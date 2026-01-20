'use client';

import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ProjectsPanel } from '@/components/dashboard/ProjectsPanel';
import { ProjectCreationModal } from '@/components/modals/ProjectCreationModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectsPageClientProps {
  user: User;
}

export function ProjectsPageClient({ user }: ProjectsPageClientProps) {
  const router = useRouter();
  const [showProjectCreationModal, setShowProjectCreationModal] = useState(false);

  const handleSelectProject = (projectId: string, writerModelId: string) => {
    router.push(`/dashboard?project=${projectId}&model=${writerModelId}`);
  };

  const handleProjectCreated = (project: any) => {
    setShowProjectCreationModal(false);
    router.push(`/dashboard?project=${project.id}&model=${project.writer_model_id}`);
  };

  return (
    <div className="min-h-screen bg-bg-deepest">
      <AppSidebar 
        user={user}
        onOpenProjects={() => router.push('/projects')}
        onOpenSmartBriefs={() => router.push('/smartbriefs')}
        onOpenWriterFactory={() => router.push('/writer-factory')}
        onOpenNFLOdds={() => router.push('/nfl-odds')}
      />

      <div className="ml-[260px] min-h-screen">
        <ProjectsPanel 
          user={user}
          onSelectProject={handleSelectProject}
          onCreateProject={() => setShowProjectCreationModal(true)}
        />
      </div>

      <ProjectCreationModal
        open={showProjectCreationModal}
        onOpenChange={setShowProjectCreationModal}
        userId={user.id}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
