create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Administradores consultam apenas o próprio cadastro" on public.admin_users;
create policy "Administradores consultam apenas o próprio cadastro"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()) and (select public.is_admin()));

comment on table public.admin_users is 'Lista mínima de usuários autorizados a acessar o painel Prime-Clean.';
comment on function public.is_admin() is 'Verifica no servidor se o usuário autenticado integra a lista de administradores.';
