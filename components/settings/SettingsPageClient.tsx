'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bell, Palette, Zap, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPageClientProps {
  user: User;
}

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveDelay, setAutoSaveDelay] = useState('2');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Settings would be saved to a user_settings table or preferences field
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Customize your Forge experience</p>
        </div>

        <div className="space-y-6">
          {/* Editor Settings */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Zap className="h-5 w-5 text-accent-primary" />
                Editor Preferences
              </CardTitle>
              <CardDescription className="text-text-secondary">Configure how the editor behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-save */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save" className="text-text-primary">Auto-save</Label>
                  <p className="text-sm text-text-secondary">
                    Automatically save your work while you type
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              {/* Auto-save Delay */}
              {autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="auto-save-delay" className="text-text-primary">Auto-save Delay</Label>
                  <Select value={autoSaveDelay} onValueChange={setAutoSaveDelay}>
                    <SelectTrigger id="auto-save-delay" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="2">2 seconds (recommended)</SelectItem>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-text-tertiary">
                    How long to wait after you stop typing before saving
                  </p>
                </div>
              )}

              {/* Word Count Display */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-text-primary">Show Word Count</Label>
                  <p className="text-sm text-text-secondary">
                    Display word count in the editor toolbar
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Bell className="h-5 w-5 text-accent-primary" />
                Notifications
              </CardTitle>
              <CardDescription className="text-text-secondary">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-text-primary">Email Notifications</Label>
                  <p className="text-sm text-text-secondary">
                    Receive updates about your projects and team activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-text-primary">Content Generation Complete</Label>
                  <p className="text-sm text-text-secondary">
                    Notify when AI finishes generating content
                  </p>
                </div>
                <Switch checked={false} disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-text-primary">SEO Score Alerts</Label>
                  <p className="text-sm text-text-secondary">
                    Alert when SEO score falls below threshold
                  </p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Palette className="h-5 w-5 text-accent-primary" />
                Appearance
              </CardTitle>
              <CardDescription className="text-text-secondary">Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-text-primary">Theme</Label>
                <Select value="dark" disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark (Current)</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-tertiary">
                  Theme customization coming soon
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-text-primary">Editor Font Size</Label>
                <Select value="medium" disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
