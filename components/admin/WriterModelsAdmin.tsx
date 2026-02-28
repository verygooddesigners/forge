'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, UserPlus, UserMinus, Pen, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AssignedUser {
  id: string;
  email: string;
  full_name?: string;
  default_writer_model_id?: string;
}

interface WriterModelWithAssignments {
  id: string;
  name: string;
  is_house_model: boolean;
  strategist_id?: string;
  created_by: string;
  metadata?: { description?: string; total_training_pieces?: number };
  created_at: string;
  assigned_users: AssignedUser[];
}

interface WriterModelsAdminProps {
  adminUser: User;
}

export function WriterModelsAdmin({ adminUser }: WriterModelsAdminProps) {
  const [models, setModels] = useState<WriterModelWithAssignments[]>([]);
  const [allUsers, setAllUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<WriterModelWithAssignments | null>(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsHouse, setNewIsHouse] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [modelsRes, usersRes] = await Promise.all([
        fetch('/api/writer-models'),
        fetch('/api/admin/users').catch(() => null),
      ]);

      const modelsJson = await modelsRes.json();
      setModels(modelsJson.data ?? []);

      // Load users directly from Supabase client (admin page context)
      const supabase = createClient();
      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name, default_writer_model_id')
        .order('full_name');
      setAllUsers(users ?? []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/writer-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          is_house_model: newIsHouse,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Writer model created');
      setShowCreateDialog(false);
      setNewName('');
      setNewDescription('');
      setNewIsHouse(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(model: WriterModelWithAssignments) {
    if (!confirm(`Delete "${model.name}"? This cannot be undone.`)) return;
    setDeleting(model.id);
    try {
      const res = await fetch(`/api/writer-models?id=${model.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Model deleted');
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleAssign() {
    if (!assignUserId || !selectedModel) return;
    setSaving(true);
    try {
      const res = await fetch('/api/writer-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedModel.id, assign_user_id: assignUserId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('User assigned');
      setShowAssignDialog(false);
      setAssignUserId('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnassign(modelId: string, userId: string, userName: string) {
    try {
      const res = await fetch('/api/writer-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modelId, unassign_user_id: userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Unassigned ${userName}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Users not yet assigned to the selected model
  const assignableUsers = allUsers.filter(
    u => !selectedModel?.assigned_users.some(au => au.id === u.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-tertiary text-sm">Loading writer models…</div>
      </div>
    );
  }

  const houseModels = models.filter(m => m.is_house_model);
  const personalModels = models.filter(m => !m.is_house_model);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">Writer Models</h1>
          <p className="text-sm text-text-tertiary mt-1">
            Create and manage AI writer models, and assign them to users as their default.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Model
        </Button>
      </div>

      {/* House Models */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <CardTitle className="text-[15px]">House Models</CardTitle>
            <Badge variant="secondary" className="text-xs">{houseModels.length}</Badge>
          </div>
          <CardDescription className="text-[13px]">
            Shared models available to all users as their writer voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {houseModels.length === 0 ? (
            <p className="text-sm text-text-tertiary py-4 text-center">No house models yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[12px]">Name</TableHead>
                  <TableHead className="text-[12px]">Description</TableHead>
                  <TableHead className="text-[12px]">Training</TableHead>
                  <TableHead className="text-[12px]">Assigned To</TableHead>
                  <TableHead className="text-[12px] w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {houseModels.map(model => (
                  <ModelRow
                    key={model.id}
                    model={model}
                    onAssign={() => { setSelectedModel(model); setShowAssignDialog(true); }}
                    onUnassign={handleUnassign}
                    onDelete={handleDelete}
                    deleting={deleting === model.id}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Personal Models */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-primary" />
            <CardTitle className="text-[15px]">Personal Models</CardTitle>
            <Badge variant="secondary" className="text-xs">{personalModels.length}</Badge>
          </div>
          <CardDescription className="text-[13px]">
            User-created models trained on individual writing styles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personalModels.length === 0 ? (
            <p className="text-sm text-text-tertiary py-4 text-center">No personal models yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[12px]">Name</TableHead>
                  <TableHead className="text-[12px]">Description</TableHead>
                  <TableHead className="text-[12px]">Training</TableHead>
                  <TableHead className="text-[12px]">Assigned To</TableHead>
                  <TableHead className="text-[12px] w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personalModels.map(model => (
                  <ModelRow
                    key={model.id}
                    model={model}
                    onAssign={() => { setSelectedModel(model); setShowAssignDialog(true); }}
                    onUnassign={handleUnassign}
                    onDelete={handleDelete}
                    deleting={deleting === model.id}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Writer Model</DialogTitle>
            <DialogDescription>
              Add a new AI writer model to Forge.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. RotoWire Voice, ESPN Style…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-desc">Description (optional)</Label>
              <Textarea
                id="model-desc"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Brief description of this writer's style…"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-subtle p-3">
              <div>
                <p className="text-sm font-medium text-text-primary">House Model</p>
                <p className="text-xs text-text-tertiary">Available to all users, not tied to one strategist</p>
              </div>
              <Switch checked={newIsHouse} onCheckedChange={setNewIsHouse} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
              >
                {saving ? 'Creating…' : 'Create Model'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>
              Set <strong>{selectedModel?.name}</strong> as a user's default writer model.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user…" />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.length === 0 && (
                    <SelectItem value="__none__" disabled>All users already assigned</SelectItem>
                  )}
                  {assignableUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || u.email}
                      {u.full_name && <span className="text-text-tertiary"> · {u.email}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowAssignDialog(false); setAssignUserId(''); }}>
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleAssign}
                disabled={saving || !assignUserId || assignUserId === '__none__'}
              >
                <UserPlus className="w-4 h-4" />
                {saving ? 'Assigning…' : 'Assign User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Model Row ─────────────────────────────────────────────────────────────
interface ModelRowProps {
  model: WriterModelWithAssignments;
  onAssign: () => void;
  onUnassign: (modelId: string, userId: string, userName: string) => void;
  onDelete: (model: WriterModelWithAssignments) => void;
  deleting: boolean;
}

function ModelRow({ model, onAssign, onUnassign, onDelete, deleting }: ModelRowProps) {
  const trainingCount = model.metadata?.total_training_pieces ?? 0;
  const description = model.metadata?.description;

  return (
    <TableRow>
      <TableCell className="font-medium text-[13px]">{model.name}</TableCell>
      <TableCell className="text-[13px] text-text-tertiary max-w-[180px] truncate">
        {description || <span className="italic opacity-50">No description</span>}
      </TableCell>
      <TableCell>
        <Badge
          variant={trainingCount >= 10 ? 'default' : 'secondary'}
          className="text-[11px]"
        >
          {trainingCount} pieces
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {model.assigned_users.length === 0 ? (
            <span className="text-[12px] text-text-tertiary italic">None</span>
          ) : (
            model.assigned_users.map(u => (
              <Badge key={u.id} variant="outline" className="text-[11px] gap-1 pr-1">
                {u.full_name || u.email.split('@')[0]}
                <button
                  onClick={() => onUnassign(model.id, u.id, u.full_name || u.email)}
                  className="ml-0.5 text-text-tertiary hover:text-destructive transition-colors"
                  title="Remove assignment"
                >
                  <UserMinus className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[12px] gap-1"
            onClick={onAssign}
            title="Assign to user"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(model)}
            disabled={deleting}
            title="Delete model"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
