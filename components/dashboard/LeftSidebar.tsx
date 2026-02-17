'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  BookOpen, 
  Wrench, 
  Settings, 
  LogOut,
  Shield,
  Edit2,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface LeftSidebarProps {
  user: User;
  projectId: string | null;
  onOpenProjectModal: () => void;
  onOpenWriterFactory: () => void;
  onOpenBriefBuilder: () => void;
  onOpenNFLOddsExtractor: () => void;
}

export function LeftSidebar({ user, projectId, onOpenProjectModal, onOpenWriterFactory, onOpenBriefBuilder, onOpenNFLOddsExtractor }: LeftSidebarProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [project, setProject] = useState<Project | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    headline: '',
    primary_keyword: '',
    secondary_keywords: '',
    topic: '',
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
    } else {
      setProject(null);
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!error && data) {
        setProject(data);
        setEditValues({
          headline: data.headline,
          primary_keyword: data.primary_keyword,
          secondary_keywords: (data.secondary_keywords || []).join(', '),
          topic: data.topic || '',
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const handleStartEdit = (field: string) => {
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    if (project) {
      setEditValues({
        headline: project.headline,
        primary_keyword: project.primary_keyword,
        secondary_keywords: (project.secondary_keywords || []).join(', '),
        topic: project.topic || '',
      });
    }
    setEditingField(null);
  };

  const handleSaveEdit = async (field: string) => {
    if (!project || !projectId) return;

    try {
      let updateData: any = {};
      
      if (field === 'secondary_keywords') {
        updateData.secondary_keywords = editValues.secondary_keywords
          .split(',')
          .map(k => k.trim())
          .filter(Boolean);
      } else {
        updateData[field] = editValues[field as keyof typeof editValues];
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (!error) {
        await loadProject();
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return user.email.substring(0, 2).toUpperCase();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg flex flex-col p-4 overflow-y-auto">
      {/* Logo */}
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-primary">Forge</h1>
      </div>

      {/* Project Info Section */}
      {project && (
        <>
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Current Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Headline */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Headline</span>
                  {editingField === 'headline' ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSaveEdit('headline')}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleStartEdit('headline')}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'headline' ? (
                  <Input
                    value={editValues.headline}
                    onChange={(e) => setEditValues({ ...editValues, headline: e.target.value })}
                    className="text-sm h-8"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium text-xs">{project.headline}</p>
                )}
              </div>

              {/* Primary Keyword */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Primary Keyword</span>
                  {editingField === 'primary_keyword' ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSaveEdit('primary_keyword')}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleStartEdit('primary_keyword')}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'primary_keyword' ? (
                  <Input
                    value={editValues.primary_keyword}
                    onChange={(e) => setEditValues({ ...editValues, primary_keyword: e.target.value })}
                    className="text-sm h-8"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium text-xs">{project.primary_keyword}</p>
                )}
              </div>

              {/* Secondary Keywords */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Secondary Keywords</span>
                  {editingField === 'secondary_keywords' ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSaveEdit('secondary_keywords')}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleStartEdit('secondary_keywords')}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'secondary_keywords' ? (
                  <Textarea
                    value={editValues.secondary_keywords}
                    onChange={(e) => setEditValues({ ...editValues, secondary_keywords: e.target.value })}
                    className="text-sm min-h-16"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium text-xs">
                    {project.secondary_keywords && project.secondary_keywords.length > 0
                      ? project.secondary_keywords.join(', ')
                      : 'None'}
                  </p>
                )}
              </div>

              {/* Topic */}
              {(project.topic || editingField === 'topic') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Topic</span>
                    {editingField === 'topic' ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleSaveEdit('topic')}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleStartEdit('topic')}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {editingField === 'topic' ? (
                    <Textarea
                      value={editValues.topic}
                      onChange={(e) => setEditValues({ ...editValues, topic: e.target.value })}
                      className="text-sm min-h-20"
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-xs">{project.topic}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Separator className="my-2" />
        </>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2 mt-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenProjectModal}
        >
          <FileText className="mr-3 h-5 w-5" />
          Projects
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenBriefBuilder}
        >
          <BookOpen className="mr-3 h-5 w-5" />
          SmartBriefs
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenWriterFactory}
        >
          <Wrench className="mr-3 h-5 w-5" />
          Writer Factory
        </Button>
        <Separator className="my-2" />
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenNFLOddsExtractor}
        >
          <TrendingUp className="mr-3 h-5 w-5" />
          NFL Odds Extractor
        </Button>
        {user.role === 'admin' && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start"
              size="default"
              onClick={() => router.push('/admin')}
            >
              <Shield className="mr-3 h-5 w-5" />
              Admin
            </Button>
          </>
        )}
      </nav>

      {/* User Menu */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user.full_name || user.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

