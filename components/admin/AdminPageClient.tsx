'use client';

import { User } from '@/types';
import { AdminDashboard } from './AdminDashboard';
import { AIHelperWidget } from '@/components/ai/AIHelperWidget';

interface AdminPageClientProps {
  user: User;
}

export function AdminPageClient({ user }: AdminPageClientProps) {
  return (
    <>
      <div className="min-h-screen bg-bg-deepest">
        <div className="ml-[260px]">
          {/* Top Bar */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-bg-deep border-b border-border-subtle">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Dashboard
              </button>
              <div className="w-px h-5 bg-border-default" />
              <h1 className="text-[15px] font-semibold">Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="p-8">
            <AdminDashboard user={user} />
          </div>
        </div>
      </div>

      {/* AI Helper Widget */}
      <AIHelperWidget />
    </>
  );
}
