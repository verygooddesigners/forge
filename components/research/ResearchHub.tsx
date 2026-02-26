'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { debugLog } from '@/lib/debug-log';
import type { OrchestratorLogType } from '@/types';

interface ResearchHubProps {
  projectId: string;
  writerModelId: string;
  onComplete: () => void;
}

type Stage = 'search' | 'evaluate' | 'verify' | 'followup' | 'keywords' | 'complete' | 'error';

const STAGE_LABELS: Record<Stage, string> = {
  search: 'Searching',
  evaluate: 'Evaluating',
  verify: 'Verifying',
  followup: 'Follow-up search',
  keywords: 'Discovering keywords',
  complete: 'Complete',
  error: 'Error',
};

export function ResearchHub({ projectId, writerModelId, onComplete }: ResearchHubProps) {
  const [headline, setHeadline] = useState<string>('');
  const [log, setLog] = useState<Array<{ type: OrchestratorLogType; message: string }>>([]);
  const [currentStage, setCurrentStage] = useState<Stage>('search');
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const completedRef = useRef(false);
  const errorRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (completedRef.current) return;
    let cancelled = false;

    async function run() {
      debugLog('ResearchHub', 'Starting', { projectId, writerModelId });
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('headline, primary_keyword, secondary_keywords, topic, description')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        debugLog('ResearchHub', 'Project not found', projectError?.message);
        setError('Project not found');
        return;
      }
      setHeadline(project.headline || 'New project');

      setStarted(true);
      setLog([]);
      setCurrentStage('search');

      const body = {
        projectId,
        headline: project.headline,
        primaryKeyword: project.primary_keyword,
        secondaryKeywords: project.secondary_keywords || [],
        topic: project.topic || '',
        additionalDetails: project.description || '',
      };
      debugLog('ResearchHub', 'POST /api/research/pipeline', body);

      const res = await fetch('/api/research/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) {
        debugLog('ResearchHub', 'Pipeline request failed', res.status, res.statusText);
        setError('Failed to start research');
        return;
      }
      debugLog('ResearchHub', 'SSE stream started');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (cancelled) break;
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            debugLog('ResearchHub', 'SSE [DONE]');
            if (!completedRef.current && !errorRef.current) {
              completedRef.current = true;
              onComplete();
            }
            return;
          }
          try {
            const data = JSON.parse(payload);
            if (data.type === 'progress') {
              debugLog('ResearchHub', 'progress', data.type, data.message);
              setLog((prev) => [...prev, { type: data.type, message: data.message }]);
              if (data.type && STAGE_LABELS[data.type as Stage]) {
                setCurrentStage(data.type as Stage);
              }
            }
            if (data.type === 'done') {
              debugLog('ResearchHub', 'done', data);
              if (!completedRef.current && !errorRef.current) {
                completedRef.current = true;
                onComplete();
              }
              return;
            }
            if (data.type === 'error') {
              debugLog('ResearchHub', 'error', data.error);
              errorRef.current = true;
              setError(data.error || 'Research failed');
            }
          } catch {
            // skip invalid JSON
          }
        }
      }

      if (!completedRef.current && !error) {
        completedRef.current = true;
        onComplete();
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [projectId, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-muted mb-4">
            <Sparkles className="w-7 h-7 text-accent-primary" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-1">Preparing your research</h1>
          <p className="text-sm text-text-secondary">{headline || 'Loading...'}</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            {error ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : currentStage === 'complete' ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
            )}
            {error ? error : STAGE_LABELS[currentStage]}
          </span>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-elevated">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Activity
            </span>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-border-subtle">
            {!started && (
              <li className="px-4 py-3 flex items-center gap-3 text-sm text-text-secondary">
                <Search className="w-4 h-4 shrink-0 text-accent-primary" />
                Starting research pipeline...
              </li>
            )}
            {log.map((entry, i) => (
              <li
                key={i}
                className="px-4 py-3 flex items-center gap-3 text-sm text-text-primary animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {entry.type === 'complete' || entry.type === 'keywords' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                ) : (
                  <Search className="w-4 h-4 shrink-0 text-accent-primary" />
                )}
                {entry.message}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-center text-text-tertiary">
          {error
            ? 'Research could not find enough content. You can continue to the editor anyway.'
            : "This usually takes 60–120 seconds. You'll be taken to the editor when research is complete."}
        </p>
        {error && (
          <Button
            onClick={() => {
              if (!completedRef.current) {
                completedRef.current = true;
                onComplete();
              }
            }}
            className="w-full"
          >
            Continue to editor
          </Button>
        )}
      </div>
    </div>
  );
}
