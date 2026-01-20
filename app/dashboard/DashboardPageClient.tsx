'use client';

import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { RightSidebar } from '@/components/dashboard/RightSidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface DashboardPageClientProps {
  user: User;
}

export function DashboardPageClient({ user }: DashboardPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const writerModelId = searchParams.get('model');
  const [editorContent, setEditorContent] = useState<any>(null);

  const handleProjectUpdate = () => {
    // Refresh or handle project updates
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
        {projectId && writerModelId ? (
          <div className="flex gap-3 p-2.5 h-screen">
            {/* Main Editor */}
            <EditorPanel 
              projectId={projectId}
              writerModelId={writerModelId}
              onOpenProjectModal={() => router.push('/projects')}
              onNewProject={() => router.push('/dashboard')}
              onContentChange={setEditorContent}
              key={`editor-${projectId}`}
            />

            {/* Right Sidebar */}
            <RightSidebar 
              projectId={projectId}
              writerModelId={writerModelId}
              content={editorContent}
              onProjectUpdate={handleProjectUpdate}
            />
          </div>
        ) : (
          <DashboardHome user={user} />
        )}
      </div>
    </div>
  );
}
