'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, RefreshCw } from 'lucide-react';
import { NewsArticle, Project, Brief } from '@/types';
import type { ProjectResearch, ResearchStory } from '@/types';
import { NewsCard } from './NewsCard';
import { ResearchStoryCard } from '@/components/research/ResearchStoryCard';
import { SEOOptimizationSidebar } from './SEOOptimizationSidebar';
import { createClient } from '@/lib/supabase/client';

interface RightSidebarProps {
  projectId: string | null;
  writerModelId: string | null;
  content?: any;
  onContentUpdate?: (content: any) => void;
  onProjectUpdate?: () => void;
}

export function RightSidebar({ 
  projectId, 
  writerModelId,
  content,
  onContentUpdate,
  onProjectUpdate,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('seo');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [projectResearch, setProjectResearch] = useState<ProjectResearch | null>(null);
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

  // After research completes, editor may load before DB write is visible; refetch research once if we have no stories
  useEffect(() => {
    if (!projectId || researchRetryRef.current) return;
    const hasStories = projectResearch && projectResearch.stories.length > 0;
    if (hasStories) return;
    const t = setTimeout(async () => {
      researchRetryRef.current = true;
      const { data } = await supabase
        .from('project_research')
        .select('*')
        .eq('project_id', projectId)
        .single();
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
  }, [projectId, projectResearch, supabase]);

  useEffect(() => {
    if (project && (project.headline || project.primary_keyword)) {
      fetchNews();
    }
  }, [project]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      // Load project and project_research in parallel so research stories show even if project fetch fails (e.g. 400)
      const [projectRes, researchRes] = await Promise.all([
        supabase
          .from('projects')
          .select(`*, brief:brief_id (*)`)
          .eq('id', projectId)
          .single(),
        supabase
          .from('project_research')
          .select('*')
          .eq('project_id', projectId)
          .single(),
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

      const { data: research } = researchRes;
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
        }
        if (stories.length === 0 && research.status === 'completed' && projectData?.research_brief?.articles) {
          const articles = projectData.research_brief.articles as ResearchStory[];
          stories = articles.map((a: any, i: number) => ({
            ...a,
            id: a.id || `art-${i}`,
            synopsis: a.synopsis || a.description?.slice(0, 150),
            is_selected: i < 5,
            verification_status: (a.verification_status as ResearchStory['verification_status']) || 'pending',
          }));
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
    await supabase
      .from('project_research')
      .update({ selected_story_ids: next, updated_at: new Date().toISOString() })
      .eq('project_id', projectId);
    setProjectResearch((prev) => (prev ? { ...prev, selected_story_ids: next } : null));
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
      {/* Research: story cards from project_research */}
      {projectId && (
        <Card className="bg-bg-surface border-border-subtle shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Research</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!projectResearch ? (
              <p className="text-xs text-text-tertiary">No research yet for this project.</p>
            ) : projectResearch.stories.length === 0 ? (
              <p className="text-xs text-text-tertiary">No stories found.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {projectResearch.stories.map((story) => (
                  <ResearchStoryCard
                    key={story.id}
                    story={story}
                    selected={projectResearch.selected_story_ids?.includes(story.id)}
                    onToggleSelect={toggleStorySelection}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
        <Card className="bg-white shadow-lg flex-1 flex flex-col">
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

