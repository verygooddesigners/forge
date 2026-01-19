'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserManagement } from './UserManagement';
import { APIKeyManagement } from './APIKeyManagement';
import { AITuner } from './AITuner';
import { AgentTuner } from './AgentTuner';
import { AIHelperAdmin } from './AIHelperAdmin';
import { CursorRemotePanel } from './CursorRemotePanel';
import { SSOConfigStatus } from './SSOConfigStatus';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();
  const isSuperAdmin = user.email === 'jeremy.botter@gdcgroup.com';

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-bg-surface p-1 rounded-[10px] border border-border-subtle">
          <TabsTrigger 
            value="users"
            className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
          >
            User Management
          </TabsTrigger>
          <TabsTrigger 
            value="api"
            className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
          >
            API Keys
          </TabsTrigger>
          <TabsTrigger 
            value="sso"
            className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
          >
            SSO Config
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
          >
            AI Tuner
          </TabsTrigger>
          <TabsTrigger 
            value="helper"
            className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
          >
            AI Helper Bot
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger 
              value="agents"
              className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
            >
              AI Agents
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger 
              value="cursor-remote"
              className="data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5"
            >
              Cursor Remote
            </TabsTrigger>
          )}
        </TabsList>

          <TabsContent value="users">
            <UserManagement adminUser={user} />
          </TabsContent>

          <TabsContent value="api">
            <APIKeyManagement adminUser={user} />
          </TabsContent>

          <TabsContent value="sso">
            <SSOConfigStatus />
          </TabsContent>

          <TabsContent value="ai">
            <AITuner adminUser={user} />
          </TabsContent>

          <TabsContent value="helper">
            <AIHelperAdmin adminUser={user} />
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="agents">
              <AgentTuner adminUser={user} />
            </TabsContent>
          )}
        {isSuperAdmin && (
          <TabsContent value="cursor-remote">
            <CursorRemotePanel adminUser={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}


