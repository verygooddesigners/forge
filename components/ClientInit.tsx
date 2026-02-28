'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { PasswordResetHandler } from './PasswordResetHandler';
import { BetaToolbar } from './beta/BetaToolbar';
import { createClient } from '@/lib/supabase/client';

export function ClientInit() {
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? undefined);
    });
  }, []);

  if (!mounted) return null;

  return (
    <>
      <PasswordResetHandler />
      <Toaster theme="dark" position="bottom-right" richColors />
      <BetaToolbar userEmail={userEmail} />
    </>
  );
}
