'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  FileText,
  BookOpen,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { countWordsInTipTapJson } from '@/lib/word-count';

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const router = useRouter();
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

      const totalWords = projects.reduce((sum, p) => sum + countWordsInTipTapJson(p.content), 0);

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
    <div className="p-10 max-w-[1400px]">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-[32px] font-bold tracking-tight mb-2">
          {getGreeting()}, {user.full_name || user.email.split('@')[0]}{' '}
          <span className="text-text-tertiary font-normal">— {getDayName()}</span>
        </h1>
        <p className="text-[16px] text-text-secondary">
          You have {recentProjects.length} projects in progress
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-5 mb-12">
        <div className="glass-card glass-card-purple-pink p-7 cursor-default flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
            Articles This Week
          </div>
          <div className="text-[36px] font-bold font-mono tracking-tight">
            {stats.articlesThisWeek}
          </div>
          {stats.articlesThisWeek > 0 && (
            <div className="text-[13px] font-semibold text-success">↑ Active</div>
          )}
        </div>

        <div className="glass-card glass-card-purple-pink p-7 cursor-default flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
            Words Generated
          </div>
          <div className="text-[36px] font-bold font-mono tracking-tight">
            {formatWordCount(stats.wordsGenerated)}
          </div>
        </div>

        <div className="glass-card glass-card-purple-pink p-7 cursor-default flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
            Avg SEO Score
          </div>
          <div className="text-[36px] font-bold font-mono tracking-tight text-accent-primary">
            {stats.avgSeoScore || '—'}
          </div>
        </div>

        <div className="glass-card glass-card-purple-pink p-7 cursor-default flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
            Active SmartBriefs
          </div>
          <div className="text-[36px] font-bold font-mono tracking-tight">
            {stats.activeSmartBriefs}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-[20px] font-bold tracking-tight mb-5">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-5">
          <button
            className="glass-card glass-card-purple-pink p-8 cursor-pointer text-left flex flex-col gap-5"
            onClick={() => router.push('/projects/new')}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
            >
              <Plus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold mb-2">Create New Article</h3>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Start a fresh AI-powered article from a topic or keyword.
              </p>
            </div>
          </button>

          <button
            className="glass-card glass-card-blue-cyan p-8 cursor-pointer text-left flex flex-col gap-5"
            onClick={() => router.push('/smartbriefs')}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)' }}
            >
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold mb-2">Build SmartBrief</h3>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Generate a structured content brief with AI research assistance.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold tracking-tight">Recent Projects</h2>
            <button
              onClick={() => router.push('/projects')}
              className="text-[13px] text-accent-primary font-semibold hover:text-accent-hover flex items-center gap-1 transition-colors"
            >
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                className="glass-card glass-card-green-emerald p-6 cursor-pointer text-left"
                onClick={() => router.push(`/dashboard?project=${project.id}&model=${project.writer_model_id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <p className="text-[15px] font-semibold leading-snug text-text-primary line-clamp-2">
                      {project.file_name || project.headline}
                    </p>
                  </div>
                  <Badge variant="ai" className="flex-shrink-0">Draft</Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-text-tertiary">
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
                  <span className="text-[11px] font-mono px-2 py-1 bg-black/5 rounded-lg text-text-secondary">
                    {project.primary_keyword}
                  </span>
                  {project.secondary_keywords?.slice(0, 2).map((kw, i) => (
                    <span key={i} className="text-[11px] font-mono px-2 py-1 bg-black/5 rounded-lg text-text-secondary">
                      {kw}
                    </span>
                  ))}
                  {project.secondary_keywords && project.secondary_keywords.length > 2 && (
                    <span className="text-[11px] text-text-muted px-2 py-1">
                      +{project.secondary_keywords.length - 2}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      <div className="mt-10 flex items-center gap-2 px-4 py-3 glass-card rounded-xl">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow flex-shrink-0" />
        <span className="text-[13px] text-text-secondary">
          <strong className="text-text-primary font-semibold">AI Agents</strong> online and ready — All systems operational
        </span>
      </div>

    </div>
  );
}
