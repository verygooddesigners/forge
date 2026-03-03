import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient<any, 'public', any> | null = null;

export function createClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Client] Missing environment variables!', {
      supabaseUrl,
      hasAnonKey: !!supabaseAnonKey
    });
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseClient<any, 'public', any>;
  return _client;
}
