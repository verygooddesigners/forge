/**
 * Lightweight in-memory cache for system settings (API keys etc.)
 * Used by lib/ai.ts to avoid a DB round-trip on every AI request.
 * Invalidated by the admin settings API route on save.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  value: string;
  fetchedAt: number;
}

const cache: Record<string, CacheEntry> = {};

export function getCached(key: string): string | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

export function setCached(key: string, value: string) {
  cache[key] = { value, fetchedAt: Date.now() };
}

export function invalidateCached(key: string) {
  delete cache[key];
}

export function invalidateAll() {
  Object.keys(cache).forEach(k => delete cache[k]);
}
