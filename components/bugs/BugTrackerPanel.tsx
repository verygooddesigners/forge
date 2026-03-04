'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Bug,
  Search,
  Plus,
  ChevronDown,
  Archive,
  ArchiveRestore,
  Trash2,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Calendar,
  User as UserIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BugReport {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  user_email: string;
  admin_notes: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

interface BugComment {
  id: string;
  bug_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  content: string;
  created_at: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low:      { label: 'Low',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted:    { label: 'New',          color: 'bg-gray-100 text-gray-700 border-gray-200' },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  in_progress:  { label: 'In Progress',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed:    { label: 'Completed',    color: 'bg-green-100 text-green-700 border-green-200' },
  wont_fix:     { label: "Won't Fix",    color: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_OPTIONS = [
  { value: 'submitted',    label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'in_progress',  label: 'In Progress' },
  { value: 'completed',    label: 'Completed (auto-archives)' },
  { value: 'wont_fix',     label: "Won't Fix" },
];

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BugTrackerPanel({ user }: { user: User }) {
  const [tab, setTab] = useState<'active' | 'archive'>('active');
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BugReport | null>(null);

  // Detail dialog state
  const [comments, setComments] = useState<BugComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Load bugs ────────────────────────────────────────────────────────────

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bugs?tab=${tab}`);
      if (!res.ok) throw new Error('Failed to load');
      const { data, canManage: cm } = await res.json();
      setBugs(data ?? []);
      setCanManage(cm ?? false);
    } catch {
      toast.error('Failed to load bugs');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { loadBugs(); }, [loadBugs]);

  // ── Load comments when bug selected ──────────────────────────────────────

  useEffect(() => {
    if (!selectedBug) return;
    setNotesValue(selectedBug.admin_notes ?? '');
    setCommentsLoading(true);
    fetch(`/api/bugs/${selectedBug.id}/comments`)
      .then(r => r.json())
      .then(({ data }) => setComments(data ?? []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [selectedBug]);

  // ── Filtered list ────────────────────────────────────────────────────────

  const filtered = bugs
    .filter(b => {
      if (search) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
      }
      if (severityFilter !== 'all' && b.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by severity first (within active tab)
      if (tab === 'active') {
        const sa = SEVERITY_ORDER.indexOf(a.severity ?? 'medium');
        const sb = SEVERITY_ORDER.indexOf(b.severity ?? 'medium');
        if (sa !== sb) return sa - sb;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // ── Stats ────────────────────────────────────────────────────────────────

  const activeBugs = bugs;
  const criticalCount = activeBugs.filter(b => b.severity === 'critical').length;
  const highCount = activeBugs.filter(b => b.severity === 'high').length;

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleStatusChange = async (bugId: string, status: string) => {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/bugs/${bugId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      // If completed, bug will be auto-archived — reload and close dialog
      if (status === 'completed') {
        toast.success('Bug marked complete and archived');
        setSelectedBug(null);
        loadBugs();
      } else {
        setSelectedBug(data);
        setBugs(prev => prev.map(b => b.id === bugId ? data : b));
        toast.success('Status updated');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBug) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/bugs/${selectedBug.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notesValue }),
      });
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setSelectedBug(data);
      setBugs(prev => prev.map(b => b.id === selectedBug.id ? data : b));
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleArchive = async (bug: BugReport, archive: boolean) => {
    setArchiving(true);
    try {
      const res = await fetch(`/api/bugs/${bug.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(archive ? 'Bug archived' : 'Bug restored to active');
      setSelectedBug(null);
      loadBugs();
    } catch {
      toast.error('Failed');
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/bugs/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Bug deleted');
      setDeleteTarget(null);
      setSelectedBug(null);
      loadBugs();
    } catch {
      toast.error('Failed to delete bug');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedBug || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/bugs/${selectedBug.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border-default bg-bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-primary/10">
                <Bug className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Bug Tracker</h1>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {tab === 'active' ? `${bugs.length} active report${bugs.length !== 1 ? 's' : ''}` : `${bugs.length} archived`}
                  {tab === 'active' && criticalCount > 0 && (
                    <span className="ml-2 text-red-600 font-semibold">· {criticalCount} critical</span>
                  )}
                  {tab === 'active' && highCount > 0 && (
                    <span className="ml-1.5 text-orange-600 font-semibold">· {highCount} high</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setReportOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Report a Bug
          </Button>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mt-5">
          {(['active', 'archive'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(''); setSeverityFilter('all'); setStatusFilter('all'); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
              }`}
            >
              {t === 'active' ? 'Active' : 'Archive'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-8 py-3 border-b border-border-default bg-bg-surface flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <Input
            placeholder="Search bugs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {tab === 'active' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">New</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
            </SelectContent>
          </Select>
        )}

        {(search || severityFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setSeverityFilter('all'); setStatusFilter('all'); }}
            className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Bug List ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-bg-surface mb-4">
              {tab === 'archive' ? (
                <Archive className="w-8 h-8 text-text-tertiary" />
              ) : (
                <Bug className="w-8 h-8 text-text-tertiary" />
              )}
            </div>
            <p className="text-text-primary font-medium">
              {search || severityFilter !== 'all' || statusFilter !== 'all'
                ? 'No bugs match your filters'
                : tab === 'archive' ? 'No archived bugs' : 'No active bugs — looking good!'}
            </p>
            {!search && tab === 'active' && (
              <p className="text-text-tertiary text-sm mt-1">
                Use the &quot;Report a Bug&quot; button to log a new issue.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(bug => (
              <button
                key={bug.id}
                onClick={() => setSelectedBug(bug)}
                className="w-full text-left p-4 rounded-xl border border-border-default bg-bg-surface hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Severity dot */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    bug.severity === 'critical' ? 'bg-red-500' :
                    bug.severity === 'high' ? 'bg-orange-400' :
                    bug.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-text-primary group-hover:text-accent-primary transition-colors truncate">
                        {bug.title}
                      </span>
                      <SeverityBadge severity={bug.severity ?? 'medium'} />
                      <StatusBadge status={bug.status} />
                    </div>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-1">
                      {bug.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {bug.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(bug.created_at)}
                      </span>
                      {bug.screenshot_url && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Screenshot
                        </span>
                      )}
                      {bug.admin_notes && (
                        <span className="flex items-center gap-1 text-accent-primary">
                          <MessageSquare className="w-3 h-3" />
                          Notes
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5 -rotate-90 group-hover:text-accent-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Report Bug Modal ────────────────────────────────────────────────── */}
      <ReportBugModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        userId={user.id}
        onSubmitted={() => { loadBugs(); toast.success('Bug reported — thank you!'); }}
      />

      {/* ── Bug Detail Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!selectedBug} onOpenChange={open => { if (!open) setSelectedBug(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-surface border-border-default">
          {selectedBug && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-2 flex-wrap">
                  <DialogTitle className="text-lg font-bold text-text-primary flex-1 min-w-0">
                    {selectedBug.title}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <SeverityBadge severity={selectedBug.severity ?? 'medium'} />
                  <StatusBadge status={selectedBug.status} />
                  {selectedBug.archived_at && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-100 text-gray-600 border-gray-200">
                      Archived
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    {selectedBug.user_email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(selectedBug.created_at)}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-base rounded-lg p-3">
                    {selectedBug.description}
                  </p>
                </div>

                {/* Screenshot */}
                {selectedBug.screenshot_url && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Screenshot</h3>
                    <a href={selectedBug.screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedBug.screenshot_url}
                        alt="Bug screenshot"
                        className="rounded-lg border border-border-default max-h-64 object-contain hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </a>
                  </div>
                )}

                {/* Admin: Status change */}
                {canManage && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Status</h3>
                    <Select
                      value={selectedBug.status}
                      onValueChange={val => handleStatusChange(selectedBug.id, val)}
                      disabled={savingStatus}
                    >
                      <SelectTrigger className="w-full">
                        {savingStatus ? (
                          <span className="flex items-center gap-2 text-sm text-text-tertiary">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                          </span>
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Notes (admin write / everyone read) */}
                {(canManage || selectedBug.admin_notes) && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                      Notes {canManage ? <span className="text-text-tertiary font-normal normal-case">(admin)</span> : ''}
                    </h3>
                    {canManage ? (
                      <div className="space-y-2">
                        <Textarea
                          value={notesValue}
                          onChange={e => setNotesValue(e.target.value)}
                          placeholder="Add internal notes visible to the reporter..."
                          rows={3}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                        >
                          {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                          Save Notes
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-text-primary bg-bg-base rounded-lg p-3 whitespace-pre-wrap">
                        {selectedBug.admin_notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Comments / Activity */}
                <div>
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                    Comments
                  </h3>
                  {commentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-text-tertiary text-center py-4">No comments yet</p>
                  ) : (
                    <div className="space-y-3 mb-3">
                      {comments.map(c => (
                        <div key={c.id} className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-ai-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {(c.user_name || c.user_email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-text-primary">
                                {c.user_name || c.user_email}
                              </span>
                              <span className="text-[10px] text-text-tertiary">{formatDate(c.created_at)}</span>
                            </div>
                            <p className="text-sm text-text-secondary mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                      className="flex-1 text-sm h-9"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="gap-1.5"
                    >
                      {submittingComment
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Send className="w-3.5 h-3.5" />
                      }
                    </Button>
                  </div>
                </div>

                {/* Admin actions: Archive / Delete */}
                {canManage && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border-default">
                    {selectedBug.archived_at ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(selectedBug, false)}
                        disabled={archiving}
                        className="gap-1.5"
                      >
                        {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(selectedBug, true)}
                        disabled={archiving}
                        className="gap-1.5"
                      >
                        {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                        Archive
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(selectedBug)}
                      className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md bg-bg-surface border-border-default">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-text-primary">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              Delete Bug Report?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            This will permanently delete &quot;{deleteTarget?.title}&quot; along with all its comments. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Forever
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
