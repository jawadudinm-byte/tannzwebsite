import { createClient } from '@supabase/supabase-js';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Always route requests via /api/supabase proxy so the raw Supabase domain is hidden
const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/api/supabase`
  : (import.meta.env.VITE_SUPABASE_URL || 'https://zagawijdouhyvcwkqace.supabase.co');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);