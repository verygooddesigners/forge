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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { WriterModel, User } from '@/types';
import { Plus, Sparkles, Trash2, BookOpen, CheckCircle2 } from 'lucide-react';

interface WriterFactoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const MAX_TRAINING_STORIES = 25;

function calculateTrainingPercentage(trainingCount: number): number {
  return Math.min(100, Math.round((trainingCount / MAX_TRAINING_STORIES) * 100));
}

export function WriterFactoryModal({ open, onOpenChange, user }: WriterFactoryModalProps) {
  const [writerModels, setWriterModels] = useState<WriterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<WriterModel | null>(null);
  const [newModelName, setNewModelName] = useState('');
  const [trainingContent, setTrainingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [trainingPercentage, setTrainingPercentage] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      loadWriterModels();
    }
  }, [open]);

  useEffect(() => {
    if (selectedModel) {
      const count = selectedModel.metadata?.total_training_pieces || 0;
      setTrainingPercentage(calculateTrainingPercentage(count));
    }
  }, [selectedModel]);

  const loadWriterModels = async () => {
    const { data, error } = await supabase
      .from('writer_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWriterModels(data);
      // Update selected model if it exists
      if (selectedModel) {
        const updated = data.find(m => m.id === selectedModel.id);
        if (updated) {
          setSelectedModel(updated);
          const count = updated.metadata?.total_training_pieces || 0;
          setTrainingPercentage(calculateTrainingPercentage(count));
        }
      }
    }
  };

  const refreshSelectedModel = async (modelId: string) => {
    const { data, error } = await supabase
      .from('writer_models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (!error && data) {
      setSelectedModel(data);
      const count = data.metadata?.total_training_pieces || 0;
      setTrainingPercentage(calculateTrainingPercentage(count));
      return data;
    }
    return null;
  };

  const canEditModel = (model: WriterModel) => {
    if (user.role === 'admin') return true;
    return model.strategist_id === user.id;
  };

  const createModel = async () => {
    if (!newModelName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('writer_models')
      .insert({
        name: newModelName,
        created_by: user.id,
        strategist_id: user.role === 'admin' ? null : user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setWriterModels([data, ...writerModels]);
      setNewModelName('');
    }
    setLoading(false);
  };

  const addTrainingContent = async () => {
    if (!selectedModel || !trainingContent.trim()) return;

    setLoading(true);
    setShowSuccess(false);
    
    // Store the content temporarily
    const contentToSubmit = trainingContent;
    
    // Clear the textarea immediately (optimistic update)
    setTrainingContent('');
    
    try {
      // Generate embedding and analyze style via API
      const response = await fetch('/api/writer-models/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          content: contentToSubmit,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh the selected model with updated data
        const updatedModel = await refreshSelectedModel(selectedModel.id);
        
        if (updatedModel) {
          // Reload all models to update the sidebar badges
          await loadWriterModels();
          
          // Show success notification
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        }
      } else {
        // If there was an error, restore the content
        setTrainingContent(contentToSubmit);
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Unknown error';
        console.error('Training error:', errorData);
        alert(`Failed to add training content: ${errorMessage}`);
      }
    } catch (error) {
      // If there was an error, restore the content
      setTrainingContent(contentToSubmit);
      console.error('Error adding training content:', error);
      alert('Failed to add training content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this writer model?')) return;

    const { error } = await supabase
      .from('writer_models')
      .delete()
      .eq('id', modelId);

    if (!error) {
      setWriterModels(writerModels.filter(m => m.id !== modelId));
      if (selectedModel?.id === modelId) {
        setSelectedModel(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[70vw] !w-[70vw] sm:!max-w-[70vw] max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Writer Factory
          </DialogTitle>
          <DialogDescription>
            Create and train AI writer models that emulate specific writing styles
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r flex flex-col">
            {/* Create New Model Section */}
            {user.role === 'admin' && (
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <Input
                    placeholder="Model name (e.g., Jeremy Botter)"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createModel()}
                    className="flex-1"
                  />
                  <Button onClick={createModel} disabled={loading || !newModelName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Models List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {writerModels.map((model) => {
                const editable = canEditModel(model);
                const trainingCount = model.metadata?.total_training_pieces || 0;
                const percentage = calculateTrainingPercentage(trainingCount);
                
                return (
                  <Card
                    key={model.id}
                    className={`cursor-pointer transition-all ${
                      selectedModel?.id === model.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    } ${!editable ? 'opacity-50' : ''}`}
                    onClick={() => editable && setSelectedModel(model)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">{model.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={
                                percentage === 100 ? 'default' : 
                                percentage >= 50 ? 'secondary' : 
                                'outline'
                              }
                              className="text-xs"
                            >
                              {percentage}% Trained
                            </Badge>
                            {!editable && <Badge variant="outline" className="text-xs">Locked</Badge>}
                          </div>
                          <CardDescription className="text-xs mt-1">
                            {trainingCount} / {MAX_TRAINING_STORIES} stories
                          </CardDescription>
                        </div>
                        {user.role === 'admin' && editable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteModel(model.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}

              {writerModels.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No writer models yet</p>
                  {user.role === 'admin' && (
                    <p className="text-xs mt-1">Create your first model above</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedModel ? (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Model Info Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedModel.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Training this writer model with example content
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={trainingPercentage === 100 ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {trainingPercentage}% Trained
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Training Progress</span>
                          <span className="font-medium">
                            {selectedModel.metadata?.total_training_pieces || 0} / {MAX_TRAINING_STORIES} stories
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              trainingPercentage === 100 ? 'bg-green-500' :
                              trainingPercentage >= 50 ? 'bg-primary' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${trainingPercentage}%` }}
                          />
                        </div>
                        {trainingPercentage < 100 && (
                          <p className="text-xs text-muted-foreground">
                            Add {MAX_TRAINING_STORIES - (selectedModel.metadata?.total_training_pieces || 0)} more stories to reach 100% training
                          </p>
                        )}
                        {trainingPercentage === 100 && (
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Model is fully trained and ready to use!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Success Notification */}
                  {showSuccess && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              Training content added successfully!
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              Model is now {trainingPercentage}% trained ({selectedModel.metadata?.total_training_pieces || 0} / {MAX_TRAINING_STORIES} stories)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Training Input Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Add Training Content</CardTitle>
                      <CardDescription>
                        Paste a complete article or content piece to train this writer model. The AI will analyze the style, tone, and voice.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="training-content">Article Content</Label>
                        <Textarea
                          id="training-content"
                          placeholder="Paste the complete article or content here..."
                          rows={15}
                          value={trainingContent}
                          onChange={(e) => setTrainingContent(e.target.value)}
                          className="resize-none font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={addTrainingContent}
                        disabled={loading || !trainingContent.trim()}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing & Training...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Training Content
                          </>
                        )}
                      </Button>
                      {trainingContent.trim() && (
                        <p className="text-xs text-muted-foreground text-center">
                          {trainingContent.split(/\s+/).length} words • Ready to train
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold">Select a Writer Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a writer model from the sidebar to start training it with example content.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


