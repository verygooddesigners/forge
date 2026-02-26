'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { WriterModel, Brief, Project } from '@/types';
import { Plus, Loader2, FileText, BookOpen } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { debugLog } from '@/lib/debug-log';
import { toast } from 'sonner';

// ----- TipTap content to read-only JSX (small font, for preview) -----
function renderTipTapNode(node: any, key: number): React.ReactNode {
  if (!node) return null;
  const k = `n-${key}`;
  if (node.type === 'text') {
    let text = node.text ?? '';
    const marks = node.marks as Array<{ type: string }> | undefined;
    if (marks?.length) {
      marks.forEach((m) => {
        if (m.type === 'bold') text = `**${text}**`;
        else if (m.type === 'italic') text = `*${text}*`;
      });
    }
    return <span key={k}>{text}</span>;
  }
  if (node.type === 'doc') {
    const children = (node.content as any[])?.map((c, i) => renderTipTapNode(c, i)) ?? [];
    return <div key={k} className="space-y-1">{children}</div>;
  }
  if (node.type === 'heading') {
    const level = Math.min(6, node.attrs?.level ?? 2);
    const children = (node.content as any[])?.map((c, i) => renderTipTapNode(c, i)) ?? [];
    return (
      <div key={k} className="font-semibold text-[10px] mt-2 first:mt-0" data-heading-level={level}>
        {children}
      </div>
    );
  }
  if (node.type === 'paragraph') {
    const children = (node.content as any[])?.map((c, i) => renderTipTapNode(c, i)) ?? [];
    return (
      <p key={k} className="text-[10px] leading-snug">
        {children}
      </p>
    );
  }
  if (node.type === 'bulletList') {
    const children = (node.content as any[])?.map((c, i) => renderTipTapNode(c, i)) ?? [];
    return (
      <ul key={k} className="list-disc list-inside text-[10px] pl-1 space-y-0.5">
        {children}
      </ul>
    );
  }
  if (node.type === 'listItem') {
    const children = (node.content as any[])?.map((c, i) => renderTipTapNode(c, i)) ?? [];
    return <li key={k}>{children}</li>;
  }
  if (node.type === 'horizontalRule') {
    return <hr key={k} className="border-border-subtle my-1" />;
  }
  return null;
}

function TipTapPreview({ content }: { content: any }) {
  if (!content?.content?.length) return null;
  return (
    <div className="text-[10px] text-text-secondary leading-snug overflow-auto max-h-full">
      {content.content.map((node: any, i: number) => renderTipTapNode(node, i))}
    </div>
  );
}

// ----- New Project Page Client -----
interface NewProjectPageClientProps {
  user: User;
}

