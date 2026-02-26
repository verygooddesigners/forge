'use client';

import { useCallback } from 'react';
import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { EditorPanel } from '@/components/dashboard/EditorPanel';
import { RightSidebar } from '@/components/dashboard/RightSidebar';
import { ResearchHub } from '@/components/research/ResearchHub';
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
  const researchMode = searchParams.get('research') === 'true';
  const [editorContent, setEditorContent] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProjectUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleResearchComplete = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('research');
    router.replace(`/dashboard?${params.toString()}`);
  }, [router, searchParams]);

  const showEditor = projectId && writerModelId && !researchMode;
  const showResearchHub = projectId && writerModelId && researchMode;

  return (
    <div className="flex h-full w-full">
      <AppSidebar
        user={user}
        onOpenProjects={() => router.push('/projects')}
        onOpenSmartBriefs={() => router.push('/smartbriefs')}
        onOpenWriterFactory={() => router.push('/writer-factory')}
      />

      <div
        className="flex-1 overflow-y-auto min-h-0"
        style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}
      >
        {showResearchHub ? (
          <ResearchHub
            projectId={projectId}
            writerModelId={writerModelId}
            onComplete={handleResearchComplete}
          />
        ) : showEditor ? (
          <div className="flex gap-3 p-2.5 h-full">
            <EditorPanel
              projectId={projectId}
              writerModelId={writerModelId}
              onOpenProjectModal={() => router.push('/projects')}
              onNewProject={() => router.push('/dashboard')}
              onContentChange={setEditorContent}
              key={`editor-${projectId}-${refreshKey}`}
            />
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
