'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, RefreshCw } from 'lucide-react';
import { NewsArticle, WriterModel, Project } from '@/types';
import { NewsCard } from './NewsCard';
import { createClient } from '@/lib/supabase/client';

interface RightSidebarProps {
  projectId: string | null;
  writerModelId: string | null;
}

export function RightSidebar({ 
  projectId, 
  writerModelId
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('news');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  const [loadingSEO, setLoadingSEO] = useState(false);
  const [writerModel, setWriterModel] = useState<WriterModel | null>(null);
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [project, setProject] = useState<Project | null>(null);
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

  // Also load writer model when project loads and has writer_model_id (if writerModelId prop not provided)
  useEffect(() => {
    if (project?.writer_model_id && !writerModelId) {
      loadWriterModelById(project.writer_model_id);
    }
  }, [project?.writer_model_id, writerModelId]);

  useEffect(() => {
    if (project?.headline && project?.primary_keyword) {
      fetchNews();
    }
  }, [project]);

  useEffect(() => {
    if (writerModelId) {
      loadWriterModel();
    } else if (!project?.writer_model_id) {
      // Only clear if project doesn't have writer_model_id either
      setWriterModel(null);
      setTrainingCount(0);
    }
  }, [writerModelId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!error && data) {
        setProject(data as Project);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadWriterModelById = async (modelId: string) => {
    if (!modelId) return;

    try {
      // Load writer model
      const { data: model, error: modelError } = await supabase
        .from('writer_models')
        .select('*')
        .eq('id', modelId)
        .single();

      if (!modelError && model) {
        setWriterModel(model);
      }

      // Load training count
      const { count, error: countError } = await supabase
        .from('training_content')
        .select('*', { count: 'exact', head: true })
        .eq('model_id', modelId);

      if (!countError && count !== null) {
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

  const generateSEOSuggestions = async () => {
    setLoadingSEO(true);
    try {
      // This would typically get the current content from the editor
      // For now, we'll simulate it
      const response = await fetch('/api/seo/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '<h1>Sample content</h1>',
          primaryKeyword: project?.primary_keyword || '',
          secondaryKeywords: project?.secondary_keywords || [],
          currentScore: seoScore,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSeoSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error generating SEO suggestions:', error);
    } finally {
      setLoadingSEO(false);
    }
  };

  return (
    <div className="w-80 flex flex-col gap-3">
      {/* Writer Model Display */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Writer Model</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* NewsEngine & SEO Assistant */}
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
                SEO Assistant
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <TabsContent value="news" className="mt-0 space-y-3">
              {projectId && project && (project.headline || project.primary_keyword) ? (
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
              {projectId ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">SEO Score</span>
                      <Badge variant={seoScore >= 70 ? 'default' : seoScore >= 40 ? 'secondary' : 'destructive'}>
                        {seoScore}/100
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          seoScore >= 70 ? 'bg-green-500' : 
                          seoScore >= 40 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${seoScore}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSEOSuggestions}
                    disabled={loadingSEO}
                    className="w-full"
                  >
                    {loadingSEO ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 mr-2" />
                        Get AI Suggestions
                      </>
                    )}
                  </Button>

                  {seoSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Suggestions</p>
                      <div className="space-y-2">
                        {seoSuggestions.map((suggestion, index) => (
                          <Card key={index}>
                            <CardContent className="p-3">
                              <p className="text-xs">{suggestion}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Open a project to see SEO analysis
                  </p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

