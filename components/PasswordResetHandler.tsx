'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PasswordResetHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on the home page and have a password reset hash
    if (pathname === '/' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        window.location.href = `/reset-password${hash}`;
      }
    }
  }, [pathname]);

  return null;
}

