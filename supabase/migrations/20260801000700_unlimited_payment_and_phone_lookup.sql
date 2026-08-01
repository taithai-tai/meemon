-- New orders never expire automatically. expires_at remains populated only for
-- compatibility with existing clients and historical reports.
create or replace function public.create_order_v1(
  p_public_token_hash text,
  p_customer jsonb,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_account public.payment_accounts%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_sku public.product_skus%rowtype;
  v_quantity integer;
  v_subtotal integer := 0;
  v_line_total integer;
  v_selection_key text;
begin
  perform pg_advisory_xact_lock(hashtext('meemon-payment-account-switch'));
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1
    or jsonb_array_length(p_items) > 50 then
    raise exception 'INVALID_CART';
  end if;

  select * into v_account from public.payment_accounts where status = 'active' limit 1;
  if not found then raise exception 'PAYMENT_ACCOUNT_NOT_READY'; end if;

  insert into public.orders (
    order_number, public_token_hash, status, full_name, phone, address,
    province, postal_code, note, subtotal_satang, shipping_satang,
    total_satang, payment_account_id, payment_account_snapshot, expires_at
  ) values (
    'MM' || to_char(now() at time zone 'Asia/Bangkok', 'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_number_sequence')::text, 6, '0'),
    p_public_token_hash,
    'pending_payment',
    left(trim(coalesce(p_customer->>'fullName', '')), 120),
    left(trim(coalesce(p_customer->>'phone', '')), 30),
    left(trim(coalesce(p_customer->>'address', '')), 500),
    left(trim(coalesce(p_customer->>'province', '')), 100),
    left(trim(coalesce(p_customer->>'postalCode', '')), 10),
    left(trim(coalesce(p_customer->>'note', '')), 500),
    0, 0, 0, v_account.id,
    jsonb_build_object(
      'bankCode', v_account.bank_code,
      'bankName', v_account.bank_name,
      'accountHolder', v_account.account_holder,
      'accountNumber', v_account.account_number
    ),
    now() + interval '100 years'
  ) returning * into v_order;

  if v_order.full_name = '' or v_order.phone = '' or v_order.address = ''
    or v_order.province = '' or v_order.postal_code !~ '^[0-9]{5}$' then
    raise exception 'INVALID_CUSTOMER';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    if v_quantity < 1 or v_quantity > 99 then raise exception 'INVALID_QUANTITY'; end if;
    v_selection_key := coalesce(v_item->>'selectionKey', '');

    select * into v_product
      from public.products
      where id = v_item->>'productId' and status = 'active';
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;

    select * into v_sku
      from public.product_skus
      where product_id = v_product.id
        and selection_key = v_selection_key
        and active = true
        and price_satang is not null
      for update;
    if not found then raise exception 'SKU_UNAVAILABLE'; end if;

    if v_product.track_inventory then
      if v_sku.stock_quantity is null
        or v_sku.stock_quantity - v_sku.reserved_quantity < v_quantity then
        raise exception 'OUT_OF_STOCK';
      end if;
      update public.product_skus
        set reserved_quantity = reserved_quantity + v_quantity
        where id = v_sku.id;
    end if;

    v_line_total := v_sku.price_satang * v_quantity;
    v_subtotal := v_subtotal + v_line_total;
    insert into public.order_items (
      order_id, product_id, sku_id, product_name, sku_label, image_url,
      unit_price_satang, quantity, line_total_satang, selections
    ) values (
      v_order.id, v_product.id, v_sku.id, v_product.name, v_sku.label,
      (select image_url from public.product_images
       where product_id = v_product.id order by position limit 1),
      v_sku.price_satang, v_quantity, v_line_total,
      coalesce(v_item->'selections', '{}'::jsonb)
    );
  end loop;

  if v_subtotal < 1 then raise exception 'INVALID_CART'; end if;

  update public.orders
    set subtotal_satang = v_subtotal, total_satang = v_subtotal
    where id = v_order.id
    returning * into v_order;

  return jsonb_build_object(
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'totalSatang', v_order.total_satang,
    'expiresAt', v_order.expires_at,
    'paymentAccount', v_order.payment_account_snapshot
  );
end;
$$;

create or replace function public.finalize_payment_v1(
  p_order_id uuid,
  p_slip_attempt_id uuid,
  p_trans_ref text,
  p_amount_satang integer,
  p_receiver_name text,
  p_receiving_bank text,
  p_transaction_at timestamptz
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status not in ('verifying', 'pending_payment') then
    raise exception 'ORDER_NOT_PAYABLE';
  end if;
  if p_amount_satang <> v_order.total_satang then raise exception 'AMOUNT_MISMATCH'; end if;

  insert into public.payments (
    order_id, slip_attempt_id, trans_ref, amount_satang, receiver_name,
    receiving_bank, transaction_at
  ) values (
    p_order_id, p_slip_attempt_id, p_trans_ref, p_amount_satang,
    p_receiver_name, p_receiving_bank, p_transaction_at
  );

  update public.product_skus s
    set stock_quantity = s.stock_quantity - i.quantity,
        reserved_quantity = greatest(0, s.reserved_quantity - i.quantity)
  from public.order_items i, public.products p
  where i.order_id = p_order_id and i.sku_id = s.id
    and p.id = i.product_id and p.track_inventory = true;

  update public.orders set status = 'paid', paid_at = now() where id = p_order_id;
  return 'paid';
end;
$$;

create or replace function public.expire_unpaid_orders_v1()
returns integer
language sql
security definer
set search_path = public
as $$
  select 0;
$$;

update public.orders
set expires_at = now() + interval '100 years'
where status in ('pending_payment', 'verifying', 'verification_failed', 'needs_review');

revoke all on function public.create_order_v1(text, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.finalize_payment_v1(uuid, uuid, text, integer, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.expire_unpaid_orders_v1() from public, anon, authenticated;
grant execute on function public.create_order_v1(text, jsonb, jsonb) to service_role;
grant execute on function public.finalize_payment_v1(uuid, uuid, text, integer, text, text, timestamptz) to service_role;
grant execute on function public.expire_unpaid_orders_v1() to service_role;
