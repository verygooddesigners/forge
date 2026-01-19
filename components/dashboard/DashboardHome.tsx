'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InlineEdit } from '@/components/ui/inline-edit';
import { 
  Plus,
  FileText,
  BookOpen,
  TrendingUp,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardHomeProps {
  user: User;
  onCreateProject: () => void;
  onOpenSmartBriefs: () => void;
  onOpenNFLOdds: () => void;
  onSelectProject: (projectId: string, writerModelId: string) => void;
}

export function DashboardHome({
  user,
  onCreateProject,
  onOpenSmartBriefs,
  onOpenNFLOdds,
  onSelectProject,
}: DashboardHomeProps) {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    articlesThisWeek: 0,
    wordsGenerated: 0,
    avgSeoScore: 0,
    activeSmartBriefs: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    loadRecentProjects();
    loadStats();
  }, []);

  const loadRecentProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(4);

    if (data) {
      // Set file_name to headline if not set
      const projectsWithFileName = data.map(project => ({
        ...project,
        file_name: project.file_name || project.headline
      }));
      setRecentProjects(projectsWithFileName);
    }
  };

  const updateFileName = async (projectId: string, newFileName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ file_name: newFileName })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setRecentProjects(prev =>
        prev.map(p =>
          p.id === projectId ? { ...p, file_name: newFileName } : p
        )
      );
    } catch (error) {
      console.error('Error updating file name:', error);
      throw error;
    }
  };

  const loadStats = async () => {
    // Load actual stats from database
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);

    const { data: briefs } = await supabase
      .from('briefs')
      .select('id')
      .or(`created_by.eq.${user.id},is_shared.eq.true`);

    if (projects) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentArticles = projects.filter(
        p => new Date(p.created_at) > oneWeekAgo
      );

      const totalWords = projects.reduce((sum, p) => {
        const content = p.content;
        if (content && content.content) {
          let words = 0;
          const countWords = (node: any) => {
            if (node.text) words += node.text.split(/\s+/).filter(Boolean).length;
            if (node.content) node.content.forEach(countWords);
          };
          content.content.forEach(countWords);
          return sum + words;
        }
        return sum;
      }, 0);

      const avgScore = projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + (p.seo_score || 0), 0) / projects.length)
        : 0;

      setStats({
        articlesThisWeek: recentArticles.length,
        wordsGenerated: totalWords,
        avgSeoScore: avgScore,
        activeSmartBriefs: briefs?.length || 0,
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDayName = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getWordCount = (content: any) => {
    if (!content || !content.content) return 0;
    let count = 0;
    const countWords = (node: any) => {
      if (node.text) count += node.text.split(/\s+/).filter(Boolean).length;
      if (node.content) node.content.forEach(countWords);
    };
    content.content.forEach(countWords);
    return count;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight mb-2">
          {getGreeting()}, {user.full_name || user.email.split('@')[0]}{' '}
          <span className="text-text-tertiary font-normal">— {getDayName()}</span>
        </h1>
        <p className="text-[15px] text-text-secondary">
          You have {recentProjects.length} projects in progress
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-5 hover:translate-y-0">
          <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
            Articles This Week
          </div>
          <div className="text-[28px] font-bold font-mono tracking-tight">
            {stats.articlesThisWeek}
          </div>
          {stats.articlesThisWeek > 0 && (
            <div className="text-[11px] text-success mt-1">
              ↑ Active
            </div>
          )}
        </Card>

        <Card className="p-5 hover:translate-y-0">
          <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
            Words Generated
          </div>
          <div className="text-[28px] font-bold font-mono tracking-tight">
            {formatWordCount(stats.wordsGenerated)}
          </div>
        </Card>

        <Card className="p-5 hover:translate-y-0">
          <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
            Avg SEO Score
          </div>
          <div className="text-[28px] font-bold font-mono tracking-tight text-accent-primary">
            {stats.avgSeoScore || '—'}
          </div>
        </Card>

        <Card className="p-5 hover:translate-y-0">
          <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
            Active SmartBriefs
          </div>
          <div className="text-[28px] font-bold font-mono tracking-tight">
            {stats.activeSmartBriefs}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight mb-5">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card 
            className="p-6 cursor-pointer relative overflow-hidden group hover:translate-y-0"
            onClick={onCreateProject}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-[10px] bg-accent-muted flex items-center justify-center text-accent-primary mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">Create New Article</h3>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Start from scratch or use a SmartBrief template
            </p>
          </Card>

          <Card 
            className="p-6 cursor-pointer relative overflow-hidden group hover:translate-y-0"
            onClick={onOpenSmartBriefs}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ai-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-[10px] bg-ai-muted flex items-center justify-center text-ai-accent mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">Build SmartBrief</h3>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Create reusable AI-powered content templates
            </p>
          </Card>

          <Card 
            className="p-6 cursor-pointer relative overflow-hidden group hover:translate-y-0"
            onClick={onOpenNFLOdds}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-success to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-[10px] bg-success-muted flex items-center justify-center text-success mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">Extract NFL Odds</h3>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Upload screenshots to auto-generate betting content
            </p>
          </Card>
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold tracking-tight">Recent Projects</h2>
            <button className="text-[13px] text-accent-primary font-medium hover:text-accent-hover flex items-center gap-1">
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <Card 
                key={project.id}
                className="p-5 cursor-pointer hover:translate-y-0"
                onClick={() => onSelectProject(project.id, project.writer_model_id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <InlineEdit
                      value={project.file_name || project.headline}
                      onSave={(newValue) => updateFileName(project.id, newValue)}
                      className="text-[15px] font-semibold leading-snug"
                      inputClassName="text-[15px] font-semibold"
                    />
                  </div>
                  <Badge variant="ai" className="flex-shrink-0">
                    Draft
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-3.5 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    {formatDate(project.updated_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 opacity-60" />
                    {getWordCount(project.content)} words
                  </span>
                  {project.seo_score && (
                    <span className="flex items-center gap-1.5 font-mono font-semibold">
                      <BarChart3 className="w-3.5 h-3.5 opacity-60" />
                      SEO {project.seo_score}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-mono px-2 py-1 bg-bg-hover rounded text-text-secondary">
                    {project.primary_keyword}
                  </span>
                  {project.secondary_keywords?.slice(0, 2).map((kw, i) => (
                    <span key={i} className="text-[11px] font-mono px-2 py-1 bg-bg-hover rounded text-text-secondary">
                      {kw}
                    </span>
                  ))}
                  {project.secondary_keywords && project.secondary_keywords.length > 2 && (
                    <span className="text-[11px] text-text-muted px-2 py-1">
                      +{project.secondary_keywords.length - 2}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      <div className="mt-8 flex items-center gap-2 px-4 py-3 bg-bg-surface border border-border-subtle rounded-lg">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
        <span className="text-[13px] text-text-secondary">
          <strong className="text-text-primary font-semibold">7 AI Agents</strong> online and ready — All systems operational
        </span>
      </div>
    </div>
  );
}
