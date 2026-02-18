'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { Brief, Category, User } from '@/types';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { BookOpen, Plus, Save, Trash2, Sparkles, Loader2, CheckCircle2, ArrowLeft, HelpCircle, ExternalLink } from 'lucide-react';
import { SmartBriefListModal } from '@/components/modals/SmartBriefListModal';
import { toast } from 'sonner';

interface SmartBriefPanelProps {
  user: User;
  onBack: () => void;
}

export function SmartBriefPanel({ user, onBack }: SmartBriefPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [briefName, setBriefName] = useState('');
  const [briefContent, setBriefContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBriefListModal, setShowBriefListModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Track create mode
  
  // AI Configuration fields
  const [aiInstructions, setAiInstructions] = useState('');
  const [exampleUrls, setExampleUrls] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedBrief) {
      setBriefName(selectedBrief.name);
      setBriefContent(selectedBrief.content);
      setCategoryId(selectedBrief.category_id || '');
      setIsShared(selectedBrief.is_shared);
      
      const seoConfig = selectedBrief.seo_config as any;
      setAiInstructions(seoConfig?.ai_instructions || '');
      setExampleUrls(seoConfig?.example_urls?.join('\n') || '');
      setUrlAnalysis(seoConfig?.url_analysis || null);
    }
  }, [selectedBrief]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'brief')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const saveBrief = async () => {
    if (!briefName.trim()) return;

    setLoading(true);
    
    const urls = exampleUrls.split('\n').map(u => u.trim()).filter(Boolean);
    const seoConfig = {
      ai_instructions: aiInstructions.trim() || undefined,
      example_urls: urls.length > 0 ? urls : undefined,
      url_analysis: urlAnalysis || undefined,
    };
    
    if (selectedBrief) {
      const { error } = await supabase
        .from('briefs')
        .update({
          name: briefName,
          content: briefContent,
          category_id: categoryId || null,
          is_shared: isShared,
          seo_config: seoConfig,
        })
        .eq('id', selectedBrief.id);

      if (!error) {
        // Brief updated successfully
        toast.success('SmartBrief updated successfully!');
      }
    } else {
      const { data, error } = await supabase
        .from('briefs')
        .insert({
          name: briefName,
          content: briefContent || {},
          category_id: categoryId || null,
          is_shared: isShared,
          created_by: user.id,
          seo_config: seoConfig,
        })
        .select()
        .single();

      if (!error && data) {
        setSelectedBrief(data);
        toast.success('SmartBrief created successfully!');
      }
    }
    
    setLoading(false);
  };

  const deleteBrief = async (briefId: string) => {
    if (!confirm('Are you sure you want to delete this SmartBrief?')) return;

    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', briefId);

    if (!error) {
      resetForm();
      toast.success('SmartBrief deleted successfully!');
    }
  };

  const startNewBrief = () => {
    setSelectedBrief(null);
    setBriefName('');
    setBriefContent(null);
    setCategoryId('');
    setIsShared(false);
    setAiInstructions('');
    setExampleUrls('');
    setUrlAnalysis(null);
    setIsCreating(true);
  };

  const resetForm = () => {
    setSelectedBrief(null);
    setBriefName('');
    setBriefContent(null);
    setCategoryId('');
    setIsShared(false);
    setAiInstructions('');
    setExampleUrls('');
    setUrlAnalysis(null);
    setIsCreating(false);
  };

  const analyzeExampleUrls = async () => {
    console.log('[SmartBrief] Analyze button clicked');
    
    const urls = exampleUrls.split('\n').map(u => u.trim()).filter(Boolean);
    
    console.log('[SmartBrief] URLs to analyze:', urls);
    console.log('[SmartBrief] AI Instructions:', aiInstructions.substring(0, 50) + '...');
    
    if (urls.length === 0) {
      toast.warning('Please add at least one URL in the Training Stories field');
      return;
    }

    if (!aiInstructions.trim()) {
      toast.warning('Please add AI instructions first to provide context for the URL analysis');
      return;
    }

    setAnalyzing(true);
    try {
      console.log('[SmartBrief] Calling API...');
      const response = await fetch('/api/briefs/analyze-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, instructions: aiInstructions }),
      });

      console.log('[SmartBrief] API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze URLs');
      }

      const result = await response.json();
      console.log('[SmartBrief] Analysis complete, URLs analyzed:', result.urlsAnalyzed);
      setUrlAnalysis(result.analysis);
      toast.success(`Analysis complete! Analyzed ${result.urlsAnalyzed} of ${result.totalUrls} URLs.`);
    } catch (error: any) {
      console.error('[SmartBrief] Error analyzing URLs:', error);
      toast.error(error.message || 'Failed to analyze example URLs');
    } finally {
      setAnalyzing(false);
    }
  };

  const canEditBrief = (brief: Brief) => {
    return brief.created_by === user.id || user.role === 'admin';
  };

  return (
    <>
      <div className="flex-1 bg-bg-deepest overflow-y-auto">
        {!selectedBrief && !isCreating ? (
          // Welcome state - centered matching dark theme
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <h2 className="text-3xl font-bold text-accent-primary mb-2">SmartBriefs</h2>
            <p className="text-text-secondary max-w-md mb-6">
              Create smart AI-powered content templates
            </p>

            {/* Prominent Guide Callout */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-accent-primary rounded-xl p-6 mb-6 max-w-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent-primary rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    New to SmartBriefs?
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Learn how to create effective SmartBriefs with our comprehensive guide covering structure, 
                    AI configuration, examples, and best practices.
                  </p>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <a href="/smartbrief-guide" target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-4 w-4 mr-2" />
                      How to Create SmartBriefs
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <Button onClick={startNewBrief} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New SmartBrief
              </Button>
            </div>
            <button
              onClick={() => setShowBriefListModal(true)}
              className="text-accent-primary hover:underline text-sm"
            >
              Or browse existing SmartBriefs
            </button>
          </div>
        ) : (
          // SmartBrief editor
          <div className="px-8 py-6 space-y-8">
            {/* Guide Callout at Top of Editor */}
            {!selectedBrief && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-accent-primary rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent-primary rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary mb-1">
                      Need help creating your SmartBrief?
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Check out our step-by-step guide with examples and best practices
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href="/smartbrief-guide" target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Guide
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <div className="w-px h-5 bg-border-default" />
                  <h2 className="text-2xl font-bold">
                    {selectedBrief ? 'Edit SmartBrief' : 'Create New SmartBrief'}
                  </h2>
                </div>
                <div className="flex gap-3">
                  {selectedBrief && canEditBrief(selectedBrief) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteBrief(selectedBrief.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <Button onClick={saveBrief} disabled={loading || !briefName.trim()}>
                    <Save className="h-4 w-4" />
                    {selectedBrief ? 'Update' : 'Create'} SmartBrief
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="briefName">SmartBrief Name</Label>
                  <Input
                    id="briefName"
                    value={briefName}
                    onChange={(e) => setBriefName(e.target.value)}
                    placeholder="e.g., NFL Team Analysis Template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="flex gap-2">
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const name = prompt('New category name:');
                        if (name) {
                          supabase.from('categories').insert({ name, type: 'brief' }).select().single()
                            .then(({ data }) => {
                              if (data) {
                                setCategories([...categories, data]);
                                setCategoryId(data.id);
                              }
                            });
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shared"
                      checked={isShared}
                      onCheckedChange={setIsShared}
                    />
                    <Label htmlFor="shared" className="cursor-pointer text-sm">
                      Share with team
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Scaffold Section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Scaffold</h3>
                <p className="text-sm text-text-secondary">
                  Define your content structure. Add headings and other notes.
                </p>
              </div>
              
              <div className="border border-[#4a4a54] rounded-lg overflow-hidden bg-[#3a3a44]" style={{ height: '400px' }}>
                <TipTapEditor
                  content={briefContent}
                  onChange={setBriefContent}
                  placeholder="Create your SmartBrief structure here... Use headings, lists, and formatting to define your content scaffold."
                />
              </div>
            </div>

            <Separator />

            {/* AI Configuration Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">AI Configuration</h3>
                <p className="text-sm text-text-secondary">
                  Use these instructions to convey anything else the AI should know before generating content.
                </p>
              </div>

              {/* Example */}
              <div className="bg-bg-elevated border border-border-default rounded-lg p-4">
                <p className="text-sm font-semibold mb-2 text-text-primary">Example:</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Single Game Stories are focused on a single upcoming NFL game between two teams. They 
                  should include betting odds, game analysis, betting insights, current team performance 
                  summaries, and predictions. The tone should be conversational but authoritative.
                </p>
              </div>

              {/* Instructions Field */}
              <div className="space-y-2">
                <Label htmlFor="aiInstructions">Instructions</Label>
                <Textarea
                  id="aiInstructions"
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="Describe what kind of story this brief is, the tone, structure, and key information to include..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Training Stories / URLs */}
              <div className="space-y-2">
                <Label htmlFor="exampleUrls">Training Stories</Label>
                <p className="text-xs text-muted-foreground">
                  Enter URLs to example stories, one per line. The AI will analyze each and learn the style and formatting.
                </p>
                <Textarea
                  id="exampleUrls"
                  value={exampleUrls}
                  onChange={(e) => setExampleUrls(e.target.value)}
                  placeholder="https://www.rotowire.com/football/article/example-1&#10;https://www.rotowire.com/football/article/example-2"
                  rows={5}
                  className="resize-none font-mono text-sm"
                />
              </div>

              {/* Analyze Button */}
              <div className="space-y-3">
                {/* Helper text */}
                {(!aiInstructions.trim() || !exampleUrls.trim()) && (
                  <p className="text-xs text-text-tertiary">
                    💡 Fill in both Instructions and Training Stories fields above to enable analysis
                  </p>
                )}
                
                <div className="flex gap-3">
                  <Button
                    onClick={analyzeExampleUrls}
                    disabled={analyzing || !aiInstructions.trim() || !exampleUrls.trim()}
                    variant="secondary"
                    className="gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing URLs (this may take 30-60 seconds)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Example URLs
                      </>
                    )}
                  </Button>
                  
                  {urlAnalysis && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Analysis Complete
                    </div>
                  )}
                </div>
              </div>

              {/* URL Analysis Results */}
              {urlAnalysis && (
                <Alert className="border-green-600 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-900">
                    <strong>AI Analysis Results</strong>
                    <div className="mt-2 p-3 bg-white rounded border max-h-64 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap">{urlAnalysis}</pre>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SmartBrief List Modal */}
      <SmartBriefListModal
        open={showBriefListModal}
        onOpenChange={setShowBriefListModal}
        onSelectBrief={(brief) => {
          setSelectedBrief(brief);
          setIsCreating(true);
        }}
      />
    </>
  );
}