export function NewProjectPageClient({ user }: NewProjectPageClientProps) {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [headline, setHeadline] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywordInput, setSecondaryKeywordInput] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState('800');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [writerModels, setWriterModels] = useState<WriterModel[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const userId = user.id;
  const userRole = user.role ?? '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setDataLoading(true);
    // User can see: their personal model (strategist_id = userId) + all house models (is_house_model = true)
    const { data: models } = await supabase
      .from('writer_models')
      .select('*')
      .or(`strategist_id.eq.${userId},is_house_model.eq.true`)
      .order('name');

    const { data: briefsData } = await supabase
      .from('briefs')
      .select('*')
      .or(`is_shared.eq.true,created_by.eq.${userId}`)
      .order('name');

    if (models) {
      setWriterModels(models);
      const defaultId = (user as User & { default_writer_model_id?: string }).default_writer_model_id;
      const personalModel = models.find((m) => m.strategist_id === userId);
      if (defaultId && models.some((m) => m.id === defaultId)) {
        setSelectedModelId(defaultId);
      } else if (personalModel) {
        setSelectedModelId(personalModel.id);
      }
    }
    if (briefsData) setBriefs(briefsData);
    setDataLoading(false);
  };

  const myBriefs = briefs.filter((b) => b.created_by === userId);
  const sharedBriefs = briefs.filter((b) => b.created_by !== userId && b.is_shared);
  const selectedBrief = selectedBriefId ? briefs.find((b) => b.id === selectedBriefId) : null;
  const personalModels = writerModels.filter((m) => m.strategist_id === userId);
  const houseModels = writerModels.filter((m) => m.is_house_model);

  const addSecondaryKeyword = () => {
    const raw = secondaryKeywordInput.trim();
    if (!raw) return;
    // Split only on commas so multi-word keywords stay together
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    const added = parts.filter((p) => !secondaryKeywords.includes(p));
    if (added.length) setSecondaryKeywords((prev) => [...prev, ...added]);
    setSecondaryKeywordInput('');
  };

  const removeSecondaryKeyword = (keyword: string) => {
    setSecondaryKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleSecondaryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSecondaryKeyword();
    }
  };

  const handleCreateProject = async () => {
    if (!selectedBriefId || !selectedModelId) return;
    if (!headline.trim() || !primaryKeyword.trim()) return;

    setLoading(true);
    debugLog('ProjectCreate', 'Create clicked', {
      headline: headline.trim().slice(0, 50),
      primaryKeyword: primaryKeyword.trim(),
      modelId: selectedModelId,
      briefId: selectedBriefId,
    });
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          headline: headline.trim(),
          file_name: projectName.trim() || headline.trim(),
          primary_keyword: primaryKeyword.trim(),
          secondary_keywords: secondaryKeywords,
          topic: topic.trim() || null,
          word_count_target: parseInt(wordCount, 10) || 800,
          writer_model_id: selectedModelId,
          brief_id: selectedBriefId,
          content: {},
        })
        .select()
        .single();

      if (error) {
        debugLog('ProjectCreate', 'Insert error', error.message);
        toast.error(error.message || 'Failed to create project');
        return;
      }
      if (!data?.id) {
        debugLog('ProjectCreate', 'No project returned', { data, error });
        toast.error('Project was created but something went wrong. Try opening the dashboard.');
        return;
      }
      const redirect = `/dashboard?project=${data.id}&model=${data.writer_model_id}&research=true`;
      debugLog('ProjectCreate', 'Project created', { projectId: data.id, redirect });
      trackEvent(supabase, userId, 'project_created', data.id, 'project', {
        word_count_target: parseInt(wordCount, 10) || 800,
      });
      router.push(redirect);
    } catch (err) {
      debugLog('ProjectCreate', 'Error', err);
      console.error('Error creating project:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    headline.trim() !== '' &&
    primaryKeyword.trim() !== '' &&
    selectedModelId !== '' &&
    selectedBriefId !== '' &&
    wordCount !== '' &&
    parseInt(wordCount, 10) > 0;

  return (
    <div className="flex h-full w-full">
      <AppSidebar
        user={user}
        onOpenProjects={() => router.push('/projects')}
        onOpenSmartBriefs={() => router.push('/smartbriefs')}
        onOpenWriterFactory={() => router.push('/writer-factory')}
      />

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-white/60 bg-white/80 backdrop-blur-md">
          <h1 className="text-xl font-semibold text-text-primary">Create New Project</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={loading || !canSubmit || dataLoading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Project
            </Button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
          <p className="text-sm text-text-secondary mb-6">
            Fill in the details below to set up your AI-generated content project.
          </p>

          {/* Section 1: Project Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary text-xs font-semibold">
                  1
                </span>
                Project Details
              </CardTitle>
              <p className="text-sm text-text-secondary">Basic information about this project.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <p className="text-xs text-text-tertiary">Give your project a clear, recognizable title.</p>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Q4 SaaS Landing Page Campaign"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <p className="text-xs text-text-tertiary">Describe the purpose, goals, or context of this project.</p>
                <Textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="e.g. This project targets mid-market SaaS buyers evaluating project management tools. Goal is to increase trial signups by 20% in Q4..."
                  rows={4}
                  className="resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Content Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary text-xs font-semibold">
                  2
                </span>
                Content Configuration
              </CardTitle>
              <p className="text-sm text-text-secondary">Define the content structure and target keywords.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">H1 Heading *</Label>
                <p className="text-xs text-text-tertiary">The primary heading for the piece of content being generated.</p>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. The Complete Guide to Project Management for Remote Teams"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryKeyword">Primary Keyword *</Label>
                  <p className="text-xs text-text-tertiary">Main SEO target keyword.</p>
                  <Input
                    id="primaryKeyword"
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    placeholder="e.g. project management software"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wordCount">Word Count</Label>
                  <p className="text-xs text-text-tertiary">Target word count for the generated content.</p>
                  <Input
                    id="wordCount"
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    placeholder="e.g. 1800"
                    min={100}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryKeywords">Secondary Keywords</Label>
                <p className="text-xs text-text-tertiary">Type a keyword and press Enter, comma, or click + to add.</p>
                <div className="flex gap-2">
                  <Input
                    id="secondaryKeywords"
                    ref={secondaryInputRef}
                    value={secondaryKeywordInput}
                    onChange={(e) => setSecondaryKeywordInput(e.target.value)}
                    onKeyDown={handleSecondaryKeyDown}
                    placeholder="e.g. remote work tools"
                  />
                  <Button type="button" size="icon" onClick={addSecondaryKeyword} className="shrink-0 bg-accent-primary text-white hover:bg-accent-primary/90">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {secondaryKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {secondaryKeywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="cursor-pointer pr-1"
                        onClick={() => removeSecondaryKeyword(kw)}
                      >
                        {kw} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Additional Details</Label>
                <p className="text-xs text-text-tertiary">
                  Any extra instructions, context, or special requirements for the AI writer.
                </p>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Include a comparison table with competitors. Avoid mentioning pricing. The tone should be friendly but authoritative..."
                  rows={4}
                  className="resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Writer Model */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary text-xs font-semibold">
                  3
                </span>
                Writer Model
              </CardTitle>
              <p className="text-sm text-text-secondary">Choose the writer model that will generate this project&apos;s content.</p>
            </CardHeader>
            <CardContent>
              <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={dataLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a writer model" />
                </SelectTrigger>
                <SelectContent>
                  {personalModels.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Your Model</SelectLabel>
                      {personalModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {houseModels.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>RotoWire Models</SelectLabel>
                      {houseModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              {writerModels.length === 0 && !dataLoading && (
                <p className="text-sm text-text-tertiary mt-2">No writer models available. Create one in Writer Model.</p>
              )}
            </CardContent>
          </Card>

          {/* Section 4: SmartBrief */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary text-xs font-semibold">
                  4
                </span>
                SmartBrief
              </CardTitle>
              <p className="text-sm text-text-secondary">Select a content blueprint to guide the AI&apos;s structure and approach.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[280px]">
                {/* Left: list */}
                <div className="border border-border-subtle rounded-lg overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
                    {myBriefs.length > 0 && (
                      <div>
                        <div className="px-3 py-2 bg-bg-hover/50 text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> My SmartBriefs
                        </div>
                        {myBriefs.map((brief) => (
                          <button
                            key={brief.id}
                            type="button"
                            onClick={() => setSelectedBriefId(brief.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              selectedBriefId === brief.id ? 'bg-accent-muted text-accent-primary' : 'hover:bg-bg-hover text-text-primary'
                            }`}
                          >
                            {brief.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {sharedBriefs.length > 0 && (
                      <div>
                        <div className="px-3 py-2 bg-bg-hover/50 text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" /> Shared with me
                        </div>
                        {sharedBriefs.map((brief) => (
                          <button
                            key={brief.id}
                            type="button"
                            onClick={() => setSelectedBriefId(brief.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              selectedBriefId === brief.id ? 'bg-accent-muted text-accent-primary' : 'hover:bg-bg-hover text-text-primary'
                            }`}
                          >
                            {brief.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {briefs.length === 0 && !dataLoading && (
                      <div className="p-4 text-sm text-text-tertiary">No SmartBriefs available. Create one first.</div>
                    )}
                  </div>
                </div>
                {/* Right: preview */}
                <div className="border border-dashed border-border-subtle rounded-lg overflow-hidden flex flex-col bg-bg-surface/50 min-h-[200px]">
                  <div className="flex-1 overflow-auto p-3">
                    {selectedBrief?.content ? (
                      <TipTapPreview content={selectedBrief.content} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-text-tertiary text-sm">
                        <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                        Select a SmartBrief to preview its scaffold.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
