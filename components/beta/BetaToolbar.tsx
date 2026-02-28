'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Bug, X, Send, ChevronDown, ChevronUp, ScrollText, Paperclip, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

const VERSION = '1.10.25';
const UPDATED = '02/28/26';

// ─── Types ─────────────────────────────────────────────────────────────────
interface BetaData {
  beta: {
    id: string;
    name: string;
    notes: string;
    notes_version: number;
    notes_is_major_update: boolean;
  };
  membership: {
    id: string;
    acknowledged_at: string | null;
    last_seen_notes_version: number;
  };
}

// ─── Status badge helper ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted:     { label: 'Submitted',     color: '#8B5CF6' },
  under_review:  { label: 'Under Review',  color: '#F59E0B' },
  planned:       { label: 'Planned',       color: '#3B82F6' },
  in_progress:   { label: 'In Progress',   color: '#10B981' },
  completed:     { label: 'Completed',     color: '#059669' },
  wont_fix:      { label: "Won't Fix",     color: '#6B7280' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#6B7280' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        background: cfg.color + '22',
        color: cfg.color,
        border: `1px solid ${cfg.color}44`,
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Beta Notes Panel ──────────────────────────────────────────────────────
function BetaNotesPanel({ betaData, onClose }: { betaData: BetaData; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '80vh',
          margin: '0 16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: '4px', borderRadius: '8px',
          }}
        >
          <X size={18} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#8B5CF6',
              background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '20px',
            }}>
              {betaData.beta.name}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
            Beta Notes
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#F9F5FF',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            lineHeight: '1.65',
            color: '#374151',
            whiteSpace: 'pre-wrap',
          }}
        >
          {betaData.beta.notes || 'No notes added for this beta yet.'}
        </div>

        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
          v{betaData.beta.notes_version} · {betaData.beta.name}
        </p>
      </div>
    </div>
  );
}

// ─── Submission Modal ──────────────────────────────────────────────────────
interface SubmitModalProps {
  type: 'bug' | 'feature';
  onClose: () => void;
}

