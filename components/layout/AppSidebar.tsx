'use client';

import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { 
  Home,
  FileText, 
  BookOpen, 
  Wrench, 
  TrendingUp,
  Shield,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppSidebarProps {
  user: User;
  onOpenProjects: () => void;
  onOpenSmartBriefs: () => void;
  onOpenWriterFactory: () => void;
  onOpenNFLOdds: () => void;
  projectCount?: number;
}

export function AppSidebar({ 
  user, 
  onOpenProjects,
  onOpenSmartBriefs,
  onOpenWriterFactory,
  onOpenNFLOdds,
  projectCount = 0 
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-bg-deep border-r border-border-subtle flex flex-col z-100">
      {/* Logo */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center font-mono font-bold text-sm text-white">
            RW
          </div>
          <div className="text-xl font-bold tracking-tight text-text-primary">
            Roto<span className="text-accent-primary">Write</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {/* WORKSPACE Section */}
        <div className="mb-6">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Workspace
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard') && !pathname.includes('/admin')
                ? 'bg-accent-muted text-accent-primary'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            }`}
          >
            <Home className="w-5 h-5 opacity-70" />
            Dashboard
          </button>

          <button
            onClick={onOpenProjects}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all"
          >
            <FileText className="w-5 h-5 opacity-70" />
            Projects
            {projectCount > 0 && (
              <span className="ml-auto bg-ai-muted text-ai-accent text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                {projectCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSmartBriefs}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all"
          >
            <BookOpen className="w-5 h-5 opacity-70" />
            SmartBriefs
          </button>
        </div>

        {/* AI TOOLS Section */}
        <div className="mb-6">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            AI Tools
          </div>
          
          <button
            onClick={onOpenWriterFactory}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all"
          >
            <Wrench className="w-5 h-5 opacity-70" />
            Writer Factory
          </button>

          <button
            onClick={onOpenNFLOdds}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all"
          >
            <TrendingUp className="w-5 h-5 opacity-70" />
            NFL Odds Extractor
          </button>

        </div>

        {/* SYSTEM Section - Only for super admin */}
        {user.email === 'jeremy.botter@gdcgroup.com' && (
          <div>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              System
            </div>
            
            <button
              onClick={() => router.push('/admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname.includes('/admin')
                  ? 'bg-accent-muted text-accent-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Shield className="w-5 h-5 opacity-70" />
              Admin
            </button>
          </div>
        )}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-border-subtle">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg-hover transition-all cursor-pointer group text-left border-none bg-transparent">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-ai-accent flex items-center justify-center font-semibold text-sm">
                {getInitials(user.full_name || user.email)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">
                  {user.full_name || user.email.split('@')[0]}
                </div>
                <div className="text-[11px] text-text-tertiary uppercase tracking-wide">
                  {user.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-text-tertiary transition-opacity" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 z-[100]">
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
