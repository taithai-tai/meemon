alter table public.orders
  add column if not exists deleted_at timestamptz;

create index if not exists orders_phone_history_active_idx
  on public.orders (public.normalize_thai_phone_v1(phone), created_at desc)
  where deleted_at is null;

create or replace function public.recover_order_access_v1(
  p_order_number text,
  p_phone text,
  p_new_token_hash text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_phone text := public.normalize_thai_phone_v1(p_phone);
begin
  if v_phone !~ '^0[689][0-9]{8}$'
    or trim(coalesce(p_order_number, '')) !~* '^MM[0-9]{8}-[0-9]{6}$'
    or length(p_new_token_hash) < 32 then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  select id into v_order_id
  from public.orders
  where upper(order_number) = upper(trim(p_order_number))
    and public.normalize_thai_phone_v1(phone) = v_phone
    and deleted_at is null;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;

  insert into public.order_access_tokens(order_id, token_hash)
  values (v_order_id, p_new_token_hash);

  delete from public.order_access_tokens
  where id in (
    select id from public.order_access_tokens
    where order_id = v_order_id
    order by created_at desc
    offset 5
  );

  return v_order_id;
end;
$$;

create or replace function public.get_public_order_v1(p_public_token_hash text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'orderId', o.id,
    'orderNumber', o.order_number,
    'status', o.status,
    'totalSatang', o.total_satang,
    'expiresAt', o.expires_at,
    'paidAt', o.paid_at,
    'createdAt', o.created_at,
    'paymentAccount', o.payment_account_snapshot,
    'shipping', jsonb_build_object(
      'fullName', o.full_name,
      'phone', o.phone,
      'address', o.address,
      'province', o.province,
      'postalCode', o.postal_code,
      'countryCode', o.country_code
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', i.product_name,
        'variant', i.sku_label,
        'image', i.image_url,
        'unitPriceSatang', i.unit_price_satang,
        'quantity', i.quantity,
        'lineTotalSatang', i.line_total_satang
      ) order by i.id)
      from public.order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  where o.deleted_at is null
    and (
      o.public_token_hash = p_public_token_hash
      or exists (
        select 1 from public.order_access_tokens t
        where t.order_id = o.id and t.token_hash = p_public_token_hash
      )
    );
$$;

create or replace function public.lookup_orders_by_phone_v1(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text := public.normalize_thai_phone_v1(p_phone);
  v_result jsonb;
begin
  if v_phone !~ '^0[689][0-9]{8}$' then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'orderNumber', o.order_number,
    'status', o.status,
    'totalSatang', o.total_satang,
    'createdAt', o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', i.product_name,
        'variant', i.sku_label,
        'image', i.image_url,
        'quantity', i.quantity
      ) order by i.id)
      from public.order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  ) order by o.created_at desc), '[]'::jsonb)
  into v_result
  from public.orders o
  where public.normalize_thai_phone_v1(o.phone) = v_phone
    and o.deleted_at is null;

  return v_result;
end;
$$;

revoke all on function public.lookup_orders_by_phone_v1(text) from public, anon, authenticated;
grant execute on function public.lookup_orders_by_phone_v1(text) to service_role;
