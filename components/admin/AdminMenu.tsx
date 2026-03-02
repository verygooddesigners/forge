'use client';

import { Users, FlaskConical, Bot } from 'lucide-react';

type AdminView = 'users' | 'betas' | 'agents';

interface AdminMenuProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export default function AdminMenu({ currentView, onViewChange }: AdminMenuProps) {
  const items = [
    { id: 'users' as AdminView, label: 'Users', icon: Users },
    { id: 'betas' as AdminView, label: 'Betas', icon: FlaskConical },
    { id: 'agents' as AdminView, label: 'Agents', icon: Bot },
  ];

  return (
    <nav className="w-48 border-r border-white/10 p-4 flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Admin</h2>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === item.id
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <item.icon size={16} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
