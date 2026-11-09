import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../src/lib/auth-service.js';

const session = { user: { id: 'u1', email: 'admin@example.invalid' } };
function fakeClient({ admin = { user_id: 'u1', active: true }, authError = null, queryError = null, active = session } = {}) {
  let signOuts = 0;
  let selectedUser = null;
  let stateCallback = null;
  return {
    auth: {
      getSession: async () => ({ data: { session: active }, error: authError }),
      signInWithPassword: async () => ({ data: { session: active }, error: authError }),
      signOut: async () => { signOuts += 1; return { error: null }; },
      onAuthStateChange: (callback) => {
        stateCallback = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      }
    },
    from(table) {
      assert.equal(table, 'admin_users');
      return {
        select(fields) {
          assert.equal(fields, 'user_id, active');
          return {
            eq(field, value) {
              assert.equal(field, 'user_id');
              selectedUser = value;
              return { maybeSingle: async () => ({ data: admin, error: queryError }) };
            }
          };
        }
      };
    },
    emit(event, value) { stateCallback?.(event, value); },
    get selectedUser() { return selectedUser; },
    get signOuts() { return signOuts; }
  };
}

test('restaura a sessão somente para administrador ativo', async () => {
  const client = fakeClient();
  assert.equal(await createAuthService(client).restore(), session);
  assert.equal(client.selectedUser, session.user.id);
  assert.equal(client.signOuts, 0);
});

test('usuário autenticado sem cadastro administrativo é recusado', async () => {
  const client = fakeClient({ admin: null });
  await assert.rejects(createAuthService(client).restore(), /não possui permissão/);
  assert.equal(client.signOuts, 1);
});

test('administrador inativo é recusado', async () => {
  const client = fakeClient({ admin: { user_id: 'u1', active: false } });
  await assert.rejects(createAuthService(client).restore(), /não possui permissão/);
  assert.equal(client.signOuts, 1);
});

test('erro ao conferir autorização falha de modo fechado', async () => {
  const client = fakeClient({ queryError: new Error('offline') });
  await assert.rejects(createAuthService(client).login('a@b.c', 'senha'), /Verifique sua conexão/);
  assert.equal(client.signOuts, 1);
});

test('credenciais inválidas têm mensagem neutra', async () => {
  const client = fakeClient({ authError: new Error('invalid') });
  await assert.rejects(createAuthService(client).login('a@b.c', 'errada'), /E-mail ou senha inválidos/);
});

test('login sem sessão é recusado', async () => {
  const client = fakeClient({ active: null });
  await assert.rejects(createAuthService(client).login('a@b.c', 'senha'), /E-mail ou senha inválidos/);
});

test('ausência de sessão retorna null sem consultar privilégios', async () => {
  const client = fakeClient({ active: null });
  assert.equal(await createAuthService(client).restore(), null);
});

test('logout delega o encerramento ao Supabase', async () => {
  const client = fakeClient();
  await createAuthService(client).logout();
  assert.equal(client.signOuts, 1);
});

test('sessão expirada devolve a interface ao login', () => {
  const client = fakeClient();
  let lost = 0;
  createAuthService(client).onSessionLost(() => { lost += 1; });
  client.emit('SIGNED_OUT', null);
  assert.equal(lost, 1);
});
