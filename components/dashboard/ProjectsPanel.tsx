'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineEdit } from '@/components/ui/inline-edit';
import { 
  Search,
  Calendar,
  FileText,
  BarChart3,
  Loader2,
  Plus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProjectsPanelProps {
  user: User;
  onSelectProject: (projectId: string, writerModelId: string) => void;
  onCreateProject: () => void;
}

export function ProjectsPanel({ user, onSelectProject, onCreateProject }: ProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'drafts' | 'published'>('all');
  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterTab, projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        // Set file_name to headline if not set
        const projectsWithFileName = data.map(project => ({
          ...project,
          file_name: project.file_name || project.headline
        }));
        setProjects(projectsWithFileName);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
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
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId ? { ...p, file_name: newFileName } : p
        )
      );
    } catch (error) {
      console.error('Error updating file name:', error);
      throw error;
    }
  };

  const applyFilters = () => {
    let filtered = projects;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          (project.file_name || project.headline).toLowerCase().includes(query) ||
          project.headline.toLowerCase().includes(query) ||
          project.primary_keyword.toLowerCase().includes(query) ||
          project.topic?.toLowerCase().includes(query)
      );
    }

    // Status filter
    // For now treating all as drafts since we don't have published field
    // You could add a status field to projects table

    setFilteredProjects(filtered);
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

  const stats = {
    total: projects.length,
    drafts: projects.length, // All treated as drafts for now
    published: 0,
    totalWords: projects.reduce((sum, p) => sum + getWordCount(p.content), 0),
  };

  return (
    <div className="flex-1 bg-bg-deepest overflow-y-auto">
      <div className="p-8">
        {/* Filters Bar */}
        <div className="flex items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search by headline, keyword, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-lg border border-border-subtle">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-all ${
                filterTab === 'all'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('drafts')}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-all ${
                filterTab === 'drafts'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilterTab('published')}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-all ${
                filterTab === 'published'
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Published
            </button>
          </div>

          {/* Create Button */}
          <Button onClick={onCreateProject}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">{stats.total}</span>
            <span className="text-[13px] text-text-tertiary">Total Projects</span>
          </div>
          <div className="w-px h-8 bg-border-default" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-ai-accent">{stats.drafts}</span>
            <span className="text-[13px] text-text-tertiary">Drafts</span>
          </div>
          <div className="w-px h-8 bg-border-default" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-success">{stats.published}</span>
            <span className="text-[13px] text-text-tertiary">Published</span>
          </div>
          <div className="w-px h-8 bg-border-default" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">{stats.totalWords.toLocaleString()}</span>
            <span className="text-[13px] text-text-tertiary">Total Words</span>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-text-muted mb-4 opacity-30" />
            <p className="text-lg font-semibold text-text-secondary">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </p>
            <p className="text-sm text-text-tertiary mt-2 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateProject}>
                <Plus className="w-4 h-4" />
                Create New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer relative overflow-hidden group p-6 hover:translate-y-0"
                onClick={() => onSelectProject(project.id, project.writer_model_id)}
              >
                {/* Colored top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-3">
                    <InlineEdit
                      value={project.file_name || project.headline}
                      onSave={(newValue) => updateFileName(project.id, newValue)}
                      className="text-base font-semibold text-text-primary leading-snug"
                      inputClassName="text-base font-semibold"
                    />
                  </div>
                  <Badge variant="ai" className="flex-shrink-0">
                    Draft
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    {formatDate(project.updated_at)}
                  </span>
                  <span className="font-mono font-semibold">
                    {getWordCount(project.content)} words
                  </span>
                  {project.seo_score && (
                    <span className="flex items-center gap-1 font-mono font-semibold text-success">
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
        )}
      </div>
    </div>
  );
}
