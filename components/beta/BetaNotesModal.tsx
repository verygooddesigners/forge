'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface BetaNotesModalProps {
  data: BetaData | null;
  onDismiss: () => void;
}

export function BetaNotesModal({ data, onDismiss }: BetaNotesModalProps) {
  const [saving, setSaving] = useState(false);

  if (!data) return null;

  const { beta, membership } = data;
  const isMandatory = !membership.acknowledged_at;
  const isMajorUpdate =
    !isMandatory &&
    beta.notes_is_major_update &&
    membership.last_seen_notes_version < beta.notes_version;

  // Don't show if nothing to show
  if (!isMandatory && !isMajorUpdate) return null;

  const handleAction = async (action: 'acknowledge' | 'seen') => {
    setSaving(true);
    try {
      await fetch('/api/beta-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: membership.id, action }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      onDismiss();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #1a1a2e)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Dismissible X for major updates only */}
        {isMajorUpdate && !isMandatory && (
          <button
            onClick={() => handleAction('seen')}
            disabled={saving}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary, #888)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary, #7c6af7)',
                background: 'var(--accent-muted, rgba(124,106,247,0.12))',
                padding: '2px 8px',
                borderRadius: '20px',
              }}
            >
              {beta.name}
            </span>
            {isMajorUpdate && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#f59e0b',
                  background: 'rgba(245,158,11,0.12)',
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}
              >
                Update
              </span>
            )}
          </div>
          <h2
            style={{
              fontSize: '19px',
              fontWeight: 700,
              color: 'var(--text-primary, #f0f0f0)',
              margin: 0,
            }}
          >
            {isMandatory ? 'Beta Notes — Please Read' : 'Beta Notes Update'}
          </h2>
          {isMandatory && (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary, #888)', margin: 0 }}>
              Please read before continuing.
            </p>
          )}
        </div>

        {/* Notes content */}
        <div
          style={{
            background: 'var(--bg-elevated, rgba(255,255,255,0.04))',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '14px',
            lineHeight: '1.65',
            color: 'var(--text-secondary, #ccc)',
            whiteSpace: 'pre-wrap',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {beta.notes || 'No notes added for this beta yet.'}
        </div>

        {/* Footer */}
        {isMandatory ? (
          <Button
            onClick={() => handleAction('acknowledge')}
            disabled={saving}
            className="w-full gap-2"
            style={{ height: '42px', fontSize: '14px', fontWeight: 600 }}
          >
            <CheckCircle2 size={16} />
            I've read the Beta Notes
          </Button>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => handleAction('seen')}
              disabled={saving}
              className="gap-2"
            >
              Got it
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
