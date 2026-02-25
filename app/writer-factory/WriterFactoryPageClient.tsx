'use client';

import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { WriterFactoryPanel } from '@/components/dashboard/WriterFactoryPanel';
import { useRouter } from 'next/navigation';

interface WriterFactoryPageClientProps {
  user: User;
}

export function WriterFactoryPageClient({ user }: WriterFactoryPageClientProps) {
  const router = useRouter();

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
        <WriterFactoryPanel user={user} />
      </div>
    </div>
  );
}
