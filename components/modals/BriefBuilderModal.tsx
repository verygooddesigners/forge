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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Brief, Category, User } from '@/types';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { BookOpen, Plus, Save, Trash2, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface BriefBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function BriefBuilderModal({ open, onOpenChange, user }: BriefBuilderModalProps) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [briefName, setBriefName] = useState('');
  const [briefContent, setBriefContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [isShared, setIsShared] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  // AI Configuration fields
  const [aiInstructions, setAiInstructions] = useState('');
  const [exampleUrls, setExampleUrls] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      loadBriefs();
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (selectedBrief) {
      setBriefName(selectedBrief.name);
      setBriefContent(selectedBrief.content);
      setCategoryId(selectedBrief.category_id || '');
      setIsShared(selectedBrief.is_shared);
      
      // Load AI configuration if exists
      const seoConfig = selectedBrief.seo_config as any;
      setAiInstructions(seoConfig?.ai_instructions || '');
      setExampleUrls(seoConfig?.example_urls?.join('\n') || '');
      setUrlAnalysis(seoConfig?.url_analysis || null);
    }
  }, [selectedBrief]);

  useEffect(() => {
    // #region agent log
    console.log('[DEBUG H3,H4] Categories state CHANGED', {categoriesCount:categories.length,categories:categories.map(c=>({id:c.id,name:c.name}))});
    fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:57',message:'Categories state CHANGED',data:{categoriesCount:categories.length,categories:categories.map(c=>({id:c.id,name:c.name}))},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3,H4'})}).catch(()=>{});
    // #endregion
  }, [categories]);

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

  const createCategory = async () => {
    // #region agent log
    console.log('[DEBUG H1] createCategory ENTRY', {newCategoryValue:newCategory,trimmed:newCategory.trim(),willReturn:!newCategory.trim()});
    fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:82',message:'createCategory ENTRY',data:{newCategoryValue:newCategory,trimmed:newCategory.trim(),willReturn:!newCategory.trim()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!newCategory.trim()) return;

    // #region agent log
    console.log('[DEBUG H2] BEFORE database insert', {newCategory:newCategory,categoriesCount:categories.length,categoriesNames:categories.map(c=>c.name)});
    fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:84',message:'BEFORE database insert',data:{newCategory:newCategory,categoriesCount:categories.length,categoriesNames:categories.map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategory, type: 'brief' })
      .select()
      .single();

    // #region agent log
    console.log('[DEBUG H2,H5] AFTER database insert', {hasError:!!error,errorDetails:error,hasData:!!data,dataValue:data,dataId:data?.id});
    fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:88',message:'AFTER database insert',data:{hasError:!!error,errorDetails:error,hasData:!!data,dataValue:data,dataId:data?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2,H5'})}).catch(()=>{});
    // #endregion

    if (!error && data) {
      // #region agent log
      console.log('[DEBUG H3] BEFORE state update', {oldCategoriesCount:categories.length,oldCategories:categories.map(c=>({id:c.id,name:c.name})),newCategoryData:data});
      fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:90',message:'BEFORE state update',data:{oldCategoriesCount:categories.length,oldCategories:categories.map(c=>({id:c.id,name:c.name})),newCategoryData:data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      setCategories([...categories, data]);
      setCategoryId(data.id);
      setNewCategory('');
      // #region agent log
      console.log('[DEBUG H3] AFTER state update called', {setCategoriesTotalCount:categories.length+1,newCategoryId:data.id});
      fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:93',message:'AFTER state update called',data:{setCategoriesTotalCount:categories.length+1,newCategoryId:data.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      console.log('[DEBUG H2] ERROR BRANCH - insert failed', {error:error});
      fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:95',message:'ERROR BRANCH - insert failed',data:{error:error},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
    }
  };

  const saveBrief = async () => {
    if (!briefName.trim()) return;

    setLoading(true);
    
    // Build SEO config with AI instructions and URL analysis
    const urls = exampleUrls.split('\n').map(u => u.trim()).filter(Boolean);
    const seoConfig = {
      ai_instructions: aiInstructions.trim() || undefined,
      example_urls: urls.length > 0 ? urls : undefined,
      url_analysis: urlAnalysis || undefined,
    };
    
    if (selectedBrief) {
      // Update existing brief
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
      // Create new brief
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

  const canEditBrief = (brief: Brief) => {
    return brief.created_by === user.id || user.role === 'admin';
  };

  const analyzeExampleUrls = async () => {
    const urls = exampleUrls.split('\n').map(u => u.trim()).filter(Boolean);
    
    if (urls.length === 0) {
      return;
    }

    if (!aiInstructions.trim()) {
      alert('Please add AI instructions first to provide context for the URL analysis');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/briefs/analyze-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          instructions: aiInstructions,
        }),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[70vw] !w-[70vw] sm:!max-w-[70vw] max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            SmartBrief Builder
          </DialogTitle>
          <DialogDescription>
            Create AI-powered content templates with URL analysis and intelligent guidance
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Briefs List */}
          <div className="w-64 flex flex-col gap-2 overflow-auto">
            <Button onClick={resetForm} size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New SmartBrief
            </Button>
            
            <div className="space-y-2">
              {briefs.map((brief) => (
                <Card
                  key={brief.id}
                  className={`cursor-pointer transition-colors ${
                    selectedBrief?.id === brief.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => canEditBrief(brief) && setSelectedBrief(brief)}
                >
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{brief.name}</CardTitle>
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
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No SmartBriefs yet
                </div>
              )}
            </div>
          </div>

          {/* Brief Editor */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                        // #region agent log
                        console.log('[DEBUG H1] Plus button clicked', {promptedName:name,hasName:!!name,currentNewCategoryState:newCategory});
                        fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:257',message:'Plus button clicked',data:{promptedName:name,hasName:!!name,currentNewCategoryState:newCategory},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
                        // #endregion
                        if (name) {
                          setNewCategory(name);
                          // #region agent log
                          console.log('[DEBUG H1] AFTER setNewCategory, BEFORE setTimeout', {nameSetTo:name,newCategoryStateStillOldValue:newCategory});
                          fetch('http://127.0.0.1:7242/ingest/a7ae02f6-4005-4442-b7e1-ec88bbaf3f7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BriefBuilderModal.tsx:259',message:'AFTER setNewCategory, BEFORE setTimeout',data:{nameSetTo:name,newCategoryStateStillOldValue:newCategory},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
                          // #endregion
                          setTimeout(() => createCategory(), 0);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shared"
                    checked={isShared}
                    onCheckedChange={setIsShared}
                  />
                  <Label htmlFor="shared" className="cursor-pointer">
                    Share with other strategists
                  </Label>
                </div>

                <div className="flex gap-2">
                  {selectedBrief && canEditBrief(selectedBrief) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBrief(selectedBrief.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete SmartBrief
                    </Button>
                  )}
                  <Button onClick={saveBrief} disabled={loading || !briefName.trim()} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {selectedBrief ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs for Content Template and AI Configuration */}
            <Tabs defaultValue="template" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full">
                <TabsTrigger value="template" className="flex-1">Content Template</TabsTrigger>
                <TabsTrigger value="ai-config" className="flex-1">AI Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="template" className="flex-1 overflow-hidden mt-4">
                <div className="h-full border rounded-lg overflow-hidden bg-white">
                  <TipTapEditor
                    content={briefContent}
                onChange={setBriefContent}
                placeholder="Create your SmartBrief structure here... Use headings, lists, and formatting to define your content scaffold."
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="ai-config" className="flex-1 overflow-y-auto mt-4 space-y-4">
                {/* AI Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="aiInstructions">
                    AI Instructions <span className="text-muted-foreground">(What is this brief about?)</span>
                  </Label>
                  <Textarea
                    id="aiInstructions"
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder="e.g., NFL Picks: Single Game stories are focused on a single upcoming NFL game. They should include odds analysis, betting insights, and predictions with a conversational but authoritative tone."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe the story type, tone, structure, and key information that should be included when generating content for this SmartBrief.
                  </p>
                </div>

                {/* Example URLs */}
                <div className="space-y-2">
                  <Label htmlFor="exampleUrls">
                    Example URLs <span className="text-muted-foreground">(One per line)</span>
                  </Label>
                  <Textarea
                    id="exampleUrls"
                    value={exampleUrls}
                    onChange={(e) => setExampleUrls(e.target.value)}
                    placeholder="https://www.rotowire.com/football/article/nfl-picks-texans-vs-steelers-nfl-playoffs-best-bets-102538&#10;https://www.rotowire.com/football/article/another-example-article-12345"
                    rows={5}
                    className="resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste URLs to similar articles. The AI will analyze these examples to understand the formatting, style, and structure for this SmartBrief type.
                  </p>
                </div>

                {/* Analyze Button */}
                <div>
                  <Button
                    onClick={analyzeExampleUrls}
                    disabled={analyzing || !aiInstructions.trim() || !exampleUrls.trim()}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Click to have the AI agent visit the URLs and extract formatting, structure, and style patterns.
                  </p>
                </div>

                {/* URL Analysis Results */}
                {urlAnalysis && (
                  <Alert className="border-green-600 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-900">
                      <strong>Analysis Complete</strong>
                      <div className="mt-2 p-3 bg-white rounded border max-h-64 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap">{urlAnalysis}</pre>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


