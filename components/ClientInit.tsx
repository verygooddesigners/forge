'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { PasswordResetHandler } from './PasswordResetHandler';

export function ClientInit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <PasswordResetHandler />
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  );
}
