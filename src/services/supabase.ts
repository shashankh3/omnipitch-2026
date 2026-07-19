import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Without credentials the app runs in offline mode: broadcasts become no-ops
// so incident logging still works locally with zero configuration.
function createOfflineStub(): SupabaseClient {
  const channelStub = {
    send: async () => 'ok',
    on: () => channelStub,
    subscribe: () => channelStub,
    unsubscribe: async () => 'ok'
  };
  return { channel: () => channelStub } as unknown as SupabaseClient;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createOfflineStub();
