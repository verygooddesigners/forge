'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Team, TeamMember, UserRole, ROLE_LABELS } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Plus,
  Edit,
  Trash2,
  Users,
  X,
  ArrowLeft,
  GripVertical,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { canManageTeams } from '@/lib/auth-config';

interface TeamManagementProps {
  adminUser: User;
}

interface TeamWithManager extends Omit<Team, 'manager'> {
  manager?: { id: string; email: string; full_name?: string } | null;
  member_count: number;
}

interface TeamMemberWithUser extends TeamMember {
  user: User;
}

export function TeamManagement({ adminUser }: TeamManagementProps) {
  const canManage = canManageTeams(adminUser.role as UserRole);

  const [teams, setTeams] = useState<TeamWithManager[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Team dialog state
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithManager | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamManagedBy, setTeamManagedBy] = useState('');
  const [saving, setSaving] = useState(false);

  // Members panel state
  const [selectedTeam, setSelectedTeam] = useState<TeamWithManager | null>(null);
  const [members, setMembers] = useState<TeamMemberWithUser[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Drag-and-drop state
  const [dragOverMembers, setDragOverMembers] = useState(false);

  // User filter for available users panel
  const [userSearch, setUserSearch] = useState('');

  const supabase = createClient();

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/teams');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeams(data.teams ?? []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllUsers = useCallback(async () => {
    const { data } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .order('full_name');
    if (data) setAllUsers(data as User[]);
  }, [supabase]);

  useEffect(() => {
    loadTeams();
    loadAllUsers();
  }, [loadTeams, loadAllUsers]);

  const loadTeamMembers = async (teamId: string) => {
    setMembersLoading(true);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/members`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(data.members ?? []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  };

  const resetTeamForm = () => {
    setTeamName('');
    setTeamDescription('');
    setTeamManagedBy('');
    setEditingTeam(null);
  };

  const openCreateDialog = () => {
    resetTeamForm();
    setTeamManagedBy(adminUser.id);
    setShowTeamDialog(true);
  };

  const openEditDialog = (team: TeamWithManager) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description ?? '');
    setTeamManagedBy(team.managed_by ?? '');
    setShowTeamDialog(true);
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: teamName.trim(),
        description: teamDescription.trim() || null,
        managed_by: teamManagedBy || null,
      };

      let res: Response;
      if (editingTeam) {
        res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingTeam ? 'Team updated' : 'Team created');
      setShowTeamDialog(false);
      resetTeamForm();
      await loadTeams();

      // Refresh selected team if it was edited
      if (editingTeam && selectedTeam?.id === editingTeam.id) {
        setSelectedTeam((prev) => prev ? { ...prev, ...data.team } : prev);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (team: TeamWithManager) => {
    if (!confirm(`Delete team "${team.name}"? This will remove all memberships.`)) return;
    try {
      const res = await fetch(`/api/admin/teams/${team.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Team deleted');
      if (selectedTeam?.id === team.id) setSelectedTeam(null);
      await loadTeams();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleSelectTeam = async (team: TeamWithManager) => {
    setSelectedTeam(team);
    setUserSearch('');
    await loadTeamMembers(team.id);
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/admin/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Member added');
      setMembers((prev) => [...prev, data.member]);
      // Update member count in teams list
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id ? { ...t, member_count: t.member_count + 1 } : t
        )
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/admin/teams/${selectedTeam.id}/members/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Member removed');
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id ? { ...t, member_count: Math.max(0, t.member_count - 1) } : t
        )
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, userId: string) => {
    e.dataTransfer.setData('userId', userId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverMembers(true);
  };

  const handleDragLeave = () => {
    setDragOverMembers(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverMembers(false);
    const userId = e.dataTransfer.getData('userId');
    if (userId) await handleAddMember(userId);
  };

  const memberIds = new Set(members.map((m) => m.user_id));
  const availableUsers = allUsers.filter(
    (u) =>
      !memberIds.has(u.id) &&
      (userSearch === '' ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.full_name ?? '').toLowerCase().includes(userSearch.toLowerCase()))
  );

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    if (role === 'super_admin' || role === 'admin') return 'default';
    if (role === 'manager' || role === 'team_leader') return 'secondary';
    return 'outline';
  };

  if (!canManage) {
    return (
      <Card className="border border-border-subtle bg-bg-surface">
        <CardContent className="pt-6">
          <p className="text-sm text-text-tertiary">You don't have permission to manage teams.</p>
        </CardContent>
      </Card>
    );
  }

  // ─── Members Panel ────────────────────────────────────────────────────────
  if (selectedTeam) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTeam(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Teams
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-text-primary truncate">{selectedTeam.name}</h2>
            {selectedTeam.description && (
              <p className="text-xs text-text-tertiary truncate">{selectedTeam.description}</p>
            )}
          </div>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(selectedTeam)}
              className="gap-2 shrink-0"
            >
              <Edit className="w-4 h-4" />
              Edit Team
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Members */}
          <Card className="border border-border-subtle bg-bg-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Members ({members.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className={`min-h-[200px] transition-colors rounded-b-lg ${
                  dragOverMembers
                    ? 'bg-accent/10 ring-2 ring-inset ring-accent'
                    : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {membersLoading ? (
                  <p className="text-xs text-text-tertiary p-4">Loading...</p>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <Users className="w-8 h-8 text-text-tertiary mb-2" />
                    <p className="text-xs text-text-tertiary">
                      {dragOverMembers ? 'Drop user here to add' : 'No members yet. Drag users here or click + to add.'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableBody>
                      {members.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="py-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-text-primary">
                                {m.user?.full_name || m.user?.email}
                              </span>
                              {m.user?.full_name && (
                                <span className="text-xs text-text-tertiary">{m.user.email}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant={getRoleBadgeVariant(m.user?.role)}>
                              {ROLE_LABELS[m.user?.role as UserRole] || m.user?.role}
                            </Badge>
                          </TableCell>
                          {canManage && (
                            <TableCell className="py-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(m.user_id)}
                                title="Remove from team"
                              >
                                <X className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Users */}
          {canManage && (
            <Card className="border border-border-subtle bg-bg-surface">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Add Members
                </CardTitle>
                <CardDescription className="text-xs">
                  Drag a user onto the members panel, or click <UserPlus className="inline w-3 h-3" /> to add instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {availableUsers.length === 0 ? (
                    <p className="text-xs text-text-tertiary py-2 text-center">
                      {userSearch ? 'No users match your search.' : 'All users are already members.'}
                    </p>
                  ) : (
                    availableUsers.map((u) => (
                      <div
                        key={u.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, u.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md border border-border-subtle bg-bg-elevated hover:bg-bg-hover cursor-grab active:cursor-grabbing group transition-colors"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {u.full_name || u.email}
                          </p>
                          {u.full_name && (
                            <p className="text-xs text-text-tertiary truncate">{u.email}</p>
                          )}
                        </div>
                        <Badge
                          variant={getRoleBadgeVariant(u.role)}
                          className="text-xs shrink-0"
                        >
                          {ROLE_LABELS[u.role as UserRole] || u.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 shrink-0 transition-opacity"
                          onClick={() => handleAddMember(u.id)}
                          title="Add to team"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Team Dialog */}
        <TeamDialog
          open={showTeamDialog}
          editingTeam={editingTeam}
          name={teamName}
          description={teamDescription}
          managedBy={teamManagedBy}
          allUsers={allUsers}
          saving={saving}
          onNameChange={setTeamName}
          onDescriptionChange={setTeamDescription}
          onManagedByChange={setTeamManagedBy}
          onSave={handleSaveTeam}
          onClose={() => {
            setShowTeamDialog(false);
            resetTeamForm();
          }}
        />
      </div>
    );
  }

  // ─── Teams List ───────────────────────────────────────────────────────────
  return (
    <>
      <Card className="border border-border-subtle bg-bg-surface">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>Organize users into teams to scope access and analytics.</CardDescription>
            </div>
            {canManage && (
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                New Team
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-text-tertiary py-4">Loading teams...</p>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-text-tertiary" />
              </div>
              <p className="text-sm text-text-secondary mb-4">No teams yet.</p>
              {canManage && (
                <Button onClick={openCreateDialog} className="gap-2" variant="secondary">
                  <Plus className="w-4 h-4" />
                  Create your first team
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow
                    key={team.id}
                    className="cursor-pointer hover:bg-bg-hover"
                    onClick={() => handleSelectTeam(team)}
                  >
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-text-secondary max-w-[200px] truncate">
                      {team.description || '-'}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {team.manager?.full_name || team.manager?.email || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {team.member_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(team)}
                              title="Edit team"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTeam(team)}
                              title="Delete team"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TeamDialog
        open={showTeamDialog}
        editingTeam={editingTeam}
        name={teamName}
        description={teamDescription}
        managedBy={teamManagedBy}
        allUsers={allUsers}
        saving={saving}
        onNameChange={setTeamName}
        onDescriptionChange={setTeamDescription}
        onManagedByChange={setTeamManagedBy}
        onSave={handleSaveTeam}
        onClose={() => {
          setShowTeamDialog(false);
          resetTeamForm();
        }}
      />
    </>
  );
}

// ─── TeamDialog ───────────────────────────────────────────────────────────────

interface TeamDialogProps {
  open: boolean;
  editingTeam: TeamWithManager | null;
  name: string;
  description: string;
  managedBy: string;
  allUsers: User[];
  saving: boolean;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onManagedByChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

function TeamDialog({
  open,
  editingTeam,
  name,
  description,
  managedBy,
  allUsers,
  saving,
  onNameChange,
  onDescriptionChange,
  onManagedByChange,
  onSave,
  onClose,
}: TeamDialogProps) {
  const managerCandidates = allUsers.filter((u) =>
    ['super_admin', 'admin', 'manager'].includes(u.role)
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
          <DialogDescription>
            {editingTeam ? 'Update team details.' : 'Create a new team to organise users.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name <span className="text-destructive">*</span></Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Editorial, Sports Desk"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-manager">Team Manager</Label>
            <Select value={managedBy} onValueChange={onManagedByChange}>
              <SelectTrigger id="team-manager">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {managerCandidates.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            onClick={onSave}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
