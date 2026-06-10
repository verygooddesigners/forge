'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Globe, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamEntry {
  name: string;
  sport: string;
  league: string;
}

interface NewsSite {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string;
  cities: string[];
  default_sports: string[];
  default_teams: TeamEntry[];
  logo_url?: string;
  is_active: boolean;
}

const EMPTY_SITE: Omit<NewsSite, 'id' | 'is_active'> = {
  name: '',
  slug: '',
  state: '',
  state_code: '',
  cities: [],
  default_sports: [],
  default_teams: [],
};

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <label className="text-xs font-medium text-text-secondary mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent-muted text-accent-primary"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="hover:opacity-70"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder || 'Type and press Enter'}
          className="text-sm h-8"
        />
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-8 shrink-0">
          Add
        </Button>
      </div>
    </div>
  );
}

function TeamsInput({
  teams,
  onChange,
}: {
  teams: TeamEntry[];
  onChange: (t: TeamEntry[]) => void;
}) {
  const [draft, setDraft] = useState<TeamEntry>({ name: '', sport: '', league: '' });

  const add = () => {
    if (draft.name.trim()) {
      onChange([...teams, { ...draft, name: draft.name.trim() }]);
      setDraft({ name: '', sport: '', league: '' });
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-text-secondary mb-1 block">Default Teams</label>
      <div className="space-y-1 mb-2">
        {teams.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-bg-elevated">
            <span className="font-medium flex-1">{t.name}</span>
            <span className="text-text-tertiary">{t.sport}</span>
            <span className="text-text-tertiary">{t.league}</span>
            <button
              type="button"
              onClick={() => onChange(teams.filter((_, idx) => idx !== i))}
              className="text-text-tertiary hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
        <Input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="Team name"
          className="text-xs h-8"
        />
        <Input
          value={draft.sport}
          onChange={(e) => setDraft((d) => ({ ...d, sport: e.target.value }))}
          placeholder="Sport (e.g. Football)"
          className="text-xs h-8"
        />
        <Input
          value={draft.league}
          onChange={(e) => setDraft((d) => ({ ...d, league: e.target.value }))}
          placeholder="League (e.g. NFL)"
          className="text-xs h-8"
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={add} className="h-8 w-full">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Team
      </Button>
    </div>
  );
}

function SiteForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<NewsSite>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_SITE, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, val: any) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.state || !form.state_code) {
      setError('Name, slug, state, and state code are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, id: (initial as any).id });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">Site Name</label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="BetCarolina" className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">Slug</label>
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="bet-carolina" className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">State</label>
          <Input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="North Carolina" className="text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">State Code</label>
          <Input value={form.state_code} onChange={(e) => set('state_code', e.target.value.toUpperCase().slice(0, 2))} placeholder="NC" className="text-sm" maxLength={2} />
        </div>
      </div>

      <TagInput label="Cities" values={form.cities} onChange={(v) => set('cities', v)} placeholder="Charlotte, Raleigh..." />
      <TagInput label="Default Sports" values={form.default_sports} onChange={(v) => set('default_sports', v)} placeholder="NFL, NBA, NCAA Football..." />
      <TeamsInput teams={form.default_teams} onChange={(v) => set('default_teams', v)} />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
          Save Site
        </Button>
      </div>
    </form>
  );
}

export function NewsSitesAdmin() {
  const [sites, setSites] = useState<NewsSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<NewsSite> | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news-sites');
      const json = await res.json();
      setSites(json.sites || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (data: any) => {
    const isNew = !data.id;
    const res = await fetch('/api/admin/news-sites', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Save failed');
    }
    setEditing(null);
    setCreating(false);
    await load();
  };

  const deleteSite = async (id: string) => {
    if (!confirm('Delete this site? This cannot be undone.')) return;
    setDeleting(id);
    await fetch(`/api/admin/news-sites?id=${id}`, { method: 'DELETE' });
    setDeleting(null);
    await load();
  };

  const toggleActive = async (site: NewsSite) => {
    await fetch('/api/admin/news-sites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: site.id, is_active: !site.is_active }),
    });
    await load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">News Sites</h2>
          <p className="text-sm text-text-secondary mt-0.5">Manage local betting sites for News Forge</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Site
        </Button>
      </div>

      {creating && (
        <div className="border border-border-subtle rounded-xl p-4 bg-bg-elevated">
          <h3 className="text-sm font-medium text-text-primary mb-4">New Site</h3>
          <SiteForm initial={{}} onSave={save} onCancel={() => setCreating(false)} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No news sites configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) =>
            editing?.id === site.id ? (
              <div key={site.id} className="border border-accent-primary/30 rounded-xl p-4 bg-bg-elevated">
                <h3 className="text-sm font-medium text-text-primary mb-4">Edit: {site.name}</h3>
                <SiteForm initial={site} onSave={save} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div
                key={site.id}
                className="border border-border-subtle rounded-xl p-4 bg-bg-surface flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary text-sm">{site.name}</span>
                    <span className="text-[10px] font-mono text-text-tertiary bg-bg-elevated px-1.5 py-0.5 rounded">
                      {site.slug}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        site.is_active
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-bg-elevated text-text-tertiary'
                      }`}
                    >
                      {site.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {site.state} ({site.state_code})
                  </p>
                  {site.cities.length > 0 && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      Cities: {site.cities.join(', ')}
                    </p>
                  )}
                  {site.default_sports.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {site.default_sports.map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-muted text-accent-primary">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {site.default_teams.length > 0 && (
                    <p className="text-xs text-text-tertiary mt-1">
                      {site.default_teams.length} team{site.default_teams.length !== 1 ? 's' : ''} configured
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(site)}
                    className="text-xs h-7 px-2"
                  >
                    {site.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(site)}
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSite(site.id)}
                    disabled={deleting === site.id}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {deleting === site.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
