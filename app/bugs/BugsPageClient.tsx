'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { BugTrackerPanel } from '@/components/bugs/BugTrackerPanel';
import { User } from '@/types';

interface BugsPageClientProps {
  user: User;
}

export function BugsPageClient({ user }: BugsPageClientProps) {
  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <AppSidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <BugTrackerPanel user={user} />
      </main>
    </div>
  );
}
