'use client';

import { useState, useEffect } from 'react';
import { User, UserRole, AccountStatus, ROLE_LABELS, STATUS_LABELS } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  canCreateUsers,
  canEditUsers,
  canDeleteUsers,
  getAssignableRoles,
} from '@/lib/auth-config';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

// All permission keys matching the Role Wizard
const ALL_PERMISSIONS = [
  { key: 'can_create_projects', label: 'Create Projects' },
  { key: 'can_edit_own_projects', label: 'Edit Own Projects' },
  { key: 'can_delete_own_projects', label: 'Delete Own Projects' },
  { key: 'can_share_projects', label: 'Share Projects' },
  { key: 'can_use_smartbriefs', label: 'Use SmartBriefs' },
  { key: 'can_edit_any_brief', label: 'Edit Any SmartBrief' },
  { key: 'can_delete_any_brief', label: 'Delete Any SmartBrief' },
  { key: 'can_export_content', label: 'Export Content' },
  { key: 'can_manage_own_writer_model', label: 'Manage Writer Model' },
  { key: 'can_use_ai_agents', label: 'Use AI Agents' },
  { key: 'can_tune_ai_agents', label: 'Tune AI Agents' },
  { key: 'can_toggle_ai_agents', label: 'Enable/Disable Agents' },
  { key: 'can_edit_master_ai', label: 'Edit Master AI' },
  { key: 'can_manage_trusted_sources', label: 'Manage Trusted Sources' },
  { key: 'can_view_analytics', label: 'View Analytics' },
  { key: 'can_view_team_analytics', label: 'View Team Analytics' },
  { key: 'can_view_users', label: 'View Users' },
  { key: 'can_create_users', label: 'Create Users' },
  { key: 'can_edit_users', label: 'Edit Users' },
  { key: 'can_delete_users', label: 'Delete Users' },
  { key: 'can_manage_teams', label: 'Manage Teams' },
  { key: 'can_access_admin', label: 'Access Admin Panel' },
  { key: 'can_manage_api_keys', label: 'Manage API Keys' },
  { key: 'can_manage_sso', label: 'Manage SSO' },
  { key: 'can_manage_tools', label: 'Manage Tools' },
  { key: 'can_manage_role_permissions', label: 'Manage Role Permissions' },
];

interface UserManagementProps {
  adminUser: User;
}

export function UserManagement({ adminUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('content_creator');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('awaiting_confirmation');
  const [loading, setLoading] = useState(false);
  const [userPermOverrides, setUserPermOverrides] = useState<Record<string, boolean>>({});
  const [showPermOverrides, setShowPermOverrides] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const supabase = createClient();

  const adminRole = adminUser.role as UserRole;
  const assignableRoles = getAssignableRoles(adminRole);
  const showCreateButton = canCreateUsers(adminRole);
  const showEditButton = canEditUsers(adminRole);
  const showDeleteButton = canDeleteUsers(adminRole);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('content_creator');
    setAccountStatus('awaiting_confirmation');
    setEditingUser(null);
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || null,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      setShowDialog(false);
      resetForm();
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          role,
          account_status: accountStatus,
        })
        .eq('id', userId);

      if (error) throw error;

      // Save per-user permission overrides if any were set
      await saveUserPermOverrides(userId);

      toast.success('User updated successfully');
      setShowDialog(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (!error) {
      toast.success('User deleted');
      await loadUsers();
    } else {
      toast.error('Failed to delete user');
    }
  };

  const loadUserPermOverrides = async (userId: string) => {
    setPermLoading(true);
    try {
      const { data } = await supabase
        .from('user_permission_overrides')
        .select('permission_key, enabled')
        .eq('user_id', userId);
      const map: Record<string, boolean> = {};
      for (const row of data ?? []) {
        map[row.permission_key] = row.enabled;
      }
      setUserPermOverrides(map);
    } catch {
      // Table might not exist yet — silently ignore
    } finally {
      setPermLoading(false);
    }
  };

  const saveUserPermOverrides = async (userId: string) => {
    try {
      const upserts = Object.entries(userPermOverrides).map(([key, enabled]) => ({
        user_id: userId,
        permission_key: key,
        enabled,
        updated_by: adminUser.id,
      }));
      if (upserts.length === 0) return;
      await supabase
        .from('user_permission_overrides')
        .upsert(upserts, { onConflict: 'user_id,permission_key' });
    } catch {
      // Silently ignore if table not yet migrated
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEmail(user.email);
    setFullName(user.full_name || '');
    setRole(user.role as UserRole);
    setAccountStatus(user.account_status as AccountStatus);
    setUserPermOverrides({});
    setShowPermOverrides(false);
    setShowDialog(true);
    loadUserPermOverrides(user.id);
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    if (role === 'super_admin' || role === 'admin') return 'default';
    if (role === 'manager' || role === 'team_leader') return 'secondary';
    return 'outline';
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    return status === 'confirmed' ? 'default' : 'outline';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Create, edit, and manage user accounts</CardDescription>
            </div>
            {showCreateButton && (
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.account_status)}>
                      {STATUS_LABELS[user.account_status as AccountStatus] || user.account_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {ROLE_LABELS[user.role as UserRole] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {showEditButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {showDeleteButton && user.id !== adminUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update user information and role'
                : 'Create a new user account with email and password.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!editingUser}
                required
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {editingUser && (
              <div className="space-y-2">
                <Label htmlFor="accountStatus">Account Status</Label>
                <Select value={accountStatus} onValueChange={(value) => setAccountStatus(value as AccountStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awaiting_confirmation">Awaiting Confirmation</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Per-user permission overrides (edit mode only) */}
            {editingUser && (
              <>
                <Separator />
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPermOverrides((v) => !v)}
                    className="w-full flex items-center justify-between py-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Individual Permission Overrides
                    </span>
                    {showPermOverrides ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showPermOverrides && (
                    <div className="mt-3 max-h-64 overflow-y-auto space-y-0 divide-y divide-border-subtle rounded-lg border border-border-subtle bg-bg-elevated p-0">
                      <p className="px-3 pt-3 pb-1 text-xs text-text-tertiary">
                        Overrides take precedence over role permissions. Only set what differs from the role.
                      </p>
                      {permLoading ? (
                        <p className="px-3 py-4 text-xs text-text-tertiary">Loading...</p>
                      ) : (
                        ALL_PERMISSIONS.map((perm) => (
                          <div key={perm.key} className="flex items-center justify-between px-3 py-2.5">
                            <span className="text-xs text-text-primary">{perm.label}</span>
                            <Switch
                              checked={userPermOverrides[perm.key] ?? false}
                              onCheckedChange={(v) =>
                                setUserPermOverrides((prev) => ({ ...prev, [perm.key]: v }))
                              }
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <Button
              className="w-full"
              onClick={() => editingUser ? handleUpdateUser(editingUser.id) : handleCreateUser()}
              disabled={loading || !email || (!editingUser && !password)}
            >
              {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
