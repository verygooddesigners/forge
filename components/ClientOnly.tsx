'use client';

import nextDynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Wraps a component to load it only on the client side (no SSR).
 * Use this to prevent Radix UI context errors during Next.js server prerendering.
 */
export function createClientOnly<T extends object>(
  loader: () => Promise<{ default: ComponentType<T> }>
): ComponentType<T> {
  return nextDynamic(loader, { ssr: false }) as ComponentType<T>;
}
