'use client';

import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  BookOpen, 
  Wrench, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeftSidebarProps {
  user: User;
  onOpenProjectModal: () => void;
  onOpenWriterFactory: () => void;
  onOpenBriefBuilder: () => void;
}

export function LeftSidebar({ user, onOpenProjectModal, onOpenWriterFactory, onOpenBriefBuilder }: LeftSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return user.email.substring(0, 2).toUpperCase();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg flex flex-col p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">RotoWrite</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenProjectModal}
        >
          <FileText className="mr-3 h-5 w-5" />
          Projects
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenBriefBuilder}
        >
          <BookOpen className="mr-3 h-5 w-5" />
          Briefs
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="default"
          onClick={onOpenWriterFactory}
        >
          <Wrench className="mr-3 h-5 w-5" />
          Writer Factory
        </Button>
        {user.role === 'admin' && (
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            size="default"
            onClick={() => router.push('/admin')}
          >
            <Shield className="mr-3 h-5 w-5" />
            Admin
          </Button>
        )}
      </nav>

      {/* User Menu */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user.full_name || user.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

