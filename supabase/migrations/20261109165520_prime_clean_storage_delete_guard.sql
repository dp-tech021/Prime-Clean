
-- Evita que um administrador remova diretamente do Storage um objeto
-- ainda usado pelo site. A chave está em media_assets; referências ao
-- asset são protegidas também por FK ON DELETE RESTRICT.
drop policy pc_storage_admin_delete on storage.objects;
create policy pc_storage_admin_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'prime-clean-media'
  and exists (
    select 1 from public.admin_users a
    where a.user_id = (select auth.uid()) and a.active
  )
  and not exists (
    select 1 from public.media_assets m
    where m.bucket_id = storage.objects.bucket_id
      and m.storage_path = storage.objects.name
      and (
        exists (
          select 1 from public.site_settings s
          where s.hero_asset_id = m.id
        )
        or exists (
          select 1 from public.services s
          where s.image_asset_id = m.id
        )
        or exists (
          select 1 from public.comparisons c
          where c.before_asset_id = m.id
             or c.after_asset_id = m.id
        )
      )
  )
);
