'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import {
  FileText,
  BookOpen,
  BookMarked,
  Wrench,
  Shield,
  ChevronUp,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
  PenTool,
  Plus,
  KeyRound,
} from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { usePermissions } from '@/hooks/use-permissions';

interface AppSidebarProps {
  user: User;
  // Legacy callback props — kept for backward compatibility but nav now routes directly
  onOpenProjects?: () => void;
  onOpenSmartBriefs?: () => void;
  onOpenWriterFactory?: () => void;
  projectCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({
  user,
  projectCount = 0,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = usePermissions(user.id);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [profileMenuOpen]);

  // Close create dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target as Node)) {
        setCreateDropdownOpen(false);
      }
    };
    if (createDropdownOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [createDropdownOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle('light');
    setIsDark(!isLight);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-accent-primary/15 text-accent-primary'
        : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'
    }`;

  const displayName = user.full_name || user.email;
  const roleLabel = user.role;

  return (
    <aside
      className="w-[260px] flex-shrink-0 flex flex-col h-full"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.5)',
      }}
    >
      {/* Logo — keep existing image, add wordmark */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-white/40">
        <button onClick={() => router.push('/dashboard')} className="focus:outline-none flex items-center gap-3">
          <Image
            src="/images/forge-icon.png"
            alt="Forge"
            width={36}
            height={36}
            className="rounded-[10px] flex-shrink-0"
            priority
          />
          <span className="text-[17px] font-bold text-text-primary tracking-tight">Forge</span>
        </button>
      </div>

      {/* NavMenu */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">

        {/* Create New button + dropdown */}
        <div className="mb-3" ref={createDropdownRef}>
          <button
            onClick={() => setCreateDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-accent-primary text-white hover:bg-accent-hover shadow-[0_4px_12px_rgba(160,33,254,0.3)]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create New...</span>
            <ChevronDown
              className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-200 ${
                createDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              createDropdownOpen ? 'max-h-24 opacity-100 mt-1' : 'max-h-0 opacity-0'
            }`}
          >
            <div
              className="rounded-xl overflow-hidden shadow-xl"
              style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
              <button
                onClick={() => { setCreateDropdownOpen(false); router.push('/projects/new'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
              >
                <FileText className="w-4 h-4 shrink-0 text-accent-primary" />
                Project
              </button>
              <div className="border-t border-black/5" />
              <button
                onClick={() => { setCreateDropdownOpen(false); router.push('/smartbriefs?new=true'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
              >
                <BookOpen className="w-4 h-4 shrink-0 text-accent-primary" />
                SmartBrief
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => router.push('/projects')} className={navLinkClass('/projects')}>
          <FileText className="w-[18px] h-[18px] shrink-0" />
          <span>Projects</span>
          {projectCount > 0 && (
            <span className="ml-auto bg-accent-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {projectCount}
            </span>
          )}
        </button>

        <button onClick={() => router.push('/smartbriefs')} className={navLinkClass('/smartbriefs')}>
          <BookOpen className="w-[18px] h-[18px] shrink-0" />
          <span>SmartBriefs</span>
        </button>

        <button onClick={() => router.push('/guide')} className={navLinkClass('/guide')}>
          <BookMarked className="w-[18px] h-[18px] shrink-0" />
          <span>User Guide</span>
        </button>

        <button onClick={() => router.push('/writer-factory')} className={navLinkClass('/writer-factory')}>
          <Wrench className="w-[18px] h-[18px] shrink-0" />
          <span>Writer Factory</span>
        </button>

        {hasPermission('can_access_admin') && (
          <button onClick={() => router.push('/admin')} className={navLinkClass('/admin')}>
            <Shield className="w-[18px] h-[18px] shrink-0" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* ProfileMenuBox */}
      <div className="p-3 border-t border-white/40" ref={profileMenuRef}>
        {profileMenuOpen && (
          <div
            className="mb-2 rounded-2xl overflow-hidden shadow-xl"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)' }}
          >
            <button
              onClick={() => { router.push('/profile'); setProfileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
            >
              <UserCircle className="w-4 h-4 shrink-0" />
              Profile
            </button>
            <button
              onClick={() => { router.push('/writer-factory'); setProfileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
            >
              <PenTool className="w-4 h-4 shrink-0" />
              Writer Model
            </button>
            <button
              onClick={() => { router.push('/change-password'); setProfileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              Change Password
            </button>
            <button
              onClick={() => { router.push('/settings'); setProfileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </button>
            <div className="border-t border-black/5" />
            <button
              onClick={() => { toggleTheme(); setProfileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-black/5 hover:text-text-primary transition-all"
            >
              {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <div className="border-t border-black/5" />
            <button
              onClick={() => { handleSignOut(); setProfileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Log Out
            </button>
          </div>
        )}

        <button
          onClick={() => setProfileMenuOpen((v) => !v)}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/5 transition-all"
        >
          <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={displayName} width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-ai-accent flex items-center justify-center font-bold text-sm text-white">
                {getInitials(displayName)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13px] font-semibold truncate text-text-primary">
              {user.full_name || user.email.split('@')[0]}
            </div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider truncate font-medium">
              {roleLabel}
            </div>
          </div>
          {profileMenuOpen ? (
            <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
          ) : (
            <ChevronUp className="w-4 h-4 text-text-tertiary shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
