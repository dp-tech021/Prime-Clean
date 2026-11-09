import test from 'node:test';
import assert from 'node:assert/strict';
import { createMediaService, makeStoragePath, MediaInUseError, validateImage } from '../src/lib/media-service.js';

const validFile = (overrides = {}) => ({ name: 'Sofá Exemplo.webp', type: 'image/webp', size: 1024, ...overrides });

function fakeClient({ query = {}, uploadError = null, removeError = null } = {}) {
  const calls = [];
  function builder(table) {
    let operation = 'select';
    let payload;
    let filters = [];
    const api = {
      select() { if (operation === 'select') operation = 'select'; return api; },
      insert(value) { operation = 'insert'; payload = value; return api; },
      update(value) { operation = 'update'; payload = value; return api; },
      delete() { operation = 'delete'; return api; },
      eq(field, value) { filters.push([field, value]); return api; },
      in(field, value) { filters.push([field, value]); return api; },
      or(value) { filters.push(['or', value]); return api; },
      order() { return api; },
      single() { return finish(); },
      maybeSingle() { return finish(); },
      then(resolve, reject) { return finish().then(resolve, reject); }
    };
    function finish() {
      calls.push({ kind: 'query', table, operation, payload, filters });
      const result = query[`${table}:${operation}`] ?? query[table] ?? { data: operation === 'select' ? [] : payload, error: null };
      return Promise.resolve(typeof result === 'function' ? result({ payload, filters }) : result);
    }
    return api;
  }
  return {
    from: builder,
    storage: {
      from(bucket) {
        assert.equal(bucket, 'prime-clean-media');
        return {
          upload: async (path, file, options) => { calls.push({ kind: 'upload', path, file, options }); return { error: uploadError }; },
          remove: async (paths) => { calls.push({ kind: 'remove', paths }); return { error: removeError }; },
          getPublicUrl: (path) => ({ data: { publicUrl: `https://example.invalid/${path}` } })
        };
      }
    },
    calls
  };
}

test('valida formato, conteúdo e limite de 5 MiB', () => {
  assert.equal(validateImage(validFile()), 'webp');
  assert.throws(() => validateImage(validFile({ type: 'image/gif' })), /Formato inválido/);
  assert.throws(() => validateImage(validFile({ size: 5 * 1024 * 1024 + 1 })), /5 MiB/);
  assert.throws(() => validateImage(validFile({ size: 0 })), /vazio/);
});

test('substituições recebem nomes novos e compatíveis com o banco', () => {
  const first = makeStoragePath('services', validFile(), 100, 'aaaaaaaa-0000');
  const second = makeStoragePath('services', validFile(), 101, 'bbbbbbbb-0000');
  assert.match(first, /^services\/sofa-exemplo-100-aaaaaaaa\.webp$/);
  assert.notEqual(first, second);
});

test('upload válido grava arquivo e metadados ilustrativos', async () => {
  const client = fakeClient({ query: { 'media_assets:insert': ({ payload }) => ({ data: { id: 'm1', ...payload }, error: null }) } });
  const service = createMediaService(client, async () => true);
  const asset = await service.uploadAsset({ file: validFile(), altText: 'Imagem ilustrativa gerada por IA de um sofá', prefix: 'services' });
  assert.equal(asset.id, 'm1');
  assert.equal(asset.illustrative, true);
  assert.equal(client.calls.filter((call) => call.kind === 'upload').length, 1);
});

test('falha de autenticação ou administrador inativo bloqueia antes do upload', async () => {
  const client = fakeClient();
  const service = createMediaService(client, async () => { throw new Error('inactive'); });
  await assert.rejects(service.uploadAsset({ file: validFile(), altText: 'Imagem sintética de teste', prefix: 'services' }), /sessão não está autorizada/i);
  assert.equal(client.calls.length, 0);
});

test('erro de conexão no Storage produz mensagem segura', async () => {
  const service = createMediaService(fakeClient({ uploadError: new Error('socket details') }), async () => true);
  await assert.rejects(service.uploadAsset({ file: validFile(), altText: 'Imagem fictícia de teste', prefix: 'services' }), /Verifique sua conexão/);
});

