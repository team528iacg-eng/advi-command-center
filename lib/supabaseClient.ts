import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const supabase: SupabaseClient<Database> = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

let _admin: SupabaseClient<Database> | null = null;
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_admin) _admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);
  return _admin;
}
