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

export function ClientInit() {
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [betaData, setBetaData] = useState<BetaData | null>(null);
  const [betaModalDismissed, setBetaModalDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? undefined;
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
      <BetaToolbar userEmail={userEmail} betaData={betaData} />
      {showModal && (
        <BetaNotesModal data={betaData} onDismiss={handleBetaModalDismiss} />
      )}
    </>
  );
}
