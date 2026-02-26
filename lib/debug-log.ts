/**
 * Debug logging for project creation and research pipeline.
 * - Server: logs in development (npm run dev) or when DEBUG_RESEARCH=1.
 * - Client: set NEXT_PUBLIC_DEBUG_RESEARCH=1 in .env.local to see browser logs.
 */

const clientEnabled =
  typeof window !== 'undefined' &&
  (process.env.NEXT_PUBLIC_DEBUG_RESEARCH === '1' || process.env.NEXT_PUBLIC_DEBUG_RESEARCH === 'true');

const serverEnabled =
  typeof window === 'undefined' &&
  (process.env.DEBUG_RESEARCH === '1' ||
    process.env.DEBUG_RESEARCH === 'true' ||
    process.env.NODE_ENV === 'development');

export function debugLog(tag: string, ...args: unknown[]) {
  const enabled = clientEnabled || serverEnabled;
  if (enabled) {
    const prefix = `[Forge:${tag}]`;
    console.log(prefix, ...args);
  }
}
