'use client';

import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { NFLOddsPanel } from '@/components/dashboard/NFLOddsPanel';
import { useRouter } from 'next/navigation';

interface NFLOddsPageClientProps {
  user: User;
}

export function NFLOddsPageClient({ user }: NFLOddsPageClientProps) {
  const router = useRouter();

  const handleProjectCreated = (projectId: string, writerModelId: string) => {
    router.push(`/dashboard?project=${projectId}&model=${writerModelId}`);
  };

  return (
    <div className="flex h-full w-full">
      <AppSidebar 
        user={user}
        onOpenProjects={() => router.push('/projects')}
        onOpenSmartBriefs={() => router.push('/smartbriefs')}
        onOpenWriterFactory={() => router.push('/writer-factory')}
        onOpenNFLOdds={() => router.push('/nfl-odds')}
      />

      <div className="flex-1 overflow-y-auto min-h-0" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}>
        <NFLOddsPanel 
          user={user}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </div>
  );
}
