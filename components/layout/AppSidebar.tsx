'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import {
  Home,
  FileText,
  BookOpen,
  BarChart3,
  Wrench,
  Shield,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  Package,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { InstalledToolWithDetails } from '@/types/tools';
import { canAccessAdmin } from '@/lib/auth-config';
import { UserRole, ROLE_LABELS } from '@/types';
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
  onOpenNFLOdds?: () => void;
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
  const [installedTools, setInstalledTools] = useState<InstalledToolWithDetails[]>([]);

  // Fetch installed tools
  useEffect(() => {
    fetchInstalledTools();
  }, []);

  const fetchInstalledTools = async () => {
    try {
      const response = await fetch('/api/tools/my-tools');
      if (response.ok) {
        const data = await response.json();
        setInstalledTools(data.tools.filter((t: InstalledToolWithDetails) => t.enabled));
      }
    } catch (error) {
      console.error('Error fetching installed tools:', error);
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

  // Get Lucide icon component by name
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Package;
  };

  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-[260px] bg-bg-deep border-r border-border-subtle flex flex-col z-100"
    >
      {/* Logo */}
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-center justify-center">
          <Image
            src="/images/forge-icon.png"
            alt="Forge"
            width={120}
            height={120}
            className="rounded-lg"
            priority
          />
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
                : 'hover:bg-bg-hover'
            }`}
          >
            <Home className="w-5 h-5 text-accent-primary" />
            Dashboard
          </button>

          <button
            onClick={onOpenProjects}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all"
          >
            <FileText className="w-5 h-5 text-accent-primary" />
            Projects
            {projectCount > 0 && (
              <span className="ml-auto bg-ai-muted text-ai-accent text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                {projectCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSmartBriefs}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all"
          >
            <BookOpen className="w-5 h-5 text-accent-primary" />
            SmartBriefs
          </button>

          <button
            onClick={onOpenWriterFactory}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all"
          >
            <Wrench className="w-5 h-5 text-accent-primary" />
            Writer Factory
          </button>

          <button
            onClick={() => router.push('/content-analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive('/content-analytics')
                ? 'bg-accent-muted text-accent-primary'
                : 'hover:bg-bg-hover'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-accent-primary" />
            Content Analytics
          </button>
        </div>


        {/* TOOLS Section */}
        {installedTools.length > 0 && (
          <div className="mb-6">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Tools
            </div>
            
            {installedTools
              .sort((a, b) => a.tool.sidebar_order - b.tool.sidebar_order)
              .map((installedTool) => {
                const Icon = getIconComponent(installedTool.tool.sidebar_icon);
                const toolPath = `/tools/${installedTool.tool.slug}/app`;
                
                return (
                  <button
                    key={installedTool.id}
                    onClick={() => router.push(toolPath)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                      pathname.startsWith(toolPath)
                        ? 'bg-accent-muted text-accent-primary'
                        : 'hover:bg-bg-hover'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-accent-primary" />
                    {installedTool.tool.sidebar_label}
                  </button>
                );
              })}

            <button
              onClick={() => router.push('/tools')}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium hover:bg-bg-hover transition-all text-text-tertiary"
            >
              <Package className="w-5 h-5" />
              Browse Tools...
            </button>
          </div>
        )}

        {/* SYSTEM Section - team_leader+ can access admin */}
        {canAccessAdmin(user.role as UserRole) && (
          <div>
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              System
            </div>
            
            <button
              onClick={() => router.push('/admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname.includes('/admin')
                  ? 'bg-accent-muted text-accent-primary'
                  : 'hover:bg-bg-hover'
              }`}
            >
              <Shield className="w-5 h-5 text-accent-primary" />
              Admin
            </button>
          </div>
        )}
      </nav>

      {/* User Card */}
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
                  {ROLE_LABELS[user.role as UserRole] || user.role}
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
    </aside>
  );
}
