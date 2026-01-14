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
import { BookOpen, Plus, Save, Trash2, Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

interface SmartBriefPanelProps {
  user: User;
  onBack: () => void;
}

export function SmartBriefPanel({ user, onBack }: SmartBriefPanelProps) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [briefName, setBriefName] = useState('');
  const [briefContent, setBriefContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // AI Configuration fields
  const [aiInstructions, setAiInstructions] = useState('');
  const [exampleUrls, setExampleUrls] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadBriefs();
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

  const loadBriefs = async () => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBriefs(data);
    }
  };

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
        await loadBriefs();
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
        setBriefs([data, ...briefs]);
        setSelectedBrief(data);
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
      setBriefs(briefs.filter(b => b.id !== briefId));
      if (selectedBrief?.id === briefId) {
        resetForm();
      }
    }
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
  };

  const analyzeExampleUrls = async () => {
    const urls = exampleUrls.split('\n').map(u => u.trim()).filter(Boolean);
    
    if (urls.length === 0) return;

    if (!aiInstructions.trim()) {
      alert('Please add AI instructions first to provide context for the URL analysis');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/briefs/analyze-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, instructions: aiInstructions }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze URLs');
      }

      const result = await response.json();
      setUrlAnalysis(result.analysis);
    } catch (error: any) {
      console.error('Error analyzing URLs:', error);
      alert(error.message || 'Failed to analyze example URLs');
    } finally {
      setAnalyzing(false);
    }
  };

  const canEditBrief = (brief: Brief) => {
    return brief.created_by === user.id || user.role === 'admin';
  };

  return (
    <div className="flex gap-3 h-full">
      {/* SmartBriefs List Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">SmartBriefs</h2>
          <Button size="sm" variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <Button onClick={resetForm} size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New SmartBrief
        </Button>
        
        <Separator />
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {briefs.map((brief) => (
            <Card
              key={brief.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedBrief?.id === brief.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => canEditBrief(brief) && setSelectedBrief(brief)}
            >
              <CardHeader className="p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm line-clamp-2">{brief.name}</CardTitle>
                    {brief.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {brief.category.name}
                      </Badge>
                    )}
                  </div>
                  {brief.is_shared && (
                    <Badge variant="secondary" className="text-xs">Shared</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}

          {briefs.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No SmartBriefs yet.<br/>Click "New SmartBrief" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Main SmartBrief Editor */}
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-y-auto">
        {!selectedBrief && !briefName ? (
          // Welcome state
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <BookOpen className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">SmartBriefs</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Create smart AI-powered content templates with URL analysis and intelligent guidance
            </p>
            <Button onClick={resetForm} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New SmartBrief
            </Button>
          </div>
        ) : (
          // SmartBrief editor
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedBrief ? 'Edit SmartBrief' : 'Create New SmartBrief'}
                </h2>
                <div className="flex gap-2">
                  {selectedBrief && canEditBrief(selectedBrief) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBrief(selectedBrief.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  <Button onClick={saveBrief} disabled={loading || !briefName.trim()} size="sm">
                    <Save className="h-4 w-4 mr-2" />
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
                <h3 className="text-lg font-semibold">Scaffold</h3>
                <p className="text-sm text-muted-foreground">
                  Define your content structure. Add headings and other notes.
                </p>
              </div>
              
              <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '400px' }}>
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
                <h3 className="text-lg font-semibold">AI Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Use these instructions to convey anything else the AI should know before generating content.
                </p>
              </div>

              {/* Example */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Example:</p>
                <p className="text-sm text-muted-foreground">
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
                      Analyzing URLs...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Example URLs
                    </>
                  )}
                </Button>
                
                {urlAnalysis && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Analysis Complete
                  </div>
                )}
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
    </div>
  );
}
