'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineEdit } from '@/components/ui/inline-edit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Calendar,
  FileText,
  BarChart3,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  Clock,
  AlignLeft,
  Users2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ProjectsPanelProps {
  user: User;
  onSelectProject: (projectId: string, writerModelId: string) => void;
  onCreateProject: () => void;
}

type SortKey = 'last_modified' | 'date_created' | 'alpha_az' | 'alpha_za';

const SORT_LABELS: Record<SortKey, string> = {
  last_modified: 'Last Modified',
  date_created: 'Date Created',
  alpha_az: 'A → Z',
  alpha_za: 'Z → A',
};

export function ProjectsPanel({ user, onSelectProject, onCreateProject }: ProjectsPanelProps) {
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('last_modified');
  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // My projects
      const { data: mine, error: mineErr } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!mineErr && mine) {
        setMyProjects(mine.map((p) => ({ ...p, file_name: p.file_name || p.headline })));
      }

      // Shared projects (other users' projects shared with everyone)
      const { data: shared, error: sharedErr } = await supabase
        .from('projects')
        .select('*')
        .neq('user_id', user.id)
        .eq('is_shared', true)
        .order('updated_at', { ascending: false });

      if (!sharedErr && shared) {
        setSharedProjects(shared.map((p) => ({ ...p, file_name: p.file_name || p.headline })));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFileName = async (projectId: string, newFileName: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ file_name: newFileName })
      .eq('id', projectId);

    if (error) throw error;

    setMyProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, file_name: newFileName } : p))
    );
  };

  const deleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to delete project');
    } else {
      setMyProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success('Project deleted');
    }
  };

  const sortProjects = (list: Project[]): Project[] => {
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'last_modified':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'date_created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'alpha_az':
          return (a.file_name || a.headline).localeCompare(b.file_name || b.headline);
        case 'alpha_za':
          return (b.file_name || b.headline).localeCompare(a.file_name || a.headline);
        default:
          return 0;
      }
    });
  };

  const filterProjects = (list: Project[]): Project[] => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        (p.file_name || p.headline).toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q) ||
        p.primary_keyword.toLowerCase().includes(q) ||
        p.topic?.toLowerCase().includes(q)
    );
  };

  const filteredMine = useMemo(() => sortProjects(filterProjects(myProjects)), [myProjects, searchQuery, sortKey]);
  const filteredShared = useMemo(() => sortProjects(filterProjects(sharedProjects)), [sharedProjects, searchQuery, sortKey]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWordCount = (content: any) => {
    if (!content?.content) return 0;
    let count = 0;
    const countWords = (node: any) => {
      if (node.text) count += node.text.split(/\s+/).filter(Boolean).length;
      if (node.content) node.content.forEach(countWords);
    };
    content.content.forEach(countWords);
    return count;
  };

  const ProjectCard = ({ project, canDelete }: { project: Project; canDelete?: boolean }) => (
    <Card
      className="cursor-pointer relative overflow-hidden group p-5 hover:translate-y-0"
      onClick={() => onSelectProject(project.id, project.writer_model_id)}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onSelectProject(project.id, project.writer_model_id); }}
          className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-accent-primary transition-all"
          title="Edit project"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {canDelete && (
          <button
            onClick={(e) => deleteProject(e, project.id)}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-text-tertiary hover:text-red-500 transition-all"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 mr-3">
          {canDelete ? (
            <InlineEdit
              value={project.file_name || project.headline}
              onSave={(v) => updateFileName(project.id, v)}
              className="text-[14px] font-semibold text-text-primary leading-snug"
              inputClassName="text-[14px] font-semibold"
            />
          ) : (
            <p className="text-[14px] font-semibold text-text-primary leading-snug line-clamp-2">
              {project.file_name || project.headline}
            </p>
          )}
        </div>
        <Badge variant="ai" className="flex-shrink-0 text-[10px]">
          Draft
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 opacity-60" />
          {formatDate(project.updated_at)}
        </span>
        <span className="font-mono font-semibold">
          {getWordCount(project.content).toLocaleString()} words
        </span>
        {project.seo_score && (
          <span className="flex items-center gap-1 font-mono font-semibold text-success">
            <BarChart3 className="w-3 h-3 opacity-60" />
            {project.seo_score}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        <span className="text-[10px] font-mono px-2 py-0.5 bg-bg-hover rounded text-text-secondary">
          {project.primary_keyword}
        </span>
        {project.secondary_keywords?.slice(0, 2).map((kw, i) => (
          <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-bg-hover rounded text-text-secondary">
            {kw}
          </span>
        ))}
        {(project.secondary_keywords?.length ?? 0) > 2 && (
          <span className="text-[10px] text-text-muted px-1 py-0.5">
            +{project.secondary_keywords!.length - 2}
          </span>
        )}
      </div>
    </Card>
  );

  const SectionEmpty = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <FileText className="h-10 w-10 text-text-muted mb-3 opacity-30" />
      <p className="text-text-secondary font-medium">{label}</p>
    </div>
  );

  return (
    <div className="flex-1 bg-bg-deepest overflow-y-auto">
      <div className="p-8">
        {/* Header bar */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-text-primary flex-1">Projects</h1>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <ArrowUpDown className="w-4 h-4" />
                {SORT_LABELS[sortKey]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => setSortKey(key)} className={sortKey === key ? 'text-accent-primary' : ''}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create */}
          <Button onClick={onCreateProject} size="sm" className="h-9 gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
          </div>
        ) : (
          <>
            {/* My Projects */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-text-tertiary" />
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  My Projects
                </h2>
                <span className="text-xs text-text-tertiary font-mono">({filteredMine.length})</span>
              </div>

              {filteredMine.length === 0 ? (
                searchQuery ? (
                  <p className="text-sm text-text-tertiary py-4">No projects match your search.</p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-10 w-10 text-text-muted mb-3 opacity-30" />
                    <p className="text-text-secondary font-medium">No projects yet</p>
                    <p className="text-sm text-text-tertiary mt-1 mb-4">
                      Create your first project to get started
                    </p>
                    <Button onClick={onCreateProject} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New Project
                    </Button>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMine.map((project) => (
                    <ProjectCard key={project.id} project={project} canDelete />
                  ))}
                </div>
              )}
            </section>

            {/* Shared Projects */}
            <section>
              <div className="flex items-center gap-2 mb-4 pt-2 border-t border-border-subtle">
                <Users2 className="w-4 h-4 text-text-tertiary mt-2" />
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mt-2">
                  Shared Projects
                </h2>
                <span className="text-xs text-text-tertiary font-mono mt-2">({filteredShared.length})</span>
              </div>

              {filteredShared.length === 0 ? (
                <p className="text-sm text-text-tertiary py-2">
                  {searchQuery ? 'No shared projects match your search.' : 'No projects have been shared yet.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredShared.map((project) => (
                    <ProjectCard key={project.id} project={project} canDelete={false} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
