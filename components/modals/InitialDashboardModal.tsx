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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Wrench, BookOpen, HelpCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/types';

interface InitialDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onNewProject: () => void;
  onOpenProject: () => void;
  onOpenWriterFactory: () => void;
  onOpenBriefBuilder: () => void;
  onOpenUserGuide: () => void;
  onSelectProject: (projectId: string, writerModelId: string) => void;
}

export function InitialDashboardModal({
  open,
  onOpenChange,
  userId,
  onNewProject,
  onOpenProject,
  onOpenWriterFactory,
  onOpenBriefBuilder,
  onOpenUserGuide,
  onSelectProject,
}: InitialDashboardModalProps) {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecentProjects, setShowRecentProjects] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open && userId) {
      loadRecentProjects();
    }
  }, [open, userId]);

  const loadRecentProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        setRecentProjects(data);
      }
    } catch (error) {
      console.error('Error loading recent projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    onSelectProject(project.id, project.writer_model_id);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Welcome to RotoWrite</DialogTitle>
          <DialogDescription>
            Choose from your recent projects or start something new
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 py-6 hover:bg-primary/5 hover:border-primary px-4 overflow-hidden"
              onClick={() => setShowRecentProjects(!showRecentProjects)}
              disabled={loading || recentProjects.length === 0}
            >
              <Clock className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-base font-semibold text-center">Recent Projects</span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2 w-full">
                {loading ? 'Loading...' : `${recentProjects.length} projects`}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 py-6 hover:bg-primary/5 hover:border-primary px-4 overflow-hidden"
              onClick={() => {
                onNewProject();
                onOpenChange(false);
              }}
            >
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-base font-semibold text-center">New Project</span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2 w-full">Create a new content project</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 py-6 hover:bg-primary/5 hover:border-primary px-4 overflow-hidden"
              onClick={() => {
                onOpenProject();
                onOpenChange(false);
              }}
            >
              <FolderOpen className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-base font-semibold text-center">Browse Projects</span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2 w-full">View all projects</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 py-6 hover:bg-primary/5 hover:border-primary px-4 overflow-hidden"
              onClick={() => {
                onOpenWriterFactory();
                onOpenChange(false);
              }}
            >
              <Wrench className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-base font-semibold text-center">Writer Factory</span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2 w-full">Train AI writer models</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 py-6 hover:bg-primary/5 hover:border-primary px-4 overflow-hidden"
              onClick={() => {
                onOpenBriefBuilder();
                onOpenChange(false);
              }}
            >
              <BookOpen className="h-8 w-8 text-primary flex-shrink-0" />
              <span className="text-base font-semibold text-center">Brief Builder</span>
              <span className="text-xs text-muted-foreground text-center line-clamp-2 w-full">Create content templates</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-center gap-2"
            onClick={() => {
              onOpenUserGuide();
              onOpenChange(false);
            }}
          >
            <HelpCircle className="h-4 w-4" />
            <span>User Guide</span>
          </Button>

          {/* Recent Projects List (conditional) */}
          {showRecentProjects && !loading && recentProjects.length > 0 && (
            <>
              <div className="divider" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent Projects</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRecentProjects(false)}
                  >
                    Hide
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleProjectClick(project)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base truncate">{project.headline}</CardTitle>
                        <CardDescription className="text-xs">
                          {project.primary_keyword}
                          {project.secondary_keywords && project.secondary_keywords.length > 0 && (
                            <> • {project.secondary_keywords.slice(0, 2).join(', ')}</>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.updated_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

