import { createClient } from '@supabase/supabase-js';

// Get Anon Key from environment variables[cite: 9]
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If running in browser, route requests through local proxy to mask direct Supabase domain
const proxyBaseUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/supabase`
  : (import.meta.env.VITE_SUPABASE_URL || 'https://zagawijdouhyvcwkqace.supabase.co');

export const supabase = createClient(proxyBaseUrl, supabaseAnonKey);