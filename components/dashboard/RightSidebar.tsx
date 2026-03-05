'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Newspaper, TrendingUp, RefreshCw, BookOpen, RotateCcw, Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { NewsArticle, Project, Brief } from '@/types';
import type { ProjectResearch, ResearchStory } from '@/types';
import { NewsCard } from './NewsCard';
import { ResearchStoryCard } from '@/components/research/ResearchStoryCard';
import { ResearchStoriesModal } from '@/components/research/ResearchStoriesModal';
import { SEOOptimizationSidebar } from './SEOOptimizationSidebar';
import { createClient } from '@/lib/supabase/client';

interface RightSidebarProps {
  projectId: string | null;
  writerModelId: string | null;
  content?: any;
  onContentUpdate?: (content: any) => void;
  onProjectUpdate?: () => void;
  onResearchAgain?: () => void;
}

export function RightSidebar({
  projectId,
  writerModelId,
  content,
  onContentUpdate,
  onProjectUpdate,
  onResearchAgain,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('seo');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [projectResearch, setProjectResearch] = useState<ProjectResearch | null>(null);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [showAddStory, setShowAddStory] = useState(false);
  const [addStoryUrl, setAddStoryUrl] = useState('');
  const [addingStory, setAddingStory] = useState(false);
  const researchRetryRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (projectId) {
      loadProject();
    } else {
      setProject(null);
      setProjectResearch(null);
      researchRetryRef.current = false;
    }
  }, [projectId]);

  // Helper: load research data via server-side API (bypasses client-side RLS for admin users)
  const loadResearchData = async (pid: string): Promise<any | null> => {
    try {
      const res = await fetch(`/api/research/load?projectId=${pid}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.research ?? null;
    } catch {
      return null;
    }
  };

  // After research completes, editor may load before DB write is visible; refetch research once if we have no stories
  useEffect(() => {
    if (!projectId || researchRetryRef.current) return;
    const hasStories = projectResearch && projectResearch.stories.length > 0;
    if (hasStories) return;
    const t = setTimeout(async () => {
      researchRetryRef.current = true;
      const data = await loadResearchData(projectId);
      if (!data) return;
      const raw = data.stories;
      let stories: ResearchStory[] = Array.isArray(raw) ? (raw as ResearchStory[]) : [];
      if (stories.length === 0 && typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          stories = Array.isArray(parsed) ? (parsed as ResearchStory[]) : [];
        } catch {
          stories = [];
        }
      }
      if (stories.length === 0 && (data.status === 'completed' || data.status === 'failed')) {
        const { data: briefRes } = await supabase.from('projects').select('research_brief').eq('id', projectId).single();
        const articles = (briefRes?.research_brief as any)?.articles;
        if (Array.isArray(articles) && articles.length > 0) {
          stories = articles.map((a: any, i: number) => ({
            ...a,
            id: a.id || `art-${i}`,
            synopsis: a.synopsis || a.description?.slice(0, 150),
            is_selected: i < 5,
            verification_status: (a.verification_status as ResearchStory['verification_status']) || 'pending',
          }));
        }
      }
      if (stories.length > 0) {
        setProjectResearch({
          ...data,
          stories,
          suggested_keywords: data.suggested_keywords || [],
          selected_story_ids: data.selected_story_ids || [],
          selected_keywords: data.selected_keywords || [],
          orchestrator_log: data.orchestrator_log || [],
        } as ProjectResearch);
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [projectId, projectResearch]);

  useEffect(() => {
    if (project && (project.headline || project.primary_keyword)) {
      fetchNews();
    }
  }, [project]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      // Load project and project_research in parallel so research stories show even if project fetch fails (e.g. 400)
      // project_research is loaded via server-side API to bypass client-side RLS for admin users
      const [projectRes, research] = await Promise.all([
        supabase
          .from('projects')
          .select(`*, brief:brief_id (*)`)
          .eq('id', projectId)
          .single(),
        loadResearchData(projectId),
      ]);

      const { data: projectData, error: projectError } = projectRes;
      if (!projectError && projectData) {
        setProject(projectData as Project);
        if (projectData.brief) {
          setBrief(projectData.brief as Brief);
        }
      } else if (projectError) {
        console.error('Error loading project:', projectError);
      }

      if (research) {
        let stories: ResearchStory[] = [];
        const raw = research.stories;
        if (Array.isArray(raw)) {
          stories = raw as ResearchStory[];
        } else if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            stories = Array.isArray(parsed) ? (parsed as ResearchStory[]) : [];
          } catch {
            stories = [];
          }
        } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
          stories = Object.values(raw) as ResearchStory[];
        }
        if (stories.length === 0 && (research.status === 'completed' || research.status === 'failed')) {
          const briefSource = projectData?.research_brief?.articles;
          if (briefSource && Array.isArray(briefSource) && briefSource.length > 0) {
            stories = briefSource.map((a: any, i: number) => ({
              ...a,
              id: a.id || `art-${i}`,
              synopsis: a.synopsis || a.description?.slice(0, 150),
              is_selected: i < 5,
              verification_status: (a.verification_status as ResearchStory['verification_status']) || 'pending',
            }));
          }
        }
        if (stories.length === 0 && (research.status === 'completed' || research.status === 'failed')) {
          const { data: briefRow } = await supabase
            .from('projects')
            .select('research_brief')
            .eq('id', projectId)
            .single();
          const articles = (briefRow?.research_brief as any)?.articles;
          if (Array.isArray(articles) && articles.length > 0) {
            stories = articles.map((a: any, i: number) => ({
              ...a,
              id: a.id || `art-${i}`,
              synopsis: a.synopsis || a.description?.slice(0, 150),
              is_selected: i < 5,
              verification_status: (a.verification_status as ResearchStory['verification_status']) || 'pending',
            }));
          }
        }
        setProjectResearch({
          ...research,
          stories,
          suggested_keywords: research.suggested_keywords || [],
          selected_story_ids: research.selected_story_ids || [],
          selected_keywords: research.selected_keywords || [],
          orchestrator_log: research.orchestrator_log || [],
        } as ProjectResearch);
      } else {
        setProjectResearch(null);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const toggleStorySelection = async (storyId: string) => {
    if (!projectId || !projectResearch) return;
    const current = projectResearch.selected_story_ids || [];
    const next = current.includes(storyId)
      ? current.filter((id) => id !== storyId)
      : [...current, storyId];
    // Use server-side API to bypass client RLS for admin users viewing other users' projects
    await fetch('/api/research/load', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, selected_story_ids: next }),
    });
    setProjectResearch((prev) => (prev ? { ...prev, selected_story_ids: next } : null));
  };

  const handleAddStory = async () => {
    if (!projectId || !addStoryUrl.trim() || addingStory) return;
    setAddingStory(true);
    try {
      const res = await fetch('/api/research/add-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, url: addStoryUrl.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to add story');
        return;
      }
      const newStory = json.story;
      setProjectResearch((prev) => {
        if (!prev) {
          return {
            id: crypto.randomUUID(),
            project_id: projectId,
            stories: [newStory],
            suggested_keywords: [],
            selected_story_ids: [newStory.id],
            selected_keywords: [],
            orchestrator_log: [],
            loops_completed: 0,
            status: 'completed' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return {
          ...prev,
          stories: [...prev.stories, newStory],
          selected_story_ids: [...(prev.selected_story_ids || []), newStory.id],
        };
      });
      setAddStoryUrl('');
      setShowAddStory(false);
      toast.success('Reference story added');
    } catch {
      toast.error('Failed to add story');
    } finally {
      setAddingStory(false);
    }
  };

  const handleRemoveStory = async (storyId: string) => {
    if (!projectId) return;
    try {
      const res = await fetch('/api/research/remove-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, storyId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to remove story');
        return;
      }
      setProjectResearch((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          stories: prev.stories.filter((s) => s.id !== storyId),
          selected_story_ids: (prev.selected_story_ids || []).filter((id) => id !== storyId),
        };
      });
      toast.success('Story removed');
    } catch {
      toast.error('Failed to remove story');
    }
  };

  const fetchNews = async () => {
    if (!project?.headline && !project?.primary_keyword) return;

    setLoadingNews(true);
    try {
      const response = await fetch('/api/news/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: project.headline,
          primaryKeyword: project.primary_keyword,
          secondaryKeywords: project.secondary_keywords || [],
          topic: project.topic || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewsArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  return (
    <div className="w-80 flex flex-col gap-3">
      {/* Research: button opens modal with story selection */}
      {projectId && (
        <>
          <Card className="bg-bg-surface border-border-subtle shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Research</CardTitle>
                {onResearchAgain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-text-tertiary hover:text-text-primary gap-1"
                    onClick={onResearchAgain}
                    title="Re-run research pipeline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Research Again
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {!projectResearch ? (
                <p className="text-xs text-text-tertiary">No research yet for this project.</p>
              ) : projectResearch.stories.length === 0 ? (
                <p className="text-xs text-text-tertiary">No stories found.</p>
              ) : (
                <>
                  <p className="text-xs text-text-secondary">
                    Choose which research stories to use as reference when generating content. Selected sources are passed to the AI for context.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setResearchModalOpen(true)}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    View / Select Reference Sources
                  </Button>
                  <p className="text-[10px] text-text-tertiary">
                    {projectResearch.stories.length} {projectResearch.stories.length !== 1 ? 'stories' : 'story'} · {projectResearch.selected_story_ids?.length ?? 0} selected
                  </p>
                </>
              )}

              {/* Manually-added stories list */}
              {projectResearch && projectResearch.stories.some((s) => s.is_manual) && (
                <div className="space-y-1">
                  <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wide">Manually added</p>
                  {projectResearch.stories
                    .filter((s) => s.is_manual)
                    .map((s) => (
                      <div key={s.id} className="flex items-center gap-1.5 group">
                        <p className="flex-1 text-xs text-text-secondary truncate" title={s.title}>{s.title}</p>
                        <button
                          className="shrink-0 text-text-tertiary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveStory(s.id)}
                          title="Remove story"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Add Reference Story */}
              <div className="pt-1 border-t border-border-subtle">
                <button
                  className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors w-full"
                  onClick={() => {
                    setShowAddStory((v) => !v);
                    setAddStoryUrl('');
                  }}
                >
                  <Plus className="w-3 h-3 shrink-0" />
                  Add Reference Story
                </button>
                {showAddStory && (
                  <div className="flex gap-1.5 mt-2">
                    <Input
                      placeholder="https://..."
                      value={addStoryUrl}
                      onChange={(e) => setAddStoryUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStory()}
                      className="h-7 text-xs"
                      autoFocus
                      disabled={addingStory}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={handleAddStory}
                      disabled={addingStory || !addStoryUrl.trim()}
                      title="Add story"
                    >
                      {addingStory ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <ResearchStoriesModal
            open={researchModalOpen}
            onOpenChange={setResearchModalOpen}
            projectResearch={projectResearch}
            onToggleStorySelection={toggleStorySelection}
            onRemoveStory={handleRemoveStory}
          />
        </>
      )}

      {/* SEO Wizard */}
      {projectId ? (
        <SEOOptimizationSidebar
          projectId={projectId}
          content={content}
          project={project}
          onContentUpdate={onContentUpdate}
          onProjectUpdate={onProjectUpdate}
        />
      ) : (
        <Card className="bg-bg-elevated shadow-lg flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="news" className="text-xs">
                  <Newspaper className="h-3 w-3 mr-1" />
                  NewsEngine
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  SEO
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <TabsContent value="news" className="mt-0 space-y-3">
              {projectId && project ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">Recent relevant news</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchNews}
                      disabled={loadingNews}
                      className="h-7 text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loadingNews ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {loadingNews ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Searching for news...</p>
                    </div>
                  ) : newsArticles.length > 0 ? (
                    <div className="space-y-2">
                      {newsArticles.map((article, index) => (
                        <NewsCard key={index} article={article} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Newspaper className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        No news found
                      </p>
                      <Button size="sm" variant="outline" onClick={fetchNews}>
                        Search for news
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Open a project to see relevant news
                  </p>
                </div>
              )}
              </TabsContent>
              <TabsContent value="seo" className="mt-0 space-y-3">
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Open a project to see SEO analysis
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

