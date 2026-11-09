import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const migrationUrl = new URL('../../supabase/migrations/20261109164735_prime_clean_admin_backend_initial.sql', import.meta.url);

test('painel usa a migration oficial da raiz como contrato de autorização', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /create table public\.admin_users[\s\S]*active boolean not null default true/i);
  assert.match(sql, /create policy pc_admin_read_self[\s\S]*user_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /where a\.user_id = \(select auth\.uid\(\)\) and a\.active/i);
  assert.doesNotMatch(sql, /create\s+(?:or replace\s+)?function[\s\S]*security\s+definer/i);
});

test('a migration concorrente do painel foi removida', async () => {
  const duplicate = fileURLToPath(new URL('../supabase/migrations/202611090001_create_admin_users.sql', import.meta.url));
  await assert.rejects(access(duplicate));
});
