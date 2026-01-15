'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, FileText, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/types';

interface ProjectListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSelectProject: (projectId: string, writerModelId: string) => void;
}

export function ProjectListModal({
  open,
  onOpenChange,
  userId,
  onSelectProject,
}: ProjectListModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (open && userId) {
      loadProjects();
    }
  }, [open, userId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = projects.filter(
        (project) =>
          project.headline.toLowerCase().includes(query) ||
          project.primary_keyword.toLowerCase().includes(query) ||
          project.topic?.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setProjects(data);
        setFilteredProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    onSelectProject(project.id, project.writer_model_id);
    onOpenChange(false);
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getWordCount = (content: any) => {
    if (!content || !content.content) return 0;
    
    let count = 0;
    const countWords = (node: any) => {
      if (node.text) {
        count += node.text.split(/\s+/).filter(Boolean).length;
      }
      if (node.content) {
        node.content.forEach(countWords);
      }
    };
    
    content.content.forEach(countWords);
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col bg-bg-surface border-border-default">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">Open Project</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Select a project to continue working on it
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search projects by headline, keyword, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-bg-elevated border-border-default text-text-primary"
          />
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto">
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
              <p className="text-sm text-text-tertiary mt-2">
                {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer bg-bg-elevated border-border-subtle hover:border-border-hover transition-all p-6"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[15px] font-semibold text-text-primary line-clamp-2 flex-1 mr-2">
                        {project.headline}
                      </h3>
                      <Badge variant="ai" className="flex-shrink-0">
                        Draft
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.updated_at)}
                    </span>
                    <span className="font-mono font-semibold">
                      {getWordCount(project.content)} words
                    </span>
                  </div>
                  
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-mono px-2 py-1 bg-bg-hover rounded text-text-secondary">
                      {project.primary_keyword}
                    </span>
                    {project.secondary_keywords?.slice(0, 2).map((keyword, idx) => (
                      <span key={idx} className="text-[11px] font-mono px-2 py-1 bg-bg-hover rounded text-text-secondary">
                        {keyword}
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
      </DialogContent>
    </Dialog>
  );
}
