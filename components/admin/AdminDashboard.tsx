'use client';

import { useState } from 'react';
import AdminMenu from './AdminMenu';
import { AdminUserManagement } from './AdminUserManagement';
import { BetaManagement } from './BetaManagement';
import { AgentMonitor } from './AgentMonitor';

type AdminView = 'users' | 'betas' | 'agents';

export function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('users');

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <AdminMenu currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto p-8">
        {currentView === 'users' && <AdminUserManagement />}
        {currentView === 'betas' && <BetaManagement />}
        {currentView === 'agents' && <AgentMonitor />}
      </main>
    </div>
  );
}
