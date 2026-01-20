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
    <div className="min-h-screen bg-bg-deepest">
      <AppSidebar 
        user={user}
        onOpenProjects={() => router.push('/projects')}
        onOpenSmartBriefs={() => router.push('/smartbriefs')}
        onOpenWriterFactory={() => router.push('/writer-factory')}
        onOpenNFLOdds={() => router.push('/nfl-odds')}
      />

      <div className="ml-[260px] min-h-screen">
        <WriterFactoryPanel user={user} />
      </div>
    </div>
  );
}
