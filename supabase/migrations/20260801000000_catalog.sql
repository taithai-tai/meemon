create extension if not exists pgcrypto;

create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null default 'other',
  status text not null default 'active' check (status in ('active', 'needs_pricing', 'inactive')),
  base_price_satang integer not null check (base_price_satang >= 0),
  price_min_satang integer not null check (price_min_satang >= 0),
  price_max_satang integer not null check (price_max_satang >= price_min_satang),
  track_inventory boolean not null default false,
  sold_count integer not null default 0,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  position integer not null default 0,
  unique (product_id, position)
);
alter table public.product_images enable row level security;
revoke all on public.product_images from anon, authenticated;

create table public.product_option_groups (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  name text not null,
  position integer not null default 0
);
alter table public.product_option_groups enable row level security;
revoke all on public.product_option_groups from anon, authenticated;

create table public.product_options (
  id text primary key,
  group_id text not null references public.product_option_groups(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  name text not null,
  disabled boolean not null default false,
  position integer not null default 0
);
alter table public.product_options enable row level security;
revoke all on public.product_options from anon, authenticated;

create table public.product_skus (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  selection_key text not null,
  option_ids text[] not null default '{}',
  label text not null default 'แบบมาตรฐาน',
  price_satang integer check (price_satang >= 0),
  active boolean not null default true,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, selection_key)
);
alter table public.product_skus enable row level security;
revoke all on public.product_skus from anon, authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger product_skus_set_updated_at before update on public.product_skus
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

