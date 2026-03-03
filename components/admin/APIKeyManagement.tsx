'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface APIKeyManagementProps {
  adminUser: User;
}

interface ServiceConfig {
  key: string;
  label: string;
  description: string;
  placeholder: string;
}

const API_SERVICES: ServiceConfig[] = [
  {
    key: 'claude_api_key',
    label: 'Anthropic API Key',
    description: 'Powers all AI content generation, agents, and style analysis. Get yours at console.anthropic.com.',
    placeholder: 'sk-ant-api03-…',
  },
  {
    key: 'tavily_api_key',
    label: 'Tavily API Key',
    description: 'Powers the NewsEngine search feature.',
    placeholder: 'tvly-…',
  },
  {
    key: 'openai_api_key',
    label: 'OpenAI API Key',
    description: 'Used for embeddings (writer model training).',
    placeholder: 'sk-…',
  },
];

export function APIKeyManagement({ adminUser: _adminUser }: APIKeyManagementProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [masked, setMasked] = useState<Record<string, string>>({});
  const [updatedAt, setUpdatedAt] = useState<Record<string, string | null>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Load masked values on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) throw new Error('Failed to load settings');
        const json = await res.json();
        const maskedMap: Record<string, string> = {};
        const updatedAtMap: Record<string, string | null> = {};
        for (const [key, val] of Object.entries(json.settings as Record<string, { masked: string; updatedAt: string | null }>)) {
          maskedMap[key] = val.masked;
          updatedAtMap[key] = val.updatedAt;
        }
        setMasked(maskedMap);
        setUpdatedAt(updatedAtMap);
      } catch {
        toast.error('Could not load current API key status.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const toggleVisibility = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  const handleSave = async (key: string) => {
    const value = inputs[key]?.trim();
    if (!value) {
      toast.error('Please enter a key value before saving.');
      return;
    }

    setSaving(s => ({ ...s, [key]: true }));
    setSaved(s => ({ ...s, [key]: false }));

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');

      setMasked(m => ({ ...m, [key]: json.masked }));
      setUpdatedAt(u => ({ ...u, [key]: new Date().toISOString() }));
      setInputs(i => ({ ...i, [key]: '' }));
      setSaved(s => ({ ...s, [key]: true }));
      toast.success('API key saved successfully.');

      // Clear the "saved" checkmark after 3s
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save API key.');
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  function formatUpdatedAt(iso: string | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return '';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
        <CardDescription>
          Update API keys for external services. Enter a new value and click Save — only the key you change will be updated. Current keys are shown masked for security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {loading ? (
          <div className="flex items-center gap-2 text-text-secondary text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading current key status…
          </div>
        ) : (
          API_SERVICES.map((service) => (
            <div key={service.key} className="space-y-2">
              <div>
                <Label htmlFor={service.key} className="text-sm font-semibold">
                  {service.label}
                </Label>
                <p className="text-xs text-text-muted mt-0.5">{service.description}</p>
              </div>

              {/* Current key status */}
              {masked[service.key] ? (
                <div className="flex items-center gap-2 text-xs text-text-secondary font-mono bg-bg-surface border border-border-subtle rounded-md px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span>{masked[service.key]}</span>
                  {updatedAt[service.key] && (
                    <span className="ml-auto text-text-muted non-mono text-[11px]">
                      Updated {formatUpdatedAt(updatedAt[service.key])}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-text-muted italic px-1">No key saved — enter a new key below.</div>
              )}

              {/* New key input */}
              <div className="flex gap-2">
                <Input
                  id={service.key}
                  type={visible[service.key] ? 'text' : 'password'}
                  value={inputs[service.key] || ''}
                  onChange={(e) => setInputs(i => ({ ...i, [service.key]: e.target.value }))}
                  placeholder={masked[service.key] ? `Enter new key to replace current` : service.placeholder}
                  className="font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave(service.key)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleVisibility(service.key)}
                  title={visible[service.key] ? 'Hide' : 'Show'}
                >
                  {visible[service.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => handleSave(service.key)}
                  disabled={saving[service.key] || !inputs[service.key]?.trim()}
                  className="shrink-0"
                >
                  {saving[service.key] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : saved[service.key] ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving[service.key] ? 'Saving…' : saved[service.key] ? 'Saved!' : 'Save'}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
