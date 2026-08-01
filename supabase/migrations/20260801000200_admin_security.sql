create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  username text not null unique check (username ~ '^[a-zA-Z0-9._-]{3,40}$'),
  active boolean not null default true,
  must_rotate_password boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.admin_profiles enable row level security;
revoke all on public.admin_profiles from anon, authenticated;

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon, authenticated;
create index audit_logs_created_idx on public.audit_logs(created_at desc);

create table public.api_rate_limits (
  bucket text not null,
  subject_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (bucket, subject_hash, window_started_at)
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;

create trigger admin_profiles_set_updated_at before update on public.admin_profiles
for each row execute function public.set_updated_at();

create or replace function public.consume_rate_limit_v1(
  p_bucket text,
  p_subject_hash text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  insert into public.api_rate_limits(bucket, subject_hash, window_started_at, request_count)
  values (p_bucket, p_subject_hash, v_window, 1)
  on conflict (bucket, subject_hash, window_started_at)
  do update set request_count = public.api_rate_limits.request_count + 1
  returning request_count into v_count;
  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit_v1(text, text, integer, integer)
from public, anon, authenticated;
grant execute on function public.consume_rate_limit_v1(text, text, integer, integer)
to service_role;

