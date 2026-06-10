'use client';

import { useState, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { PitchCard } from './PitchCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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

interface PitchPanelProps {
  projectId: string;
  initialPitches: Pitch[];
  researchStatus: string;
}

export function PitchPanel({ projectId, initialPitches, researchStatus }: PitchPanelProps) {
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>(initialPitches);
  const [researching, setResearching] = useState(researchStatus === 'researching');
  const [log, setLog] = useState<{ type: string; message: string }[]>([]);
  const [error, setError] = useState('');
  const [creatingContent, setCreatingContent] = useState<string | null>(null);

  const startResearch = useCallback(async () => {
    setResearching(true);
    setLog([]);
    setError('');
    setPitches([]);

    try {
      const res = await fetch('/api/news-forge/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Research request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6));
            setLog((prev) => [...prev.slice(-19), event]);
            if (event.type === 'complete') {
              const pitchRes = await fetch(`/api/news-forge/pitches?project_id=${projectId}`);
              const pitchJson = await pitchRes.json();
              setPitches(pitchJson.pitches || []);
            }
            if (event.type === 'error') {
              setError(event.message);
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Research failed');
    } finally {
      setResearching(false);
    }
  }, [projectId]);

  const handleSourceStatusChange = useCallback(
    (pitchId: string, sourceId: string, status: 'neutral' | 'used' | 'blocked') => {
      setPitches((prev) =>
        prev.map((p) =>
          p.id === pitchId
            ? {
                ...p,
                sources: p.sources.map((s) =>
                  s.id === sourceId ? { ...s, status } : s
                ),
              }
            : p
        )
      );
    },
    []
  );

  const handleCreateContent = useCallback(
    async (pitchId: string) => {
      setCreatingContent(pitchId);
      try {
        const notesRes = await fetch('/api/news-forge/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pitch_id: pitchId }),
        });

        if (!notesRes.ok) {
          const json = await notesRes.json();
          throw new Error(json.error || 'Notes generation failed');
        }

        const { master_notes } = await notesRes.json();

        // Update pitch with master notes
        setPitches((prev) =>
          prev.map((p) => (p.id === pitchId ? { ...p, master_notes } : p))
        );

        // Get pitch data for generation
        const pitch = pitches.find((p) => p.id === pitchId);
        if (!pitch) return;

        const usedSources = pitch.sources.filter((s) => s.status === 'used');
        const researchBrief = {
          articles: usedSources.map((s) => ({
            id: s.id,
            title: s.title,
            url: s.url,
            source: s.source_domain,
            description: '',
            published_date: s.published_date,
            relevance_score: 1,
            trust_score: s.trust_score,
            is_trusted: s.trust_score >= 0.7,
            is_flagged: false,
          })),
          verified_facts: [],
          disputed_facts: [],
          user_feedback: [],
          fact_check_complete: false,
          research_timestamp: new Date().toISOString(),
          confidence_score: pitch.source_score / 100,
        };

        // Navigate to dashboard for writing
        const params = new URLSearchParams({
          project: projectId,
          nf_pitch: pitchId,
          headline: pitch.headline,
          research: 'true',
        });
        router.push(`/dashboard?${params.toString()}`);
      } catch (err: any) {
        alert(err.message || 'Failed to create content');
      } finally {
        setCreatingContent(null);
      }
    },
    [pitches, projectId, router]
  );

  // Initial state — no research yet
  if (!researching && pitches.length === 0 && log.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📰</span>
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1.5">Ready to Research</h3>
        <p className="text-sm text-text-secondary max-w-xs mb-6">
          The AI will search for current sports news for your selected site, teams, and sports — then generate story pitches for you to review.
        </p>
        <Button onClick={startResearch}>Start Research</Button>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Research in progress */}
      {researching && (
        <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
            <span className="text-sm font-medium text-text-primary">Researching stories...</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="shrink-0 opacity-50 font-mono">
                  {entry.type === 'complete' ? '✓' : entry.type === 'error' ? '✗' : '›'}
                </span>
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={startResearch} className="ml-auto shrink-0">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Pitches */}
      {pitches.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              {pitches.length} Story Pitch{pitches.length !== 1 ? 'es' : ''}
            </h3>
            <Button variant="ghost" size="sm" onClick={startResearch} disabled={researching}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-research
            </Button>
          </div>
          {pitches.map((pitch) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              onSourceStatusChange={handleSourceStatusChange}
              onCreateContent={handleCreateContent}
              creatingContent={creatingContent === pitch.id}
            />
          ))}
        </>
      )}
    </div>
  );
}
