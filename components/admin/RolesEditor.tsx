'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShieldCheck, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RolesEditorProps {
  adminUser: User;
}

interface RoleWithCount {
  id: string;
  name: string;
  description?: string;
  permission_count: number;
  created_at: string;
  updated_at: string;
}

// All permission keys and their human-readable labels, grouped by category
const PERMISSION_GROUPS: Array<{
  group: string;
  permissions: Array<{ key: string; label: string }>;
}> = [
  {
    group: 'Content',
    permissions: [
      { key: 'can_create_projects', label: 'Create Projects' },
      { key: 'can_edit_own_projects', label: 'Edit Own Projects' },
      { key: 'can_delete_own_projects', label: 'Delete Own Projects' },
      { key: 'can_share_projects', label: 'Share Projects' },
      { key: 'can_use_smartbriefs', label: 'Use SmartBriefs' },
      { key: 'can_edit_any_brief', label: 'Edit Any SmartBrief' },
      { key: 'can_delete_any_brief', label: 'Delete Any SmartBrief' },
      { key: 'can_export_content', label: 'Export Content' },
      { key: 'can_manage_own_writer_model', label: 'Manage Writer Model' },
    ],
  },
  {
    group: 'AI & Tools',
    permissions: [
      { key: 'can_use_ai_agents', label: 'Use AI Agents' },
      { key: 'can_tune_ai_agents', label: 'Tune AI Agents' },
      { key: 'can_toggle_ai_agents', label: 'Enable/Disable Agents' },
      { key: 'can_edit_master_ai', label: 'Edit Master AI Instructions' },
      { key: 'can_manage_trusted_sources', label: 'Manage Trusted Sources' },
    ],
  },
  {
    group: 'Analytics',
    permissions: [
      { key: 'can_view_analytics', label: 'View Analytics' },
      { key: 'can_view_team_analytics', label: 'View Team Analytics' },
    ],
  },
  {
    group: 'User Management',
    permissions: [
      { key: 'can_view_users', label: 'View Users' },
      { key: 'can_create_users', label: 'Create Users' },
      { key: 'can_edit_users', label: 'Edit Users' },
      { key: 'can_delete_users', label: 'Delete Users' },
      { key: 'can_manage_teams', label: 'Manage Teams' },
      { key: 'can_create_teams', label: 'Create Teams' },
    ],
  },
  {
    group: 'Admin Access',
    permissions: [
      { key: 'can_access_admin', label: 'Access Admin Panel' },
      { key: 'can_view_user_guide', label: 'View User Guide' },
      { key: 'can_manage_api_keys', label: 'Manage API Keys' },
      { key: 'can_manage_sso', label: 'Manage SSO' },
      { key: 'can_manage_tools', label: 'Manage Tools' },
      { key: 'can_manage_role_permissions', label: 'Manage Role Permissions' },
    ],
  },
];

export function RolesEditor({ adminUser }: RolesEditorProps) {
  const [roles, setRoles] = useState<RoleWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<RoleWithCount | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [permLoading, setPermLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (!res.ok) throw new Error('Failed to load roles');
      const data = await res.json();
      setRoles(data);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingRole(null);
    setIsCreating(true);
    setRoleName('');
    setRoleDescription('');
    setPermissions({});
  };

  const openEdit = async (role: RoleWithCount) => {
    setEditingRole(role);
    setIsCreating(false);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setPermissions({});
    await loadRolePermissions(role.name);
  };

  const loadRolePermissions = async (roleName: string) => {
    setPermLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('role_permissions')
        .select('permission_key, enabled')
        .eq('role', roleName);

      const map: Record<string, boolean> = {};
      for (const row of data ?? []) {
        map[row.permission_key] = row.enabled;
      }
      setPermissions(map);
    } catch {
      // Leave permissions empty
    } finally {
      setPermLoading(false);
    }
  };

  const handleBack = () => {
    setEditingRole(null);
    setIsCreating(false);
    setPermissions({});
    loadRoles();
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        const res = await fetch('/api/admin/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: roleName.trim(), description: roleDescription.trim() }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create role');

        // Save permissions if any were toggled
        if (Object.keys(permissions).length > 0) {
          await fetch(`/api/admin/roles/${data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions }),
          });
        }

        toast.success('Role created');
      } else if (editingRole) {
        const res = await fetch(`/api/admin/roles/${editingRole.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: roleName.trim(),
            description: roleDescription.trim(),
            permissions,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update role');

        toast.success('Role updated');
      }

      handleBack();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRole) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${editingRole.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete role');
      toast.success('Role deleted');
      setShowDeleteDialog(false);
      handleBack();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  // ---- List view ----
  if (!editingRole && !isCreating) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent-primary" />
              Roles Editor
            </h1>
            <p className="text-text-secondary mt-1">
              Manage roles and their permissions across the platform.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Role
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => openEdit(role)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-hover transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-default bg-bg-elevated">
                  <ShieldCheck className="w-5 h-5 text-accent-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-text-primary">{role.name}</div>
                  {role.description && (
                    <div className="text-sm text-text-secondary mt-0.5 truncate">{role.description}</div>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {role.permission_count} permissions
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Create / Edit view ----
  return (
    <div className="max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        All Roles
      </Button>

      <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-6">
        <ShieldCheck className="w-6 h-6 text-accent-primary" />
        {isCreating ? 'Create New Role' : `Edit: ${editingRole?.name}`}
      </h1>

      <Card className="bg-bg-surface border-border-default">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Senior Editor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleDescription">Role Description</Label>
            <Textarea
              id="roleDescription"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Optional description of this role's purpose"
              rows={2}
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-semibold text-text-primary">Permissions</Label>
            {permLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
              </div>
            ) : (
              <div className="rounded-lg border border-border-default overflow-hidden">
                {PERMISSION_GROUPS.map((group, gi) => (
                  <div key={group.group}>
                    {gi > 0 && <div className="border-t border-border-subtle" />}
                    <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary bg-bg-elevated">
                      {group.group}
                    </div>
                    <div className="grid grid-cols-2 gap-0 divide-y divide-border-subtle">
                      {group.permissions.map((perm, pi) => (
                        <div
                          key={perm.key}
                          className={`flex items-center justify-between px-4 py-2.5 ${pi % 2 === 0 && pi === group.permissions.length - 1 ? 'col-span-2' : ''}`}
                        >
                          <span className="text-sm text-text-primary">{perm.label}</span>
                          <Switch
                            checked={permissions[perm.key] ?? false}
                            onCheckedChange={(val) =>
                              setPermissions((prev) => ({ ...prev, [perm.key]: val }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {editingRole ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={saving}
              >
                Delete Role
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleSave} disabled={saving || !roleName.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreating ? 'Create Role' : 'Update Role'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{editingRole?.name}&quot;? This cannot be undone.
              You cannot delete a role that has users assigned to it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
