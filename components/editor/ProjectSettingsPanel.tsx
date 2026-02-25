'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WriterModel, Brief, Project } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProjectSettingsPanelProps {
  projectId: string;
  writerModelId: string;
  userId: string;
  onSave?: () => void;
  onClose?: () => void;
}

export function ProjectSettingsPanel({
  projectId,
  writerModelId,
  userId,
  onSave,
  onClose,
}: ProjectSettingsPanelProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [writerModels, setWriterModels] = useState<WriterModel[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file_name, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [headline, setHeadline] = useState('');
  const [primary_keyword, setPrimaryKeyword] = useState('');
  const [secondary_keywords, setSecondaryKeywords] = useState<string[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedBriefId, setSelectedBriefId] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (proj) {
        setProject(proj as Project);
        setFileName(proj.file_name || '');
        setDescription(proj.description || '');
        setHeadline(proj.headline || '');
        setPrimaryKeyword(proj.primary_keyword || '');
        setSecondaryKeywords(Array.isArray(proj.secondary_keywords) ? proj.secondary_keywords : []);
        setSelectedModelId(proj.writer_model_id || '');
        setSelectedBriefId(proj.brief_id || '');
      }

      const { data: models } = await supabase
        .from('writer_models')
        .select('*')
        .or(`strategist_id.eq.${userId},is_house_model.eq.true`)
        .order('name');
      setWriterModels(models ?? []);

      const { data: briefsData } = await supabase
        .from('briefs')
        .select('*')
        .or(`is_shared.eq.true,created_by.eq.${userId}`)
        .order('name');
      setBriefs(briefsData ?? []);
      setLoading(false);
    }
    load();
  }, [projectId, userId, supabase]);

  const personalModels = writerModels.filter((m) => m.strategist_id === userId);
  const houseModels = writerModels.filter((m) => m.is_house_model);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('projects')
      .update({
        file_name: file_name.trim() || headline.trim(),
        description: description.trim() || null,
        headline: headline.trim(),
        primary_keyword: primary_keyword.trim(),
        secondary_keywords: secondary_keywords,
        writer_model_id: selectedModelId,
        brief_id: selectedBriefId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    setSaving(false);
    onSave?.();
    onClose?.();
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="w-80 max-h-[80vh] overflow-y-auto space-y-4 p-4">
      <h3 className="font-semibold text-sm text-text-primary">Project Settings</h3>
      <div className="space-y-2">
        <Label className="text-xs">Project name</Label>
        <Input
          value={file_name}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Project name"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Headline (H1)</Label>
        <Input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Article headline"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Primary keyword</Label>
        <Input
          value={primary_keyword}
          onChange={(e) => setPrimaryKeyword(e.target.value)}
          placeholder="Primary keyword"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Writer model</Label>
        <Select value={selectedModelId} onValueChange={setSelectedModelId}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {personalModels.length > 0 && (
              <SelectGroup>
                <SelectLabel>Your Model</SelectLabel>
                {personalModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {houseModels.length > 0 && (
              <SelectGroup>
                <SelectLabel>RotoWire Models</SelectLabel>
                {houseModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">SmartBrief</Label>
        <Select value={selectedBriefId} onValueChange={setSelectedBriefId}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select brief" />
          </SelectTrigger>
          <SelectContent>
            {briefs.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
                {b.is_shared ? ' (Shared)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          'Save changes'
        )}
      </Button>
    </div>
  );
}
