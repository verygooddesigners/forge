'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { Save, Plus, Edit, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AIHelperAdminProps {
  adminUser: User;
}

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AssistantSettings {
  system_prompt: string;
  temperature: number;
  model: string;
  max_tokens: number;
  use_web: boolean;
}

export function AIHelperAdmin({ adminUser }: AIHelperAdminProps) {
  const [activeTab, setActiveTab] = useState<'qa' | 'tuning'>('qa');
  const [qaEntries, setQaEntries] = useState<QAEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Q/A Form State
  const [editingEntry, setEditingEntry] = useState<QAEntry | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newTags, setNewTags] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Tuning State
  const [settings, setSettings] = useState<AssistantSettings>({
    system_prompt: '',
    temperature: 0.7,
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    use_web: false,
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadQAEntries(), loadSettings()]);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const loadQAEntries = async () => {
    const { data, error } = await supabase
      .from('ai_helper_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQaEntries(data);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('ai_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'assistant_system_prompt',
        'assistant_temperature',
        'assistant_model',
        'assistant_max_tokens',
        'assistant_use_web'
      ]);

    if (data) {
      const settingsMap = new Map(data.map(s => [s.setting_key, s.setting_value]));
      setSettings({
        system_prompt: settingsMap.get('assistant_system_prompt') || 
          'You are an AI assistant for Forge, a content creation platform. Help users understand features, troubleshoot issues, and learn best practices.',
        temperature: parseFloat(settingsMap.get('assistant_temperature') || '0.7'),
        model: settingsMap.get('assistant_model') || 'claude-sonnet-4-20250514',
        max_tokens: parseInt(settingsMap.get('assistant_max_tokens') || '2000'),
        use_web: settingsMap.get('assistant_use_web') === 'true',
      });
    }
  };

  const handleSaveQA = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setMessage({ type: 'error', text: 'Question and answer are required' });
      return;
    }

    setSaving(true);
    try {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      
      if (editingEntry) {
        // Update existing
        const { error } = await supabase
          .from('ai_helper_entries')
          .update({
            question: newQuestion,
            answer: newAnswer,
            tags,
            updated_by: adminUser.id,
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Entry updated successfully' });
      } else {
        // Create new
        const { error } = await supabase
          .from('ai_helper_entries')
          .insert({
            question: newQuestion,
            answer: newAnswer,
            tags,
            is_active: true,
            created_by: adminUser.id,
            updated_by: adminUser.id,
          });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Entry created successfully' });
      }

      // Reset form
      setNewQuestion('');
      setNewAnswer('');
      setNewTags('');
      setEditingEntry(null);
      setShowForm(false);
      
      // Reload entries
      await loadQAEntries();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving Q/A:', error);
      setMessage({ type: 'error', text: 'Failed to save entry' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditQA = (entry: QAEntry) => {
    setEditingEntry(entry);
    setNewQuestion(entry.question);
    setNewAnswer(entry.answer);
    setNewTags(entry.tags.join(', '));
    setShowForm(true);
  };

  const handleDeleteQA = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('ai_helper_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Entry deleted successfully' });
      await loadQAEntries();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setMessage({ type: 'error', text: 'Failed to delete entry' });
    }
  };

  const handleToggleActive = async (entry: QAEntry) => {
    try {
      const { error } = await supabase
        .from('ai_helper_entries')
        .update({ is_active: !entry.is_active, updated_by: adminUser.id })
        .eq('id', entry.id);

      if (error) throw error;
      await loadQAEntries();
    } catch (error) {
      console.error('Error toggling entry:', error);
      setMessage({ type: 'error', text: 'Failed to toggle entry' });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { setting_key: 'assistant_system_prompt', setting_value: settings.system_prompt },
        { setting_key: 'assistant_temperature', setting_value: settings.temperature.toString() },
        { setting_key: 'assistant_model', setting_value: settings.model },
        { setting_key: 'assistant_max_tokens', setting_value: settings.max_tokens.toString() },
        { setting_key: 'assistant_use_web', setting_value: settings.use_web.toString() },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('ai_settings')
          .upsert({
            ...setting,
            updated_by: adminUser.id,
          }, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Helper Bot</CardTitle>
        <CardDescription>
          Manage Q/A entries and configure the AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'qa' | 'tuning')}>
          <TabsList className="mb-6">
            <TabsTrigger value="qa">Q/A Library</TabsTrigger>
            <TabsTrigger value="tuning">AI Tuning</TabsTrigger>
          </TabsList>

          <TabsContent value="qa" className="space-y-4">
            {!showForm ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    {qaEntries.length} total entries
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Q/A Entry
                  </Button>
                </div>

                <div className="space-y-3">
                  {qaEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border rounded-lg p-4 bg-bg-surface"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{entry.question}</h4>
                            {!entry.is_active && (
                              <Badge variant="outline" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mb-2">{entry.answer}</p>
                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={entry.is_active}
                            onCheckedChange={() => handleToggleActive(entry)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQA(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQA(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingEntry ? 'Edit Q/A Entry' : 'New Q/A Entry'}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEntry(null);
                      setNewQuestion('');
                      setNewAnswer('');
                      setNewTags('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="What is this feature for?"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Detailed answer..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="features, troubleshooting, seo"
                      className="mt-2"
                    />
                  </div>

                  <Button onClick={handleSaveQA} disabled={saving} className="w-full">
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingEntry ? 'Update Entry' : 'Create Entry'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tuning" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={settings.system_prompt}
                  onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                  rows={8}
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Temperature: {settings.temperature.toFixed(2)}</Label>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower = more focused, Higher = more creative
                  </p>
                </div>

                <div>
                  <Label>Max Tokens: {settings.max_tokens}</Label>
                  <Slider
                    value={[settings.max_tokens]}
                    onValueChange={([value]) => setSettings({ ...settings, max_tokens: value })}
                    min={500}
                    max={4000}
                    step={100}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum response length
                  </p>
                </div>
              </div>

              <div>
                <Label>Model</Label>
                <Select
                  value={settings.model}
                  onValueChange={(value) => setSettings({ ...settings, model: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                    <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label htmlFor="use-web">Enable Web Search (Tavily)</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Use external web search to enhance responses
                  </p>
                </div>
                <Switch
                  id="use-web"
                  checked={settings.use_web}
                  onCheckedChange={(checked) => setSettings({ ...settings, use_web: checked })}
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
