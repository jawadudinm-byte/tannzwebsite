import { createClient } from '@supabase/supabase-js';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Always route via /api/supabase proxy (Vite local server proxy on dev, Vercel rewrites on production)
const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/api/supabase`
  : 'https://zagawijdouhyvcwkqace.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);