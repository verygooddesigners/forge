'use client';

import { useState } from 'react';
import { PlusCircle, Ban, ChevronDown, ChevronUp, ExternalLink, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SourceListManager } from './SourceListManager';

interface PitchSource {
  id: string;
  title: string;
  url: string;
  source_domain: string;
  trust_score: number;
  published_date: string;
  status: 'neutral' | 'used' | 'blocked';
}

interface Pitch {
  id: string;
  headline: string;
  synopsis: string;
  source_score: number;
  status: string;
  sources: PitchSource[];
  master_notes?: string;
}

interface PitchCardProps {
  pitch: Pitch;
  onSourceStatusChange: (pitchId: string, sourceId: string, status: 'neutral' | 'used' | 'blocked') => void;
  onCreateContent: (pitchId: string) => Promise<void>;
  creatingContent: boolean;
}

function SourceScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono font-bold text-text-primary w-8 text-right">{score}</span>
    </div>
  );
}

function TrustBadge({ score }: { score: number }) {
  const label = score >= 0.8 ? 'High' : score >= 0.6 ? 'Med' : 'Low';
  const cls =
    score >= 0.8
      ? 'text-green-600 bg-green-500/10'
      : score >= 0.6
        ? 'text-amber-600 bg-amber-500/10'
        : 'text-red-600 bg-red-500/10';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{label}</span>
  );
}

export function PitchCard({ pitch, onSourceStatusChange, onCreateContent, creatingContent }: PitchCardProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const usedCount = pitch.sources.filter((s) => s.status === 'used').length;
  const visibleSources = pitch.sources.filter((s) => s.status !== 'blocked');

  const handleSourceAction = async (
    sourceId: string,
    newStatus: 'neutral' | 'used' | 'blocked'
  ) => {
    const current = pitch.sources.find((s) => s.id === sourceId);
    const status = current?.status === newStatus ? 'neutral' : newStatus;
    onSourceStatusChange(pitch.id, sourceId, status);

    await fetch(`/api/news-forge/pitches/${pitch.id}/sources`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId, status }),
    });
  };

  return (
    <div className="border border-border-subtle rounded-2xl bg-bg-surface overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
            Potential Story
          </span>
        </div>
        <h3 className="text-[15px] font-semibold text-text-primary leading-snug">
          {pitch.headline}
        </h3>
      </div>

      {/* Synopsis */}
      <div className="px-4 py-3">
        <p className="text-sm text-text-secondary leading-relaxed">{pitch.synopsis}</p>
      </div>

      {/* Source Score */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-tertiary font-medium">Source Score</span>
          <span className="text-[10px] text-text-tertiary">
            {pitch.sources.length} source{pitch.sources.length !== 1 ? 's' : ''}
            {usedCount > 0 && ` · ${usedCount} selected`}
          </span>
        </div>
        <SourceScoreBar score={pitch.source_score} />
      </div>

      {/* Sources toggle */}
      <div className="border-t border-border-subtle">
        <button
          onClick={() => setSourcesOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-text-secondary hover:bg-bg-elevated transition-colors"
        >
          <span className="font-medium">
            Sources ({visibleSources.length})
          </span>
          {sourcesOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {sourcesOpen && (
          <div className="px-4 pb-3 space-y-1.5">
            {visibleSources.map((src) => (
              <div
                key={src.id}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                  src.status === 'used'
                    ? 'bg-accent-muted border border-accent-primary/20'
                    : 'bg-bg-elevated'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-medium text-text-primary truncate flex-1">{src.source_domain}</span>
                    <TrustBadge score={src.trust_score} />
                  </div>
                  <p className="text-text-tertiary line-clamp-1 text-[11px]">{src.title}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0.5 rounded text-text-tertiary hover:text-accent-primary transition-colors"
                    title="Open source"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleSourceAction(src.id, 'used')}
                    title={src.status === 'used' ? 'Remove from used sources' : 'Add to used sources'}
                    className={`p-0.5 rounded transition-colors ${
                      src.status === 'used'
                        ? 'text-accent-primary'
                        : 'text-text-tertiary hover:text-accent-primary hover:bg-accent-muted'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSourceAction(src.id, 'blocked')}
                    title="Block this source"
                    className="p-0.5 rounded text-text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                  <SourceListManager
                    source={{
                      url: src.url,
                      title: src.title,
                      source_domain: src.source_domain,
                      trust_score: src.trust_score,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Master notes (if generated) */}
      {pitch.master_notes && (
        <div className="border-t border-border-subtle">
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-text-secondary hover:bg-bg-elevated transition-colors"
          >
            <span className="font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Research Notes
            </span>
            {notesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {notesOpen && (
            <div className="px-4 pb-4">
              <div className="bg-bg-elevated rounded-xl p-3 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
                {pitch.master_notes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Content button */}
      <div className="px-4 pb-4 pt-2">
        <Button
          className="w-full"
          onClick={() => onCreateContent(pitch.id)}
          disabled={creatingContent || usedCount === 0}
          size="sm"
        >
          {creatingContent ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating notes & article...</>
          ) : usedCount === 0 ? (
            'Select sources first, then Create Content'
          ) : (
            `Create Content (${usedCount} source${usedCount !== 1 ? 's' : ''})`
          )}
        </Button>
      </div>
    </div>
  );
}
