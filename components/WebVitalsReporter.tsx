'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface VitalEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  pathname: string;
  navigationType: string;
  connectionType: string | null;
}

// Thresholds per https://web.dev/articles/vitals
const THRESHOLDS: Record<string, [number, number]> = {
  CLS:  [0.1,  0.25],
  FCP:  [1800, 3000],
  LCP:  [2500, 4000],
  TTFB: [800,  1800],
  INP:  [200,  500],
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t[0]) return 'good';
  if (value <= t[1]) return 'needs-improvement';
  return 'poor';
}

function getConnectionType(): string | null {
  if (typeof navigator === 'undefined') return null;
  const conn = (navigator as any).connection;
  return conn?.effectiveType ?? null;
}

function getNavigationType(): string {
  if (typeof performance === 'undefined') return 'navigate';
  const entries = performance.getEntriesByType('navigation');
  if (entries.length > 0) return (entries[0] as PerformanceNavigationTiming).type;
  return 'navigate';
}

export function WebVitalsReporter() {
  const pathname = usePathname();
  const bufferRef = useRef<VitalEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    const entries = bufferRef.current.splice(0);
    if (entries.length === 0) return;
    // Use sendBeacon for reliability, fall back to fetch
    const body = JSON.stringify(entries);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/admin/vitals', body);
    } else {
      fetch('/api/admin/vitals', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  const report = useCallback((name: string, value: number) => {
    bufferRef.current.push({
      name,
      value,
      rating: getRating(name, value),
      pathname: pathname || '/',
      navigationType: getNavigationType(),
      connectionType: getConnectionType(),
    });
    // Debounce: flush after 5s of quiet, or immediately if buffer > 10
    if (timerRef.current) clearTimeout(timerRef.current);
    if (bufferRef.current.length >= 10) {
      flush();
    } else {
      timerRef.current = setTimeout(flush, 5000);
    }
  }, [pathname, flush]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

    const observers: PerformanceObserver[] = [];

    // LCP
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) report('LCP', last.startTime);
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObs);
    } catch {
      // PerformanceObserver may not support this entry type
    }

    // FCP
    try {
      const fcpObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            report('FCP', entry.startTime);
          }
        }
      });
      fcpObs.observe({ type: 'paint', buffered: true });
      observers.push(fcpObs);
    } catch {
      // PerformanceObserver may not support this entry type
    }

    // CLS
    try {
      let clsValue = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        report('CLS', clsValue);
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObs);
    } catch {
      // PerformanceObserver may not support this entry type
    }

    // INP (Interaction to Next Paint)
    try {
      const inpObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // event entries have duration
          if ((entry as any).duration) {
            report('INP', (entry as any).duration);
          }
        }
      });
      inpObs.observe({ type: 'event', buffered: true });
      observers.push(inpObs);
    } catch {
      // PerformanceObserver may not support this entry type
    }

    // TTFB
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;
        report('TTFB', nav.responseStart - nav.requestStart);
      }
    } catch {
      // performance API may not be available
    }

    // Flush on page hide
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observers.forEach(o => o.disconnect());
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flush();
    };
  }, [report, flush]);

  return null; // This component renders nothing
}
