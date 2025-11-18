'use client';

import { useState } from 'react';
import { User, Project } from '@/types';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { EditorPanel } from './EditorPanel';
import { ProjectCreationModal } from '@/components/modals/ProjectCreationModal';
import { WriterFactoryModal } from '@/components/modals/WriterFactoryModal';
import { BriefBuilderModal } from '@/components/modals/BriefBuilderModal';

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedWriterModel, setSelectedWriterModel] = useState<string | null>(null);
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showWriterFactoryModal, setShowWriterFactoryModal] = useState(false);
  const [showBriefBuilderModal, setShowBriefBuilderModal] = useState(false);

  const handleProjectCreated = (project: Project) => {
    setSelectedProject(project.id);
    setSelectedWriterModel(project.writer_model_id);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-2.5">
        <div className="flex gap-3 h-[calc(100vh-20px)]">
          {/* Left Sidebar */}
          <LeftSidebar 
            user={user}
            onOpenProjectModal={() => setShowProjectModal(true)}
            onOpenWriterFactory={() => setShowWriterFactoryModal(true)}
            onOpenBriefBuilder={() => setShowBriefBuilderModal(true)}
          />

          {/* Main Editor */}
          <EditorPanel 
            projectId={selectedProject}
            writerModelId={selectedWriterModel}
            onOpenProjectModal={() => setShowProjectModal(true)}
          />

          {/* Right Sidebar */}
          <RightSidebar 
            projectId={selectedProject}
            writerModelId={selectedWriterModel}
          />
        </div>
      </div>

      {/* Modals */}
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
    </>
  );
}

