'use client';

import { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Settings,
  LogOut,
  Pin,
  PinOff,
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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ 
  user, 
  onOpenProjects,
  onOpenSmartBriefs,
  onOpenWriterFactory,
  onOpenNFLOdds,
  projectCount = 0,
  collapsed = false,
  onToggleCollapse
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Determine if sidebar should be expanded
  const isExpanded = isPinned || isHovered;

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

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
    <aside 
      className={`fixed left-0 top-0 h-screen ${isExpanded ? 'w-[260px]' : 'w-[60px]'} bg-bg-deep border-r border-border-subtle flex flex-col z-100 transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo & Pin Button */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center font-mono font-bold text-sm text-white">
              RW
            </div>
            {isExpanded && (
              <div className="text-xl font-bold tracking-tight text-text-primary">
                Roto<span className="text-accent-primary">Write</span>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={handleTogglePin}
              className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors"
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            >
              {isPinned ? (
                <Pin className="h-5 w-5 text-accent-primary" />
              ) : (
                <PinOff className="h-5 w-5 text-text-secondary" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {/* WORKSPACE Section */}
        <div className="mb-6">
          {isExpanded && (
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Workspace
            </div>
          )}
          
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard') && !pathname.includes('/admin')
                ? 'bg-accent-muted text-accent-primary'
                : 'hover:bg-bg-hover'
            }`}
            title={!isExpanded ? 'Dashboard' : ''}
          >
            <Home className={`${isExpanded ? 'w-5 h-5' : 'w-7 h-7'} text-accent-primary`} />
            {isExpanded && 'Dashboard'}
          </button>

          <button
            onClick={onOpenProjects}
            className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all`}
            title={!isExpanded ? 'Projects' : ''}
          >
            <FileText className={`${isExpanded ? 'w-5 h-5' : 'w-7 h-7'} text-accent-primary`} />
            {isExpanded && (
              <>
                Projects
                {projectCount > 0 && (
                  <span className="ml-auto bg-ai-muted text-ai-accent text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                    {projectCount}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={onOpenSmartBriefs}
            className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all`}
            title={!isExpanded ? 'SmartBriefs' : ''}
          >
            <BookOpen className={`${isExpanded ? 'w-5 h-5' : 'w-7 h-7'} text-accent-primary`} />
            {isExpanded && 'SmartBriefs'}
          </button>
        </div>

        {/* AI TOOLS Section */}
        <div className="mb-6">
          {isExpanded && (
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              AI Tools
            </div>
          )}
          
          <button
            onClick={onOpenWriterFactory}
            className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all`}
            title={!isExpanded ? 'Writer Factory' : ''}
          >
            <Wrench className={`${isExpanded ? 'w-5 h-5' : 'w-7 h-7'} text-accent-primary`} />
            {isExpanded && 'Writer Factory'}
          </button>

          <button
            onClick={onOpenNFLOdds}
            className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all`}
            title={!isExpanded ? 'NFL Odds Extractor' : ''}
          >
            <TrendingUp className={`${isExpanded ? 'w-5 h-5' : 'w-7 h-7'} text-accent-primary`} />
            {isExpanded && 'NFL Odds Extractor'}
          </button>

        </div>

        {/* SYSTEM Section - Only for super admin */}
        {user.email === 'jeremy.botter@gdcgroup.com' && (
          <div>
            {isExpanded && (
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                System
              </div>
            )}
            
            <button
              onClick={() => router.push('/admin')}
              className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname.includes('/admin')
                  ? 'bg-accent-muted text-accent-primary'
                  : 'hover:bg-bg-hover'
              }`}
              title={!isExpanded ? 'Admin' : ''}
            >
              <Shield className={`${isExpanded ? 'w-5 h-5' : 'w-7 h-7'} text-accent-primary`} />
              {isExpanded && 'Admin'}
            </button>
          </div>
        )}
      </nav>

      {/* User Card */}
      {isExpanded && (
        <div className="p-4 border-t border-border-subtle">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg-hover transition-all cursor-pointer group">
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
                <ChevronDown className="w-4 h-4 text-text-tertiary group-hover:opacity-100 transition-opacity" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
      )}
    </aside>
  );
}
