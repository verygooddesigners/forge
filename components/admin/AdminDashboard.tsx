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

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();
  const isSuperAdmin = user.email === 'jeremy.botter@gmail.com' || user.email === 'jeremy.botter@gdcgroup.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="ai">AI Tuner</TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="agents">AI Agents</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="users">
            <UserManagement adminUser={user} />
          </TabsContent>

          <TabsContent value="api">
            <APIKeyManagement adminUser={user} />
          </TabsContent>

          <TabsContent value="ai">
            <AITuner adminUser={user} />
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="agents">
              <AgentTuner adminUser={user} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}


