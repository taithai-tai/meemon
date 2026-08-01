alter table public.admin_profiles
  alter column must_rotate_password set default false;

update public.admin_profiles
set must_rotate_password = false
where must_rotate_password = true;

-- Meemon currently operates with the seeded `admin` account only. Keep any
-- historical profiles for the audit trail, but prevent them from signing in.
update public.admin_profiles
set active = (username = 'admin');