test('falha no cadastro remove o arquivo recém-enviado', async () => {
  const client = fakeClient({ query: { 'media_assets:insert': { data: null, error: new Error('db') } } });
  const service = createMediaService(client, async () => true);
  await assert.rejects(service.uploadAsset({ file: validFile(), altText: 'Imagem ilustrativa de teste', prefix: 'services' }), /removido com segurança/);
  assert.equal(client.calls.filter((call) => call.kind === 'remove').length, 1);
});

test('exclusão é protegida quando a mídia está referenciada', async () => {
  const client = fakeClient({ query: {
    site_settings: { data: [], error: null },
    services: { data: [{ id: 's1', title: 'Sofá' }], error: null },
    comparisons: { data: [], error: null }
  } });
  const service = createMediaService(client, async () => true);
  await assert.rejects(service.deleteAsset({ id: 'm1', storage_path: 'services/a.webp' }), MediaInUseError);
  assert.equal(client.calls.some((call) => call.kind === 'remove'), false);
});

test('arquivo órfão é removido do Storage e depois do banco', async () => {
  const client = fakeClient({ query: {
    site_settings: { data: [], error: null }, services: { data: [], error: null }, comparisons: { data: [], error: null },
    'media_assets:delete': { data: { id: 'm1' }, error: null }
  } });
  const service = createMediaService(client, async () => true);
  await service.deleteAsset({ id: 'm1', storage_path: 'services/a.webp' });
  const operations = client.calls.filter((call) => ['remove', 'query'].includes(call.kind));
  assert.equal(operations.some((call) => call.kind === 'remove'), true);
  assert.equal(operations.some((call) => call.table === 'media_assets' && call.operation === 'delete'), true);
});

test('comparação rejeita imagens iguais antes de escrever', async () => {
  const client = fakeClient();
  const service = createMediaService(client, async () => true);
  await assert.rejects(service.saveComparison({ title: 'Teste', serviceName: 'Sofá', order: 1, beforeId: 'm1', afterId: 'm1' }), /duas imagens diferentes/);
  assert.equal(client.calls.length, 0);
});

test('conteúdo público exige metadados públicos das imagens', async () => {
  const client = fakeClient({ query: { media_assets: { data: [{ id: 'm1', public_visible: false }], error: null } } });
  const service = createMediaService(client, async () => true);
  await assert.rejects(service.saveHero({ assetId: 'm1', visible: true }), /Publique os metadados/);
  assert.equal(client.calls.some((call) => call.table === 'site_settings' && call.operation === 'update'), false);
});

test('não oculta metadados usados por conteúdo publicado', async () => {
  const client = fakeClient({ query: {
    site_settings: { data: [{ id: 1 }], error: null }, services: { data: [], error: null }, comparisons: { data: [], error: null }
  } });
  const service = createMediaService(client, async () => true);
  await assert.rejects(service.updateAssetVisibility('m1', false), /Oculte primeiro/);
  assert.equal(client.calls.some((call) => call.table === 'media_assets' && call.operation === 'update'), false);
});

test('serviços podem ser criados, editados e removidos sem apagar a mídia', async () => {
  const client = fakeClient({ query: {
    'services:insert': { data: { id: 's1' }, error: null },
    'services:update': { data: { id: 's1' }, error: null },
    'services:delete': { data: { id: 's1' }, error: null }
  } });
  const service = createMediaService(client, async () => true);
  const base = { title: 'Sofá', description: 'Descrição', assetId: 'm1', order: 1, visible: false };
  await service.saveService(base);
  await service.saveService({ ...base, id: 's1', title: 'Sofá editado' });
  await service.deleteService('s1');
  assert.deepEqual(client.calls.filter((call) => call.table === 'services').map((call) => call.operation), ['insert', 'update', 'delete']);
  assert.equal(client.calls.some((call) => call.table === 'media_assets' && call.operation === 'delete'), false);
});

test('comparação válida mantém marcadores de demonstração', async () => {
  const client = fakeClient({ query: { 'comparisons:insert': ({ payload }) => ({ data: payload, error: null }) } });
  const service = createMediaService(client, async () => true);
  await service.saveComparison({ title: 'Sofá demonstrativo', serviceName: 'Sofá', description: '', order: 2, published: false, beforeId: 'm1', afterId: 'm2' });
  const insert = client.calls.find((call) => call.table === 'comparisons' && call.operation === 'insert');
  assert.equal(insert.payload.demonstrative, true);
  assert.equal(insert.payload.consent_confirmed, false);
});
