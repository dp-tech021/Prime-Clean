import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadPublicConfig, loadSupabaseContent, publicContentRules, safePublicImageUrl } from '../public-content.mjs';
import worker, { publicConfig } from '../worker/index.mjs';

const key = 'sb_publishable_teste_publico';
const config = { mode: 'supabase', supabaseUrl: publicContentRules.EXPECTED_ORIGIN, publishableKey: key };
const asset = (id, path, visible = true) => ({ id, bucket_id: 'prime-clean-media', storage_path: path, alt_text: `Imagem sintética ilustrativa ${id}`, illustrative: true, public_visible: visible });

function response(value, init = {}) { return new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json', ...init.headers }, ...init }); }

function apiFetch({ settings = [], services = [], comparisons = [], assets = [], fail = false } = {}) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (fail) throw new Error('offline');
    const path = new URL(url).pathname;
    if (path.endsWith('/site_settings')) return response(settings);
    if (path.endsWith('/services')) return response(services);
    if (path.endsWith('/comparisons')) return response(comparisons);
    if (path.endsWith('/media_assets')) return response(assets);
    throw new Error(`rota inesperada: ${path}`);
  };
  return { fetchImpl, calls };
}

test('mapeia foto principal pública e aceita somente URL do bucket autorizado', async () => {
  const hero = asset('hero1', 'hero/sala.webp');
  const { fetchImpl } = apiFetch({ settings: [{ id: 1, area: 'Demonstração', hero_asset_id: hero.id, hero_visible: true }], assets: [hero] });
  const content = await loadSupabaseContent(config, fetchImpl);
  assert.match(content.site.heroImage, /\/storage\/v1\/object\/public\/prime-clean-media\/hero\/sala\.webp$/);
  assert.equal(safePublicImageUrl(content.site.heroImage), content.site.heroImage);
  assert.equal(safePublicImageUrl('https://example.com/storage/v1/object/public/prime-clean-media/hero/sala.webp'), '');
});

test('serviços ocultos somem e a ordem publicada é respeitada', async () => {
  const a = asset('a', 'services/a.webp'); const b = asset('b', 'services/b.webp');
  const services = [
    { id: '2', title: 'Segundo', description: 'B', image_asset_id: b.id, sort_order: 2, visible: true, illustrative: true },
    { id: '1', title: 'Primeiro', description: 'A', image_asset_id: a.id, sort_order: 1, visible: true, illustrative: true },
    { id: '3', title: 'Oculto', description: 'C', image_asset_id: a.id, sort_order: 0, visible: false, illustrative: true }
  ];
  const content = await loadSupabaseContent(config, apiFetch({ services, assets: [a, b] }).fetchImpl);
  assert.deepEqual(content.services.map((item) => item.title), ['Primeiro', 'Segundo']);
});

test('mídia não pública não é apresentada no serviço', async () => {
  const hidden = asset('h', 'services/oculta.webp', false);
  const services = [{ id: '1', title: 'Sem foto', description: 'Continua íntegro', image_asset_id: hidden.id, sort_order: 1, visible: true, illustrative: true }];
  const content = await loadSupabaseContent(config, apiFetch({ services, assets: [hidden] }).fetchImpl);
  assert.equal(content.services[0].image, '');
});

test('comparação exige publicação, simulação e duas mídias públicas distintas', async () => {
  const before = asset('before', 'comparisons/antes.webp'); const after = asset('after', 'comparisons/depois.webp');
  const base = { title: 'Sofá', service_name: 'Sofá', description: '', before_asset_id: before.id, after_asset_id: after.id, sort_order: 2, published: true, demonstrative: true, consent_confirmed: false };
  const comparisons = [base, { ...base, title: 'Despublicada', published: false }, { ...base, title: 'Imagem repetida', after_asset_id: before.id }];
  const content = await loadSupabaseContent(config, apiFetch({ comparisons, assets: [before, after] }).fetchImpl);
  assert.deepEqual(content.comparisons.map((item) => item.title), ['Sofá']);
});

test('falha de rede rejeita a carga sem restaurar JSON antigo', async () => {
  await assert.rejects(loadSupabaseContent(config, apiFetch({ fail: true }).fetchImpl));
});

test('adaptador público faz somente requisições GET com chave publicável', async () => {
  const api = apiFetch();
  await loadSupabaseContent(config, api.fetchImpl);
  assert.equal(api.calls.length, 4);
  assert.ok(api.calls.every((call) => call.options.method === 'GET'));
  assert.ok(api.calls.every((call) => call.options.headers.apikey === key));
  assert.ok(api.calls.every((call) => !('Authorization' in call.options.headers)));
});

test('ativação do Worker prevalece e configuração Supabase incompleta falha fechada', async () => {
  const fetchImpl = async (url) => String(url).includes('public-content-config')
    ? response({ mode: 'json' })
    : response({ mode: 'supabase', supabaseUrl: '', publishableKey: '' }, { status: 503, headers: { 'x-prime-clean-config': 'worker' } });
  await assert.rejects(loadPublicConfig(fetchImpl), /indisponível|inválida/);
});

test('Worker nunca publica chave secreta e delega arquivos estáticos', async () => {
  assert.deepEqual(publicConfig({ PUBLIC_CONTENT_SOURCE: 'supabase', SUPABASE_URL: publicContentRules.EXPECTED_ORIGIN, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_proibida' }), { mode: 'supabase', supabaseUrl: '', publishableKey: '' });
  const encoded = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const elevated = `${encoded({ alg: 'HS256' })}.${encoded({ role: 'service_role' })}.assinatura`;
  assert.equal(publicConfig({ PUBLIC_CONTENT_SOURCE: 'supabase', SUPABASE_URL: publicContentRules.EXPECTED_ORIGIN, SUPABASE_PUBLISHABLE_KEY: elevated }).publishableKey, '');
  const env = { PUBLIC_CONTENT_SOURCE: 'json', ASSETS: { fetch: async () => new Response('asset') } };
  const configResponse = await worker.fetch(new Request('https://site.invalid/api/public-config'), env);
  assert.equal((await configResponse.json()).mode, 'json');
  assert.equal(configResponse.headers.get('cache-control'), 'no-store');
  assert.equal(await (await worker.fetch(new Request('https://site.invalid/app.js'), env)).text(), 'asset');
});

test('migration preserva RLS e não concede escrita anônima', async () => {
  const sql = await readFile(new URL('../supabase/migrations/20261109164735_prime_clean_admin_backend_initial.sql', import.meta.url), 'utf8');
  assert.match(sql, /alter table public\.services enable row level security/i);
  assert.match(sql, /revoke all[\s\S]*from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(?:insert|update|delete)[^;]*\bto\s+anon\b/i);
  assert.match(sql, /create policy pc_services_public_select[\s\S]*for select to anon, authenticated using \(visible\)/i);
});

test('wrangler mantém Preview separado de produção sem copiar chaves de runtime', async () => {
  const wrangler = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(wrangler.name, 'prime-clean');
  assert.deepEqual(wrangler.previews, {});
  assert.equal(wrangler.assets.binding, 'ASSETS');
  assert.equal(wrangler.build.command, 'node scripts/build_public.mjs');
  assert.equal(Object.hasOwn(wrangler, 'vars'), false);
});
