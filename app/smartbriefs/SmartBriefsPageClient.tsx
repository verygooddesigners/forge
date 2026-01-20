'use client';

import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SmartBriefPanel } from '@/components/dashboard/SmartBriefPanel';
import { useRouter } from 'next/navigation';

interface SmartBriefsPageClientProps {
  user: User;
}

export function SmartBriefsPageClient({ user }: SmartBriefsPageClientProps) {
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
        <SmartBriefPanel 
          user={user}
          onBack={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}
