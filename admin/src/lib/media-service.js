const BUCKET = 'prime-clean-media';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/webp', 'webp'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png']
]);
const PREFIXES = new Set(['hero', 'services', 'comparisons']);
const ILLUSTRATIVE_TEXT = /(ilustrativ|gerad|simula|sint[eé]tic|fict)/i;

export class AdminDataError extends Error {
  constructor(message, { partial = false } = {}) {
    super(message);
    this.partial = partial;
  }
}

export class MediaInUseError extends AdminDataError {
  constructor(references) {
    super(`Esta imagem está em uso por: ${references.join(', ')}. Remova essas referências antes de excluir.`);
    this.references = references;
  }
}

export function validateImage(file) {
  if (!file || typeof file.size !== 'number') throw new AdminDataError('Selecione uma imagem.');
  if (!ALLOWED_TYPES.has(file.type)) throw new AdminDataError('Formato inválido. Use WebP, JPEG ou PNG.');
  if (file.size <= 0) throw new AdminDataError('O arquivo selecionado está vazio.');
  if (file.size > MAX_FILE_SIZE) throw new AdminDataError('A imagem ultrapassa o limite de 5 MiB.');
  return ALLOWED_TYPES.get(file.type);
}

export function validateAltText(value) {
  const alt = String(value || '').trim();
  if (alt.length < 8 || !ILLUSTRATIVE_TEXT.test(alt)) {
    throw new AdminDataError('O texto alternativo deve ter ao menos 8 caracteres e identificar a imagem como ilustrativa, sintética, fictícia ou gerada por IA.');
  }
  return alt;
}

export function makeStoragePath(prefix, file, now = Date.now(), uuid = crypto.randomUUID()) {
  if (!PREFIXES.has(prefix)) throw new AdminDataError('Destino de upload inválido.');
  const extension = validateImage(file);
  const base = String(file.name || 'imagem').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'imagem';
  return `${prefix}/${base.slice(0, 48)}-${now}-${uuid.slice(0, 8).toLowerCase()}.${extension}`;
}

