'use client';

/**
 * /auth/go — Magic link intermediary page.
 *
 * Problem: Slack, Gmail, and other messaging tools make automated HTTP
 * requests to "preview" or "unfurl" links. If we share a raw Supabase
 * magic link (https://[project].supabase.co/auth/v1/verify?token=xxx),
 * those pre-fetchers visit the URL, consume the one-time token, and leave
 * the actual user with an "already used" error.
 *
 * Solution: We wrap the Supabase verification URL in this intermediary page.
 * The shared URL looks like:
 *   https://gdcforge.vercel.app/auth/go?url=BASE64_ENCODED_SUPABASE_URL
 *
 * Pre-fetchers visit /auth/go, receive our HTML (a loading spinner), and
 * stop — they don't execute JavaScript. Real users' browsers DO execute the
 * JavaScript, which decodes the URL and follows it immediately. The Supabase
 * token is only consumed when the actual user clicks the link.
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GoContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encoded = searchParams.get('url');
    if (!encoded) {
      setError('This link is missing required information.');
      return;
    }

    let decoded: string;
    try {
      decoded = atob(encoded);
    } catch {
      setError('This link is malformed. Ask for a new one.');
      return;
    }

    // Safety check — only follow Supabase auth verify URLs
    if (!decoded.includes('/auth/v1/verify')) {
      setError('This link is invalid. Ask for a new one.');
      return;
    }

    // Redirect to the Supabase verification URL.
    // Pre-fetchers (Slack, email scanners) never reach this line because they
    // don't execute JavaScript. Real browsers do, and the redirect is instant.
    window.location.href = decoded;
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-sm text-red-400 text-center max-w-sm">{error}</p>
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

export default function GoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary">Signing you in…</p>
          </div>
        </div>
      }
    >
      <GoContent />
    </Suspense>
  );
}
