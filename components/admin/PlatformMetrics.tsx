'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Gauge,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  MousePointerClick,
  Zap,
  MoveHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawVital {
  id: string;
  metric_name: string;
  value: number;
  rating: string | null;
  pathname: string | null;
  navigation_type: string | null;
  user_agent: string | null;
  connection_type: string | null;
  created_at: string;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';
type MetricName = 'LCP' | 'FCP' | 'TTFB' | 'INP' | 'CLS';

interface MetricSummary {
  name: MetricName;
  p75: number;
  count: number;
  rating: 'good' | 'needs-improvement' | 'poor' | 'none';
  unit: string;
}

interface BucketPoint {
  time: string;
  LCP: number | null;
  FCP: number | null;
  TTFB: number | null;
}

interface PathRow {
  pathname: string;
  count: number;
  LCP: number | null;
  FCP: number | null;
  TTFB: number | null;
  INP: number | null;
  CLS: number | null;
}

interface RatingDist {
  metric: MetricName;
  good: number;
  needsImprovement: number;
  poor: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METRIC_NAMES: MetricName[] = ['LCP', 'FCP', 'TTFB', 'INP', 'CLS'];

const METRIC_META: Record<MetricName, { label: string; icon: React.ComponentType<{ className?: string }>; unit: string; goodMax: number; needsMax: number }> = {
  LCP:  { label: 'Largest Contentful Paint', icon: TrendingUp,        unit: 'ms',  goodMax: 2500,  needsMax: 4000  },
  FCP:  { label: 'First Contentful Paint',   icon: Zap,               unit: 'ms',  goodMax: 1800,  needsMax: 3000  },
  TTFB: { label: 'Time to First Byte',       icon: Clock,             unit: 'ms',  goodMax: 800,   needsMax: 1800  },
  INP:  { label: 'Interaction to Next Paint', icon: MousePointerClick, unit: 'ms',  goodMax: 200,   needsMax: 500   },
  CLS:  { label: 'Cumulative Layout Shift',  icon: MoveHorizontal,    unit: '',    goodMax: 0.1,   needsMax: 0.25  },
};

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string; hours: number }[] = [
  { value: '1h',  label: 'Last 1h',  hours: 1   },
  { value: '6h',  label: 'Last 6h',  hours: 6   },
  { value: '24h', label: 'Last 24h', hours: 24  },
  { value: '7d',  label: 'Last 7d',  hours: 168 },
];

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function getRatingForValue(metric: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const meta = METRIC_META[metric];
  if (value <= meta.goodMax) return 'good';
  if (value <= meta.needsMax) return 'needs-improvement';
  return 'poor';
}

function formatValue(metric: MetricName, value: number): string {
  if (metric === 'CLS') return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

function getBucketMs(timeRange: TimeRange): number {
  switch (timeRange) {
    case '1h':
    case '6h':  return 5 * 60 * 1000;   // 5 min buckets
    case '24h': return 30 * 60 * 1000;  // 30 min buckets
    case '7d':  return 4 * 60 * 60 * 1000; // 4 hour buckets
  }
}

function formatBucketTime(ts: number, timeRange: TimeRange): string {
  if (timeRange === '7d') return format(new Date(ts), 'MMM d HH:mm');
  return format(new Date(ts), 'HH:mm');
}

// ---------------------------------------------------------------------------
// Data aggregation
// ---------------------------------------------------------------------------

function computeMetricSummaries(vitals: RawVital[]): MetricSummary[] {
  return METRIC_NAMES.map((name) => {
    const values = vitals.filter(v => v.metric_name === name).map(v => v.value);
    const p75Val = percentile(values, 75);
    const rating = values.length > 0 ? getRatingForValue(name, p75Val) : 'none';
    return {
      name,
      p75: p75Val,
      count: values.length,
      rating,
      unit: METRIC_META[name].unit,
    };
  });
}

function computeTimeSeries(vitals: RawVital[], timeRange: TimeRange): BucketPoint[] {
  const bucketMs = getBucketMs(timeRange);
  const chartMetrics: MetricName[] = ['LCP', 'FCP', 'TTFB'];

  // Build map: bucketTs -> metric -> values[]
  const bucketMap = new Map<number, Record<string, number[]>>();

  for (const vital of vitals) {
    if (!chartMetrics.includes(vital.metric_name as MetricName)) continue;
    const ts = new Date(vital.created_at).getTime();
    const bucket = Math.floor(ts / bucketMs) * bucketMs;
    if (!bucketMap.has(bucket)) bucketMap.set(bucket, { LCP: [], FCP: [], TTFB: [] });
    const entry = bucketMap.get(bucket)!;
    if (!entry[vital.metric_name]) entry[vital.metric_name] = [];
    entry[vital.metric_name].push(vital.value);
  }

  const sorted = Array.from(bucketMap.entries()).sort(([a], [b]) => a - b);

  return sorted.map(([ts, metrics]) => ({
    time: formatBucketTime(ts, timeRange),
    LCP:  metrics['LCP']?.length  ? Math.round(percentile(metrics['LCP'],  75)) : null,
    FCP:  metrics['FCP']?.length  ? Math.round(percentile(metrics['FCP'],  75)) : null,
    TTFB: metrics['TTFB']?.length ? Math.round(percentile(metrics['TTFB'], 75)) : null,
  }));
}

function computePathBreakdown(vitals: RawVital[]): PathRow[] {
  const pathMap = new Map<string, Record<string, number[]>>();

  for (const vital of vitals) {
    const path = vital.pathname || '/';
    if (!pathMap.has(path)) pathMap.set(path, {});
    const entry = pathMap.get(path)!;
    if (!entry[vital.metric_name]) entry[vital.metric_name] = [];
    entry[vital.metric_name].push(vital.value);
  }

  const rows: PathRow[] = [];
  for (const [pathname, metrics] of pathMap.entries()) {
    const allValues = Object.values(metrics).flat();
    rows.push({
      pathname,
      count: allValues.length,
      LCP:  metrics['LCP']?.length  ? Math.round(percentile(metrics['LCP'],  75)) : null,
      FCP:  metrics['FCP']?.length  ? Math.round(percentile(metrics['FCP'],  75)) : null,
      TTFB: metrics['TTFB']?.length ? Math.round(percentile(metrics['TTFB'], 75)) : null,
      INP:  metrics['INP']?.length  ? Math.round(percentile(metrics['INP'],  75)) : null,
      CLS:  metrics['CLS']?.length  ? parseFloat(percentile(metrics['CLS'],  75).toFixed(3)) : null,
    });
  }

  return rows.sort((a, b) => b.count - a.count);
}

function computeRatingDistribution(vitals: RawVital[]): RatingDist[] {
  return METRIC_NAMES.map((name) => {
    const metricVitals = vitals.filter(v => v.metric_name === name);
    let good = 0;
    let needsImprovement = 0;
    let poor = 0;
    for (const v of metricVitals) {
      const r = v.rating ?? getRatingForValue(name, v.value);
      if (r === 'good') good++;
      else if (r === 'needs-improvement') needsImprovement++;
      else poor++;
    }
    return { metric: name, good, needsImprovement, poor };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RatingBadge({ rating }: { rating: 'good' | 'needs-improvement' | 'poor' | 'none' }) {
  switch (rating) {
    case 'good':
      return <Badge className="bg-green-500/10 text-green-500 border border-green-500/30 text-[11px]">Good</Badge>;
    case 'needs-improvement':
      return <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 text-[11px]">Needs Work</Badge>;
    case 'poor':
      return <Badge className="bg-red-500/10 text-red-500 border border-red-500/30 text-[11px]">Poor</Badge>;
    case 'none':
      return <Badge className="bg-bg-elevated text-text-tertiary border border-border-subtle text-[11px]">No data</Badge>;
  }
}

function MetricValueText({
  metric,
  value,
}: {
  metric: MetricName;
  value: number | null;
}) {
  if (value === null) return <span className="text-text-tertiary">—</span>;
  const rating = getRatingForValue(metric, value);
  const colorClass =
    rating === 'good'
      ? 'text-green-500'
      : rating === 'needs-improvement'
      ? 'text-yellow-500'
      : 'text-red-500';
  return <span className={colorClass}>{formatValue(metric, value)}</span>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PlatformMetrics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [vitals, setVitals] = useState<RawVital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async (range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const option = TIME_RANGE_OPTIONS.find(o => o.value === range)!;
      const res = await fetch(`/api/admin/vitals?hours=${option.hours}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setVitals(json.data ?? []);
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange, fetchData]);

  const summaries = computeMetricSummaries(vitals);
  const timeSeries = computeTimeSeries(vitals, timeRange);
  const pathBreakdown = computePathBreakdown(vitals);
  const ratingDist = computeRatingDistribution(vitals);
  const hasData = vitals.length > 0;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary flex items-center gap-2">
            <Gauge className="w-5 h-5 text-accent-primary" />
            Platform Metrics
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Real-time Core Web Vitals collected from all page loads.
            {lastFetched && (
              <span className="ml-2">Last updated {lastFetched.toLocaleTimeString()}.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-bg-elevated rounded-lg p-1 border border-border-subtle">
            {TIME_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  timeRange === opt.value
                    ? 'bg-bg-surface text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(timeRange)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border border-red-500/20 bg-red-500/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-red-400">Failed to load metrics: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
          <span className="ml-2 text-sm text-text-tertiary">Loading metrics…</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {summaries.map((summary) => {
              const meta = METRIC_META[summary.name];
              const Icon = meta.icon;
              return (
                <Card key={summary.name} className="border border-border-subtle bg-bg-surface">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className="w-3.5 h-3.5 text-text-tertiary" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                        {summary.name}
                      </span>
                    </div>
                    <div className="text-[22px] font-semibold text-text-primary leading-none mb-2">
                      {summary.count === 0 ? (
                        <span className="text-text-tertiary text-base">—</span>
                      ) : (
                        formatValue(summary.name, summary.p75)
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <RatingBadge rating={summary.rating} />
                      {summary.count > 0 && (
                        <span className="text-[10px] text-text-tertiary">{summary.count} samples</span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-tertiary mt-1.5 leading-tight">{meta.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No data state */}
          {!hasData && (
            <Card className="border border-border-subtle bg-bg-surface">
              <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center gap-3">
                <Gauge className="w-8 h-8 text-text-tertiary" />
                <p className="text-sm font-medium text-text-secondary">No data yet</p>
                <p className="text-xs text-text-tertiary text-center max-w-xs">
                  Web Vitals will appear here once users start visiting pages. Make sure
                  <code className="mx-1 px-1 bg-bg-elevated rounded text-[11px] font-mono">WebVitalsReporter</code>
                  is mounted in your root layout.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Time Series Chart */}
          {hasData && timeSeries.length > 0 && (
            <Card className="border border-border-subtle bg-bg-surface">
              <CardContent className="pt-5 pb-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">
                  Load Performance Over Time
                  <span className="ml-2 text-[11px] text-text-tertiary font-normal">(p75 per bucket)</span>
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={timeSeries} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradLCP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradFCP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradTTFB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}ms`}
                      width={52}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--color-text-primary)',
                      }}
                      formatter={(value: number, name: string) => [`${value}ms`, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="LCP"
                      name="LCP"
                      stroke="#6366f1"
                      fill="url(#gradLCP)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                    <Area
                      type="monotone"
                      dataKey="FCP"
                      name="FCP"
                      stroke="#22c55e"
                      fill="url(#gradFCP)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                    <Area
                      type="monotone"
                      dataKey="TTFB"
                      name="TTFB"
                      stroke="#eab308"
                      fill="url(#gradTTFB)"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Page Path Breakdown */}
          {hasData && pathBreakdown.length > 0 && (
            <Card className="border border-border-subtle bg-bg-surface">
              <CardContent className="pt-5 pb-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">
                  Page Path Breakdown
                  <span className="ml-2 text-[11px] text-text-tertiary font-normal">(p75 per path)</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left pb-2 pr-4 text-text-tertiary font-medium">Path</th>
                        <th className="text-right pb-2 px-3 text-text-tertiary font-medium">Samples</th>
                        <th className="text-right pb-2 px-3 text-text-tertiary font-medium">LCP</th>
                        <th className="text-right pb-2 px-3 text-text-tertiary font-medium">FCP</th>
                        <th className="text-right pb-2 px-3 text-text-tertiary font-medium">TTFB</th>
                        <th className="text-right pb-2 px-3 text-text-tertiary font-medium">INP</th>
                        <th className="text-right pb-2 pl-3 text-text-tertiary font-medium">CLS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pathBreakdown.map((row) => (
                        <tr key={row.pathname} className="border-b border-border-subtle last:border-0">
                          <td className="py-2.5 pr-4">
                            <code className="text-[11px] font-mono text-text-secondary bg-bg-elevated px-1.5 py-0.5 rounded">
                              {row.pathname}
                            </code>
                          </td>
                          <td className="py-2.5 px-3 text-right text-text-tertiary">{row.count}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <MetricValueText metric="LCP" value={row.LCP} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <MetricValueText metric="FCP" value={row.FCP} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <MetricValueText metric="TTFB" value={row.TTFB} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <MetricValueText metric="INP" value={row.INP} />
                          </td>
                          <td className="py-2.5 pl-3 text-right font-mono">
                            {row.CLS !== null ? (
                              <MetricValueText metric="CLS" value={row.CLS} />
                            ) : (
                              <span className="text-text-tertiary">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating Distribution */}
          {hasData && (
            <Card className="border border-border-subtle bg-bg-surface">
              <CardContent className="pt-5 pb-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4">Rating Distribution</h2>
                <div className="space-y-3">
                  {ratingDist.map((dist) => {
                    const total = dist.good + dist.needsImprovement + dist.poor;
                    if (total === 0) return null;
                    const goodPct = (dist.good / total) * 100;
                    const needsPct = (dist.needsImprovement / total) * 100;
                    const poorPct = (dist.poor / total) * 100;
                    return (
                      <div key={dist.metric} className="flex items-center gap-3">
                        <span className="text-[12px] font-mono font-semibold text-text-secondary w-10 shrink-0">
                          {dist.metric}
                        </span>
                        <div className="flex-1 h-5 rounded-full overflow-hidden bg-bg-elevated flex">
                          {goodPct > 0 && (
                            <div
                              title={`Good: ${dist.good}`}
                              style={{ width: `${goodPct}%` }}
                              className="h-full bg-green-500 transition-all"
                            />
                          )}
                          {needsPct > 0 && (
                            <div
                              title={`Needs improvement: ${dist.needsImprovement}`}
                              style={{ width: `${needsPct}%` }}
                              className="h-full bg-yellow-500 transition-all"
                            />
                          )}
                          {poorPct > 0 && (
                            <div
                              title={`Poor: ${dist.poor}`}
                              style={{ width: `${poorPct}%` }}
                              className="h-full bg-red-500 transition-all"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-text-tertiary min-w-[120px]">
                          <span className="text-green-500">{dist.good}g</span>
                          <span className="text-yellow-500">{dist.needsImprovement}ni</span>
                          <span className="text-red-500">{dist.poor}p</span>
                          <span>/ {total}</span>
                        </div>
                      </div>
                    );
                  })}
                  {ratingDist.every(d => d.good + d.needsImprovement + d.poor === 0) && (
                    <p className="text-sm text-text-tertiary text-center py-4">No rating data available.</p>
                  )}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-[11px] text-text-tertiary">Good</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-[11px] text-text-tertiary">Needs Improvement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[11px] text-text-tertiary">Poor</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
