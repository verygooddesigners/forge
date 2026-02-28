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

    // Don't show beta UI on auth pages
    if (AUTH_PATHS.some(p => window.location.pathname.startsWith(p))) return;

    const supabase = createClient();

    // Use getSession() (reads cached cookie) instead of getUser() (network call)
    // to avoid the toolbar never appearing when the network call is slow/fails.
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? undefined;
      setUserEmail(email);

      // Only fetch beta notes if logged in
      if (email) {
        fetch('/api/beta-notes')
          .then(r => r.json())
          .then(json => {
            if (json.data) setBetaData(json.data);
          })
          .catch(console.error);
      }
    });
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