function SubmitModal({ type, onClose }: SubmitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBug = type === 'bug';
  const accentColor = '#8B5CF6';

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please attach an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      let screenshot_url: string | null = null;

      // Upload screenshot to Supabase Storage if attached
      if (screenshotFile && isBug) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ext = screenshotFile.name.split('.').pop() || 'png';
          const path = `${user.id}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('bug-screenshots')
            .upload(path, screenshotFile, { contentType: screenshotFile.type });
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage
            .from('bug-screenshots')
            .getPublicUrl(path);
          screenshot_url = publicUrl;
        }
      }

      const res = await fetch('/api/beta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, screenshot_url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          margin: '0 16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: '4px', borderRadius: '8px',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: accentColor + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isBug
              ? <Bug size={20} color={accentColor} />
              : <Sparkles size={20} color={accentColor} />}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              {isBug ? 'Report a Bug' : 'Suggest a Feature'}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              {isBug ? 'Tell us what went wrong' : 'Share your idea with the team'}
            </p>
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#10B98118',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
              {isBug ? 'Bug reported!' : 'Suggestion submitted!'}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 24px' }}>
              Thanks — we'll review it shortly.
            </p>
            <button
              onClick={onClose}
              style={{
                background: accentColor, color: '#fff', border: 'none',
                borderRadius: '10px', padding: '10px 24px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                {isBug ? 'What happened?' : 'What do you have in mind?'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isBug ? 'Brief summary of the bug' : 'Feature title'}
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#111827',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>
            <div style={{ marginBottom: isBug ? '16px' : '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                {isBug ? 'Steps to reproduce / details' : 'Describe the feature'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isBug
                  ? 'What were you doing? What did you expect to happen?'
                  : 'How would this feature work? Why is it useful?'}
                required
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#111827',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', lineHeight: '1.5',
                }}
                onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            {/* Screenshot upload — bug reports only */}
            {isBug && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Screenshot <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />

                {screenshotPreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      style={{
                        maxWidth: '100%', maxHeight: '160px', borderRadius: '10px',
                        border: '1.5px solid #E5E7EB', display: 'block',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: '#EF4444', border: 'none', borderRadius: '50%',
                        width: '22px', height: '22px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', padding: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? accentColor : '#D1D5DB'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? '#F5F3FF' : '#FAFAFA',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Paperclip size={18} color={dragOver ? accentColor : '#9CA3AF'} />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        Click to attach or drag & drop
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>PNG, JPG, GIF, WebP · max 5MB</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              style={{
                width: '100%', background: accentColor, color: '#fff',
                border: 'none', borderRadius: '10px', padding: '12px',
                fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting || !title.trim() || !description.trim() ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.15s',
              }}
            >
              <Send size={15} />
              {submitting ? (screenshotFile ? 'Uploading & submitting…' : 'Submitting…') : isBug ? 'Submit Bug Report' : 'Submit Suggestion'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── My Reports Panel ──────────────────────────────────────────────────────
interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature';
  title: string;
  description: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  user_email?: string;
  screenshot_url?: string;
}

function typeIcon(type: string) {
  return type === 'bug' ? <Bug size={13} /> : <Sparkles size={13} />;
}

function MyReports({ onClose, isAdmin }: { onClose: () => void; isAdmin: boolean }) {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Record<string, string>>({});
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/beta-feedback')
      .then(r => r.json())
      .then(json => { setItems(json.data || []); setLoading(false); })
      .catch(() => { setItems([]); setLoading(false); });
  }, []);

  async function saveAdminUpdate(id: string) {
    setSaving(id);
    try {
      await fetch('/api/beta-feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: editStatus[id], admin_notes: editNotes[id] }),
      });
      setItems(prev => prev?.map(i => i.id === id
        ? { ...i, status: editStatus[id] ?? i.status, admin_notes: editNotes[id] ?? i.admin_notes }
        : i) ?? null);
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(null);
    }
  }

  const accentColor = '#8B5CF6';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: isAdmin ? '680px' : '520px',
          maxHeight: '80vh',
          margin: '0 16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: '4px', borderRadius: '8px',
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
          {isAdmin ? '📋 All Beta Feedback' : '📬 My Reports'}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#9CA3AF' }}>
          {isAdmin ? 'All bug reports and feature suggestions from beta users' : 'Your submitted bug reports and feature suggestions'}
        </p>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '14px' }}>Loading…</div>
          )}
          {!loading && items?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '14px' }}>No submissions yet.</div>
          )}
          {!loading && items && items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map(item => {
                const isOpen = expanded === item.id;
                return (
                  <div key={item.id} style={{ border: '1.5px solid #F3F4F6', borderRadius: '12px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      style={{
                        width: '100%', background: isOpen ? '#F9F5FF' : '#FAFAFA',
                        border: 'none', cursor: 'pointer', padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 600,
                        color: item.type === 'bug' ? '#EF4444' : '#8B5CF6',
                        background: item.type === 'bug' ? '#FEF2F2' : '#F5F3FF',
                        padding: '3px 8px', borderRadius: '999px',
                      }}>
                        {typeIcon(item.type)}
                        {item.type === 'bug' ? 'Bug' : 'Feature'}
                      </span>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {item.title}
                      </span>
                      {isAdmin && item.user_email && (
                        <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0, marginRight: '8px' }}>
                          {item.user_email.split('@')[0]}
                        </span>
                      )}
                      <StatusBadge status={item.status} />
                      <span style={{ color: '#C4B5FD', flexShrink: 0, marginLeft: '4px' }}>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '14px', borderTop: '1px solid #F3F4F6', background: '#fff' }}>
                        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 10px', lineHeight: '1.5' }}>
                          {item.description}
                        </p>

                        {item.screenshot_url && (
                          <div style={{ marginBottom: '12px' }}>
                            <a href={item.screenshot_url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={item.screenshot_url}
                                alt="Screenshot"
                                style={{
                                  maxWidth: '100%', maxHeight: '200px', borderRadius: '8px',
                                  border: '1.5px solid #E5E7EB', display: 'block', cursor: 'pointer',
                                }}
                              />
                            </a>
                            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ImageIcon size={11} />
                              Click to open full size
                            </p>
                          </div>
                        )}

                        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 12px' }}>
                          Submitted: {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>

                        {item.admin_notes && !isAdmin && (
                          <div style={{
                            background: '#F5F3FF', borderRadius: '8px', padding: '10px 12px',
                            fontSize: '13px', color: '#5B21B6', borderLeft: '3px solid #8B5CF6',
                          }}>
                            <strong>Note from team:</strong> {item.admin_notes}
                          </div>
                        )}

                        {isAdmin && (
                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px' }}>STATUS</label>
                                <select
                                  defaultValue={item.status}
                                  onChange={e => setEditStatus(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  style={{
                                    width: '100%', padding: '8px 10px', borderRadius: '8px',
                                    border: '1.5px solid #E5E7EB', fontSize: '13px', color: '#111827',
                                    background: '#fff', outline: 'none', fontFamily: 'inherit',
                                  }}
                                >
                                  {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                                    <option key={val} value={val}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={() => saveAdminUpdate(item.id)}
                                disabled={saving === item.id}
                                style={{
                                  marginTop: '19px', background: accentColor, color: '#fff',
                                  border: 'none', borderRadius: '8px', padding: '8px 16px',
                                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                  opacity: saving === item.id ? 0.6 : 1, whiteSpace: 'nowrap',
                                }}
                              >
                                {saving === item.id ? '…' : 'Save'}
                              </button>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                                NOTE TO USER (optional)
                              </label>
                              <textarea
                                defaultValue={item.admin_notes || ''}
                                onChange={e => setEditNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                                placeholder="Add a note visible to the submitter…"
                                rows={2}
                                style={{
                                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                                  border: '1.5px solid #E5E7EB', fontSize: '13px', color: '#111827',
                                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                  fontFamily: 'inherit',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main BetaToolbar ──────────────────────────────────────────────────────
const TOOLBAR_COLLAPSED_KEY = 'forge-beta-toolbar-collapsed';

interface BetaToolbarProps {
  userEmail?: string;
  betaData?: BetaData | null;
}

export function BetaToolbar({ userEmail, betaData }: BetaToolbarProps) {
  const [modal, setModal] = useState<'bug' | 'feature' | 'reports' | 'notes' | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(TOOLBAR_COLLAPSED_KEY) === 'true'; } catch { return false; }
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(TOOLBAR_COLLAPSED_KEY, String(next)); } catch { /* ignore */ }
  };

  const isAdmin = userEmail
    ? ['jeremy.botter@gdcgroup.com', 'jeremy.botter@gmail.com'].includes(userEmail)
    : false;

  const hasBetaNotes = !!betaData?.beta?.notes;

  const pill: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
  };

  const iconBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 8px',
    borderRadius: '999px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: '#7C3AED',
    transition: 'background 0.15s',
  };

  return (
    <>
      {/* Collapsed mini pill */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          title="Show Beta Toolbar"
          style={{
            position: 'fixed',
            top: '14px',
            right: '28px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(245, 243, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '999px',
            padding: '5px 12px',
            boxShadow: '0 4px 24px rgba(139, 92, 246, 0.18), 0 1px 4px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
            color: '#5B21B6',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245, 243, 255, 1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245, 243, 255, 0.92)'; }}
        >
          ⚡ BETA
        </button>
      )}

      {/* Full toolbar */}
      {!collapsed && (
        <div
          style={{
            position: 'fixed',
            top: '14px',
            right: '28px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(245, 243, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '999px',
            padding: '5px 8px 5px 14px',
            boxShadow: '0 4px 24px rgba(139, 92, 246, 0.18), 0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Version info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#5B21B6', letterSpacing: '0.02em' }}>
              BETA v{VERSION}
            </span>
            <span style={{ width: '1px', height: '12px', background: 'rgba(139, 92, 246, 0.2)' }} />
            <span style={{ fontSize: '11px', color: '#7C3AED', opacity: 0.7 }}>
              {UPDATED}
            </span>
          </div>

          {/* Suggest/Feedback */}
          <button
            onClick={() => setModal('feature')}
            style={{ ...pill, background: '#8B5CF6', color: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7C3AED'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8B5CF6'; }}
          >
            <Sparkles size={13} />
            Suggest/Feedback
          </button>

          {/* Bug Report */}
          <button
            onClick={() => setModal('bug')}
            style={{ ...pill, background: 'rgba(139, 92, 246, 0.12)', color: '#5B21B6' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139, 92, 246, 0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139, 92, 246, 0.12)'; }}
          >
            <Bug size={13} />
            Bug Report
          </button>

          {/* Beta Notes */}
          {hasBetaNotes && (
            <button
              onClick={() => setModal('notes')}
              style={iconBtn}
              title="Beta Notes"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139, 92, 246, 0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <ScrollText size={15} />
            </button>
          )}

          {/* My Reports / All Feedback */}
          <button
            onClick={() => setModal('reports')}
            style={iconBtn}
            title={isAdmin ? 'View all feedback' : 'My submissions'}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139, 92, 246, 0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            {isAdmin ? '📋' : '📬'}
          </button>

          {/* Collapse button */}
          <button
            onClick={toggleCollapsed}
            style={{ ...iconBtn, opacity: 0.5 }}
            title="Minimize toolbar"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(139, 92, 246, 0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Modals */}
      {(modal === 'bug' || modal === 'feature') && (
        <SubmitModal type={modal} onClose={() => setModal(null)} />
      )}
      {modal === 'reports' && (
        <MyReports onClose={() => setModal(null)} isAdmin={isAdmin} />
      )}
      {modal === 'notes' && betaData && (
        <BetaNotesPanel betaData={betaData} onClose={() => setModal(null)} />
      )}
    </>
  );
}
