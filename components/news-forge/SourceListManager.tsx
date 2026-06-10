'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListPlus, Plus, Check, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SourceList {
  id: string;
  name: string;
  items: { id: string }[];
}

interface SourceListManagerProps {
  source: {
    url: string;
    title: string;
    source_domain: string;
    trust_score: number;
  };
}

export function SourceListManager({ source }: SourceListManagerProps) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<SourceList[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news-forge/source-lists');
      const json = await res.json();
      setLists(json.lists || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadLists();
  }, [open, loadLists]);

  const addToList = async (listId: string) => {
    setSaving(listId);
    try {
      await fetch('/api/news-forge/source-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_item',
          list_id: listId,
          url: source.url,
          title: source.title,
          source_domain: source.source_domain,
          trust_score: source.trust_score,
        }),
      });
      setSaved((s) => new Set([...s, listId]));
    } finally {
      setSaving(null);
    }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving('new');
    try {
      const res = await fetch('/api/news-forge/source-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_list', list_name: name }),
      });
      const json = await res.json();
      if (json.list) {
        await addToList(json.list.id);
        setNewName('');
        await loadLists();
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="Save to list"
          className="p-0.5 rounded text-text-tertiary hover:text-accent-primary hover:bg-accent-muted transition-colors"
        >
          <ListPlus className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs font-semibold text-text-primary mb-2">Save to list</p>
        <p className="text-[11px] text-text-tertiary mb-3 truncate">{source.title}</p>

        {loading ? (
          <div className="flex items-center gap-2 text-text-secondary text-xs py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading lists...
          </div>
        ) : (
          <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
            {lists.length === 0 ? (
              <p className="text-xs text-text-tertiary">No lists yet. Create one below.</p>
            ) : (
              lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => addToList(list.id)}
                  disabled={saving === list.id || saved.has(list.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors disabled:opacity-60"
                >
                  <span className="truncate flex-1 text-left">{list.name}</span>
                  <span className="text-text-tertiary ml-2 shrink-0">
                    {saved.has(list.id) ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : saving === list.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="text-[10px]">{list.items?.length ?? 0}</span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="border-t border-border-subtle pt-2.5">
          <p className="text-[10px] text-text-tertiary mb-1.5">Create new list</p>
          <div className="flex gap-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
              placeholder="List name..."
              className="text-xs h-7 flex-1"
            />
            <Button
              size="sm"
              onClick={createAndAdd}
              disabled={!newName.trim() || saving === 'new'}
              className="h-7 w-7 p-0 shrink-0"
            >
              {saving === 'new' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
