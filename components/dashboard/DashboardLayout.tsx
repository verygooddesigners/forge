'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/types';
import { AppSidebar } from '../layout/AppSidebar';
import { DashboardHome } from './DashboardHome';
import { ProjectsPanel } from './ProjectsPanel';
import { RightSidebar } from './RightSidebar';
import { EditorPanel } from './EditorPanel';
import { SmartBriefPanel } from './SmartBriefPanel';
import { ProjectCreationModal } from '@/components/modals/ProjectCreationModal';
import { WriterFactoryModal } from '@/components/modals/WriterFactoryModal';
import { UserGuideModal } from '@/components/modals/UserGuideModal';
import { NFLOddsExtractorModal } from '@/components/modals/NFLOddsExtractorModal';

interface DashboardLayoutProps {
  user: User;
}

type DashboardView = 'home' | 'projects' | 'editor' | 'smartbriefs';

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedWriterModel, setSelectedWriterModel] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<any>(null);
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [projectCount, setProjectCount] = useState(0);
  
  // Modal states
  const [showProjectCreationModal, setShowProjectCreationModal] = useState(false);
  const [showWriterFactoryModal, setShowWriterFactoryModal] = useState(false);
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
  const [showNFLOddsExtractorModal, setShowNFLOddsExtractorModal] = useState(false);

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
          onOpenWriterFactory={() => setShowWriterFactoryModal(true)}
          onOpenNFLOdds={() => setShowNFLOddsExtractorModal(true)}
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
              onOpenNFLOdds={() => setShowNFLOddsExtractorModal(true)}
              onSelectProject={handleSelectProject}
            />
          ) : activeView === 'projects' ? (
            <ProjectsPanel 
              user={user}
              onSelectProject={handleSelectProject}
              onCreateProject={() => setShowProjectCreationModal(true)}
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
      
      <WriterFactoryModal
        open={showWriterFactoryModal}
        onOpenChange={setShowWriterFactoryModal}
        user={user}
      />

      <UserGuideModal
        open={showUserGuideModal}
        onOpenChange={setShowUserGuideModal}
      />

      <NFLOddsExtractorModal
        open={showNFLOddsExtractorModal}
        onOpenChange={setShowNFLOddsExtractorModal}
        userId={user.id}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}

