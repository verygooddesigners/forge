'use client';

import { User } from '@/types';
import { AppSidebar } from '../layout/AppSidebar';
import { AdminDashboard } from './AdminDashboard';
import { getDefaultSection, type AdminSectionId } from './AdminMenu';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdminPageWrapperProps {
  user: User;
}

export function AdminPageWrapper({ user }: AdminPageWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const defaultSection = getDefaultSection({});
  const activeSection = (sectionParam as AdminSectionId) || defaultSection;

  return (
    <div className="min-h-screen bg-bg-deepest">
      {/* Fixed Sidebar */}
      <AppSidebar 
        user={user}
        onOpenProjects={() => router.push('/dashboard')}
        onOpenSmartBriefs={() => router.push('/dashboard')}
        onOpenWriterFactory={() => router.push('/dashboard')}
        onOpenNFLOdds={() => router.push('/dashboard')}
        projectCount={0}
      />

      {/* Main Content Area */}
      <div className="ml-[260px] min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-bg-deep border-b border-border-subtle">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Dashboard
            </button>
            <div className="w-px h-5 bg-border-default" />
            <h1 className="text-[15px] font-semibold text-text-primary">Admin Dashboard</h1>
          </div>
        </div>
        
        <div className="p-8">
          <AdminDashboard user={user} activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}
