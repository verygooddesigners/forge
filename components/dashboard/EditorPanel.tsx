'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface EditorPanelProps {
  projectId: string | null;
  writerModelId: string | null;
  onOpenProjectModal: () => void;
}

export function EditorPanel({ projectId, writerModelId, onOpenProjectModal }: EditorPanelProps) {
  const [content, setContent] = useState<any>(null);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const supabase = createClient();
  
  // Debounce content changes for auto-save
  const debouncedContent = useDebounce(content, 2000);

  // Load project content
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // Auto-save when content changes
  useEffect(() => {
    if (debouncedContent && projectId) {
      saveProject();
    }
  }, [debouncedContent]);

  const loadProject = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .select('content')
      .eq('id', projectId)
      .single();

    if (!error && data) {
      setContent(data.content);
    }
  };

  const saveProject = async () => {
    if (!projectId || !content) return;

    setSaving(true);
    const { error } = await supabase
      .from('projects')
      .update({ content })
      .eq('id', projectId);

    if (!error) {
      setLastSaved(new Date());
    }
    setSaving(false);
  };

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
  };

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
  };

  if (!projectId) {
    return (
      <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Welcome to RotoWrite</h2>
          <p className="text-muted-foreground max-w-md">
            Create a new project or open an existing one to start writing AI-powered content.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button size="lg" onClick={onOpenProjectModal}>
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
            <Button variant="outline" size="lg" onClick={onOpenProjectModal}>
              Open Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col">
      <TipTapEditor
        content={content}
        onChange={handleContentChange}
        onWordCountChange={handleWordCountChange}
        placeholder="Start writing your content..."
      />

      {/* Status Bar */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
        <span className="flex items-center gap-2">
          {saving ? (
            <>
              <Save className="h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : lastSaved ? (
            <>
              <Save className="h-3 w-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </>
          ) : (
            'Ready'
          )}
        </span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
}

