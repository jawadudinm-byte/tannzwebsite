import { createClient } from '@supabase/supabase-js';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Always construct full absolute HTTP/HTTPS URL for Supabase JS client
const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/api/supabase`
  : (import.meta.env.VITE_SUPABASE_URL || 'https://zagawijdouhyvcwkqace.supabase.co');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);