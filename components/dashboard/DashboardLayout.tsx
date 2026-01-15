'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/types';
import { AppSidebar } from '../layout/AppSidebar';
import { DashboardHome } from './DashboardHome';
import { ProjectsPanel } from './ProjectsPanel';
import { WriterFactoryPanel } from './WriterFactoryPanel';
import { NFLOddsPanel } from './NFLOddsPanel';
import { RightSidebar } from './RightSidebar';
import { EditorPanel } from './EditorPanel';
import { SmartBriefPanel } from './SmartBriefPanel';
import { ProjectCreationModal } from '@/components/modals/ProjectCreationModal';
import { UserGuideModal } from '@/components/modals/UserGuideModal';
import { AIHelperWidget } from '@/components/ai/AIHelperWidget';

interface DashboardLayoutProps {
  user: User;
}

type DashboardView = 'home' | 'projects' | 'writer-factory' | 'nfl-odds' | 'editor' | 'smartbriefs';

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedWriterModel, setSelectedWriterModel] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [projectCount, setProjectCount] = useState(0);
  
  // Modal states
  const [showProjectCreationModal, setShowProjectCreationModal] = useState(false);
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);

  // Don't show initial modal anymore - using new dashboard home
  // useEffect(() => {
  //   if (!selectedProject) {
  //     setShowInitialModal(true);
  //   }
  // }, [selectedProject]);

  const handleProjectCreated = (project: Project) => {
    setSelectedProject(project.id);
    setSelectedWriterModel(project.writer_model_id);
    setActiveView('editor');
  };

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

  const handleOpenNFLOdds = () => {
    setActiveView('nfl-odds');
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
          onOpenNFLOdds={handleOpenNFLOdds}
          projectCount={projectCount}
        />

        {/* Main Content Area with margin for fixed sidebar */}
        <div className="ml-[260px] min-h-screen">
          {/* Main Content Area - Conditional */}
          {activeView === 'home' ? (
            <DashboardHome
              user={user}
              onCreateProject={() => setShowProjectCreationModal(true)}
              onOpenSmartBriefs={handleOpenSmartBriefs}
              onOpenNFLOdds={handleOpenNFLOdds}
              onSelectProject={handleSelectProject}
            />
          ) : activeView === 'projects' ? (
            <ProjectsPanel 
              user={user}
              onSelectProject={handleSelectProject}
              onCreateProject={() => setShowProjectCreationModal(true)}
            />
          ) : activeView === 'writer-factory' ? (
            <WriterFactoryPanel user={user} />
          ) : activeView === 'nfl-odds' ? (
            <NFLOddsPanel 
              user={user}
              onProjectCreated={handleSelectProject}
            />
          ) : activeView === 'smartbriefs' ? (
            <SmartBriefPanel user={user} onBack={handleBackToHome} />
          ) : (
            <div className="flex gap-3 p-2.5 h-screen">
              {/* Main Editor */}
              <EditorPanel 
                projectId={selectedProject}
                writerModelId={selectedWriterModel}
                onOpenProjectModal={handleOpenProjects}
                onNewProject={() => setShowProjectCreationModal(true)}
                onContentChange={setEditorContent}
              />

              {/* Right Sidebar */}
              <RightSidebar 
                projectId={selectedProject}
                writerModelId={selectedWriterModel}
                content={editorContent}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProjectCreationModal
        open={showProjectCreationModal}
        onOpenChange={setShowProjectCreationModal}
        userId={user.id}
        onProjectCreated={handleProjectCreated}
      />

      <UserGuideModal
        open={showUserGuideModal}
        onOpenChange={setShowUserGuideModal}
      />

      {/* AI Helper Widget */}
      <AIHelperWidget />
    </>
  );
}

