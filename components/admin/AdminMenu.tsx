'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types';
import {
  Users,
  UsersRound,
  Key,
  Shield,
  Sliders,
  MessageCircle,
  Bot,
  BookMarked,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ScrollText,
  Activity,
  Link2,
  PenLine,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ADMIN_MENU_STORAGE_KEY = 'forge-admin-menu-collapsed';

export type AdminSectionId =
  | 'users'
  | 'teams'
  | 'api-keys'
  | 'sso'
  | 'ai-tuner'
  | 'ai-helper'
  | 'ai-agents'
  | 'writer-models'
  | 'trusted-sources'
  | 'tools'
  | 'roles-editor'
  | 'odds-api'
  | 'audit-log'
  | 'system-health';

interface AdminMenuProps {
  user: User;
  permissions: Record<string, boolean>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: AdminSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission: string;
  group?: string;
}

const MENU_ITEMS: MenuItem[] = [
  // User Management
  { id: 'users', label: 'Manage Users', icon: Users, requiredPermission: 'can_view_users', group: 'User Management' },
  { id: 'teams', label: 'Teams', icon: UsersRound, requiredPermission: 'can_manage_teams', group: 'User Management' },
  { id: 'roles-editor', label: 'Roles Editor', icon: ShieldCheck, requiredPermission: 'can_manage_role_permissions', group: 'User Management' },

  // AI & Content
  { id: 'ai-tuner', label: 'AI Tuner', icon: Sliders, requiredPermission: 'can_edit_master_ai', group: 'AI & Content' },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot, requiredPermission: 'can_tune_ai_agents', group: 'AI & Content' },
  { id: 'ai-helper', label: 'AI Helper Bot', icon: MessageCircle, requiredPermission: 'can_edit_master_ai', group: 'AI & Content' },
  { id: 'writer-models', label: 'Writer Models', icon: PenLine, requiredPermission: 'can_edit_master_ai', group: 'AI & Content' },
  { id: 'trusted-sources', label: 'Trusted Sources', icon: BookMarked, requiredPermission: 'can_manage_trusted_sources', group: 'AI & Content' },

  // Integrations
  { id: 'api-keys', label: 'API Keys', icon: Key, requiredPermission: 'can_manage_api_keys', group: 'Integrations' },
  { id: 'sso', label: 'SSO Management', icon: Link2, requiredPermission: 'can_manage_sso', group: 'Integrations' },
  { id: 'odds-api', label: 'Odds API', icon: TrendingUp, requiredPermission: 'can_manage_api_keys', group: 'Integrations' },

  // Platform
  { id: 'tools', label: 'Tools Management', icon: Wrench, requiredPermission: 'can_manage_tools', group: 'Platform' },
  { id: 'audit-log', label: 'Audit Log', icon: ScrollText, requiredPermission: 'can_access_admin', group: 'Platform' },
  { id: 'system-health', label: 'System Health', icon: Activity, requiredPermission: 'can_manage_api_keys', group: 'Platform' },
];

function canAccessItem(permissions: Record<string, boolean>, item: MenuItem): boolean {
  return permissions[item.requiredPermission] === true;
}

function getVisibleItems(permissions: Record<string, boolean>): MenuItem[] {
  return MENU_ITEMS.filter((item) => canAccessItem(permissions, item));
}

export function getDefaultSection(permissions: Record<string, boolean>): AdminSectionId {
  const visible = getVisibleItems(permissions);
  return visible[0]?.id ?? 'users';
}

export function getAdminMenuCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ADMIN_MENU_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminMenuCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(ADMIN_MENU_STORAGE_KEY, String(collapsed));
  } catch {
    // ignore
  }
}

export function AdminMenu({ user, permissions, collapsed, onToggleCollapse }: AdminMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSection = (searchParams.get('section') as AdminSectionId) || getDefaultSection(permissions);
  const visibleItems = getVisibleItems(permissions);

  const setSection = (section: AdminSectionId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', section);
    router.push(`/admin?${params.toString()}`);
  };

  const buttonClass = (id: AdminSectionId) =>
    cn(
      'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all',
      currentSection === id
        ? 'bg-accent-muted text-accent-primary'
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    );

  const iconClass = 'w-4 h-4 shrink-0';

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border-subtle bg-bg-deep shrink-0 transition-[width] duration-200 ease-in-out z-[99]',
        collapsed ? 'w-[56px]' : 'w-[220px]'
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border-subtle min-h-[52px]">
        {!collapsed && (
          <span className="text-[13px] font-semibold text-text-primary truncate">Admin</span>
        )}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-all shrink-0"
                aria-label={collapsed ? 'Expand admin menu' : 'Collapse admin menu'}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand admin menu' : 'Collapse admin menu'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {collapsed ? (
          <div className="flex flex-col gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <TooltipProvider key={item.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSection(item.id)}
                        className={cn(
                          'w-full flex items-center justify-center p-3 rounded-lg transition-all',
                          currentSection === item.id
                            ? 'bg-accent-muted text-accent-primary'
                            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {(() => {
              let lastGroup: string | undefined = undefined;
              return visibleItems.map((item) => {
                const showGroupHeader = item.group && item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <div key={item.id}>
                    {showGroupHeader && (
                      <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                        {item.group}
                      </div>
                    )}
                    <button
                      onClick={() => setSection(item.id)}
                      className={cn(buttonClass(item.id), 'px-3 py-2')}
                    >
                      <item.icon className={iconClass} />
                      <span className="truncate text-[13px]">{item.label}</span>
                    </button>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </nav>
    </aside>
  );
}
