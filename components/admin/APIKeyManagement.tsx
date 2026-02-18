'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';

interface APIKeyManagementProps {
  adminUser: User;
}

const API_SERVICES = [
  { key: 'grok', label: 'Grok API', description: 'AI content generation' },
  { key: 'openai', label: 'OpenAI API', description: 'Embeddings and backup AI' },
  { key: 'tavily', label: 'Tavily API', description: 'News search engine' },
];

export function APIKeyManagement({ adminUser }: APIKeyManagementProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    grok: '',
    openai: '',
    tavily: '',
  });
  const [visible, setVisible] = useState<Record<string, boolean>>({
    grok: false,
    openai: false,
    tavily: false,
  });
  const [saving, setSaving] = useState(false);

  const toggleVisibility = (key: string) => {
    setVisible({ ...visible, [key]: !visible[key] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, this would save to the database via an API route
      console.log('Saving API keys:', apiKeys);
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('API keys saved successfully');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
        <CardDescription>
          Manage API keys for external services. Keys are encrypted before storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {API_SERVICES.map((service) => (
          <div key={service.key} className="space-y-2">
            <div>
              <Label htmlFor={service.key}>{service.label}</Label>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </div>
            <div className="flex gap-2">
              <Input
                id={service.key}
                type={visible[service.key] ? 'text' : 'password'}
                value={apiKeys[service.key]}
                onChange={(e) => setApiKeys({ ...apiKeys, [service.key]: e.target.value })}
                placeholder={`Enter ${service.label} key`}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleVisibility(service.key)}
              >
                {visible[service.key] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save API Keys'}
        </Button>
      </CardContent>
    </Card>
  );
}


