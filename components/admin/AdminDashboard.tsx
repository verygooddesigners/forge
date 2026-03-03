'use client';

import { User } from '@/types';
import { UserManagement } from './UserManagement';
import { TeamManagement } from './TeamManagement';
import { APIKeyManagement } from './APIKeyManagement';
import { AITuner } from './AITuner';
import { AgentTuner } from './AgentTuner';
import { AIHelperAdmin } from './AIHelperAdmin';
import { SSOConfigStatus } from './SSOConfigStatus';
import { TrustedSourcesAdmin } from './TrustedSourcesAdmin';
import { ToolsAdmin } from './ToolsAdmin';
import { RolesEditor } from './RolesEditor';
import { OddsApiManagement } from './OddsApiManagement';
import { AuditLog } from './AuditLog';
import { SystemHealth } from './SystemHealth';
import { WriterModelsAdmin } from './WriterModelsAdmin';
import { BetaManagement } from './BetaManagement';
import type { AdminSectionId } from './AdminMenu';

interface AdminDashboardProps {
  user: User;
  activeSection: AdminSectionId;
}

export function AdminDashboard({ user, activeSection }: AdminDashboardProps) {
  switch (activeSection) {
    case 'beta':
      return <BetaManagement adminUser={user} />;
    case 'users':
      return <UserManagement adminUser={user} />;
    case 'teams':
      return <TeamManagement adminUser={user} />;
    case 'api-keys':
      return <APIKeyManagement adminUser={user} />;
    case 'sso':
      return <SSOConfigStatus />;
    case 'ai-tuner':
      return <AITuner adminUser={user} />;
    case 'ai-helper':
      return <AIHelperAdmin adminUser={user} />;
    case 'ai-agents':
      return <AgentTuner adminUser={user} />;
    case 'writer-models':
      return <WriterModelsAdmin adminUser={user} />;
    case 'trusted-sources':
      return <TrustedSourcesAdmin />;
    case 'tools':
      return <ToolsAdmin />;
    case 'roles-editor':
      return <RolesEditor adminUser={user} />;
    case 'odds-api':
      return <OddsApiManagement />;
    case 'audit-log':
      return <AuditLog />;
    case 'system-health':
      return <SystemHealth />;
    default:
      return <UserManagement adminUser={user} />;
  }
}
