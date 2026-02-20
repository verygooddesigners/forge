'use client';

import { useEffect } from 'react';

export function PasswordResetHandler() {
  useEffect(() => {
    // Check if we have a password reset hash on home page or login page
    const pathname = window.location.pathname;
    if (pathname === '/' || pathname === '/login') {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        console.log('[PasswordResetHandler] Detected recovery hash, redirecting to reset-password');
        window.location.href = `/reset-password${hash}`;
      }
    }
  }, []);

  return null;
}

