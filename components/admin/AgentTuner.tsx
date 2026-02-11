'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AgentConfig, AgentKey } from '@/lib/agents/types';

interface AgentTunerProps {
  adminUser: User;
}

const AGENT_TABS = [
  { key: 'content_generation', label: 'Content' },
  { key: 'writer_training', label: 'Writer' },
  { key: 'seo_optimization', label: 'SEO' },
  { key: 'quality_assurance', label: 'QA' },
  { key: 'persona_tone', label: 'Persona' },
  { key: 'creative_features', label: 'Creative' },
  { key: 'visual_extraction', label: 'Visual' },
  { key: 'fact_verification', label: 'Fact Check' },
] as const;

export function AgentTuner({ adminUser }: AgentTunerProps) {
  const [agents, setAgents] = useState<Record<string, AgentConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentKey>('content_generation');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if user is super admin
  const isSuperAdmin = adminUser.email === 'jeremy.botter@gmail.com' || adminUser.email === 'jeremy.botter@gdcgroup.com';

  useEffect(() => {
    if (isSuperAdmin) {
      loadAgents();
    }
  }, [isSuperAdmin]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agents');
      if (!response.ok) throw new Error('Failed to load agents');
      
      const data = await response.json();
      const agentsMap = data.agents.reduce((acc: Record<string, AgentConfig>, agent: AgentConfig) => {
        acc[agent.agentKey] = agent;
        return acc;
      }, {});
      
      setAgents(agentsMap);
    } catch (error) {
      console.error('Error loading agents:', error);
      setMessage({ type: 'error', text: 'Failed to load agent configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (agentKey: AgentKey) => {
    try {
      setSaving(true);
      const agent = agents[agentKey];
      
      const response = await fetch(`/api/admin/agents/${agentKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent),
      });
      
      if (!response.ok) throw new Error('Failed to save agent');
      
      const data = await response.json();
      setAgents(prev => ({ ...prev, [agentKey]: data.agent }));
      setMessage({ type: 'success', text: `${agent.displayName} saved successfully` });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving agent:', error);
      setMessage({ type: 'error', text: 'Failed to save agent configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (agentKey: AgentKey) => {
    if (!confirm('Are you sure you want to reset this agent to default configuration?')) {
      return;
    }
    
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/agents/${agentKey}/reset`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to reset agent');
      
      const data = await response.json();
      setAgents(prev => ({ ...prev, [agentKey]: data.agent }));
      setMessage({ type: 'success', text: `Agent reset to defaults` });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error resetting agent:', error);
      setMessage({ type: 'error', text: 'Failed to reset agent' });
    } finally {
      setSaving(false);
    }
  };

  const updateAgent = (agentKey: AgentKey, updates: Partial<AgentConfig>) => {
    setAgents(prev => ({
      ...prev,
      [agentKey]: { ...prev[agentKey], ...updates },
    }));
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Configuration</CardTitle>
          <CardDescription>Access Restricted</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This section is only accessible to super administrators.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    );
  }

  const currentAgent = agents[selectedAgent];

  if (!currentAgent) {
    return (
      <Card>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load agent configuration</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Configuration</CardTitle>
        <CardDescription>
          Configure system prompts, parameters, and guardrails for each agent
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

        <Tabs value={selectedAgent} onValueChange={(v) => setSelectedAgent(v as AgentKey)}>
          <TabsList className="grid grid-cols-7 w-full mb-6">
            {AGENT_TABS.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {AGENT_TABS.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentAgent.displayName}</h3>
                  <p className="text-sm text-gray-500">{currentAgent.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enabled-${tab.key}`}>Enabled</Label>
                  <Switch
                    id={`enabled-${tab.key}`}
                    checked={currentAgent.enabled}
                    onCheckedChange={(checked) => updateAgent(tab.key, { enabled: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`prompt-${tab.key}`}>System Instructions</Label>
                  <Textarea
                    id={`prompt-${tab.key}`}
                    value={currentAgent.systemPrompt}
                    onChange={(e) => updateAgent(tab.key, { systemPrompt: e.target.value })}
                    rows={12}
                    className="mt-2 font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Temperature: {currentAgent.temperature.toFixed(2)}</Label>
                    <Slider
                      value={[currentAgent.temperature]}
                      onValueChange={([value]) => updateAgent(tab.key, { temperature: value })}
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
                    <Label>Max Tokens: {currentAgent.maxTokens}</Label>
                    <Slider
                      value={[currentAgent.maxTokens]}
                      onValueChange={([value]) => updateAgent(tab.key, { maxTokens: value })}
                      min={500}
                      max={8000}
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
                    value={currentAgent.model}
                    onValueChange={(value) => updateAgent(tab.key, { model: value })}
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

                <div>
                  <Label>Guardrails</Label>
                  <div className="mt-2 space-y-2 border rounded-lg p-4">
                    {currentAgent.guardrails.map((guardrail, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`guardrail-${tab.key}-${index}`}
                          checked={true}
                          disabled
                        />
                        <label
                          htmlFor={`guardrail-${tab.key}-${index}`}
                          className="text-sm text-gray-600 capitalize"
                        >
                          {guardrail.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special config for QA agent */}
                {tab.key === 'quality_assurance' && currentAgent.specialConfig && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">LanguageTool Settings</h4>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-languagetool">Use LanguageTool</Label>
                      <Switch
                        id="use-languagetool"
                        checked={currentAgent.specialConfig.useLanguageTool ?? true}
                        onCheckedChange={(checked) =>
                          updateAgent(tab.key, {
                            specialConfig: { ...currentAgent.specialConfig, useLanguageTool: checked },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>LanguageTool Strictness</Label>
                      <Select
                        value={currentAgent.specialConfig.languageToolStrictness ?? 'standard'}
                        onValueChange={(value) =>
                          updateAgent(tab.key, {
                            specialConfig: { ...currentAgent.specialConfig, languageToolStrictness: value },
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Special config for Visual Extraction agent */}
                {tab.key === 'visual_extraction' && currentAgent.specialConfig && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Vision & Fallback Settings</h4>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-fallback">Enable GPT-4o Fallback</Label>
                      <Switch
                        id="enable-fallback"
                        checked={currentAgent.specialConfig.enableFallback ?? true}
                        onCheckedChange={(checked) =>
                          updateAgent(tab.key, {
                            specialConfig: { ...currentAgent.specialConfig, enableFallback: checked },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>
                        Confidence Threshold: {(currentAgent.specialConfig.confidenceThreshold ?? 0.85).toFixed(2)}
                      </Label>
                      <Slider
                        value={[currentAgent.specialConfig.confidenceThreshold ?? 0.85]}
                        onValueChange={([value]) =>
                          updateAgent(tab.key, {
                            specialConfig: { ...currentAgent.specialConfig, confidenceThreshold: value },
                          })
                        }
                        min={0.5}
                        max={1}
                        step={0.05}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Fallback Trigger</Label>
                      <Select
                        value={currentAgent.specialConfig.fallbackTrigger ?? 'both'}
                        onValueChange={(value) =>
                          updateAgent(tab.key, {
                            specialConfig: { ...currentAgent.specialConfig, fallbackTrigger: value },
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lowConfidence">Low Confidence Only</SelectItem>
                          <SelectItem value="denseText">Dense Text Only</SelectItem>
                          <SelectItem value="both">Both Conditions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleReset(tab.key)}
                  disabled={saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
                <Button
                  onClick={() => handleSave(tab.key)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

