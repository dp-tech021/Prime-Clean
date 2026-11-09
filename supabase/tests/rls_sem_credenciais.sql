-- Testes SQL transacionais da autorização para o Prime-Clean.
-- Executar somente em banco local ou descartável autorizado; não aplicar no
-- projeto remoto sem autorização específica.
-- Nenhum usuário real e nenhum arquivo enviado. Todos os dados são revertidos.
-- SUCESSO: execução termina sem exceção. Use usuário admin real para E2E separado.

-- Teste 1: visitante anônimo vê apenas serviços visíveis e não tem INSERT.
begin;
insert into public.services(title,description,sort_order,visible) values
('Teste visível temporário','Registro transacional apenas para verificar RLS.',1,true),
('Teste oculto temporário','Registro transacional apenas para verificar RLS.',2,false);
set local role anon;
do $test_anon$
declare n integer;
begin
  select count(*) into n from public.services;
  if n <> 1 then
    raise exception 'RLS anon: esperava 1 serviço visível; encontrou %', n;
  end if;
  select count(*) into n from public.site_settings;
  if n <> 1 then
    raise exception 'RLS anon: esperava 1 configuração pública; encontrou %', n;
  end if;
  if has_table_privilege('anon','public.admin_users','INSERT')
     or has_table_privilege('anon','public.services','INSERT') then
    raise exception 'anon recebeu INSERT indevidamente';
  end if;
end $test_anon$;
rollback;

-- Teste 2: usuário logado sem cadastro de admin só lê conteúdo público.
begin;
insert into public.services(title,description,sort_order,visible) values
('Teste visível auth','Registro transacional apenas para verificar RLS.',1,true),
('Teste oculto auth','Registro transacional apenas para verificar RLS.',2,false);
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000099';
do $test_auth$
declare n integer; changed integer;
begin
  select count(*) into n from public.services;
  if n <> 1 then
    raise exception 'RLS auth sem admin: esperava 1 serviço visível; encontrou %', n;
  end if;
  select count(*) into n from public.admin_users;
  if n <> 0 then
    raise exception 'Usuário comum conseguiu ver lista de admins';
  end if;
  update public.services set title='NÃO DEVE ALTERAR' where visible = true;
  get diagnostics changed = row_count;
  if changed <> 0 then
    raise exception 'Usuário comum conseguiu alterar % serviço(s)', changed;
  end if;
  if has_table_privilege('authenticated','public.admin_users','UPDATE') then
    raise exception 'authenticated pode se tornar admin por UPDATE';
  end if;
end $test_auth$;
rollback;

-- Teste 3: administrador inativo lê o próprio vínculo, mas não administra.
begin;
insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000098','inativo-temporario@example.invalid');
insert into public.admin_users(user_id,active) values
('00000000-0000-4000-8000-000000000098',false);
insert into public.services(title,description,sort_order,visible) values
('Teste oculto inativo','Registro transacional apenas para verificar RLS.',98,false);
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000098';
do $test_inactive$
declare n integer; changed integer; enabled boolean;
begin
  select count(*), bool_and(active) into n, enabled from public.admin_users;
  if n <> 1 or enabled is not false then
    raise exception 'Admin inativo não consultou corretamente o próprio vínculo';
  end if;
  update public.services set title='NÃO DEVE ALTERAR' where sort_order=98;
  get diagnostics changed = row_count;
  if changed <> 0 then
    raise exception 'Admin inativo conseguiu alterar % serviço(s)', changed;
  end if;
end $test_inactive$;
rollback;

-- Teste 4: somente administrador ativo recebe a política administrativa.
begin;
insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000097','ativo-temporario@example.invalid');
insert into public.admin_users(user_id,active) values
('00000000-0000-4000-8000-000000000097',true);
insert into public.services(title,description,sort_order,visible) values
('Teste oculto ativo','Registro transacional apenas para verificar RLS.',97,false);
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000097';
do $test_active$
declare n integer; changed integer; enabled boolean;
begin
  select count(*), bool_and(active) into n, enabled from public.admin_users;
  if n <> 1 or enabled is not true then
    raise exception 'Admin ativo não consultou corretamente o próprio vínculo';
  end if;
  update public.services set title='Teste alterado por admin ativo' where sort_order=97;
  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'Admin ativo deveria alterar 1 serviço; alterou %', changed;
  end if;
end $test_active$;
rollback;

-- Verificações não destrutivas: esperado 0 serviços, 0 comparações e 0 mídias.
select
 (select count(*) from public.services) as servicos_persistidos,
 (select count(*) from public.comparisons) as comparacoes_persistidas,
 (select count(*) from public.media_assets) as midias_persistidas;

-- A terceira etapa de QA (pendente) exige Auth/Storage E2E com
-- administrador ativo. Não considerar estes testes SQL suficientes por si sós.
