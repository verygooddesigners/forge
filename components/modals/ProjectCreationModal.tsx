'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { WriterModel, Brief, Project } from '@/types';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';

interface ProjectCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onProjectCreated?: (project: Project) => void;
}

type Step = 'initial' | 'details' | 'model' | 'brief';

export function ProjectCreationModal({
  open,
  onOpenChange,
  userId,
  onProjectCreated,
}: ProjectCreationModalProps) {
  const [step, setStep] = useState<Step>('initial');
  const [action, setAction] = useState<'new' | 'existing' | null>(null);
  
  // Project details
  const [headline, setHeadline] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState('800');
  
  // Selections
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedBriefId, setSelectedBriefId] = useState('');
  
  // Available options
  const [writerModels, setWriterModels] = useState<WriterModel[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    // Load writer models
    const { data: models } = await supabase
      .from('writer_models')
      .select('*')
      .order('name');
    
    // Load briefs (shared or owned by user)
    const { data: briefsData } = await supabase
      .from('briefs')
      .select('*')
      .or(`is_shared.eq.true,created_by.eq.${userId}`)
      .order('name');
    
    // Load user's existing projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (models) setWriterModels(models);
    if (briefsData) setBriefs(briefsData);
    if (projects) setExistingProjects(projects);
  };

  const resetForm = () => {
    setStep('initial');
    setAction(null);
    setHeadline('');
    setPrimaryKeyword('');
    setSecondaryKeywords('');
    setTopic('');
    setWordCount('800');
    setSelectedModelId('');
    setSelectedBriefId('');
  };

  const handleInitial = (selectedAction: 'new' | 'existing') => {
    setAction(selectedAction);
    if (selectedAction === 'new') {
      setStep('details');
    } else {
      // Load existing project
      // For now, just close the modal
      onOpenChange(false);
    }
  };

  const handleDetailsNext = () => {
    if (!headline || !primaryKeyword) return;
    setStep('model');
  };

  const handleModelNext = () => {
    if (!selectedModelId) return;
    setStep('brief');
  };

  const handleCreateProject = async () => {
    if (!selectedBriefId || !selectedModelId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          headline,
          primary_keyword: primaryKeyword,
          secondary_keywords: secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
          topic: topic || null,
          word_count_target: parseInt(wordCount) || 800,
          writer_model_id: selectedModelId,
          brief_id: selectedBriefId,
          content: {},
        })
        .select()
        .single();

      if (!error && data) {
        onProjectCreated?.(data);
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'initial' && 'Get Started'}
            {step === 'details' && 'Project Details'}
            {step === 'model' && 'Choose Writer Model'}
            {step === 'brief' && 'Select Brief'}
          </DialogTitle>
          <DialogDescription>
            {step === 'initial' && 'Create a new project or open an existing one'}
            {step === 'details' && 'Enter the details for your new content project'}
            {step === 'model' && 'Select which writer model to use for this project'}
            {step === 'brief' && 'Choose a brief template to structure your content'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Initial Step */}
          {step === 'initial' && (
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => handleInitial('new')}
              >
                <FileText className="h-8 w-8" />
                <span className="text-base font-medium">New Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => handleInitial('existing')}
              >
                <FileText className="h-8 w-8" />
                <span className="text-base font-medium">Open Existing Project</span>
              </Button>
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  placeholder="Enter your story headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryKeyword">Primary Keyword *</Label>
                <Input
                  id="primaryKeyword"
                  placeholder="e.g., Baltimore Ravens"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryKeywords">Secondary Keywords</Label>
                <Input
                  id="secondaryKeywords"
                  placeholder="Comma-separated (e.g., NFL playoffs, AFC North)"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Textarea
                  id="topic"
                  placeholder="Brief description of what this content is about"
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordCount">Target Word Count</Label>
                <Input
                  id="wordCount"
                  type="number"
                  placeholder="800"
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Model Selection Step */}
          {step === 'model' && (
            <div className="space-y-4">
              <Label>Select Writer Model</Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a writer model" />
                </SelectTrigger>
                <SelectContent>
                  {writerModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                      {model.metadata?.total_training_pieces && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({model.metadata.total_training_pieces} pieces)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {writerModels.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No writer models available. Please create one in the Writer Factory.
                </p>
              )}
            </div>
          )}

          {/* Brief Selection Step */}
          {step === 'brief' && (
            <div className="space-y-4">
              <Label>Select Brief/Scaffold</Label>
              <Select value={selectedBriefId} onValueChange={setSelectedBriefId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a brief template" />
                </SelectTrigger>
                <SelectContent>
                  {briefs.map((brief) => (
                    <SelectItem key={brief.id} value={brief.id}>
                      {brief.name}
                      {brief.is_shared && (
                        <span className="text-xs text-muted-foreground ml-2">(Shared)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {briefs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No briefs available. Please create one in the Brief Builder.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 'details') setStep('initial');
              else if (step === 'model') setStep('details');
              else if (step === 'brief') setStep('model');
            }}
            disabled={step === 'initial'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={() => {
              if (step === 'details') handleDetailsNext();
              else if (step === 'model') handleModelNext();
              else if (step === 'brief') handleCreateProject();
            }}
            disabled={
              (step === 'details' && (!headline || !primaryKeyword)) ||
              (step === 'model' && !selectedModelId) ||
              (step === 'brief' && (!selectedBriefId || loading))
            }
          >
            {step === 'brief' ? (
              loading ? 'Creating...' : 'Start New Project'
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


