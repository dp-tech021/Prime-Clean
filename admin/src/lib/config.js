const SUPABASE_HOST = /^(?:[a-z0-9-]+\.)?supabase\.co$/i;

function decodeJwtPayload(value) {
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  } catch {
    return null;
  }
}

export function validatePublicConfig(env) {
  const urlValue = env.VITE_SUPABASE_URL?.trim();
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!urlValue || !key) throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY em admin/.env.local.');

  let url;
  try { url = new URL(urlValue); } catch { throw new Error('VITE_SUPABASE_URL não é uma URL válida.'); }
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((!local && url.protocol !== 'https:') || (local && !['http:', 'https:'].includes(url.protocol))) {
    throw new Error('A URL do Supabase deve usar HTTPS; HTTP é aceito somente no ambiente local.');
  }
  if (!local && !SUPABASE_HOST.test(url.hostname)) throw new Error('Use a URL oficial do projeto Supabase.');
  if (key.startsWith('sb_secret_')) throw new Error('Chaves secretas não podem ser usadas no navegador.');

  const payload = decodeJwtPayload(key);
  const isPublishable = key.startsWith('sb_publishable_');
  const isLegacyAnon = payload?.role === 'anon';
  if (!isPublishable && !isLegacyAnon) throw new Error('Use somente a chave publicável (ou a chave anon legada) do Supabase.');
  return { url: url.toString().replace(/\/$/, ''), key };
}
