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
import { ArrowLeft, ArrowRight, Plus, Check } from 'lucide-react';

interface ProjectCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onProjectCreated?: (project: Project) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function ProjectCreationModal({
  open,
  onOpenChange,
  userId,
  onProjectCreated,
}: ProjectCreationModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  // Project details
  const [projectName, setProjectName] = useState('');
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

    if (models) {
      setWriterModels(models);
      
      // Auto-select user's writer model if it exists
      const userModel = models.find(m => m.strategist_id === userId);
      if (userModel) {
        setSelectedModelId(userModel.id);
      }
    }
    if (briefsData) setBriefs(briefsData);
  };

  const resetForm = () => {
    setStep(1);
    setProjectName('');
    setHeadline('');
    setPrimaryKeyword('');
    setSecondaryKeywords('');
    setTopic('');
    setWordCount('800');
    setSelectedModelId('');
    setSelectedBriefId('');
    setSlideDirection('right');
  };

  const handleNext = () => {
    setSlideDirection('right');
    if (step < 9) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    setSlideDirection('left');
    if (step > 1) {
      setStep((step - 1) as Step);
    }
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

  const canProceed = () => {
    switch (step) {
      case 1: return projectName.trim() !== '';
      case 2: return headline.trim() !== '';
      case 3: return primaryKeyword.trim() !== '';
      case 4: return true; // Secondary keywords are optional
      case 5: return true; // Topic is optional
      case 6: return selectedModelId !== '';
      case 7: return selectedBriefId !== '';
      case 8: return wordCount !== '' && parseInt(wordCount) > 0;
      case 9: return true;
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Project Name';
      case 2: return 'Headline (H1)';
      case 3: return 'Primary Keyword';
      case 4: return 'Secondary Keywords';
      case 5: return 'Additional Details';
      case 6: return 'Writer Model';
      case 7: return 'Brief Template';
      case 8: return 'Word Count Target';
      case 9: return 'Confirmation';
      default: return '';
    }
  };

  const getTrainingPercentage = (model: WriterModel) => {
    const count = model.metadata?.total_training_pieces || 0;
    return Math.min(100, Math.round((count / 25) * 100));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            New Project - {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 9
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 min-h-[300px] relative overflow-hidden">
          <div 
            className={`transition-all duration-300 ease-in-out ${
              slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
            key={step}
          >
            {/* Step 1: Project Name */}
            {step === 1 && (
              <div className="space-y-4">
                <Label htmlFor="projectName">What is the name of your new project?</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Ravens Playoff Analysis"
                  className="form-field-bottom-line"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Headline */}
            {step === 2 && (
              <div className="space-y-4">
                <Label htmlFor="headline">What is the H1 for your content?</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Baltimore Ravens Playoff Chances 2024"
                  className="form-field-bottom-line"
                  autoFocus
                />
              </div>
            )}

            {/* Step 3: Primary Keyword */}
            {step === 3 && (
              <div className="space-y-4">
                <Label htmlFor="primaryKeyword">What is the primary keyword?</Label>
                <Input
                  id="primaryKeyword"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="e.g., Baltimore Ravens playoffs"
                  className="form-field-bottom-line"
                  autoFocus
                />
              </div>
            )}

            {/* Step 4: Secondary Keywords */}
            {step === 4 && (
              <div className="space-y-4">
                <Label htmlFor="secondaryKeywords">What are the secondary keywords? (Separate each with a comma)</Label>
                <Textarea
                  id="secondaryKeywords"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="e.g., AFC North, NFL playoffs, playoff seeding"
                  rows={3}
                  className="form-field-bottom-line"
                  autoFocus
                />
              </div>
            )}

            {/* Step 5: Additional Details */}
            {step === 5 && (
              <div className="space-y-4">
                <Label htmlFor="topic">Write any more details about the content you want the Writing Engine to take into consideration</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Additional context, angle, or requirements..."
                  rows={4}
                  className="form-field-bottom-line"
                  autoFocus
                />
              </div>
            )}

            {/* Step 6: Writer Model */}
            {step === 6 && (
              <div className="space-y-4">
                <Label>Choose your writer model</Label>
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a writer model" />
                  </SelectTrigger>
                  <SelectContent>
                    {writerModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({getTrainingPercentage(model)}% trained)
                          </span>
                        </div>
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

            {/* Step 7: Brief Chooser */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Choose a brief template</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // TODO: Open brief builder modal
                      alert('Brief builder integration coming soon');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Brief
                  </Button>
                </div>
                <Select value={selectedBriefId} onValueChange={setSelectedBriefId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brief template" />
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

            {/* Step 8: Word Count */}
            {step === 8 && (
              <div className="space-y-4">
                <Label htmlFor="wordCount">How many words should the story be?</Label>
                <Input
                  id="wordCount"
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  placeholder="800"
                  min="100"
                  className="form-field-bottom-line"
                  autoFocus
                />
              </div>
            )}

            {/* Step 9: Confirmation */}
            {step === 9 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Please confirm your project details:</h3>
                <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Project Name:</span>
                    <p className="font-medium">{projectName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Headline:</span>
                    <p className="font-medium">{headline}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Primary Keyword:</span>
                    <p className="font-medium">{primaryKeyword}</p>
                  </div>
                  {secondaryKeywords && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Secondary Keywords:</span>
                      <p className="font-medium">{secondaryKeywords}</p>
                    </div>
                  )}
                  {topic && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Additional Details:</span>
                      <p className="font-medium">{topic}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Writer Model:</span>
                    <p className="font-medium">
                      {writerModels.find(m => m.id === selectedModelId)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Brief:</span>
                    <p className="font-medium">
                      {briefs.find(b => b.id === selectedBriefId)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Target Word Count:</span>
                    <p className="font-medium">{wordCount} words</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 9 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateProject}
              disabled={loading || !canProceed()}
            >
              {loading ? 'Creating...' : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Start Project
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
