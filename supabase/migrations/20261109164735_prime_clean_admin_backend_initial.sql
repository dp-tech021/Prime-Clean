
-- Prime-Clean: MVP do painel administrativo (projeto fictício).
-- A publicação existente no GitHub Pages continua usando JSON até a migração.
-- Somente conteúdo sintético deve ser enviado ao bucket público.

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'prime-clean-media'
    check (bucket_id = 'prime-clean-media'),
  storage_path text not null unique
    check (storage_path ~ '^(hero|services|comparisons)/[a-z0-9][a-z0-9_-]*[.](webp|jpg|jpeg|png)$'),
  mime_type text not null
    check (mime_type in ('image/webp', 'image/jpeg', 'image/png')),
  alt_text text not null
    check (length(btrim(alt_text)) >= 8
       and alt_text ~* '(ilustrativ|gerad|simula|sint[eé]tic|fict)'),
  illustrative boolean not null default true check (illustrative),
  public_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  area text not null
    default 'Projeto demonstrativo — sem área de atendimento'
    check (length(btrim(area)) > 0),
  hero_asset_id uuid references public.media_assets(id) on delete restrict,
  hero_visible boolean not null default false,
  check (not hero_visible or hero_asset_id is not null)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 100),
  description text not null check (length(btrim(description)) > 0),
  image_asset_id uuid references public.media_assets(id) on delete restrict,
  sort_order integer not null default 1 check (sort_order >= 1),
  visible boolean not null default false,
  illustrative boolean not null default true check (illustrative),
  created_at timestamptz not null default now()
);

create table public.comparisons (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 120),
  service_name text not null check (length(btrim(service_name)) between 1 and 100),
  description text not null default '',
  before_asset_id uuid not null references public.media_assets(id) on delete restrict,
  after_asset_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 1 check (sort_order >= 1),
  published boolean not null default false,
  demonstrative boolean not null default true check (demonstrative),
  consent_confirmed boolean not null default false check (not consent_confirmed),
  check (before_asset_id <> after_asset_id),
  created_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1);

create index services_sort_order_idx on public.services(sort_order);
create index comparisons_sort_order_idx on public.comparisons(sort_order);
create index media_assets_public_visible_idx on public.media_assets(public_visible);

alter table public.admin_users enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.comparisons enable row level security;

-- Evita depender de permissões implícitas do schema.
revoke all on public.admin_users, public.media_assets, public.site_settings,
  public.services, public.comparisons from public, anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.media_assets, public.site_settings,
  public.services, public.comparisons to anon, authenticated;
grant insert, update, delete on public.media_assets,
  public.services, public.comparisons to authenticated;
grant update on public.site_settings to authenticated;

-- A lista de administradores só é alterada por pessoal autorizado via dashboard/SQL.
-- O usuário autenticado pode consultar apenas o próprio vínculo.
create policy pc_admin_read_self on public.admin_users
for select to authenticated
using (user_id = (select auth.uid()));

-- SELECT adicional para administradores, sem criar função SECURITY DEFINER.
-- Uma conta com login, mas sem cadastro ativo em admin_users, não administra nada.
create policy pc_media_public_select on public.media_assets
for select to anon, authenticated using (public_visible);
create policy pc_media_admin_select on public.media_assets
for select to authenticated using (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_media_admin_insert on public.media_assets
for insert to authenticated with check (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_media_admin_update on public.media_assets
for update to authenticated
using (exists (select 1 from public.admin_users a
               where a.user_id = (select auth.uid()) and a.active))
with check (exists (select 1 from public.admin_users a
                    where a.user_id = (select auth.uid()) and a.active));
create policy pc_media_admin_delete on public.media_assets
for delete to authenticated using (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);

create policy pc_settings_public_select on public.site_settings
for select to anon, authenticated using (true);
create policy pc_settings_admin_update on public.site_settings
for update to authenticated
using (exists (select 1 from public.admin_users a
               where a.user_id = (select auth.uid()) and a.active))
with check (exists (select 1 from public.admin_users a
                    where a.user_id = (select auth.uid()) and a.active));

create policy pc_services_public_select on public.services
for select to anon, authenticated using (visible);
create policy pc_services_admin_select on public.services
for select to authenticated using (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_services_admin_insert on public.services
for insert to authenticated with check (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_services_admin_update on public.services
for update to authenticated
using (exists (select 1 from public.admin_users a
               where a.user_id = (select auth.uid()) and a.active))
with check (exists (select 1 from public.admin_users a
                    where a.user_id = (select auth.uid()) and a.active));
create policy pc_services_admin_delete on public.services
for delete to authenticated using (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);

create policy pc_comparisons_public_select on public.comparisons
for select to anon, authenticated using (published and demonstrative);
create policy pc_comparisons_admin_select on public.comparisons
for select to authenticated using (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_comparisons_admin_insert on public.comparisons
for insert to authenticated with check (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_comparisons_admin_update on public.comparisons
for update to authenticated
using (exists (select 1 from public.admin_users a
               where a.user_id = (select auth.uid()) and a.active))
with check (exists (select 1 from public.admin_users a
                    where a.user_id = (select auth.uid()) and a.active));
create policy pc_comparisons_admin_delete on public.comparisons
for delete to authenticated using (
  exists (select 1 from public.admin_users a
          where a.user_id = (select auth.uid()) and a.active)
);

-- Bucket público exclusivamente para arquivos sintéticos; URL pública NÃO é privada.
-- Limite por upload: 5 MiB; WebP, JPEG ou PNG.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'prime-clean-media', 'prime-clean-media', true, 5242880,
  array['image/webp','image/jpeg','image/png']::text[]
);

-- Download via URL pública do Storage é permitido; listagem/alteração requer admin.
create policy pc_storage_admin_select on storage.objects
for select to authenticated using (
  bucket_id = 'prime-clean-media'
  and exists (select 1 from public.admin_users a
              where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_storage_admin_insert on storage.objects
for insert to authenticated with check (
  bucket_id = 'prime-clean-media'
  and name ~ '^(hero|services|comparisons)/[a-z0-9][a-z0-9_-]*[.](webp|jpg|jpeg|png)$'
  and exists (select 1 from public.admin_users a
              where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_storage_admin_update on storage.objects
for update to authenticated
using (
  bucket_id = 'prime-clean-media'
  and exists (select 1 from public.admin_users a
              where a.user_id = (select auth.uid()) and a.active)
)
with check (
  bucket_id = 'prime-clean-media'
  and name ~ '^(hero|services|comparisons)/[a-z0-9][a-z0-9_-]*[.](webp|jpg|jpeg|png)$'
  and exists (select 1 from public.admin_users a
              where a.user_id = (select auth.uid()) and a.active)
);
create policy pc_storage_admin_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'prime-clean-media'
  and exists (select 1 from public.admin_users a
              where a.user_id = (select auth.uid()) and a.active)
);
