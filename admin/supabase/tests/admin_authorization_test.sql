begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email)
values
  ('10000000-0000-0000-0000-000000000001', 'admin-a@example.invalid'),
  ('10000000-0000-0000-0000-000000000002', 'admin-b@example.invalid'),
  ('10000000-0000-0000-0000-000000000003', 'comum@example.invalid');

insert into public.admin_users (user_id)
values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002');

select extensions.ok(
  (select relrowsecurity from pg_class where oid = 'public.admin_users'::regclass),
  'RLS está habilitada em admin_users'
);

set local role anon;
select extensions.throws_ok(
  'select public.is_admin()', '42501', null,
  'usuário anônimo não executa is_admin'
);
select extensions.throws_ok(
  'select * from public.admin_users', '42501', null,
  'usuário anônimo não lê admin_users'
);

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
select extensions.is(public.is_admin(), false, 'usuário comum não é administrador');
select extensions.is((select count(*)::integer from public.admin_users), 0, 'usuário comum não lê cadastros');
select extensions.throws_ok(
  $$insert into public.admin_users (user_id) values ('10000000-0000-0000-0000-000000000003')$$,
  '42501', null, 'usuário comum não se promove'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select extensions.is(public.is_admin(), true, 'administrador autorizado é reconhecido');
select extensions.is((select count(*)::integer from public.admin_users), 1, 'administrador lê somente o próprio cadastro');
select extensions.throws_ok(
  $$insert into public.admin_users (user_id) values ('10000000-0000-0000-0000-000000000003')$$,
  '42501', null, 'administrador não adiciona usuários pelo cliente'
);
select extensions.throws_ok(
  $$delete from public.admin_users where user_id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'administrador não remove usuários pelo cliente'
);

reset role;
select extensions.has_function('public', 'is_admin', array[]::text[], 'função de autorização existe');
select extensions.has_table('public', 'admin_users', 'tabela de administradores existe');
select * from extensions.finish();
rollback;
