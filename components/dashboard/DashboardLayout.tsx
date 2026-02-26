'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { AppSidebar } from '../layout/AppSidebar';
import { DashboardHome } from './DashboardHome';
import { ProjectsPanel } from './ProjectsPanel';
import { WriterFactoryPanel } from './WriterFactoryPanel';
import { RightSidebar } from './RightSidebar';
import { EditorPanel } from './EditorPanel';
import { SmartBriefPanel } from './SmartBriefPanel';
import { UserGuideModal } from '@/components/modals/UserGuideModal';
import { AIHelperWidget } from '@/components/ai/AIHelperWidget';

interface DashboardLayoutProps {
  user: User;
}

type DashboardView = 'home' | 'projects' | 'writer-factory' | 'editor' | 'smartbriefs';

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedWriterModel, setSelectedWriterModel] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [projectCount, setProjectCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectRefreshTrigger, setProjectRefreshTrigger] = useState(0);
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);

  const handleProjectUpdate = () => {
    // Trigger a refresh of the project data
    setProjectRefreshTrigger(prev => prev + 1);
  };

  // Don't show initial modal anymore - using new dashboard home
  // useEffect(() => {
  //   if (!selectedProject) {
  //     setShowInitialModal(true);
  //   }
  // }, [selectedProject]);

  const handleSelectProject = (projectId: string, writerModelId: string) => {
    setSelectedProject(projectId);
    setSelectedWriterModel(writerModelId);
    setActiveView('editor');
  };

  const handleOpenProjects = () => {
    setActiveView('projects');
  };

  const handleOpenSmartBriefs = () => {
    setActiveView('smartbriefs');
  };

  const handleOpenWriterFactory = () => {
    setActiveView('writer-factory');
  };

  const handleBackToEditor = () => {
    setActiveView('editor');
  };
  
  const handleBackToHome = () => {
    setActiveView('home');
  };

  return (
    <>
      <div className="min-h-screen bg-bg-deepest">
        {/* Fixed Sidebar */}
        <AppSidebar 
          user={user}
          onOpenProjects={handleOpenProjects}
          onOpenSmartBriefs={handleOpenSmartBriefs}
          onOpenWriterFactory={handleOpenWriterFactory}
          projectCount={projectCount}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area with margin for fixed sidebar */}
        <div className="ml-[260px] min-h-screen">
          {/* Main Content Area - Conditional */}
          {activeView === 'home' ? (
            <DashboardHome user={user} />
          ) : activeView === 'projects' ? (
            <ProjectsPanel 
              user={user}
              onSelectProject={handleSelectProject}
              onCreateProject={() => router.push('/projects/new')}
            />
          ) : activeView === 'writer-factory' ? (
            <WriterFactoryPanel user={user} />
          ) : activeView === 'smartbriefs' ? (
            <SmartBriefPanel user={user} onBack={handleBackToHome} />
          ) : (
            <div className="flex gap-3 p-2.5 h-screen">
              {/* Main Editor */}
              <EditorPanel 
                projectId={selectedProject}
                writerModelId={selectedWriterModel}
                onOpenProjectModal={handleOpenProjects}
                onNewProject={() => router.push('/projects/new')}
                onContentChange={setEditorContent}
                key={`editor-${selectedProject}-${projectRefreshTrigger}`}
              />

              {/* Right Sidebar */}
              <RightSidebar 
                projectId={selectedProject}
                writerModelId={selectedWriterModel}
                content={editorContent}
                onProjectUpdate={handleProjectUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserGuideModal
        open={showUserGuideModal}
        onOpenChange={setShowUserGuideModal}
      />

      {/* AI Helper Widget */}
      <AIHelperWidget />
    </>
  );
}

