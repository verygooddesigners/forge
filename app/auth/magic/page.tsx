'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * /auth/magic — Client-side handler for admin-generated magic links.
 *
 * Supabase magic links (from admin.auth.admin.generateLink) redirect here
 * after verifying the one-time token. Depending on the project's auth flow,
 * Supabase appends session info as either:
 *
 *   1. Hash fragments:  #access_token=xxx&refresh_token=xxx  (implicit flow)
 *   2. Code param:      ?code=xxx                            (PKCE flow)
 *   3. OTP token hash:  ?token_hash=xxx&type=magiclink       (email OTP flow)
 *
 * This page handles all three cases client-side, then redirects to /dashboard.
 * A server-side route cannot handle case (1) because hash fragments are never
 * sent to the server.
 */
export default function MagicAuthPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      // ── 1. Implicit flow: hash fragments (#access_token=…&refresh_token=…) ─
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            router.replace('/dashboard');
            return;
          }
          setErrorMsg('Could not sign you in — the link may have expired. Ask for a new one.');
          return;
        }
      }

      // ── 2. PKCE code flow: ?code=xxx ────────────────────────────────────────
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace('/dashboard');
          return;
        }
        setErrorMsg('Could not sign you in — the link may have expired. Ask for a new one.');
        return;
      }

      // ── 3. OTP token hash flow: ?token_hash=xxx&type=xxx ───────────────────
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          // token_hash only supports email OTP types, not SMS
          type: type as 'email' | 'recovery' | 'invite' | 'magiclink' | 'signup' | 'email_change',
        });
        if (!error) {
          router.replace('/dashboard');
          return;
        }
        setErrorMsg('Could not sign you in — the link may have expired. Ask for a new one.');
        return;
      }

      // ── 4. Already signed in? ────────────────────────────────────────────────
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
        return;
      }

      setErrorMsg('This login link is invalid or has already been used. Ask for a new one.');
    }

    handleAuth();
  }, [router]);

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-sm text-red-400 text-center max-w-sm">{errorMsg}</p>
        <a href="/login" className="text-sm text-accent-primary hover:underline">
          Go to login page
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">Signing you in…</p>
      </div>
    </div>
  );
}
