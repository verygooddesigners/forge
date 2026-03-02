'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { PasswordResetHandler } from './PasswordResetHandler';
import { BetaToolbar } from './beta/BetaToolbar';
import { BetaNotesModal } from './beta/BetaNotesModal';
import { createClient } from '@/lib/supabase/client';

interface BetaData {
  beta: {
    id: string;
    name: string;
    notes: string;
    notes_version: number;
    notes_is_major_update: boolean;
  };
  membership: {
    id: string;
    acknowledged_at: string | null;
    last_seen_notes_version: number;
  };
}

// Auth pages where we never want to show the beta toolbar or modal
const AUTH_PATHS = ['/login', '/reset-password', '/signup', '/awaiting-confirmation'];

export function ClientInit() {
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [betaData, setBetaData] = useState<BetaData | null>(null);
  const [betaModalDismissed, setBetaModalDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    const isAuthPage = AUTH_PATHS.some(p => window.location.pathname.startsWith(p));

    const fetchBetaData = (email: string) => {
      fetch('/api/beta-notes')
        .then(r => r.json())
        .then(json => { if (json.data) setBetaData(json.data); })
        .catch(console.error);
    };

    // Initial session check (skip on auth pages like /login, /signup)
    if (!isAuthPage) {
      // Use getSession() (reads cached cookie) instead of getUser() (network call)
      // to avoid the toolbar never appearing when the network call is slow/fails.
      supabase.auth.getSession().then(({ data }) => {
        const email = data.session?.user?.email ?? undefined;
        setUserEmail(email);
        if (email) fetchBetaData(email);
      });
    }

    // Listen for auth state changes so we catch the session being set by
    // /auth/magic (magic link sign-in). The root layout persists across
    // client-side navigations, so the initial getSession() call above may
    // run before setSession() is called — this listener bridges that gap.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const email = session.user?.email ?? undefined;
        setUserEmail(email);
        if (email) fetchBetaData(email);
      } else if (event === 'SIGNED_OUT') {
        setUserEmail(undefined);
        setBetaData(null);
        setBetaModalDismissed(false);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleBetaModalDismiss = () => {
    setBetaModalDismissed(true);
  };

  if (!mounted) return null;

  // Determine if modal should show
  const showModal = !betaModalDismissed && betaData !== null && (() => {
    const { membership, beta } = betaData;
    const isMandatory = !membership.acknowledged_at;
    const isMajorUpdate =
      !isMandatory &&
      beta.notes_is_major_update &&
      membership.last_seen_notes_version < beta.notes_version;
    return isMandatory || isMajorUpdate;
  })();

  return (
    <>
      <PasswordResetHandler />
      <Toaster theme="dark" position="bottom-right" richColors />
      {/* Only show BetaToolbar when authenticated */}
      {userEmail && <BetaToolbar userEmail={userEmail} betaData={betaData} />}
      {showModal && (
        <BetaNotesModal data={betaData} onDismiss={handleBetaModalDismiss} />
      )}
    </>
  );
}
