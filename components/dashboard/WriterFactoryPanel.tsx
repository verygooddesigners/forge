'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WriterFactoryPanelProps {
  user: User;
}

interface WriterModel {
  id: string;
  name: string;
  strategist_id: string;
  created_by: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface TrainingContent {
  id: string;
  model_id: string;
  content: string;
  analyzed_style: any;
  created_at: string;
}

export function WriterFactoryPanel({ user }: WriterFactoryPanelProps) {
  const [models, setModels] = useState<WriterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<WriterModel | null>(null);
  const [trainingContent, setTrainingContent] = useState<TrainingContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [trainingText, setTrainingText] = useState('');
  const [trainingUrl, setTrainingUrl] = useState('');
  const [training, setTraining] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadTrainingContent(selectedModel.id);
    }
  }, [selectedModel]);

  const loadModels = async () => {
    const { data } = await supabase
      .from('writer_models')
      .select('*')
      .order('name');

    if (data) {
      console.log('[WRITER_FACTORY_PANEL] Loaded models:', data.map(m => ({
        name: m.name,
        id: m.id,
        training_count: m.metadata?.total_training_pieces || 0
      })));
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0]);
      }
    }
  };

  const loadTrainingContent = async (modelId: string) => {
    const { data } = await supabase
      .from('training_content')
      .select('*')
      .eq('model_id', modelId)
      .order('created_at', { ascending: false });

    if (data) {
      setTrainingContent(data);
    }
  };

  const extractContentFromUrl = async () => {
    if (!trainingUrl.trim()) return;

    setExtracting(true);
    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trainingUrl.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const extractedContent = data.content || '';

        if (extractedContent.trim()) {
          setTrainingText(extractedContent);
          setTrainingUrl('');
          toast.success('Content extracted successfully');
        } else {
          toast.warning('No content could be extracted from that URL. Please try copy/pasting the text manually.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to extract content from URL. Please try copy/pasting the text manually.');
      }
    } catch (error) {
      console.error('URL extraction error:', error);
      toast.error('Failed to extract content from URL. Please try copy/pasting the text manually.');
    } finally {
      setExtracting(false);
    }
  };

  const createModel = async () => {
    if (!newModelName.trim()) return;

    setCreating(true);
    const { data, error } = await supabase
      .from('writer_models')
      .insert({
        name: newModelName,
        strategist_id: user.id,
        created_by: user.id,
        metadata: {},
      })
      .select()
      .single();

    if (!error && data) {
      setModels([...models, data]);
      setSelectedModel(data);
      setNewModelName('');
    }
    setCreating(false);
  };

  const addTrainingStory = async () => {
    if (!trainingText.trim() || !selectedModel) return;

    setTraining(true);
    try {
      const response = await fetch('/api/writer-models/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          content: trainingText,
        }),
      });

      if (response.ok) {
        await loadTrainingContent(selectedModel.id);
        await loadModels(); // Reload models to update badge counts
        setTrainingText('');
        toast.success('Training story added successfully!');
      } else {
        throw new Error('Failed to add training story');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setTraining(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const trainingProgress = trainingContent.length;
  const trainingPercent = Math.round((trainingContent.length / 25) * 100);

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Models List Sidebar */}
      <div className="w-80 bg-bg-deep border-r border-border-subtle flex flex-col">
        <div className="p-5 border-b border-border-subtle">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search writer models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-[13px]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filteredModels.map((model) => {
            const modelTrainingCount = model.metadata?.total_training_pieces || 0;
            const modelTrainingPercent = Math.round((modelTrainingCount / 25) * 100);
            
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-lg mb-1 transition-all ${
                  selectedModel?.id === model.id
                    ? 'bg-bg-surface border border-border-hover'
                    : 'hover:bg-bg-surface'
                }`}
              >
                <div className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center font-bold text-sm ${
                  modelTrainingCount >= 25
                    ? 'bg-gradient-to-br from-accent-primary to-accent-dark text-white'
                    : 'bg-bg-hover text-text-tertiary'
                }`}>
                  {getInitials(model.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">{model.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {modelTrainingCount >= 25 ? (
                      <Badge variant="success" className="text-[10px]">Trained</Badge>
                    ) : modelTrainingCount > 0 ? (
                      <Badge variant="warning" className="text-[10px]">{modelTrainingPercent}% Trained</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Untrained</Badge>
                    )}
                    <span className="text-[11px] text-text-tertiary">{modelTrainingCount} / 25</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add Model Button */}
        <div className="p-3">
          {newModelName ? (
            <div className="flex gap-2">
              <Input
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Writer name..."
                className="flex-1"
                autoFocus
              />
              <Button onClick={createModel} disabled={creating} size="sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              </Button>
              <Button onClick={() => setNewModelName('')} variant="ghost" size="sm">×</Button>
            </div>
          ) : (
            <button
              onClick={() => setNewModelName('New Writer')}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border-default rounded-lg text-text-tertiary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-muted transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Writer Model
            </button>
          )}
        </div>
      </div>

      {/* Training Panel */}
      <div className="flex-1 overflow-y-auto bg-bg-deepest p-8">
        {!selectedModel ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-text-muted" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Writer Factory</h2>
            <p className="text-text-secondary max-w-md">
              Train AI models on specific writing styles. Select a writer model to get started.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Writer Profile Header */}
            <div className="flex items-start gap-5 mb-8 pb-8 border-b border-border-subtle">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center font-bold text-[28px] text-white flex-shrink-0">
                {getInitials(selectedModel.name)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary mb-2">{selectedModel.name}</h1>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-success">{trainingPercent}%</span>
                    <span className="text-[13px] text-text-tertiary">Trained</span>
                  </div>
                  <div className="w-px h-6 bg-border-default" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono">{trainingContent.length}</span>
                    <span className="text-[13px] text-text-tertiary">Stories</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Progress */}
            <Card className="p-6 mb-6 hover:translate-y-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-primary">Training Progress</span>
                <span className="text-sm font-semibold font-mono text-accent-primary">{trainingContent.length} / 25 stories</span>
              </div>
              <div className="h-2 bg-bg-hover rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-hover rounded-full transition-all duration-300"
                  style={{ width: `${trainingPercent}%` }}
                />
              </div>
              <p className="text-xs text-text-tertiary">
                {trainingContent.length >= 25 
                  ? 'Model fully trained. Add more stories to improve voice accuracy.' 
                  : `Add ${25 - trainingContent.length} more stories to complete training.`}
              </p>
            </Card>

            {/* Add Training Story */}
            <Card className="p-6 mb-6 hover:translate-y-0">
              <h3 className="text-base font-semibold text-text-primary mb-4">Add Training Story</h3>
              
              {/* URL Extraction */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Extract from URL (Optional)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/article"
                    value={trainingUrl}
                    onChange={(e) => setTrainingUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && extractContentFromUrl()}
                    disabled={extracting}
                    className="flex-1"
                  />
                  <Button
                    onClick={extractContentFromUrl}
                    disabled={extracting || !trainingUrl.trim()}
                    variant="secondary"
                  >
                    {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extract'}
                  </Button>
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  Paste a URL to automatically extract the article content
                </p>
              </div>

              {/* Manual Content Entry */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Article Content
                </label>
                <Textarea
                  value={trainingText}
                  onChange={(e) => setTrainingText(e.target.value)}
                  placeholder="Or paste an article written in this writer's style..."
                  rows={8}
                  disabled={extracting}
                />
              </div>

              <Button 
                onClick={addTrainingStory} 
                disabled={training || !trainingText.trim() || extracting}
                className="w-full"
              >
                {training ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Style...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Story
                  </>
                )}
              </Button>
            </Card>

            {/* Training Stories Grid */}
            {trainingContent.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-4">Training Stories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {trainingContent.map((story) => (
                    <Card key={story.id} className="p-4 hover:translate-y-0">
                      <p className="text-[13px] font-medium text-text-primary line-clamp-2 mb-2">
                        {story.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-text-tertiary">
                          {story.content.length} chars
                        </span>
                        <div className="w-2 h-2 rounded-full bg-success" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
