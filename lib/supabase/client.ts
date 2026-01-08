import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // #region agent log
  console.log('[Client] Creating Supabase client:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 30),
    timestamp: new Date().toISOString()
  });
  // #endregion

  if (!supabaseUrl || !supabaseAnonKey) {
    // #region agent log
    console.error('[Client] Missing environment variables!', {
      supabaseUrl,
      hasAnonKey: !!supabaseAnonKey
    });
    // #endregion
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}