export function createMediaService(client, requireAuthorized) {
  const table = (name) => client.from(name);
  const guard = async () => {
    try { await requireAuthorized(); }
    catch { throw new AdminDataError('Sua sessão não está autorizada. Entre novamente.'); }
  };
  const query = async (promise, message) => {
    const { data, error } = await promise;
    if (error) throw new AdminDataError(message);
    return data;
  };

  async function loadAll() {
    await guard();
    const [settings, assets, services, comparisons] = await Promise.all([
      query(table('site_settings').select('id, area, hero_asset_id, hero_visible').eq('id', 1).single(), 'Não foi possível carregar a foto principal.'),
      query(table('media_assets').select('id, bucket_id, storage_path, mime_type, alt_text, illustrative, public_visible, created_at').order('created_at', { ascending: false }), 'Não foi possível carregar a biblioteca.'),
      query(table('services').select('id, title, description, image_asset_id, sort_order, visible, illustrative').order('sort_order'), 'Não foi possível carregar os serviços.'),
      query(table('comparisons').select('id, title, service_name, description, before_asset_id, after_asset_id, sort_order, published, demonstrative, consent_confirmed').order('sort_order'), 'Não foi possível carregar as comparações.')
    ]);
    return { settings, assets, services, comparisons };
  }

  function publicUrl(asset) {
    if (!asset?.storage_path) return '';
    return client.storage.from(BUCKET).getPublicUrl(asset.storage_path).data.publicUrl;
  }

  async function uploadAsset({ file, altText, prefix, publicVisible = true }) {
    await guard();
    const path = makeStoragePath(prefix, file);
    const alt = validateAltText(altText);
    const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });
    if (uploadError) throw new AdminDataError('Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.');

    const { data, error } = await table('media_assets').insert({
      bucket_id: BUCKET,
      storage_path: path,
      mime_type: file.type,
      alt_text: alt,
      illustrative: true,
      public_visible: Boolean(publicVisible)
    }).select().single();
    if (!error) return data;

    const { error: cleanupError } = await client.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      throw new AdminDataError(`O arquivo foi enviado, mas o cadastro falhou. Anote o caminho ${path} para reconciliação.`, { partial: true });
    }
    throw new AdminDataError('O cadastro da imagem falhou e o arquivo enviado foi removido com segurança.');
  }

  async function referencesFor(assetId) {
    await guard();
    const [hero, services, comparisons] = await Promise.all([
      query(table('site_settings').select('id').eq('hero_asset_id', assetId), 'Não foi possível verificar a foto principal.'),
      query(table('services').select('id, title').eq('image_asset_id', assetId), 'Não foi possível verificar os serviços.'),
      query(table('comparisons').select('id, title').or(`before_asset_id.eq.${assetId},after_asset_id.eq.${assetId}`), 'Não foi possível verificar as comparações.')
    ]);
    return [
      ...hero.map(() => 'Foto principal'),
      ...services.map((item) => `Serviço: ${item.title}`),
      ...comparisons.map((item) => `Comparação: ${item.title}`)
    ];
  }

  async function ensurePublicAssets(ids) {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return;
    const assets = await query(table('media_assets').select('id, public_visible').in('id', unique), 'Não foi possível validar a visibilidade das imagens.');
    if (unique.some((id) => !assets.some((asset) => asset.id === id && asset.public_visible === true))) {
      throw new AdminDataError('Publique os metadados de todas as imagens selecionadas antes de tornar o conteúdo visível.');
    }
  }

  async function publicReferencesFor(assetId) {
    const [hero, services, comparisons] = await Promise.all([
      query(table('site_settings').select('id').eq('hero_asset_id', assetId).eq('hero_visible', true), 'Não foi possível verificar a foto principal.'),
      query(table('services').select('id, title').eq('image_asset_id', assetId).eq('visible', true), 'Não foi possível verificar os serviços.'),
      query(table('comparisons').select('id, title').eq('published', true).or(`before_asset_id.eq.${assetId},after_asset_id.eq.${assetId}`), 'Não foi possível verificar as comparações.')
    ]);
    return [...hero.map(() => 'Foto principal'), ...services.map((item) => `Serviço: ${item.title}`), ...comparisons.map((item) => `Comparação: ${item.title}`)];
  }

  async function deleteAsset(asset) {
    const references = await referencesFor(asset.id);
    if (references.length) throw new MediaInUseError(references);
    const { error: storageError } = await client.storage.from(BUCKET).remove([asset.storage_path]);
    if (storageError) throw new AdminDataError('Não foi possível excluir o arquivo. Nada foi removido do cadastro.');
    const { error: databaseError } = await table('media_assets').delete().eq('id', asset.id);
    if (databaseError) throw new AdminDataError('O arquivo foi removido, mas o cadastro permaneceu. Atualize a página e faça a reconciliação.', { partial: true });
  }

  async function updateAssetVisibility(id, publicVisible) {
    await guard();
    if (!publicVisible) {
      const references = await publicReferencesFor(id);
      if (references.length) throw new AdminDataError(`Oculte primeiro o conteúdo publicado que usa esta imagem: ${references.join(', ')}.`);
    }
    await query(table('media_assets').update({ public_visible: Boolean(publicVisible) }).eq('id', id).select().single(), 'Não foi possível alterar a visibilidade da imagem.');
  }

  async function saveHero({ assetId, visible }) {
    await guard();
    if (visible && !assetId) throw new AdminDataError('Selecione uma imagem antes de publicar a foto principal.');
    if (visible) await ensurePublicAssets([assetId]);
    await query(table('site_settings').update({ hero_asset_id: assetId || null, hero_visible: Boolean(visible) }).eq('id', 1).select().single(), 'Não foi possível salvar a foto principal.');
  }

  async function saveService(values) {
    await guard();
    const payload = {
      title: String(values.title).trim(), description: String(values.description).trim(),
      image_asset_id: values.assetId || null, sort_order: Number(values.order),
      visible: Boolean(values.visible), illustrative: true
    };
    if (!payload.title || !payload.description || !Number.isInteger(payload.sort_order) || payload.sort_order < 1) throw new AdminDataError('Preencha título, descrição e uma ordem maior que zero.');
    if (payload.visible && payload.image_asset_id) await ensurePublicAssets([payload.image_asset_id]);
    const request = values.id ? table('services').update(payload).eq('id', values.id) : table('services').insert(payload);
    await query(request.select().single(), 'Não foi possível salvar o serviço.');
  }

  async function deleteService(id) {
    await guard();
    await query(table('services').delete().eq('id', id).select().single(), 'Não foi possível remover o serviço.');
  }

  async function saveComparison(values) {
    await guard();
    if (!values.beforeId || !values.afterId || values.beforeId === values.afterId) throw new AdminDataError('Escolha duas imagens diferentes para antes e depois.');
    const payload = {
      title: String(values.title).trim(), service_name: String(values.serviceName).trim(),
      description: String(values.description || '').trim(), before_asset_id: values.beforeId,
      after_asset_id: values.afterId, sort_order: Number(values.order), published: Boolean(values.published),
      demonstrative: true, consent_confirmed: false
    };
    if (!payload.title || !payload.service_name || !Number.isInteger(payload.sort_order) || payload.sort_order < 1) throw new AdminDataError('Preencha título, serviço e uma ordem maior que zero.');
    if (payload.published) await ensurePublicAssets([payload.before_asset_id, payload.after_asset_id]);
    const request = values.id ? table('comparisons').update(payload).eq('id', values.id) : table('comparisons').insert(payload);
    await query(request.select().single(), 'Não foi possível salvar a comparação.');
  }

  async function deleteComparison(id) {
    await guard();
    await query(table('comparisons').delete().eq('id', id).select().single(), 'Não foi possível remover a comparação.');
  }

  return { loadAll, publicUrl, uploadAsset, referencesFor, deleteAsset, updateAssetVisibility, saveHero, saveService, deleteService, saveComparison, deleteComparison };
}

export const mediaRules = { BUCKET, MAX_FILE_SIZE, ALLOWED_TYPES: [...ALLOWED_TYPES.keys()] };
