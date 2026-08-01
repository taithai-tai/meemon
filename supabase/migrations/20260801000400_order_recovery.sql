create or replace function public.normalize_thai_phone_v1(p_phone text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
begin
  if v_digits like '66%' and length(v_digits) = 11 then
    v_digits := '0' || substring(v_digits from 3);
  end if;
  return v_digits;
end;
$$;

alter table public.orders
  add column if not exists country_code text not null default 'TH'
  check (country_code = 'TH');

create index if not exists orders_order_number_phone_recovery_idx
  on public.orders (order_number, public.normalize_thai_phone_v1(phone));

create table public.order_access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.order_access_tokens enable row level security;
revoke all on public.order_access_tokens from anon, authenticated;
create index order_access_tokens_order_idx on public.order_access_tokens(order_id, created_at desc);

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
    and public.normalize_thai_phone_v1(phone) = v_phone;

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
  where o.public_token_hash = p_public_token_hash
    or exists (
      select 1 from public.order_access_tokens t
      where t.order_id = o.id and t.token_hash = p_public_token_hash
    );
$$;

revoke all on function public.normalize_thai_phone_v1(text) from public, anon, authenticated;
revoke all on function public.recover_order_access_v1(text, text, text) from public, anon, authenticated;
revoke all on function public.get_public_order_v1(text) from public, anon, authenticated;
grant execute on function public.normalize_thai_phone_v1(text) to service_role;
grant execute on function public.recover_order_access_v1(text, text, text) to service_role;
grant execute on function public.get_public_order_v1(text) to service_role;
