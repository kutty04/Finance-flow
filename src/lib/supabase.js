import { createClient } from '@supabase/supabase-js';

// We fall back to empty strings so it doesn't crash if env vars are missing initially.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
