'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, Zap, Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'error' | 'checking';
  latency?: number;
  message?: string;
}

export function SystemHealth() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'Database', status: 'checking' },
    { name: 'Authentication', status: 'checking' },
    { name: 'Storage', status: 'checking' },
    { name: 'AI API', status: 'checking' },
  ]);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    const supabase = createClient();

    // DB check
    const dbStart = Date.now();
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      setChecks((prev) =>
        prev.map((c) =>
          c.name === 'Database'
            ? { ...c, status: error ? 'error' : 'healthy', latency: Date.now() - dbStart, message: error?.message }
            : c
        )
      );
    } catch {
      setChecks((prev) =>
        prev.map((c) => (c.name === 'Database' ? { ...c, status: 'error', message: 'Connection failed' } : c))
      );
    }

    // Auth check
    try {
      const { data, error } = await supabase.auth.getSession();
      setChecks((prev) =>
        prev.map((c) =>
          c.name === 'Authentication'
            ? { ...c, status: error ? 'error' : 'healthy', message: error?.message }
            : c
        )
      );
    } catch {
      setChecks((prev) =>
        prev.map((c) => (c.name === 'Authentication' ? { ...c, status: 'error', message: 'Auth error' } : c))
      );
    }

    // Storage check
    try {
      const { data, error } = await supabase.storage.getBucket('avatars');
      setChecks((prev) =>
        prev.map((c) =>
          c.name === 'Storage'
            ? { ...c, status: error ? 'degraded' : 'healthy', message: error?.message }
            : c
        )
      );
    } catch {
      setChecks((prev) =>
        prev.map((c) => (c.name === 'Storage' ? { ...c, status: 'degraded', message: 'Bucket check failed' } : c))
      );
    }

    // AI API check (just ping the endpoint)
    const aiStart = Date.now();
    try {
      const res = await fetch('/api/generate/health', { method: 'GET' }).catch(() => null);
      setChecks((prev) =>
        prev.map((c) =>
          c.name === 'AI API'
            ? {
                ...c,
                status: res?.ok ? 'healthy' : 'degraded',
                latency: Date.now() - aiStart,
                message: res?.ok ? undefined : 'AI endpoint unreachable',
              }
            : c
        )
      );
    } catch {
      setChecks((prev) =>
        prev.map((c) =>
          c.name === 'AI API'
            ? { ...c, status: 'degraded', message: 'AI endpoint unreachable' }
            : c
        )
      );
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30 border">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 border">Degraded</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30 border">Error</Badge>;
      case 'checking':
        return <Badge className="bg-bg-elevated text-text-tertiary border-border-subtle border">Checking...</Badge>;
    }
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'checking':
        return <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />;
    }
  };

  const overallStatus = checks.every((c) => c.status === 'healthy')
    ? 'healthy'
    : checks.some((c) => c.status === 'error')
    ? 'error'
    : checks.some((c) => c.status === 'checking')
    ? 'checking'
    : 'degraded';

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent-primary" />
          System Health
        </h1>
        <p className="text-text-secondary mt-1">
          Real-time status of all Forge platform services.
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6 bg-bg-surface border-border-default">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              overallStatus === 'healthy' ? 'bg-green-500/10' :
              overallStatus === 'error' ? 'bg-red-500/10' :
              'bg-yellow-500/10'
            }`}>
              <Activity className={`w-6 h-6 ${
                overallStatus === 'healthy' ? 'text-green-400' :
                overallStatus === 'error' ? 'text-red-400' :
                'text-yellow-400'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Overall Status</p>
              <p className="text-xl font-bold text-text-primary capitalize">{overallStatus === 'checking' ? 'Checking...' : overallStatus}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={runHealthChecks}
                className="text-sm text-accent-primary hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual checks */}
      <div className="space-y-3">
        {checks.map((check) => (
          <Card key={check.name} className="bg-bg-surface border-border-default">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{check.name}</p>
                  {check.message && (
                    <p className="text-xs text-text-tertiary mt-0.5">{check.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {check.latency !== undefined && (
                    <span className="text-xs text-text-tertiary">{check.latency}ms</span>
                  )}
                  {getStatusBadge(check.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
