'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Project, ProjectResearch, WriterModel, Brief } from '@/types';

interface GenerationContextProps {
  projectId: string | null;
  writerModelId: string | null;
  onGenerateContent?: () => void;
  generating?: boolean;
  canGenerate?: boolean;
}

export function GenerationContext({
  projectId,
  writerModelId,
  onGenerateContent,
  generating = false,
  canGenerate = false,
}: GenerationContextProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectResearch, setProjectResearch] = useState<ProjectResearch | null>(null);
  const [writerModel, setWriterModel] = useState<WriterModel | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setProjectResearch(null);
      setWriterModel(null);
      setBrief(null);
      return;
    }
    supabase
      .from('projects')
      .select('*, brief:brief_id (*)')
      .eq('id', projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProject(data as Project);
          setBrief((data as any).brief as Brief | null);
        }
      });
    supabase
      .from('project_research')
      .select('*')
      .eq('project_id', projectId)
      .single()
      .then(({ data }) => setProjectResearch(data as ProjectResearch | null));
  }, [projectId, supabase]);

  useEffect(() => {
    const id = writerModelId || project?.writer_model_id;
    if (!id) {
      setWriterModel(null);
      return;
    }
    supabase
      .from('writer_models')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setWriterModel(data as WriterModel | null));
  }, [writerModelId, project?.writer_model_id, supabase]);

  const selectedCount = projectResearch?.selected_story_ids?.length ?? 0;
  const keywordCount = projectResearch?.selected_keywords?.length ?? 0;

  if (!projectId) return null;

  return (
    <div className="border-b border-border-subtle bg-bg-elevated/50">
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary min-w-0"
        >
          {collapsed ? (
            <ChevronDown className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronUp className="h-3 w-3 shrink-0" />
          )}
          <span className="truncate">
            {selectedCount} selected {selectedCount === 1 ? 'story' : 'stories'} · {keywordCount} keyword{keywordCount !== 1 ? 's' : ''}
            {brief?.name && ` · Brief: ${brief.name}`}
            {writerModel?.name && ` · Model: ${writerModel.name}`}
          </span>
        </button>
        {onGenerateContent && (
          <Button
            size="sm"
            className="gap-2 shrink-0"
            onClick={onGenerateContent}
            disabled={generating || !canGenerate}
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Content'}
          </Button>
        )}
      </div>
    </div>
  );
}
