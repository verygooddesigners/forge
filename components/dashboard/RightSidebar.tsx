'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Newspaper, TrendingUp, RefreshCw } from 'lucide-react';
import { NewsArticle, WriterModel, Project, Brief } from '@/types';
import { NewsCard } from './NewsCard';
import { SEOOptimizationSidebar } from './SEOOptimizationSidebar';
import { createClient } from '@/lib/supabase/client';

interface RightSidebarProps {
  projectId: string | null;
  writerModelId: string | null;
  content?: any;
  onContentUpdate?: (content: any) => void;
}

export function RightSidebar({ 
  projectId, 
  writerModelId,
  content,
  onContentUpdate,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('seo');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [writerModel, setWriterModel] = useState<WriterModel | null>(null);
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [project, setProject] = useState<Project | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Reset writer model when project changes
    setWriterModel(null);
    setTrainingCount(0);
    
    if (projectId) {
      loadProject();
    } else {
      setProject(null);
    }
  }, [projectId]);


  useEffect(() => {
    if (project && (project.headline || project.primary_keyword)) {
      fetchNews();
    }
  }, [project]);

  useEffect(() => {
    console.log('writerModelId changed:', writerModelId);
    if (writerModelId) {
      loadWriterModel();
    } else if (!project?.writer_model_id) {
      // Only clear if project doesn't have writer_model_id either
      setWriterModel(null);
      setTrainingCount(0);
    }
  }, [writerModelId]);

  // Also try loading from project if writerModelId prop is not set
  useEffect(() => {
    if (project?.writer_model_id && !writerModelId) {
      console.log('Loading writer model from project:', project.writer_model_id);
      loadWriterModelById(project.writer_model_id);
    }
  }, [project?.writer_model_id, writerModelId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      console.log('Loading project:', projectId);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          brief:brief_id (*)
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
        if (data.brief) {
          setBrief(data.brief as Brief);
        }
        
        // Load writer model from project if writerModelId prop not set
        if (data.writer_model_id && !writerModelId) {
          console.log('Loading writer model from project data');
          loadWriterModelById(data.writer_model_id);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadWriterModelById = async (modelId: string) => {
    if (!modelId) {
      console.log('loadWriterModelById: No modelId provided');
      return;
    }

    console.log('Loading writer model:', modelId);
    try {
      // Load writer model
      const { data: model, error: modelError } = await supabase
        .from('writer_models')
        .select('*')
        .eq('id', modelId)
        .single();

      if (modelError) {
        console.error('Error loading writer model:', modelError);
        return;
      }

      if (model) {
        console.log('Writer model loaded:', model.name);
        setWriterModel(model);
      } else {
        console.log('No writer model found for ID:', modelId);
      }

      // Load training count
      const { count, error: countError } = await supabase
        .from('training_content')
        .select('*', { count: 'exact', head: true })
        .eq('model_id', modelId);

      if (countError) {
        console.error('Error loading training count:', countError);
      } else if (count !== null) {
        console.log('Training count:', count);
        setTrainingCount(count);
      }
    } catch (error) {
      console.error('Error loading writer model:', error);
    }
  };

  const loadWriterModel = async () => {
    if (!writerModelId) return;
    await loadWriterModelById(writerModelId);
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
      {/* Writer Model & Brief Display */}
      {projectId && (
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 space-y-3">
            {/* Writer Model */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Writer Model</p>
              {writerModel ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {getInitials(writerModel.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{writerModel.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {trainingCount} training {trainingCount === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </div>
              ) : writerModelId ? (
                <p className="text-sm text-muted-foreground">Loading model...</p>
              ) : (
                <p className="text-sm text-muted-foreground">No model selected</p>
              )}
            </div>

            {/* Brief Name */}
            {brief && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Brief</p>
                  <p className="text-sm font-medium">{brief.name}</p>
                </div>
              </>
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

