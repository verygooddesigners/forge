'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Database,
  Shield,
  HardDrive,
  Cpu,
  Search,
  Bot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

type CheckStatus = 'healthy' | 'degraded' | 'error' | 'checking';

interface HealthCheck {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  latency?: number;
  message?: string;
  detail?: string;
}

const INITIAL_CHECKS: HealthCheck[] = [
  { id: 'database', name: 'Database', description: 'Supabase PostgreSQL connection', status: 'checking' },
  { id: 'auth', name: 'Authentication', description: 'Supabase Auth service', status: 'checking' },
  { id: 'storage', name: 'Storage', description: 'Supabase Storage buckets', status: 'checking' },
  { id: 'ai', name: 'Claude API', description: 'Anthropic Claude API connectivity', status: 'checking' },
  { id: 'tavily', name: 'Tavily API', description: 'News search API connectivity', status: 'checking' },
  { id: 'openai', name: 'OpenAI API', description: 'Embeddings and vision API connectivity', status: 'checking' },
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  auth: Shield,
  storage: HardDrive,
  ai: Cpu,
  tavily: Search,
  openai: Bot,
};

export function SystemHealth() {
  const [checks, setChecks] = useState<HealthCheck[]>(INITIAL_CHECKS);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateCheck = useCallback((id: string, update: Partial<HealthCheck>) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...update } : c)));
  }, []);

  const runHealthChecks = useCallback(async () => {
    setIsRefreshing(true);
    setChecks(INITIAL_CHECKS);

    const supabase = createClient();

    // Database
    const dbStart = Date.now();
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      const latency = Date.now() - dbStart;
      if (error) {
        updateCheck('database', { status: 'error', latency, message: 'Query failed', detail: error.message });
      } else {
        updateCheck('database', {
          status: latency > 1000 ? 'degraded' : 'healthy',
          latency,
          message: latency > 1000 ? 'Slow response (>1s)' : undefined,
        });
      }
    } catch (e: any) {
      updateCheck('database', { status: 'error', message: 'Connection refused', detail: e.message });
    }

    // Auth
    try {
      const { error } = await supabase.auth.getSession();
      if (error) {
        updateCheck('auth', { status: 'error', message: 'Auth service error', detail: error.message });
      } else {
        updateCheck('auth', { status: 'healthy' });
      }
    } catch (e: any) {
      updateCheck('auth', { status: 'error', message: 'Auth unreachable', detail: e.message });
    }

    // Storage — list all buckets instead of checking a specific one
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        updateCheck('storage', { status: 'degraded', message: 'Could not list storage buckets', detail: error.message });
      } else {
        const count = buckets?.length ?? 0;
        const bucketNames = (buckets ?? []).map((b) => b.name).join(', ') || 'none';
        updateCheck('storage', {
          status: 'healthy',
          message: `${count} bucket${count !== 1 ? 's' : ''} configured`,
          detail: `Buckets: ${bucketNames}`,
        });
      }
    } catch (e: any) {
      updateCheck('storage', { status: 'degraded', message: 'Storage check failed', detail: e.message });
    }

    // AI API
    const aiStart = Date.now();
    try {
      const res = await fetch('/api/generate/health', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      const latency = Date.now() - aiStart;
      if (res.ok) {
        updateCheck('ai', {
          status: 'healthy',
          latency: json.latency ?? latency,
          message: json.model ? `Model: ${json.model}` : undefined,
        });
      } else {
        updateCheck('ai', {
          status: res.status === 429 ? 'degraded' : 'error',
          latency,
          message: json.message || 'AI endpoint returned an error',
          detail: `HTTP ${res.status}`,
        });
      }
    } catch (e: any) {
      updateCheck('ai', { status: 'error', message: 'AI endpoint unreachable', detail: e.message });
    }

    // Tavily API
    const tavilyStart = Date.now();
    try {
      const res = await fetch('/api/generate/health/tavily', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      const latency = Date.now() - tavilyStart;
      if (res.ok) {
        updateCheck('tavily', { status: 'healthy', latency: json.latency ?? latency });
      } else {
        updateCheck('tavily', {
          status: res.status === 429 ? 'degraded' : 'error',
          latency,
          message: json.message || 'Tavily endpoint returned an error',
          detail: `HTTP ${res.status}`,
        });
      }
    } catch (e: any) {
      updateCheck('tavily', { status: 'error', message: 'Tavily endpoint unreachable', detail: e.message });
    }

    // OpenAI API
    const openaiStart = Date.now();
    try {
      const res = await fetch('/api/generate/health/openai', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      const latency = Date.now() - openaiStart;
      if (res.ok) {
        updateCheck('openai', { status: 'healthy', latency: json.latency ?? latency });
      } else {
        updateCheck('openai', {
          status: res.status === 429 ? 'degraded' : 'error',
          latency,
          message: json.message || 'OpenAI endpoint returned an error',
          detail: `HTTP ${res.status}`,
        });
      }
    } catch (e: any) {
      updateCheck('openai', { status: 'error', message: 'OpenAI endpoint unreachable', detail: e.message });
    }

    setLastChecked(new Date());
    setIsRefreshing(false);
  }, [updateCheck]);

  useEffect(() => {
    runHealthChecks();
  }, [runHealthChecks]);

  const overallStatus: CheckStatus = checks.some((c) => c.status === 'checking')
    ? 'checking'
    : checks.some((c) => c.status === 'error')
    ? 'error'
    : checks.some((c) => c.status === 'degraded')
    ? 'degraded'
    : 'healthy';

  const overallConfig = {
    healthy:  { label: 'All Systems Operational', bg: 'bg-green-500/10',  text: 'text-green-500',  border: 'border-green-500/20'  },
    degraded: { label: 'Partially Degraded',       bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
    error:    { label: 'Service Disruption',        bg: 'bg-red-500/10',   text: 'text-red-500',    border: 'border-red-500/20'    },
    checking: { label: 'Running Checks…',           bg: 'bg-bg-elevated',  text: 'text-text-tertiary', border: 'border-border-subtle' },
  }[overallStatus];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            System Health
          </h1>
          <p className="text-sm text-text-tertiary mt-1">Real-time status of all Forge platform services.</p>
        </div>
        <Button variant="outline" size="sm" onClick={runHealthChecks} disabled={isRefreshing} className="gap-2 shrink-0">
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Checking…' : 'Refresh'}
        </Button>
      </div>

      {/* Overall Status Banner */}
      <Card className={`border ${overallConfig.border} ${overallConfig.bg}`}>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overallConfig.bg}`}>
              {overallStatus === 'checking' ? (
                <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
              ) : overallStatus === 'healthy' ? (
                <CheckCircle2 className={`w-5 h-5 ${overallConfig.text}`} />
              ) : overallStatus === 'degraded' ? (
                <AlertTriangle className={`w-5 h-5 ${overallConfig.text}`} />
              ) : (
                <XCircle className={`w-5 h-5 ${overallConfig.text}`} />
              )}
            </div>
            <div>
              <p className={`text-[17px] font-semibold ${overallConfig.text}`}>{overallConfig.label}</p>
              {lastChecked && (
                <p className="text-[12px] text-text-tertiary mt-0.5">Last checked {lastChecked.toLocaleTimeString()}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Service Checks */}
      <div className="space-y-3">
        {checks.map((check) => {
          const Icon = ICONS[check.id] ?? Activity;
          return (
            <Card key={check.id} className="border border-border-subtle bg-bg-surface">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon className="w-4 h-4 text-text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text-primary">{check.name}</p>
                      <span className="text-xs text-text-tertiary">{check.description}</span>
                    </div>
                    {check.message && (
                      <p className={`text-xs mt-1 ${
                        check.status === 'error' ? 'text-red-400' :
                        check.status === 'degraded' ? 'text-yellow-500' :
                        'text-text-tertiary'
                      }`}>
                        {check.message}
                      </p>
                    )}
                    {check.detail && check.status !== 'healthy' && (
                      <p className="text-[11px] text-text-tertiary mt-1 font-mono bg-bg-elevated rounded px-1.5 py-0.5 inline-block">
                        {check.detail}
                      </p>
                    )}
                    {check.detail && check.status === 'healthy' && (
                      <p className="text-xs text-text-tertiary mt-0.5">{check.detail}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {check.latency !== undefined && (
                      <span className={`text-xs font-mono ${
                        check.latency > 1000 ? 'text-yellow-500' :
                        check.latency > 500  ? 'text-text-secondary' :
                        'text-text-tertiary'
                      }`}>
                        {check.latency}ms
                      </span>
                    )}
                    <StatusBadge status={check.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CheckStatus }) {
  switch (status) {
    case 'healthy':
      return <Badge className="bg-green-500/10 text-green-500 border border-green-500/30 gap-1"><CheckCircle2 className="w-3 h-3" />Healthy</Badge>;
    case 'degraded':
      return <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 gap-1"><AlertTriangle className="w-3 h-3" />Degraded</Badge>;
    case 'error':
      return <Badge className="bg-red-500/10 text-red-500 border border-red-500/30 gap-1"><XCircle className="w-3 h-3" />Error</Badge>;
    case 'checking':
      return <Badge className="bg-bg-elevated text-text-tertiary border border-border-subtle gap-1"><Loader2 className="w-3 h-3 animate-spin" />Checking</Badge>;
  }
}
