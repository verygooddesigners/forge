'use client';

import { User, UserRole } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { APIKeyManagement } from './APIKeyManagement';
import { AITuner } from './AITuner';
import { AgentTuner } from './AgentTuner';
import { AIHelperAdmin } from './AIHelperAdmin';
import { CursorRemotePanel } from './CursorRemotePanel';
import { SSOConfigStatus } from './SSOConfigStatus';
import { TrustedSourcesAdmin } from './TrustedSourcesAdmin';
import { ToolsAdmin } from './ToolsAdmin';
import {
  canViewUsers,
  canManageApiKeys,
  canManageSso,
  canEditMasterInstructions,
  canTuneAgents,
  canAccessCursorRemote,
  canManageTrustedSources,
  canManageTools,
} from '@/lib/auth-config';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const role = user.role as UserRole;

  // Determine which tabs are visible based on role
  const showUsers = canViewUsers(role);
  const showApiKeys = canManageApiKeys(role);
  const showSso = canManageSso(role);
  const showAiTuner = canEditMasterInstructions(role);
  const showAgents = canTuneAgents(role);
  const showCursorRemote = canAccessCursorRemote(role);
  const showTrustedSources = canManageTrustedSources(role);
  const showTools = canManageTools(role);

  // Default tab based on what they can see
  const defaultTab = showUsers ? 'users' : showAiTuner ? 'ai' : 'helper';

  const tabClass = "data-[state=active]:bg-bg-elevated data-[state=active]:text-text-primary text-text-secondary text-[13px] font-medium px-5 py-2.5";

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-bg-surface p-1 rounded-[10px] border border-border-subtle flex-wrap">
          {showUsers && (
            <TabsTrigger value="users" className={tabClass}>
              User Management
            </TabsTrigger>
          )}
          {showApiKeys && (
            <TabsTrigger value="api" className={tabClass}>
              API Keys
            </TabsTrigger>
          )}
          {showSso && (
            <TabsTrigger value="sso" className={tabClass}>
              SSO Config
            </TabsTrigger>
          )}
          {showAiTuner && (
            <TabsTrigger value="ai" className={tabClass}>
              AI Tuner
            </TabsTrigger>
          )}
          <TabsTrigger value="helper" className={tabClass}>
            AI Helper Bot
          </TabsTrigger>
          {showAgents && (
            <TabsTrigger value="agents" className={tabClass}>
              AI Agents
            </TabsTrigger>
          )}
          {showCursorRemote && (
            <TabsTrigger value="cursor-remote" className={tabClass}>
              Cursor Remote
            </TabsTrigger>
          )}
          {showTrustedSources && (
            <TabsTrigger value="trusted-sources" className={tabClass}>
              Trusted Sources
            </TabsTrigger>
          )}
          {showTools && (
            <TabsTrigger value="tools" className={tabClass}>
              Tools
            </TabsTrigger>
          )}
        </TabsList>

        {showUsers && (
          <TabsContent value="users">
            <UserManagement adminUser={user} />
          </TabsContent>
        )}

        {showApiKeys && (
          <TabsContent value="api">
            <APIKeyManagement adminUser={user} />
          </TabsContent>
        )}

        {showSso && (
          <TabsContent value="sso">
            <SSOConfigStatus />
          </TabsContent>
        )}

        {showAiTuner && (
          <TabsContent value="ai">
            <AITuner adminUser={user} />
          </TabsContent>
        )}

        <TabsContent value="helper">
          <AIHelperAdmin adminUser={user} />
        </TabsContent>

        {showAgents && (
          <TabsContent value="agents">
            <AgentTuner adminUser={user} />
          </TabsContent>
        )}

        {showCursorRemote && (
          <TabsContent value="cursor-remote">
            <CursorRemotePanel adminUser={user} />
          </TabsContent>
        )}

        {showTrustedSources && (
          <TabsContent value="trusted-sources">
            <TrustedSourcesAdmin />
          </TabsContent>
        )}

        {showTools && (
          <TabsContent value="tools">
            <ToolsAdmin />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
