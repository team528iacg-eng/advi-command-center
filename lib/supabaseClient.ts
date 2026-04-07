import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use placeholder if env var is not set (during Next.js static analysis phase)
// At runtime, the real env var is always available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Browser/client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (lazy singleton)
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _admin;
}
