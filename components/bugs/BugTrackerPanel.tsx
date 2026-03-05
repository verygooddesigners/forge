'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
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
  Pencil,
  Check,
  X,
  Link as LinkIcon,
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

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
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

export function BugTrackerPanel({ user, initialBugId }: { user: User; initialBugId?: string }) {
  const router = useRouter();
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

  // Detail panel state
  const [comments, setComments] = useState<BugComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSeverity, setEditSeverity] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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

  // ── Load initial bug from URL param ──────────────────────────────────────

  useEffect(() => {
    if (!initialBugId) return;
    fetch(`/api/bugs/${initialBugId}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) {
          setSelectedBug(json.data);
          // If the bug is archived, switch to archive tab
          if (json.data.archived_at) setTab('archive');
        }
      })
      .catch(() => {/* ignore — just don't pre-select */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBugId]);

  // ── Load comments when bug selected ──────────────────────────────────────

  useEffect(() => {
    if (!selectedBug) return;
    setNotesValue(selectedBug.admin_notes ?? '');
    setIsEditing(false);
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
      if (tab === 'active') {
        const sa = SEVERITY_ORDER.indexOf(a.severity ?? 'medium');
        const sb = SEVERITY_ORDER.indexOf(b.severity ?? 'medium');
        if (sa !== sb) return sa - sb;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // ── Stats ────────────────────────────────────────────────────────────────

  const criticalCount = bugs.filter(b => b.severity === 'critical').length;
  const highCount = bugs.filter(b => b.severity === 'high').length;

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

  const startEdit = () => {
    if (!selectedBug) return;
    setEditTitle(selectedBug.title);
    setEditDescription(selectedBug.description);
    setEditSeverity(selectedBug.severity ?? 'medium');
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async () => {
    if (!selectedBug) return;
    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/bugs/${selectedBug.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          severity: editSeverity,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setSelectedBug(data);
      setBugs(prev => prev.map(b => b.id === selectedBug.id ? data : b));
      setIsEditing(false);
      toast.success('Bug updated');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-8 py-5 border-b border-border-default bg-bg-surface">
        <div className="flex items-center justify-between">
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
          <Button onClick={() => setReportOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Report a Bug
          </Button>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mt-4">
          {(['active', 'archive'] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSearch('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setSelectedBug(null);
                router.push('/bugs', { scroll: false });
              }}
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

      {/* ── Main content: list + detail side by side ────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ── Left: Bug List ──────────────────────────────────────────── */}
        <div className="flex flex-col border-r border-border-default w-[380px] flex-shrink-0">

          {/* Filters */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-border-default bg-bg-surface flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-8 text-sm w-[110px]">
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
                <SelectTrigger className="h-8 w-[130px] text-sm">
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
                Clear
              </button>
            )}
          </div>

          {/* Bug list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-2xl bg-bg-elevated mb-3">
                  {tab === 'archive' ? (
                    <Archive className="w-7 h-7 text-text-tertiary" />
                  ) : (
                    <Bug className="w-7 h-7 text-text-tertiary" />
                  )}
                </div>
                <p className="text-text-primary font-medium text-sm">
                  {search || severityFilter !== 'all' || statusFilter !== 'all'
                    ? 'No bugs match your filters'
                    : tab === 'archive' ? 'No archived bugs' : 'No active bugs — looking good!'}
                </p>
                {!search && tab === 'active' && (
                  <p className="text-text-tertiary text-xs mt-1">
                    Use &quot;Report a Bug&quot; to log a new issue.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(bug => (
                  <button
                    key={bug.id}
                    onClick={() => {
                      setSelectedBug(bug);
                      router.push(`/bugs/${bug.id}`, { scroll: false });
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all group ${
                      selectedBug?.id === bug.id
                        ? 'border-accent-primary/40 bg-accent-primary/8 shadow-sm'
                        : 'border-border-default bg-bg-surface hover:border-accent-primary/25 hover:bg-accent-primary/4'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Severity dot */}
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        bug.severity === 'critical' ? 'bg-red-500' :
                        bug.severity === 'high' ? 'bg-orange-400' :
                        bug.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-medium text-sm truncate transition-colors ${
                            selectedBug?.id === bug.id ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'
                          }`}>
                            {bug.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <SeverityBadge severity={bug.severity ?? 'medium'} />
                          <StatusBadge status={bug.status} />
                        </div>
                        <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-text-tertiary">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDate(bug.created_at)}
                          </span>
                          {bug.screenshot_url && (
                            <span className="flex items-center gap-0.5">
                              <ImageIcon className="w-2.5 h-2.5" />
                              Screenshot
                            </span>
                          )}
                          {bug.admin_notes && (
                            <span className="flex items-center gap-0.5 text-accent-primary">
                              <MessageSquare className="w-2.5 h-2.5" />
                              Notes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Bug Detail ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-base">
          {!selectedBug ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="p-4 rounded-2xl bg-bg-elevated">
                <Bug className="w-7 h-7 text-text-tertiary" />
              </div>
              <p className="text-text-secondary text-sm font-medium">Select a bug to view details</p>
              <p className="text-text-tertiary text-xs">Click any item in the list to open it here.</p>
            </div>
          ) : (
            <>
            {/* Detail header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-border-default bg-bg-surface flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="text-base font-bold h-8 px-2"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-base font-bold text-text-primary leading-snug">{selectedBug.title}</h2>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {isEditing ? (
                    <Select value={editSeverity} onValueChange={setEditSeverity}>
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <SeverityBadge severity={selectedBug.severity ?? 'medium'} />
                  )}
                  <StatusBadge status={selectedBug.status} />
                  {selectedBug.archived_at && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-100 text-gray-600 border-gray-200">
                      Archived
                    </span>
                  )}
                </div>
              </div>

              {/* Edit / Save / Cancel + Copy link buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="h-8 gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="h-8 gap-1.5"
                    >
                      {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = `${window.location.origin}/bugs/${selectedBug.id}`;
                        navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
                      }}
                      className="h-8 w-8 p-0"
                      title="Copy shareable link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startEdit}
                      className="h-8 gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

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
                {isEditing ? (
                  <Textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    rows={5}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-surface rounded-lg p-3 border border-border-default">
                    {selectedBug.description}
                  </p>
                )}
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
              {canManage && !isEditing && (
                <div>
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Status</h3>
                  <Select
                    value={selectedBug.status}
                    onValueChange={val => handleStatusChange(selectedBug.id, val)}
                    disabled={savingStatus}
                  >
                    <SelectTrigger className="w-full max-w-xs">
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
              {!isEditing && (
                <div>
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                    Notes {canManage ? <span className="text-text-tertiary font-normal normal-case">(admin)</span> : ''}
                  </h3>
                  {canManage ? (
                    <div className="space-y-2">
                      <Textarea
                        value={notesValue}
                        onChange={e => setNotesValue(e.target.value)}
                        placeholder="Add internal notes visible to everyone..."
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
                  ) : selectedBug.admin_notes ? (
                    <p className="text-sm text-text-primary bg-bg-surface rounded-lg p-3 border border-border-default whitespace-pre-wrap">
                      {selectedBug.admin_notes}
                    </p>
                  ) : (
                    <p className="text-sm text-text-tertiary italic">No notes from the team yet.</p>
                  )}
                </div>
              )}

              {/* Comments / Activity */}
              {!isEditing && (
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
              )}

              {/* Admin actions: Archive / Delete */}
              {canManage && !isEditing && (
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
        </div>
      </div>

      {/* ── Report Bug Modal ────────────────────────────────────────────────── */}
      <ReportBugModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        userId={user.id}
        onSubmitted={() => { loadBugs(); toast.success('Bug reported — thank you!'); }}
      />

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
