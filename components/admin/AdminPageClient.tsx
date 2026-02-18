'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { AppSidebar } from '../layout/AppSidebar';
import { AdminMenu, getDefaultSection, getAdminMenuCollapsed, setAdminMenuCollapsed, type AdminSectionId } from './AdminMenu';
import { AdminDashboard } from './AdminDashboard';
import { AIHelperWidget } from '@/components/ai/AIHelperWidget';

interface AdminPageClientProps {
  user: User;
}

export function AdminPageClient({ user }: AdminPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const defaultSection = getDefaultSection(user.role as UserRole);
  const activeSection = (sectionParam as AdminSectionId) || defaultSection;

  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    setCollapsedState(getAdminMenuCollapsed());
  }, []);

  const onToggleCollapse = () => {
    const next = !collapsed;
    setCollapsedState(next);
    setAdminMenuCollapsed(next);
  };

  return (
    <>
      <div className="flex h-screen bg-bg-deepest overflow-hidden">
        <AppSidebar
          user={user}
          onOpenProjects={() => router.push('/dashboard')}
          onOpenSmartBriefs={() => router.push('/dashboard')}
          onOpenWriterFactory={() => router.push('/dashboard')}
          onOpenNFLOdds={() => router.push('/dashboard')}
          projectCount={0}
        />

        <AdminMenu
          user={user}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />

        <main className="flex-1 overflow-auto p-8">
          <AdminDashboard user={user} activeSection={activeSection} />
        </main>
      </div>

      <AIHelperWidget />
    </>
  );
}
