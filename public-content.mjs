const EXPECTED_ORIGIN = 'https://zffigzpmwcbmqfgrhrao.supabase.co';
const BUCKET = 'prime-clean-media';
const PATH_PATTERN = /^(hero|services|comparisons)\/[a-z0-9][a-z0-9_-]*\.(webp|jpg|jpeg|png)$/;
const SYNTHETIC_PATTERN = /(ilustrativ|gerad|simula|sint[eé]tic|fict)/i;

export class PublicContentError extends Error {}

function validKey(value) {
  if (typeof value !== 'string' || !value.trim() || value.startsWith('sb_secret_')) return false;
  if (value.startsWith('sb_publishable_')) return true;
  try {
    const part = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')));
    return payload.role === 'anon';
  } catch { return false; }
}

function normalizeConfig(value) {
  if (!value || !['json', 'supabase'].includes(value.mode)) throw new PublicContentError('Configuração pública de conteúdo inválida.');
  if (value.mode === 'json') return { mode: 'json' };
  if (value.supabaseUrl !== EXPECTED_ORIGIN || !validKey(value.publishableKey)) {
    throw new PublicContentError('A fonte pública está indisponível ou foi configurada com uma origem inválida.');
  }
  return { mode: 'supabase', supabaseUrl: EXPECTED_ORIGIN, publishableKey: value.publishableKey };
}

async function readJson(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, options);
  const value = await response.json().catch(() => { throw new PublicContentError('A resposta pública não contém JSON válido.'); });
  return { response, value };
}

export async function loadPublicConfig(fetchImpl = fetch) {
  const local = await readJson(fetchImpl, 'public-content-config.json', { cache: 'no-store' });
  if (!local.response.ok) throw new PublicContentError('Não foi possível carregar a configuração local de conteúdo.');
  const fallback = normalizeConfig(local.value);
  let runtime;
  try {
    runtime = await readJson(fetchImpl, 'api/public-config', { cache: 'no-store' });
  } catch (error) {
    if (fallback.mode === 'supabase') throw new PublicContentError('A configuração pública está temporariamente indisponível.');
    return fallback;
  }
  if (runtime.response.headers.get('x-prime-clean-config') !== 'worker') return fallback;
  return normalizeConfig(runtime.value);
}

export function publicImageUrl(asset, origin = EXPECTED_ORIGIN) {
  if (!asset || asset.public_visible !== true || asset.illustrative !== true) return '';
  if (asset.bucket_id !== BUCKET || typeof asset.storage_path !== 'string' || !PATH_PATTERN.test(asset.storage_path)) return '';
  if (typeof asset.alt_text !== 'string' || !SYNTHETIC_PATTERN.test(asset.alt_text)) return '';
  if (origin !== EXPECTED_ORIGIN) return '';
  const encoded = asset.storage_path.split('/').map(encodeURIComponent).join('/');
  const url = new URL(`/storage/v1/object/public/${BUCKET}/${encoded}`, EXPECTED_ORIGIN);
  return url.protocol === 'https:' && url.origin === EXPECTED_ORIGIN ? url.href : '';
}

export function safePublicImageUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    const path = decodeURIComponent(url.pathname.slice(prefix.length));
    if (url.protocol !== 'https:' || url.origin !== EXPECTED_ORIGIN || !url.pathname.startsWith(prefix) || url.search || url.hash || !PATH_PATTERN.test(path)) return '';
    return url.href;
  } catch { return ''; }
}

function requestHeaders(key) {
  return { Accept: 'application/json', apikey: key };
}

async function table(fetchImpl, config, name, query) {
  const url = `${config.supabaseUrl}/rest/v1/${name}?${query}`;
  const response = await fetchImpl(url, { method: 'GET', headers: requestHeaders(config.publishableKey), cache: 'no-store' });
  if (!response.ok) throw new PublicContentError('Não foi possível consultar o conteúdo publicado.');
  const value = await response.json().catch(() => { throw new PublicContentError('O servidor retornou conteúdo inválido.'); });
  if (!Array.isArray(value)) throw new PublicContentError('O servidor retornou uma estrutura inesperada.');
  return value;
}

export async function loadSupabaseContent(config, fetchImpl = fetch) {
  const [settingsRows, serviceRows, comparisonRows, assetRows] = await Promise.all([
    table(fetchImpl, config, 'site_settings', 'select=id,area,hero_asset_id,hero_visible&id=eq.1'),
    table(fetchImpl, config, 'services', 'select=id,title,description,image_asset_id,sort_order,visible,illustrative&visible=eq.true&order=sort_order.asc'),
    table(fetchImpl, config, 'comparisons', 'select=id,title,service_name,description,before_asset_id,after_asset_id,sort_order,published,demonstrative,consent_confirmed&published=eq.true&demonstrative=eq.true&order=sort_order.asc'),
    table(fetchImpl, config, 'media_assets', 'select=id,bucket_id,storage_path,alt_text,illustrative,public_visible&public_visible=eq.true')
  ]);
  const assets = new Map(assetRows.filter((asset) => publicImageUrl(asset)).map((asset) => [asset.id, asset]));
  const setting = settingsRows.find((row) => row?.id === 1) || {};
  const hero = assets.get(setting.hero_asset_id);
  const services = serviceRows.flatMap((row) => {
    if (!row || row.visible !== true || row.illustrative !== true || typeof row.title !== 'string' || typeof row.description !== 'string') return [];
    const asset = assets.get(row.image_asset_id);
    return [{ title: row.title.trim(), description: row.description.trim(), image: publicImageUrl(asset), imageAlt: asset?.alt_text || '', illustrative: true, order: Number.isInteger(row.sort_order) ? row.sort_order : 1, visible: true }];
  }).filter((row) => row.title && row.description).sort((a, b) => a.order - b.order);
  const comparisons = comparisonRows.flatMap((row) => {
    const before = assets.get(row?.before_asset_id); const after = assets.get(row?.after_asset_id);
    if (!row || row.published !== true || row.demonstrative !== true || row.consent_confirmed !== false || !before || !after || before.id === after.id) return [];
    if (typeof row.title !== 'string' || typeof row.service_name !== 'string') return [];
    return [{ title: row.title.trim(), service: row.service_name.trim(), description: typeof row.description === 'string' ? row.description.trim() : '', before: publicImageUrl(before), after: publicImageUrl(after), beforeAlt: before.alt_text, afterAlt: after.alt_text, order: Number.isInteger(row.sort_order) ? row.sort_order : 1, published: true, demonstrative: true }];
  }).filter((row) => row.title && row.service && row.before && row.after).sort((a, b) => a.order - b.order);
  return {
    site: {
      area: typeof setting.area === 'string' && setting.area.trim() ? setting.area.trim() : 'Projeto demonstrativo — sem área de atendimento',
      heroImage: setting.hero_visible === true ? publicImageUrl(hero) : '',
      heroImageAlt: setting.hero_visible === true ? hero?.alt_text || '' : '',
      heroImageIllustrative: Boolean(hero), heroImageVisible: setting.hero_visible === true && Boolean(hero)
    }, services, comparisons
  };
}

export const publicContentRules = { EXPECTED_ORIGIN, BUCKET };
