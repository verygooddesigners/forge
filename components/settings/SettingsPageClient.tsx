'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Sparkles,
  PenTool,
  Bell,
  Download,
  Eye,
  Type,
  Palette,
  Globe,
  Lock,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface SettingsPageClientProps {
  user: User;
}

interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  defaultWordCount: number;
  editorFontSize: 'sm' | 'md' | 'lg';
  spellCheck: boolean;
  autoSave: boolean;
  notifySharedProjects: boolean;
  notifyTeamActivity: boolean;
  exportFormat: 'html' | 'markdown' | 'plain';
  showWordCount: boolean;
  showSeoScore: boolean;
  compactProjectCards: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  defaultWordCount: 800,
  editorFontSize: 'md',
  spellCheck: true,
  autoSave: true,
  notifySharedProjects: true,
  notifyTeamActivity: false,
  exportFormat: 'html',
  showWordCount: true,
  showSeoScore: true,
  compactProjectCards: false,
};

const SETTINGS_KEY = 'forge-user-settings';

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, []);

  const set = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      // Apply theme immediately
      if (settings.theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }

      toast.success('Settings saved');
      setDirty(false);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const SettingRow = ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex-1 pr-8">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
              <p className="text-text-secondary mt-1">Customize your Forge experience</p>
            </div>
            {dirty && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">

          {/* Appearance */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-text-primary text-base">
                <Palette className="h-4 w-4 text-accent-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border-subtle">
              <SettingRow
                label="Theme"
                description="Choose your preferred color scheme"
              >
                <Select value={settings.theme} onValueChange={(v) => set('theme', v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                label="Compact Project Cards"
                description="Show smaller project cards in the Projects browser"
              >
                <Switch
                  checked={settings.compactProjectCards}
                  onCheckedChange={(v) => set('compactProjectCards', v)}
                />
              </SettingRow>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-text-primary text-base">
                <Type className="h-4 w-4 text-accent-primary" />
                Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border-subtle">
              <SettingRow
                label="Font Size"
                description="Text size inside the content editor"
              >
                <Select value={settings.editorFontSize} onValueChange={(v) => set('editorFontSize', v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                label="Spell Check"
                description="Underline misspelled words in the editor"
              >
                <Switch
                  checked={settings.spellCheck}
                  onCheckedChange={(v) => set('spellCheck', v)}
                />
              </SettingRow>
              <SettingRow
                label="Auto-Save"
                description="Automatically save changes every 30 seconds"
              >
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(v) => set('autoSave', v)}
                />
              </SettingRow>
              <SettingRow
                label="Show Word Count"
                description="Display live word count in the editor toolbar"
              >
                <Switch
                  checked={settings.showWordCount}
                  onCheckedChange={(v) => set('showWordCount', v)}
                />
              </SettingRow>
              <SettingRow
                label="Show SEO Score"
                description="Display live SEO score indicator while writing"
              >
                <Switch
                  checked={settings.showSeoScore}
                  onCheckedChange={(v) => set('showSeoScore', v)}
                />
              </SettingRow>
            </CardContent>
          </Card>

          {/* Content Defaults */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-text-primary text-base">
                <Zap className="h-4 w-4 text-accent-primary" />
                Content Defaults
              </CardTitle>
              <CardDescription className="text-text-secondary text-sm">
                Default values when creating new projects
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border-subtle">
              <SettingRow
                label="Default Word Count Target"
                description="Pre-filled word count when creating a new project"
              >
                <Select
                  value={String(settings.defaultWordCount)}
                  onValueChange={(v) => set('defaultWordCount', Number(v))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[300, 500, 800, 1000, 1200, 1500, 2000, 2500, 3000].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n.toLocaleString()} words
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>

          {/* Export Preferences */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-text-primary text-base">
                <Download className="h-4 w-4 text-accent-primary" />
                Export Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border-subtle">
              <SettingRow
                label="Default Export Format"
                description="Format used when exporting content via the Export modal"
              >
                <Select value={settings.exportFormat} onValueChange={(v) => set('exportFormat', v as any)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="plain">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-text-primary text-base">
                <Bell className="h-4 w-4 text-accent-primary" />
                Notifications
              </CardTitle>
              <CardDescription className="text-text-secondary text-sm">
                In-app notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border-subtle">
              <SettingRow
                label="Shared Project Alerts"
                description="Notify me when someone shares a project with the team"
              >
                <Switch
                  checked={settings.notifySharedProjects}
                  onCheckedChange={(v) => set('notifySharedProjects', v)}
                />
              </SettingRow>
              <SettingRow
                label="Team Activity"
                description="Notify me about new team member actions (content created, briefs added)"
              >
                <Switch
                  checked={settings.notifyTeamActivity}
                  onCheckedChange={(v) => set('notifyTeamActivity', v)}
                />
              </SettingRow>
            </CardContent>
          </Card>

          {/* Writer Model */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-text-primary text-base">
                <PenTool className="h-4 w-4 text-accent-primary" />
                Writer Model
              </CardTitle>
              <CardDescription className="text-text-secondary text-sm">
                Train your personal AI writer model to match your writing style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                The Writer Factory lets you train an AI model on your writing style by providing sample content.
                The more samples you provide, the better the model will match your voice and tone.
              </p>
              <Button onClick={() => router.push('/writer-factory')} variant="outline" className="gap-2">
                <PenTool className="h-4 w-4" />
                Open Writer Factory
              </Button>
            </CardContent>
          </Card>

          {/* Save */}
          {dirty && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="px-8">
                {saving ? 'Saving...' : 'Save All Settings'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
