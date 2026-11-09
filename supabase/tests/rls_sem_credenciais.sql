-- Testes SQL transacionais da autorização para o Prime-Clean.
-- Executar no SQL Editor do projeto prime-clean-admin.
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

-- Verificações não destrutivas: esperado 0 serviços, 0 comparações e 0 mídias.
select
 (select count(*) from public.services) as servicos_persistidos,
 (select count(*) from public.comparisons) as comparacoes_persistidas,
 (select count(*) from public.media_assets) as midias_persistidas;

-- A terceira etapa de QA (pendente) exige Auth/Storage E2E com
-- administrador ativo. Não considerar estes testes SQL suficientes por si sós.
