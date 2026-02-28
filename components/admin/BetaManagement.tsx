'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  Send,
  RefreshCw,
  Play,
  StopCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Loader2,
  X,
  Copy,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { BetaNotesEditor } from '@/components/beta/BetaNotesEditor';

interface BetaUser {
  id: string;
  beta_id: string;
  email: string;
  user_id: string | null;
  invited_at: string | null;
  acknowledged_at: string | null;
  last_seen_notes_version: number;
  created_at: string;
  default_writer_model_id: string | null;
}

interface WriterModelOption {
  id: string;
  name: string;
  is_house_model: boolean;
}

interface Beta {
  id: string;
  name: string;
  notes: string;
  notes_version: number;
  notes_is_major_update: boolean;
  status: 'draft' | 'active' | 'ended';
  created_by: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  users: BetaUser[];
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  active: { label: 'Active', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  ended: { label: 'Ended', color: 'bg-bg-elevated text-text-tertiary border-border-subtle' },
};

function fmt(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function BetaManagement({ adminUser }: { adminUser: User }) {
  const [betas, setBetas] = useState<Beta[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  // Per-beta UI state
  const [addEmailMap, setAddEmailMap] = useState<Record<string, string>>({});
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [resendingMap, setResendingMap] = useState<Record<string, boolean>>({});
  const [removingMap, setRemovingMap] = useState<Record<string, boolean>>({});
  const [notesEditMap, setNotesEditMap] = useState<Record<string, string>>({});
  const [notesIsMajorMap, setNotesIsMajorMap] = useState<Record<string, boolean>>({});
  const [savingNotesMap, setSavingNotesMap] = useState<Record<string, boolean>>({});
  const [startingMap, setStartingMap] = useState<Record<string, boolean>>({});
  const [endingMap, setEndingMap] = useState<Record<string, boolean>>({});
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);
  const [writerModels, setWriterModels] = useState<WriterModelOption[]>([]);
  const [assigningModelMap, setAssigningModelMap] = useState<Record<string, boolean>>({});
  const [magicLinks, setMagicLinks] = useState<{ email: string; link: string }[]>([]);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [debuggingEmail, setDebuggingEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [betasRes, modelsRes] = await Promise.all([
        fetch('/api/admin/betas'),
        fetch('/api/writer-models'),
      ]);
      const betasJson = await betasRes.json();
      if (betasJson.data) setBetas(betasJson.data);
      const modelsJson = await modelsRes.json();
      if (modelsJson.data) {
        setWriterModels(
          modelsJson.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            is_house_model: m.is_house_model ?? false,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // When a beta is expanded, seed notes editor with current notes
  const handleExpand = (betaId: string) => {
    if (expandedId === betaId) {
      setExpandedId(null);
    } else {
      setExpandedId(betaId);
      const beta = betas.find(b => b.id === betaId);
      if (beta) {
        setNotesEditMap(m => ({ ...m, [betaId]: beta.notes ?? '' }));
        setNotesIsMajorMap(m => ({ ...m, [betaId]: false }));
      }
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), notes: newNotes.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBetas(prev => [json.data, ...prev]);
      setExpandedId(json.data.id);
      setNotesEditMap(m => ({ ...m, [json.data.id]: newNotes.trim() }));
      setCreateOpen(false);
      setNewName('');
      setNewNotes('');
      toast.success(`Beta "${json.data.name}" created`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  // ── Add User ─────────────────────────────────────────────────────────────
  const handleAddUser = async (betaId: string) => {
    const email = addEmailMap[betaId]?.trim();
    if (!email) return;
    setAddingMap(m => ({ ...m, [betaId]: true }));
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beta_id: betaId, action: 'add_user', email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAddEmailMap(m => ({ ...m, [betaId]: '' }));
      toast.success(`${email} added to beta`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAddingMap(m => ({ ...m, [betaId]: false }));
    }
  };

  // ── Remove User ──────────────────────────────────────────────────────────
  const handleRemoveUser = async (betaId: string, email: string) => {
    const key = `${betaId}-${email}`;
    setRemovingMap(m => ({ ...m, [key]: true }));
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beta_id: betaId, action: 'remove_user', email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`${email} removed`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRemovingMap(m => ({ ...m, [key]: false }));
    }
  };

  // ── Resend Invite ────────────────────────────────────────────────────────
  const handleResend = async (betaId: string, email: string) => {
    const key = `${betaId}-${email}`;
    setResendingMap(m => ({ ...m, [key]: true }));
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beta_id: betaId, action: 'resend_invite', email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.already_existed && json.magic_link) {
        setMagicLinks([{ email, link: json.magic_link }]);
      } else if (json.already_existed) {
        toast.error(`Couldn't generate a login link for ${email}. They can log in at /login.`);
      } else {
        toast.success(`Invite resent to ${email}`);
      }
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setResendingMap(m => ({ ...m, [key]: false }));
    }
  };

  // ── Debug User ───────────────────────────────────────────────────────────
  const handleDebugUser = async (betaId: string, email: string) => {
    setDebuggingEmail(email);
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beta_id: betaId, action: 'debug_user', email }),
      });
      const json = await res.json();
      setDebugResult({ email, ...json });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDebuggingEmail(null);
    }
  };

  // ── Save Notes ───────────────────────────────────────────────────────────
  const handleSaveNotes = async (betaId: string) => {
    setSavingNotesMap(m => ({ ...m, [betaId]: true }));
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta_id: betaId,
          action: 'update_notes',
          notes: notesEditMap[betaId] ?? '',
          is_major_update: notesIsMajorMap[betaId] ?? false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Beta notes updated');
      setNotesIsMajorMap(m => ({ ...m, [betaId]: false }));
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingNotesMap(m => ({ ...m, [betaId]: false }));
    }
  };

  // ── Start Beta ───────────────────────────────────────────────────────────
  const handleStart = async (betaId: string) => {
    const beta = betas.find(b => b.id === betaId);
    if (!beta) return;
    if (beta.users.length === 0) {
      toast.error('Add at least one user before starting the beta');
      return;
    }
    setStartingMap(m => ({ ...m, [betaId]: true }));
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beta_id: betaId, action: 'start_beta' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const succeeded = json.results?.filter((r: any) => r.success && !r.already_existed).length ?? 0;
      const withLinks = (json.results ?? []).filter((r: any) => r.success && r.already_existed && r.magic_link);
      const existingNoLink = json.results?.filter((r: any) => r.success && r.already_existed && !r.magic_link).length ?? 0;
      const failed = json.results?.filter((r: any) => !r.success).length ?? 0;
      const parts: string[] = [];
      if (succeeded > 0) parts.push(`${succeeded} invite${succeeded !== 1 ? 's' : ''} sent`);
      if (withLinks.length > 0) parts.push(`${withLinks.length} login link${withLinks.length !== 1 ? 's' : ''} ready to share`);
      if (existingNoLink > 0) parts.push(`${existingNoLink} already registered`);
      if (failed > 0) parts.push(`${failed} failed`);
      toast.success(`Beta started — ${parts.join(', ') || 'no pending invites'}`);
      if (withLinks.length > 0) {
        setMagicLinks(withLinks.map((r: any) => ({ email: r.email, link: r.magic_link })));
      }
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStartingMap(m => ({ ...m, [betaId]: false }));
    }
  };

  // ── End Beta ─────────────────────────────────────────────────────────────
  const handleEnd = async (betaId: string) => {
    setEndingMap(m => ({ ...m, [betaId]: true }));
    setConfirmEndId(null);
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beta_id: betaId, action: 'end_beta' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Beta ended — user accounts are now permanent');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setEndingMap(m => ({ ...m, [betaId]: false }));
    }
  };

  // ── Delete Beta ──────────────────────────────────────────────────────────
  const handleDelete = async (betaId: string) => {
    if (!confirm('Delete this draft beta? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/betas?id=${betaId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBetas(prev => prev.filter(b => b.id !== betaId));
      if (expandedId === betaId) setExpandedId(null);
      toast.success('Beta deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // ── Assign Writer Model ───────────────────────────────────────────────────
  const handleAssignWriterModel = async (betaId: string, bu: BetaUser, modelId: string | null) => {
    if (!bu.user_id) return;
    const key = `${betaId}-${bu.email}`;
    setAssigningModelMap(m => ({ ...m, [key]: true }));
    try {
      const res = await fetch('/api/admin/betas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beta_id: betaId,
          action: 'assign_writer_model',
          user_id: bu.user_id,
          email: bu.email,
          writer_model_id: modelId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const modelName = modelId ? writerModels.find(m => m.id === modelId)?.name : null;
      toast.success(modelName ? `Writer model "${modelName}" assigned to ${bu.email}` : `Writer model unassigned`);
      // Update local state optimistically so UI reflects immediately
      setBetas(prev => prev.map(b => b.id !== betaId ? b : {
        ...b,
        users: b.users.map(u => u.id !== bu.id ? u : { ...u, default_writer_model_id: modelId }),
      }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAssigningModelMap(m => ({ ...m, [key]: false }));
    }
  };

  // ── Render user row ───────────────────────────────────────────────────────
  const renderUserRow = (beta: Beta, bu: BetaUser) => {
    const key = `${beta.id}-${bu.email}`;
    const isRemoving = removingMap[key];
    const isResending = resendingMap[key];
    const isAssigning = assigningModelMap[key];
    const hasInvite = !!bu.invited_at;
    const hasAcked = !!bu.acknowledged_at;
    const canAssignModel = !!bu.user_id && beta.status !== 'ended';

    return (
      <tr key={bu.id} className="border-t border-border-subtle">
        <td className="py-2 pr-4 text-[13px] text-text-primary">{bu.email}</td>
        <td className="py-2 pr-4">
          {hasInvite ? (
            hasAcked ? (
              <span className="flex items-center gap-1 text-[11px] text-green-400">
                <CheckCircle2 className="w-3 h-3" /> Acknowledged
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-yellow-400">
                <Clock className="w-3 h-3" /> Invited
              </span>
            )
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
              <AlertCircle className="w-3 h-3" /> Not yet invited
            </span>
          )}
        </td>
        <td className="py-2 pr-4">
          {canAssignModel ? (
            <div className="relative flex items-center gap-1">
              <select
                value={bu.default_writer_model_id ?? ''}
                onChange={e => handleAssignWriterModel(beta.id, bu, e.target.value || null)}
                disabled={isAssigning}
                className="h-7 text-[12px] rounded-md border border-border-subtle bg-bg-elevated text-text-primary px-2 pr-6 appearance-none cursor-pointer disabled:opacity-50 min-w-[140px] max-w-[200px]"
              >
                <option value="">— Unassigned —</option>
                {writerModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.is_house_model ? ' (In-House)' : ''}
                  </option>
                ))}
              </select>
              {isAssigning && <Loader2 className="w-3 h-3 animate-spin text-text-tertiary absolute right-1.5 pointer-events-none" />}
            </div>
          ) : (
            <span className="text-[12px] text-text-tertiary italic">
              {!bu.user_id ? 'Invite first' : '—'}
            </span>
          )}
        </td>
        <td className="py-2 pr-4 text-[12px] text-text-tertiary">{fmt(bu.invited_at)}</td>
        <td className="py-2 text-right">
          <div className="flex items-center justify-end gap-2">
            {beta.status !== 'ended' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] gap-1.5 text-text-secondary hover:text-accent-primary"
                  onClick={() => handleResend(beta.id, bu.email)}
                  disabled={isResending}
                  title={hasInvite ? 'Resend invite' : 'Send invite'}
                >
                  {isResending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {hasInvite ? 'Resend' : 'Send'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] gap-1 text-text-secondary hover:text-yellow-400"
                  onClick={() => handleDebugUser(beta.id, bu.email)}
                  disabled={debuggingEmail === bu.email}
                  title="Debug user auth state"
                >
                  {debuggingEmail === bu.email ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleRemoveUser(beta.id, bu.email)}
                  disabled={isRemoving}
                >
                  {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // ── Render beta card ──────────────────────────────────────────────────────
  const renderBeta = (beta: Beta) => {
    const isExpanded = expandedId === beta.id;
    const cfg = STATUS_CONFIG[beta.status];
    const isStarting = startingMap[beta.id];
    const isEnding = endingMap[beta.id];
    const isSavingNotes = savingNotesMap[beta.id];
    const notesText = notesEditMap[beta.id] ?? beta.notes ?? '';
    const isMajorUpdate = notesIsMajorMap[beta.id] ?? false;
    const uninvitedCount = beta.users.filter(u => !u.invited_at).length;

    return (
      <div key={beta.id} className="border border-border-subtle rounded-xl overflow-hidden bg-bg-card">
        {/* Header row */}
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-hover transition-colors"
          onClick={() => handleExpand(beta.id)}
        >
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-text-primary">{beta.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-[12px] text-text-tertiary">
              {beta.users.length} user{beta.users.length !== 1 ? 's' : ''}
            </span>
            {beta.status === 'active' && uninvitedCount > 0 && (
              <span className="text-[11px] text-yellow-400">
                {uninvitedCount} pending invite{uninvitedCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-text-tertiary">
              {beta.status === 'active' && beta.started_at ? `Started ${fmt(beta.started_at)}` : ''}
              {beta.status === 'ended' && beta.ended_at ? `Ended ${fmt(beta.ended_at)}` : ''}
              {beta.status === 'draft' ? `Created ${fmt(beta.created_at)}` : ''}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-tertiary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            )}
          </div>
        </button>

        {/* Expanded body */}
        {isExpanded && (
          <div className="border-t border-border-subtle px-5 py-5 space-y-6">

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {beta.status === 'draft' && (
                <>
                  <Button
                    size="sm"
                    className="gap-2 bg-green-600 hover:bg-green-500 text-white"
                    onClick={() => handleStart(beta.id)}
                    disabled={isStarting || beta.users.length === 0}
                  >
                    {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Start Beta
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDelete(beta.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Draft
                  </Button>
                </>
              )}
              {beta.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => setConfirmEndId(beta.id)}
                  disabled={isEnding}
                >
                  {isEnding ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                  End Beta
                </Button>
              )}
            </div>

            {/* Beta Notes editor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-tertiary" />
                <span className="text-[13px] font-semibold text-text-primary">Beta Notes</span>
                <span className="text-[11px] text-text-tertiary">
                  v{beta.notes_version} · shown to all beta users on login
                </span>
              </div>
              <BetaNotesEditor
                value={notesText}
                onChange={html => setNotesEditMap(m => ({ ...m, [beta.id]: html }))}
                disabled={beta.status === 'ended'}
              />
              {beta.status !== 'ended' && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isMajorUpdate}
                      onCheckedChange={checked =>
                        setNotesIsMajorMap(m => ({ ...m, [beta.id]: !!checked }))
                      }
                    />
                    <span className="text-[12px] text-text-secondary">
                      Mark as major update (re-shows to users who have already acknowledged)
                    </span>
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleSaveNotes(beta.id)}
                    disabled={isSavingNotes || notesText === beta.notes}
                  >
                    {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Save Notes
                  </Button>
                </div>
              )}
            </div>

            {/* Users table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-text-primary">Users</span>
                <span className="text-[12px] text-text-tertiary">{beta.users.length} total</span>
              </div>

              {beta.users.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-[11px] font-medium text-text-tertiary pb-2 pr-4">Email</th>
                      <th className="text-left text-[11px] font-medium text-text-tertiary pb-2 pr-4">Status</th>
                      <th className="text-left text-[11px] font-medium text-text-tertiary pb-2 pr-4">Writer Model</th>
                      <th className="text-left text-[11px] font-medium text-text-tertiary pb-2 pr-4">Invited</th>
                      <th className="text-right text-[11px] font-medium text-text-tertiary pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beta.users.map(bu => renderUserRow(beta, bu))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[13px] text-text-tertiary">No users added yet.</p>
              )}

              {/* Add user input */}
              {beta.status !== 'ended' && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={addEmailMap[beta.id] ?? ''}
                    onChange={e => setAddEmailMap(m => ({ ...m, [beta.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddUser(beta.id)}
                    className="h-8 text-[13px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8 shrink-0"
                    onClick={() => handleAddUser(beta.id)}
                    disabled={addingMap[beta.id] || !addEmailMap[beta.id]?.trim()}
                  >
                    {addingMap[beta.id] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Beta Management</h1>
          <p className="text-[13px] text-text-tertiary mt-0.5">
            Create and manage beta programs, invite users, and communicate updates.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New Beta
        </Button>
      </div>

      {/* Beta list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
        </div>
      ) : betas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border-subtle rounded-xl">
          <Send className="w-8 h-8 text-text-tertiary" />
          <p className="text-[14px] font-medium text-text-primary">No betas yet</p>
          <p className="text-[13px] text-text-tertiary">Create your first beta to get started.</p>
          <Button size="sm" className="gap-2 mt-1" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New Beta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {betas.map(renderBeta)}
        </div>
      )}

      {/* Create Beta dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Beta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-text-secondary">Beta Name</label>
              <Input
                placeholder="e.g. Beta 1"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-text-secondary">
                Beta Notes <span className="text-text-tertiary font-normal">(optional)</span>
              </label>
              <BetaNotesEditor
                value={newNotes}
                onChange={html => setNewNotes(html)}
                placeholder="Goals, what to test, known limitations..."
              />
              <p className="text-[11px] text-text-tertiary">
                Beta users will see these notes in a modal on their first login.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Beta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Magic Links dialog — for existing users who can't receive an invite email */}
      <Dialog open={magicLinks.length > 0} onOpenChange={open => !open && setMagicLinks([])}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-violet-400" />
              Login Links for Existing Users
            </DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-secondary">
            These users already have accounts so invite emails don&apos;t work. Share these one-click login links with them directly — via Slack, email, or any other way.
          </p>
          <div className="flex flex-col gap-3 py-1">
            {magicLinks.map(({ email, link }) => (
              <div key={email} className="flex flex-col gap-1.5 p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                <p className="text-[12px] font-medium text-text-secondary">{email}</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={link}
                    className="flex-1 text-[11px] bg-bg-deepest border border-border-subtle rounded px-2 py-1.5 text-text-tertiary font-mono truncate focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 gap-1.5 text-[12px] h-7"
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      toast.success('Copied!');
                    }}
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMagicLinks([])}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debug User dialog */}
      <Dialog open={!!debugResult} onOpenChange={open => !open && setDebugResult(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>User Debug — {debugResult?.email}</DialogTitle>
          </DialogHeader>
          {debugResult && (
            <div className="space-y-3 text-[12px] font-mono">
              <div>
                <p className="text-text-secondary mb-1 font-sans font-medium">public.users row</p>
                <pre className="bg-bg-secondary rounded p-2 overflow-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(debugResult.public_users_row, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-text-secondary mb-1 font-sans font-medium">auth.users (by public UUID)</p>
                <pre className="bg-bg-secondary rounded p-2 overflow-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(debugResult.auth_user_by_pub_id, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-text-secondary mb-1 font-sans font-medium">generateLink result</p>
                <pre className={`rounded p-2 overflow-auto whitespace-pre-wrap break-all ${debugResult.generate_link_result?.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {JSON.stringify(debugResult.generate_link_result, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDebugResult(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm End Beta dialog */}
      <Dialog open={!!confirmEndId} onOpenChange={open => !open && setConfirmEndId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>End Beta?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-secondary py-2">
            This will mark the beta as ended. All user accounts will become permanent with the same permissions they currently have. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmEndId(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-500 text-white gap-2"
              onClick={() => confirmEndId && handleEnd(confirmEndId)}
            >
              <StopCircle className="w-4 h-4" />
              End Beta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
