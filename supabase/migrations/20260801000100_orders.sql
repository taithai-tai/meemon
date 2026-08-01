create table public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_code text not null,
  bank_name text not null,
  account_holder text not null,
  account_number text not null,
  status text not null default 'pending_validation' check (status in ('pending_validation', 'active', 'retired')),
  validated_at timestamptz,
  validation_trans_ref text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payment_accounts enable row level security;
revoke all on public.payment_accounts from anon, authenticated;

create unique index one_active_payment_account
  on public.payment_accounts ((status)) where status = 'active';

insert into public.payment_accounts (
  bank_code, bank_name, account_holder, account_number, status
) values (
  '004', 'ธนาคารกสิกรไทย', 'นาย ดนุพล แสงนคร', '0793953402', 'pending_validation'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  public_token_hash text not null unique,
  status text not null default 'pending_payment' check (
    status in (
      'pending_payment', 'verifying', 'paid', 'packing', 'shipped',
      'completed', 'verification_failed', 'needs_review', 'expired',
      'cancelled', 'refunded'
    )
  ),
  full_name text not null,
  phone text not null,
  address text not null,
  province text not null,
  postal_code text not null,
  note text not null default '',
  subtotal_satang integer not null check (subtotal_satang >= 0),
  shipping_satang integer not null default 0 check (shipping_satang = 0),
  total_satang integer not null check (total_satang >= 0),
  payment_account_id uuid not null references public.payment_accounts(id),
  payment_account_snapshot jsonb not null,
  expires_at timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
create index orders_status_expires_idx on public.orders(status, expires_at);
create index orders_created_idx on public.orders(created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  sku_id uuid not null references public.product_skus(id) on delete restrict,
  product_name text not null,
  sku_label text not null,
  image_url text,
  unit_price_satang integer not null check (unit_price_satang >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total_satang integer not null check (line_total_satang >= 0),
  selections jsonb not null default '[]'::jsonb
);
alter table public.order_items enable row level security;
revoke all on public.order_items from anon, authenticated;

create table public.slip_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  attempt_number integer not null check (attempt_number between 1 and 5),
  object_path text,
  status text not null check (status in ('verifying', 'verified', 'rejected', 'delayed', 'needs_review', 'provider_error')),
  provider_code integer,
  provider_message text,
  provider_response jsonb,
  trans_ref text,
  next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, attempt_number)
);
alter table public.slip_attempts enable row level security;
revoke all on public.slip_attempts from anon, authenticated;
create index slip_attempts_retry_idx on public.slip_attempts(status, next_retry_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  slip_attempt_id uuid not null references public.slip_attempts(id) on delete restrict,
  provider text not null default 'easyslip',
  trans_ref text not null,
  amount_satang integer not null check (amount_satang >= 0),
  receiver_name text,
  receiving_bank text,
  transaction_at timestamptz,
  verified_at timestamptz not null default now(),
  unique (provider, trans_ref)
);
alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'slips', 'slips', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create trigger payment_accounts_set_updated_at before update on public.payment_accounts
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger slip_attempts_set_updated_at before update on public.slip_attempts
for each row execute function public.set_updated_at();

create or replace function public.protect_order_financial_fields()
returns trigger language plpgsql as $$
begin
  if old.subtotal_satang = 0 and old.total_satang = 0 and old.status = 'pending_payment' then
    return new;
  end if;
  if new.subtotal_satang <> old.subtotal_satang
    or new.shipping_satang <> old.shipping_satang
    or new.total_satang <> old.total_satang
    or new.payment_account_id <> old.payment_account_id
    or new.payment_account_snapshot <> old.payment_account_snapshot then
    raise exception 'Order financial fields are immutable';
  end if;
  return new;
end;
$$;

create trigger orders_protect_financial_fields before update on public.orders
for each row execute function public.protect_order_financial_fields();

create or replace function public.protect_verified_payments()
returns trigger language plpgsql as $$
begin
  raise exception 'Verified payments are immutable';
end;
$$;

create trigger payments_no_update before update or delete on public.payments
for each row execute function public.protect_verified_payments();
