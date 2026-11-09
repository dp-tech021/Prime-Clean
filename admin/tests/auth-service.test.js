import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../src/lib/auth-service.js';

const session = { user: { id: 'u1', email: 'admin@example.invalid' } };
function fakeClient({ admin = true, authError = null, rpcError = null, active = session } = {}) {
  let signOuts = 0;
  return {
    auth: {
      getSession: async () => ({ data: { session: active }, error: authError }),
      signInWithPassword: async () => ({ data: { session: active }, error: authError }),
      signOut: async () => { signOuts += 1; return { error: null }; }
    },
    rpc: async () => ({ data: admin, error: rpcError }),
    get signOuts() { return signOuts; }
  };
}

test('restaura a sessão somente para administrador', async () => {
  const client = fakeClient();
  assert.equal(await createAuthService(client).restore(), session);
  assert.equal(client.signOuts, 0);
});

test('sessão autenticada sem autorização é encerrada', async () => {
  const client = fakeClient({ admin: false });
  await assert.rejects(createAuthService(client).restore(), /não possui permissão/);
  assert.equal(client.signOuts, 1);
});

test('erro ao conferir autorização falha de modo fechado', async () => {
  const client = fakeClient({ rpcError: new Error('offline') });
  await assert.rejects(createAuthService(client).login('a@b.c', 'senha'), /confirmar a autorização/);
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
