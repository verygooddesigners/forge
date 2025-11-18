'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Save } from 'lucide-react';

interface AITunerProps {
  adminUser: User;
}

export function AITuner({ adminUser }: AITunerProps) {
  const [masterInstructions, setMasterInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadMasterInstructions();
  }, []);

  const loadMasterInstructions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('setting_value')
        .eq('setting_key', 'master_instructions')
        .single();

      if (!error && data) {
        setMasterInstructions(data.setting_value);
      }
    } catch (error) {
      console.error('Error loading master instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMasterInstructions = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          setting_key: 'master_instructions',
          setting_value: masterInstructions,
          updated_by: adminUser.id,
        });

      if (!error) {
        alert('Master instructions saved successfully');
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error saving master instructions:', error);
      alert('Failed to save master instructions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Tuner</CardTitle>
        <CardDescription>
          Configure master instructions that apply to all AI-generated content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="masterInstructions">Master Instructions</Label>
          <Textarea
            id="masterInstructions"
            rows={12}
            value={masterInstructions}
            onChange={(e) => setMasterInstructions(e.target.value)}
            placeholder="Enter global instructions that will be applied to all AI content generation..."
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            These instructions will be included in every content generation request.
            Use them to define tone, style guidelines, and quality standards.
          </p>
        </div>

        <Button onClick={saveMasterInstructions} disabled={saving || loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Master Instructions'}
        </Button>
      </CardContent>
    </Card>
  );
}


