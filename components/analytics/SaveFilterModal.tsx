'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { FilterConfig } from '@/types/analytics';

interface SaveFilterModalProps {
  open: boolean;
  onClose: () => void;
  filterConfig: FilterConfig;
  onSaved: () => void;
}

export function SaveFilterModal({ open, onClose, filterConfig, onSaved }: SaveFilterModalProps) {
  const [name, setName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for this filter');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/analytics/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), filter_config: filterConfig, is_shared: isShared }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Filter saved');
      setName('');
      setIsShared(false);
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save filter');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Filter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filter Name</Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 2026 Overview"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share-toggle">Share with team</Label>
              <p className="text-xs text-text-tertiary">Others can load this filter via a link</p>
            </div>
            <Switch id="share-toggle" checked={isShared} onCheckedChange={setIsShared} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Filter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
