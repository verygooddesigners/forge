'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ProjectsPanel } from './ProjectsPanel';
import { WriterFactoryPanel } from './WriterFactoryPanel';

type DashboardTab = 'projects' | 'writer-factory';

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('projects');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Forge</h1>
        <span className="text-sm text-white/40">{user.email}</span>
      </header>
      <div className="px-8 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'projects'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('writer-factory')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'writer-factory'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Writer Factory
          </button>
        </div>
        {activeTab === 'projects' && <ProjectsPanel userId={user.id} />}
        {activeTab === 'writer-factory' && <WriterFactoryPanel userId={user.id} />}
      </div>
    </div>
  );
}
