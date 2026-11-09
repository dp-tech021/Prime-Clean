import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePublicConfig } from '../src/lib/config.js';

const legacyKey = (role) => {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256' })}.${encode({ role })}.signature`;
};

test('aceita URL oficial e chave publicável', () => {
  const result = validatePublicConfig({
    VITE_SUPABASE_URL: 'https://projeto.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_exemplo'
  });
  assert.equal(result.url, 'https://projeto.supabase.co');
});

test('exige as duas variáveis públicas', () => {
  assert.throws(() => validatePublicConfig({}), /Defina/);
});

test('recusa chave secreta', () => {
  assert.throws(() => validatePublicConfig({ VITE_SUPABASE_URL: 'https://p.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_exemplo' }), /secretas/);
});

test('recusa JWT legado service_role e aceita anon', () => {
  const base = { VITE_SUPABASE_URL: 'http://localhost:54321' };
  assert.throws(() => validatePublicConfig({ ...base, VITE_SUPABASE_PUBLISHABLE_KEY: legacyKey('service_role') }), /publicável/);
  assert.equal(validatePublicConfig({ ...base, VITE_SUPABASE_PUBLISHABLE_KEY: legacyKey('anon') }).url, 'http://localhost:54321');
});
