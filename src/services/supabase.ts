import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxzlwpdpnvvcgnttjfao.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rxXXKLhKUdZUc_QHLM-sRA_g79xAys3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
