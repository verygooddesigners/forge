'use client';

import { useState, useEffect } from 'react';
import { User, UserRole, ROLE_LABELS } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChevronRight, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RoleWizardProps {
  adminUser: User;
}

// All permission keys and their human-readable labels, grouped by category
const PERMISSION_GROUPS: Array<{
  group: string;
  permissions: Array<{ key: string; label: string; description: string }>;
}> = [
  {
    group: 'Content',
    permissions: [
      { key: 'can_create_projects', label: 'Create Projects', description: 'Can create new writing projects' },
      { key: 'can_edit_own_projects', label: 'Edit Own Projects', description: 'Can edit projects they created' },
      { key: 'can_delete_own_projects', label: 'Delete Own Projects', description: 'Can delete projects they created' },
      { key: 'can_share_projects', label: 'Share Projects', description: 'Can share projects with other users' },
      { key: 'can_use_smartbriefs', label: 'Use SmartBriefs', description: 'Can create and use SmartBriefs' },
      { key: 'can_edit_any_brief', label: 'Edit Any SmartBrief', description: 'Can edit SmartBriefs created by anyone' },
      { key: 'can_delete_any_brief', label: 'Delete Any SmartBrief', description: 'Can delete SmartBriefs created by anyone' },
      { key: 'can_export_content', label: 'Export Content', description: 'Can export generated content' },
      { key: 'can_manage_own_writer_model', label: 'Manage Writer Model', description: 'Can train and manage their personal writer model' },
    ],
  },
  {
    group: 'AI & Tools',
    permissions: [
      { key: 'can_use_ai_agents', label: 'Use AI Agents', description: 'Can use AI agents for content generation' },
      { key: 'can_tune_ai_agents', label: 'Tune AI Agents', description: 'Can adjust temperature, prompts, and model settings for individual agents' },
      { key: 'can_toggle_ai_agents', label: 'Enable/Disable Agents', description: 'Can turn AI agents on or off' },
      { key: 'can_edit_master_ai', label: 'Edit Master AI Instructions', description: 'Can edit the global AI instruction system' },
      { key: 'can_manage_trusted_sources', label: 'Manage Trusted Sources', description: 'Can add/remove trusted research sources' },
    ],
  },
  {
    group: 'Analytics',
    permissions: [
      { key: 'can_view_analytics', label: 'View Analytics', description: 'Can view content analytics dashboard' },
      { key: 'can_view_team_analytics', label: 'View Team Analytics', description: 'Can view analytics across all team members' },
    ],
  },
  {
    group: 'User Management',
    permissions: [
      { key: 'can_view_users', label: 'View Users', description: 'Can view the list of all users' },
      { key: 'can_create_users', label: 'Create Users', description: 'Can invite and create new user accounts' },
      { key: 'can_edit_users', label: 'Edit Users', description: 'Can edit user profiles and change roles' },
      { key: 'can_delete_users', label: 'Delete Users', description: 'Can permanently delete user accounts' },
      { key: 'can_manage_teams', label: 'Manage Teams', description: 'Can create, edit, and delete teams' },
    ],
  },
  {
    group: 'Admin Access',
    permissions: [
      { key: 'can_access_admin', label: 'Access Admin Panel', description: 'Can access the Admin section of the app' },
      { key: 'can_view_user_guide', label: 'View User Guide', description: 'Can access the user guide documentation' },
      { key: 'can_manage_api_keys', label: 'Manage API Keys', description: 'Can view and update system API keys' },
      { key: 'can_manage_sso', label: 'Manage SSO', description: 'Can configure Single Sign-On settings' },
      { key: 'can_manage_tools', label: 'Manage Tools', description: 'Can approve and manage installed tools/plugins' },
      { key: 'can_manage_role_permissions', label: 'Manage Role Permissions', description: 'Can edit role permissions using this wizard' },
    ],
  },
];

const ALL_ROLES: UserRole[] = ['content_creator', 'team_leader', 'manager', 'admin', 'super_admin'];

const ROLE_COLORS: Record<UserRole, string> = {
  content_creator: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  team_leader: 'text-green-400 border-green-500/30 bg-green-500/10',
  manager: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  admin: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  super_admin: 'text-red-400 border-red-500/30 bg-red-500/10',
};

type PermissionMap = Record<string, boolean>;

export function RoleWizard({ adminUser }: RoleWizardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (selectedRole) {
      loadPermissions(selectedRole);
    }
  }, [selectedRole]);

  const loadPermissions = async (role: UserRole) => {
    setLoading(true);
    setDirty(false);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key, enabled')
        .eq('role', role);

      if (error) throw error;

      const map: PermissionMap = {};
      for (const row of data ?? []) {
        map[row.permission_key] = row.enabled;
      }
      setPermissions(map);
    } catch (err) {
      console.error('Error loading permissions:', err);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // Upsert all permissions
      const upserts = Object.entries(permissions).map(([key, enabled]) => ({
        role: selectedRole,
        permission_key: key,
        enabled,
        updated_by: adminUser.id,
      }));

      const { error } = await supabase
        .from('role_permissions')
        .upsert(upserts, { onConflict: 'role,permission_key' });

      if (error) throw error;

      toast.success(`Permissions saved for ${ROLE_LABELS[selectedRole]}`);
      setDirty(false);
    } catch (err: any) {
      console.error('Error saving permissions:', err);
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedRole) return;
    await loadPermissions(selectedRole);
    toast.info('Changes discarded');
  };

  // Role selection view
  if (!selectedRole) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-primary" />
            Role Wizard
          </h1>
          <p className="text-text-secondary mt-1">
            Configure which permissions and rights each role has across the platform. Select a role to edit its permissions.
          </p>
        </div>

        <div className="space-y-3">
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-hover transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${ROLE_COLORS[role]}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text-primary">{ROLE_LABELS[role]}</div>
                <div className="text-sm text-text-secondary mt-0.5">
                  {role === 'content_creator' && 'Default role for new users. Can create and edit their own content.'}
                  {role === 'team_leader' && 'Can access admin tools and manage AI agents. No user management.'}
                  {role === 'manager' && 'Can manage users and teams. Elevated AI and analytics access.'}
                  {role === 'admin' && 'Full user management. Can configure SSO and toggle agents.'}
                  {role === 'super_admin' && 'Unrestricted access to all platform features and configuration.'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Permission editor view
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSelectedRole(null); setPermissions({}); setDirty(false); }}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          All Roles
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-accent-primary" />
              {ROLE_LABELS[selectedRole]}
              <Badge variant="outline" className={ROLE_COLORS[selectedRole]}>
                {selectedRole}
              </Badge>
            </h1>
            <p className="text-text-secondary mt-1">
              Toggle permissions on or off for this role. Changes take effect after saving.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={!dirty || saving}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
        </div>
      ) : (
        <div className="space-y-4">
          {PERMISSION_GROUPS.map((group) => (
            <Card key={group.group} className="bg-bg-surface border-border-default">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  {group.group}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-border-subtle">
                {group.permissions.map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-text-primary">{perm.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{perm.description}</p>
                    </div>
                    <Switch
                      checked={permissions[perm.key] ?? false}
                      onCheckedChange={(val) => handleToggle(perm.key, val)}
                      disabled={selectedRole === 'super_admin'}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {selectedRole === 'super_admin' && (
            <p className="text-sm text-text-tertiary text-center py-2">
              Super Admin permissions cannot be restricted.
            </p>
          )}

          {dirty && (
            <div className="sticky bottom-4 flex justify-end">
              <div className="flex gap-2 bg-bg-surface border border-border-default rounded-xl p-3 shadow-lg">
                <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
