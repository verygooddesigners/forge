'use client';

import { useEffect } from 'react';

export function ClientInit() {
  useEffect(() => {
    // Client-side initialization
    console.log('Forge client initialized');
  }, []);

  return null;
}
