'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Sparkles } from 'lucide-react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { Project } from '@/types';

interface EditorPanelProps {
  projectId: string | null;
  writerModelId: string | null;
  onOpenProjectModal: () => void;
}

export function EditorPanel({ projectId, writerModelId, onOpenProjectModal }: EditorPanelProps) {
  const [content, setContent] = useState<any>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
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
      .select(`
        *,
        brief:brief_id (content),
        writer_model:writer_model_id (id)
      `)
      .eq('id', projectId)
      .single();

    if (!error && data) {
      setProject(data as Project);
      setContent(data.content || null);
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

  const handleGenerateContent = async () => {
    if (!project || !projectId || !writerModelId) return;

    setGenerating(true);
    try {
      // Get brief content
      const briefContent = project.brief?.content || null;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          headline: project.headline,
          primaryKeyword: project.primary_keyword,
          secondaryKeywords: project.secondary_keywords || [],
          wordCount: project.word_count_target || 800,
          writerModelId,
          briefContent: briefContent ? JSON.stringify(briefContent) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedText = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                generatedText += parsed.content;
                // Update content in real-time as it streams
                // Convert plain text to TipTap JSON format
                const tipTapContent = {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: generatedText.split('\n\n').map((para) => ({
                        type: 'text',
                        text: para.trim(),
                      })).filter((p) => p.text),
                    },
                  ],
                };
                setContent(tipTapContent);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final content conversion - convert plain text to proper TipTap format
      const paragraphs = generatedText.split('\n\n').filter(p => p.trim());
      const tipTapContent = {
        type: 'doc',
        content: paragraphs.map((para) => {
          // Check if it's a heading (starts with #)
          if (para.trim().startsWith('#')) {
            const level = para.match(/^#+/)?.[0].length || 1;
            const text = para.replace(/^#+\s*/, '').trim();
            return {
              type: `heading`,
              attrs: { level: Math.min(level, 3) },
              content: [{ type: 'text', text }],
            };
          }
          return {
            type: 'paragraph',
            content: para.trim() ? [{ type: 'text', text: para.trim() }] : [],
          };
        }).filter((node) => node.content && node.content.length > 0),
      };

      setContent(tipTapContent);
      
      // Save the generated content
      await supabase
        .from('projects')
        .update({ content: tipTapContent })
        .eq('id', projectId);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
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
      {/* Header with Generate Button */}
      {project && (
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">{project.headline}</h2>
            <p className="text-sm text-muted-foreground">
              {project.primary_keyword}
              {project.secondary_keywords && project.secondary_keywords.length > 0 && (
                <> • {project.secondary_keywords.join(', ')}</>
              )}
            </p>
          </div>
          <Button
            onClick={handleGenerateContent}
            disabled={generating || !writerModelId}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Content'}
          </Button>
        </div>
      )}

      <TipTapEditor
        content={content}
        onChange={handleContentChange}
        onWordCountChange={handleWordCountChange}
        placeholder={project ? "Click 'Generate Content' to create your article..." : "Start writing your content..."}
      />

      {/* Status Bar */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
        <span className="flex items-center gap-2">
          {generating ? (
            <>
              <Sparkles className="h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : saving ? (
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

