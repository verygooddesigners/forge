'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PasswordResetHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we have a password reset hash on home page or login page
    if ((pathname === '/' || pathname === '/login') && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        console.log('[PasswordResetHandler] Detected recovery hash, redirecting to reset-password');
        window.location.href = `/reset-password${hash}`;
      }
    }
  }, [pathname]);

  return null;
}

