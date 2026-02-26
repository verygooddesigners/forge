'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '@/types';
import { AppSidebar } from '../layout/AppSidebar';
import { AdminMenu, getDefaultSection, getAdminMenuCollapsed, setAdminMenuCollapsed, type AdminSectionId } from './AdminMenu';
import { AdminDashboard } from './AdminDashboard';
import { AIHelperWidget } from '@/components/ai/AIHelperWidget';
import { usePermissions } from '@/hooks/use-permissions';
import { Loader2 } from 'lucide-react';

interface AdminPageClientProps {
  user: User;
}

export function AdminPageClient({ user }: AdminPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { permissions, loading: permissionsLoading } = usePermissions(user.id, user.email);

  const sectionParam = searchParams.get('section');
  const defaultSection = permissionsLoading ? 'users' : getDefaultSection(permissions);
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
      <div className="flex h-full w-full overflow-hidden">
        <AppSidebar
          user={user}
          onOpenProjects={() => router.push('/dashboard')}
          onOpenSmartBriefs={() => router.push('/dashboard')}
          onOpenWriterFactory={() => router.push('/dashboard')}
          projectCount={0}
        />

        {permissionsLoading ? (
          <div className="w-[220px] flex items-center justify-center border-r border-border-subtle bg-bg-deep shrink-0">
            <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
          </div>
        ) : (
          <AdminMenu
            user={user}
            permissions={permissions}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
          />
        )}

        <main className="flex-1 overflow-auto p-8" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}>
          {permissionsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
            </div>
          ) : (
            <AdminDashboard user={user} activeSection={activeSection} />
          )}
        </main>
      </div>

      <AIHelperWidget />
    </>
  );
}
