import { createClient } from '@supabase/supabase-js';
import { validatePublicConfig } from './config.js';

export function makeSupabaseClient(env) {
  const { url, key } = validatePublicConfig(env);
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
}
