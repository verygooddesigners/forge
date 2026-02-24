'use client';

import { User } from '@/types';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SmartBriefPanel } from '@/components/dashboard/SmartBriefPanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface SmartBriefsPageClientProps {
  user: User;
}

function SmartBriefsPageInner({ user }: SmartBriefsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoCreate = searchParams.get('new') === 'true';

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
          autoCreate={autoCreate}
        />
      </div>
    </div>
  );
}

export function SmartBriefsPageClient({ user }: SmartBriefsPageClientProps) {
  return (
    <Suspense fallback={null}>
      <SmartBriefsPageInner user={user} />
    </Suspense>
  );
}
