const EXPECTED_ORIGIN = 'https://zffigzpmwcbmqfgrhrao.supabase.co';

function isPublicKey(value) {
  if (typeof value !== 'string' || value.startsWith('sb_secret_')) return false;
  if (value.startsWith('sb_publishable_')) return true;
  try {
    const part = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')));
    return payload.role === 'anon';
  } catch { return false; }
}

export function publicConfig(env) {
  const mode = env.PUBLIC_CONTENT_SOURCE === 'supabase' ? 'supabase' : 'json';
  if (mode === 'json') return { mode };
  if (env.SUPABASE_URL !== EXPECTED_ORIGIN || !isPublicKey(env.SUPABASE_PUBLISHABLE_KEY)) {
    return { mode: 'supabase', supabaseUrl: '', publishableKey: '' };
  }
  return { mode, supabaseUrl: EXPECTED_ORIGIN, publishableKey: env.SUPABASE_PUBLISHABLE_KEY };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/public-config') {
      const config = publicConfig(env);
      const ready = config.mode === 'json' || Boolean(config.publishableKey);
      return Response.json(config, {
        status: ready ? 200 : 503,
        headers: { 'Cache-Control': 'no-store', 'X-Prime-Clean-Config': 'worker', 'X-Content-Type-Options': 'nosniff' }
      });
    }
    return env.ASSETS.fetch(request);
  }
};
