'use client';

import { useEffect, useMemo, useState } from 'react';
import { User, CursorAgentStatus, CursorRemoteCommand } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw, Send } from 'lucide-react';

interface CursorRemotePanelProps {
  adminUser: User;
}

const REFRESH_INTERVAL_MS = 10000;

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function statusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'destructive';
    case 'in_progress':
      return 'ai';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
}

function agentStatusVariant(status: string) {
  switch (status) {
    case 'busy':
    case 'in_progress':
      return 'ai';
    case 'idle':
      return 'success';
    case 'offline':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function CursorRemotePanel({ adminUser }: CursorRemotePanelProps) {
  const [commands, setCommands] = useState<CursorRemoteCommand[]>([]);
  const [agents, setAgents] = useState<CursorAgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commandText, setCommandText] = useState('');
  const [targetAgentId, setTargetAgentId] = useState('');

  const hasAccess = useMemo(() => adminUser.role === 'Super Administrator', [adminUser.role]);

  const loadData = async (isManual = false) => {
    if (!hasAccess) return;
    if (isManual) {
      setRefreshing(true);
    }
    try {
      setError(null);
      const [commandsResponse, agentsResponse] = await Promise.all([
        fetch('/api/admin/cursor-remote/commands?limit=50'),
        fetch('/api/admin/cursor-remote/agents'),
      ]);

      if (!commandsResponse.ok || !agentsResponse.ok) {
        throw new Error('Failed to load cursor remote data.');
      }

      const commandsData = await commandsResponse.json();
      const agentsData = await agentsResponse.json();

      setCommands(commandsData.commands || []);
      setAgents(agentsData.agents || []);
    } catch (err) {
      console.error('Error loading cursor remote data:', err);
      setError('Failed to load cursor remote status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!hasAccess) return;
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasAccess]);

  const handleSend = async () => {
    const trimmed = commandText.trim();
    if (!trimmed) {
      setError('Enter a command before sending.');
      return;
    }

    setSubmitting(true);
    try {
      setError(null);
      const response = await fetch('/api/admin/cursor-remote/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandText: trimmed,
          targetAgentId: targetAgentId.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send command.');
      }

      setCommandText('');
      setTargetAgentId('');
      await loadData(true);
    } catch (err) {
      console.error('Error sending cursor command:', err);
      setError('Failed to send command.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cursor Remote</CardTitle>
          <CardDescription>Access Restricted</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This section is only accessible to super administrators.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Cursor Remote Commands</CardTitle>
              <CardDescription>
                Send instructions to your local Cursor agent and monitor progress.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={commandText}
              onChange={(event) => setCommandText(event.target.value)}
              rows={4}
              placeholder="Describe the next build instruction for Cursor..."
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={targetAgentId}
                onChange={(event) => setTargetAgentId(event.target.value)}
                placeholder="Optional target agent id"
              />
              <Button onClick={handleSend} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Command
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
          <CardDescription>Latest heartbeat from connected machines.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {agents.length === 0 ? (
            <p className="text-sm text-text-secondary">No agents connected yet.</p>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{agent.agent_id}</span>
                    <Badge variant={agentStatusVariant(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-text-secondary">
                    Last heartbeat: {formatDate(agent.last_heartbeat)}
                  </span>
                </div>
                <div className="text-xs text-text-secondary">
                  Current task: {agent.current_task || '—'}
                </div>
                <div className="text-xs text-text-secondary">
                  Last message: {agent.last_message || '—'}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Command History</CardTitle>
          <CardDescription>Recent commands and delivery status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {commands.length === 0 ? (
            <p className="text-sm text-text-secondary">No commands yet.</p>
          ) : (
            commands.map((command) => (
              <div
                key={command.id}
                className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(command.status || 'pending')}>
                      {command.status}
                    </Badge>
                    {command.target_agent_id && (
                      <span className="text-xs text-text-secondary">
                        Target: {command.target_agent_id}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {formatDate(command.created_at)}
                  </span>
                </div>
                <div className="text-sm text-text-primary whitespace-pre-line">
                  {command.command_text}
                </div>
                {command.result_text && (
                  <div className="text-xs text-text-secondary">
                    Result: {command.result_text}
                  </div>
                )}
                {command.error_text && (
                  <div className="text-xs text-error">
                    Error: {command.error_text}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
