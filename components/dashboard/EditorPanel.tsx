'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Sparkles } from 'lucide-react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { ExportModal } from '@/components/modals/ExportModal';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { Project } from '@/types';
import { Editor } from '@tiptap/react';

interface EditorPanelProps {
  projectId: string | null;
  writerModelId: string | null;
  onOpenProjectModal: () => void;
  onNewProject?: () => void;
  onContentChange?: (content: any) => void;
}

export function EditorPanel({ projectId, writerModelId, onOpenProjectModal, onNewProject, onContentChange }: EditorPanelProps) {
  const [content, setContent] = useState<any>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const supabase = createClient();
  
  // Debounce content changes for auto-save
  const debouncedContent = useDebounce(content, 2000);

  // Notify parent of content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

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

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          brief:brief_id (content)
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        return;
      }

      if (data) {
        console.log('Project loaded:', data.headline, 'Writer Model ID:', data.writer_model_id);
        setProject(data as Project);
        setContent(data.content || null);
      }
    } catch (error) {
      console.error('Error loading project:', error);
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
    if (!project || !projectId) {
      alert('Project not loaded. Please try again.');
      return;
    }

    // Use writerModelId from prop or from project
    const modelId = writerModelId || project.writer_model_id;
    if (!modelId) {
      alert('No writer model selected. Please select a writer model for this project.');
      return;
    }

    setGenerating(true);
    try {
      // Get brief content - need to load it if not already loaded
      let briefContent = project.brief?.content || null;
      
      // If brief content not loaded, fetch it
      if (!briefContent && project.brief_id) {
        const { data: briefData } = await supabase
          .from('briefs')
          .select('content')
          .eq('id', project.brief_id)
          .single();
        
        if (briefData) {
          briefContent = briefData.content;
        }
      }

      console.log('Generating content with:', {
        projectId,
        headline: project.headline,
        primaryKeyword: project.primary_keyword,
        writerModelId: modelId,
        hasBrief: !!briefContent,
      });

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
          writerModelId: modelId,
          briefContent: briefContent ? JSON.stringify(briefContent) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || `Failed to generate content (${response.status})`;
        console.error('Generation API error:', errorData);
        throw new Error(errorMessage);
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
                // Don't display during streaming - wait for final formatted conversion
                // This prevents raw HTML/markdown from showing in the editor
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Helper function to strip HTML tags and convert to plain text
      const stripHtmlTags = (html: string): string => {
        return html
          // Convert HTML tags to markdown equivalents
          .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i>(.*?)<\/i>/gi, '*$1*')
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
          .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '### $1')
          .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '### $1')
          .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '### $1')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
          .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1')
          .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1')
          // Remove any remaining HTML tags
          .replace(/<[^>]+>/g, '')
          // Decode HTML entities
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          // Clean up extra whitespace
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();
      };

      // Strip HTML tags from generated text before processing
      const cleanedText = stripHtmlTags(generatedText);

      // Final content conversion - convert markdown text to proper TipTap format
      const lines = cleanedText.split('\n');
      const tipTapNodes = [];
      let currentParagraph = '';
      let inList = false;
      let listItems: string[] = [];
      let listType: 'bullet' | 'ordered' | null = null;

      const parseInlineFormatting = (text: string) => {
        const content = [];
        let remainingText = text;
        let position = 0;

        while (position < remainingText.length) {
          // Check for bold (**text** or __text__)
          const boldMatch = remainingText.slice(position).match(/^(\*\*|__)(.*?)\1/);
          if (boldMatch) {
            if (position > 0) {
              content.push({ type: 'text', text: remainingText.slice(0, position) });
              remainingText = remainingText.slice(position);
              position = 0;
            }
            content.push({ 
              type: 'text', 
              text: boldMatch[2],
              marks: [{ type: 'bold' }]
            });
            remainingText = remainingText.slice(boldMatch[0].length);
            continue;
          }

          // Check for italic (*text* or _text_)
          const italicMatch = remainingText.slice(position).match(/^(\*|_)(.*?)\1/);
          if (italicMatch) {
            if (position > 0) {
              content.push({ type: 'text', text: remainingText.slice(0, position) });
              remainingText = remainingText.slice(position);
              position = 0;
            }
            content.push({ 
              type: 'text', 
              text: italicMatch[2],
              marks: [{ type: 'italic' }]
            });
            remainingText = remainingText.slice(italicMatch[0].length);
            continue;
          }

          position++;
        }

        if (remainingText) {
          content.push({ type: 'text', text: remainingText });
        }

        return content.length > 0 ? content : [{ type: 'text', text }];
      };

      const flushList = () => {
        if (listItems.length > 0 && listType) {
          tipTapNodes.push({
            type: listType === 'bullet' ? 'bulletList' : 'orderedList',
            content: listItems.map(item => ({
              type: 'listItem',
              content: [{
                type: 'paragraph',
                content: parseInlineFormatting(item),
              }],
            })),
          });
          listItems = [];
          listType = null;
          inList = false;
        }
      };

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check if it's a heading (starts with #)
        if (trimmedLine.startsWith('#')) {
          flushList();
          if (currentParagraph) {
            tipTapNodes.push({
              type: 'paragraph',
              content: parseInlineFormatting(currentParagraph.trim()),
            });
            currentParagraph = '';
          }
          
          const level = trimmedLine.match(/^#+/)?.[0].length || 1;
          const text = trimmedLine.replace(/^#+\s*/, '').trim();
          if (text) {
            tipTapNodes.push({
              type: 'heading',
              attrs: { level: Math.min(level, 3) },
              content: parseInlineFormatting(text),
            });
          }
        } 
        // Check for bullet list
        else if (trimmedLine.match(/^[-*]\s/)) {
          if (currentParagraph) {
            tipTapNodes.push({
              type: 'paragraph',
              content: parseInlineFormatting(currentParagraph.trim()),
            });
            currentParagraph = '';
          }
          const itemText = trimmedLine.replace(/^[-*]\s/, '').trim();
          if (listType !== 'bullet') {
            flushList();
            listType = 'bullet';
          }
          listItems.push(itemText);
          inList = true;
        }
        // Check for ordered list
        else if (trimmedLine.match(/^\d+\.\s/)) {
          if (currentParagraph) {
            tipTapNodes.push({
              type: 'paragraph',
              content: parseInlineFormatting(currentParagraph.trim()),
            });
            currentParagraph = '';
          }
          const itemText = trimmedLine.replace(/^\d+\.\s/, '').trim();
          if (listType !== 'ordered') {
            flushList();
            listType = 'ordered';
          }
          listItems.push(itemText);
          inList = true;
        }
        else if (trimmedLine === '') {
          flushList();
          if (currentParagraph) {
            tipTapNodes.push({
              type: 'paragraph',
              content: parseInlineFormatting(currentParagraph.trim()),
            });
            currentParagraph = '';
          }
        } else {
          if (inList) {
            flushList();
          }
          if (currentParagraph) {
            currentParagraph += ' ' + trimmedLine;
          } else {
            currentParagraph = trimmedLine;
          }
        }
      }

      flushList();
      if (currentParagraph) {
        tipTapNodes.push({
          type: 'paragraph',
          content: parseInlineFormatting(currentParagraph.trim()),
        });
      }

      const tipTapContent = {
        type: 'doc',
        content: tipTapNodes.filter((node) => node.content && (node.content.length > 0 || node.type === 'bulletList' || node.type === 'orderedList')),
      };

      setContent(tipTapContent);
      
      // Save the generated content
      await supabase
        .from('projects')
        .update({ content: tipTapContent })
        .eq('id', projectId);
    } catch (error: any) {
      console.error('Error generating content:', error);
      let errorMessage = 'Failed to generate content. Please try again.';
      
      // Provide more specific error messages
      if (error.message) {
        if (error.message.includes('CLAUDE_API_KEY')) {
          errorMessage = 'Claude API key is not configured. Please contact your administrator.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.message.includes('training content')) {
          errorMessage = 'No training content found for this writer model. Please add training content in the Writer Factory before generating content.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`Content Generation Error:\n\n${errorMessage}\n\nPlease check the browser console for more details.`);
    } finally {
      setGenerating(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Welcome to RotoWrite</h2>
          <p className="text-text-secondary max-w-md">
            Create a new project or open an existing one to start writing AI-powered content.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button size="lg" onClick={onNewProject || onOpenProjectModal}>
              <Plus className="w-5 h-5" />
              New Project
            </Button>
            <Button variant="ghost" size="lg" onClick={onOpenProjectModal}>
              Open Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl flex flex-col">
        <div className="flex-1 overflow-hidden">
          <TipTapEditor
            content={content}
            onChange={handleContentChange}
            onWordCountChange={handleWordCountChange}
            placeholder={project ? "Start writing your content..." : "Start writing your content..."}
            onGenerateContent={handleGenerateContent}
            generating={generating}
            canGenerate={!!writerModelId && !!project}
            onExport={() => setShowExportModal(true)}
            onEditorReady={(editor) => { editorRef.current = editor; }}
          />
        </div>

        {/* Status Bar */}
        <div className="border-t border-border-subtle bg-bg-deep px-4 py-2.5 text-xs text-text-tertiary flex justify-between items-center">
          <span className="flex items-center gap-2 font-medium">
            {generating ? (
              <>
                <Sparkles className="h-3 w-3 animate-spin text-ai-accent" />
                <span className="text-ai-accent">Generating...</span>
              </>
            ) : saving ? (
              <>
                <Save className="h-3 w-3 animate-spin text-accent-primary" />
                <span className="text-accent-primary">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-3 w-3 text-success" />
                <span className="text-text-secondary">Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : (
              <span className="text-text-muted">Ready</span>
            )}
          </span>
          <span className="font-mono font-semibold text-text-primary">{wordCount} words</span>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        editor={editorRef.current}
        projectHeadline={project?.headline}
      />
    </>
  );
}

