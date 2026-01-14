'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/types';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { EditorPanel } from './EditorPanel';
import { ProjectCreationModal } from '@/components/modals/ProjectCreationModal';
import { WriterFactoryModal } from '@/components/modals/WriterFactoryModal';
import { BriefBuilderModal } from '@/components/modals/BriefBuilderModal';
import { InitialDashboardModal } from '@/components/modals/InitialDashboardModal';
import { UserGuideModal } from '@/components/modals/UserGuideModal';
import { NFLOddsExtractorModal } from '@/components/modals/NFLOddsExtractorModal';

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedWriterModel, setSelectedWriterModel] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<any>(null);
  
  // Modal states
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showWriterFactoryModal, setShowWriterFactoryModal] = useState(false);
  const [showBriefBuilderModal, setShowBriefBuilderModal] = useState(false);
  const [showUserGuideModal, setShowUserGuideModal] = useState(false);
  const [showNFLOddsExtractorModal, setShowNFLOddsExtractorModal] = useState(false);

  // Show initial modal when no project is selected
  useEffect(() => {
    if (!selectedProject) {
      setShowInitialModal(true);
    }
  }, [selectedProject]);

  const handleProjectCreated = (project: Project) => {
    setSelectedProject(project.id);
    setSelectedWriterModel(project.writer_model_id);
  };

  const handleSelectProject = (projectId: string, writerModelId: string) => {
    setSelectedProject(projectId);
    setSelectedWriterModel(writerModelId);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-2.5 relative">
        {/* Backdrop when initial modal is open */}
        {showInitialModal && !selectedProject && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
        )}
        
        <div className="flex gap-3 h-[calc(100vh-20px)] relative z-10">
          {/* Left Sidebar */}
          <LeftSidebar 
            user={user}
            projectId={selectedProject}
            onOpenProjectModal={() => setShowProjectModal(true)}
            onOpenWriterFactory={() => setShowWriterFactoryModal(true)}
            onOpenBriefBuilder={() => setShowBriefBuilderModal(true)}
            onOpenNFLOddsExtractor={() => setShowNFLOddsExtractorModal(true)}
          />

          {/* Main Editor */}
          <EditorPanel 
            projectId={selectedProject}
            writerModelId={selectedWriterModel}
            onOpenProjectModal={() => setShowProjectModal(true)}
            onContentChange={setEditorContent}
          />

          {/* Right Sidebar */}
          <RightSidebar 
            projectId={selectedProject}
            writerModelId={selectedWriterModel}
            content={editorContent}
          />
        </div>
      </div>

      {/* Modals */}
      <InitialDashboardModal
        open={showInitialModal}
        onOpenChange={setShowInitialModal}
        userId={user.id}
        onNewProject={() => setShowProjectModal(true)}
        onOpenProject={() => setShowProjectModal(true)}
        onOpenWriterFactory={() => setShowWriterFactoryModal(true)}
        onOpenBriefBuilder={() => setShowBriefBuilderModal(true)}
        onOpenUserGuide={() => setShowUserGuideModal(true)}
        onSelectProject={handleSelectProject}
      />

      <ProjectCreationModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        userId={user.id}
        onProjectCreated={handleProjectCreated}
      />
      
      <WriterFactoryModal
        open={showWriterFactoryModal}
        onOpenChange={setShowWriterFactoryModal}
        user={user}
      />

      <BriefBuilderModal
        open={showBriefBuilderModal}
        onOpenChange={setShowBriefBuilderModal}
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

