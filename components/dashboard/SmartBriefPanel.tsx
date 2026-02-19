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
import { BookOpen, Plus, Save, Trash2, Sparkles, Loader2, CheckCircle2, ArrowLeft, HelpCircle, ExternalLink, Search, ArrowUpDown, Users2, FileText } from 'lucide-react';
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
  const [isCreating, setIsCreating] = useState(false); // Track create mode

  // Description field for the editor
  const [briefDescription, setBriefDescription] = useState('');

  // Browser state
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<Brief[]>([]);
  const [browserLoading, setBrowserLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'last_modified' | 'date_created' | 'alpha_az' | 'alpha_za'>('last_modified');
  
  // AI Configuration fields
  const [aiInstructions, setAiInstructions] = useState('');
  const [exampleUrls, setExampleUrls] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    loadCategories();
    loadBriefs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBriefs(briefs);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBriefs(
        briefs.filter(
          (brief) =>
            brief.name.toLowerCase().includes(query) ||
            brief.category?.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, briefs]);

  useEffect(() => {
    if (selectedBrief) {
      setBriefName(selectedBrief.name);
      setBriefDescription(selectedBrief.description || '');
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

  const loadBriefs = async () => {
    setBrowserLoading(true);
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*, category:categories(*)')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setBriefs(data);
        setFilteredBriefs(data);
      }
    } catch (error) {
      console.error('Error loading briefs:', error);
    } finally {
      setBrowserLoading(false);
    }
  };

  const handleBriefSelect = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsCreating(true);
    setSearchQuery('');
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
          description: briefDescription.trim() || null,
          content: briefContent,
          category_id: categoryId || null,
          is_shared: isShared,
          seo_config: seoConfig,
        })
        .eq('id', selectedBrief.id);

      if (!error) {
        // Brief updated successfully
        toast.success('SmartBrief updated successfully!');
        loadBriefs();
      }
    } else {
      const { data, error } = await supabase
        .from('briefs')
        .insert({
          name: briefName,
          description: briefDescription.trim() || null,
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
        loadBriefs();
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
      loadBriefs();
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
    setBriefDescription('');
    setBriefContent(null);
    setCategoryId('');
    setIsShared(false);
    setAiInstructions('');
    setExampleUrls('');
    setUrlAnalysis(null);
    setIsCreating(false);
  };

  const startNewBriefFull = () => {
    resetForm();
    setIsCreating(true);
  };

  const sortBriefs = (list: Brief[]): Brief[] => {
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'last_modified':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'date_created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'alpha_az':
          return a.name.localeCompare(b.name);
        case 'alpha_za':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
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
    return brief.created_by === user.id || ['super_admin', 'admin', 'manager', 'team_leader'].includes(user.role);
  };

  // Computed sections for browser view
  const myBriefs = sortBriefs(filteredBriefs.filter((b) => b.created_by === user.id));
  const sharedBriefs = sortBriefs(filteredBriefs.filter((b) => b.created_by !== user.id && b.is_shared));

  const BriefCard = ({ brief }: { brief: Brief }) => (
    <Card
      className="cursor-pointer relative overflow-hidden group p-5 hover:translate-y-0"
      onClick={() => handleBriefSelect(brief)}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-text-primary flex-1 leading-snug line-clamp-2">
          {brief.name}
        </h3>
        {brief.category && (
          <Badge variant="secondary" className="ml-2 flex-shrink-0 text-[10px]">
            {brief.category.name}
          </Badge>
        )}
      </div>
      {brief.description && (
        <p className="text-xs text-text-secondary line-clamp-2 mb-2">
          {brief.description}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {brief.is_shared && (
          <Badge variant="ai" className="text-[10px]">Shared</Badge>
        )}
        {(brief.seo_config as any)?.ai_instructions && (
          <span className="flex items-center gap-1 text-[10px] text-ai-accent">
            <Sparkles className="h-3 w-3" />
            AI Configured
          </span>
        )}
      </div>
      {brief.updated_at && (
        <div className="text-[10px] text-text-tertiary">
          Updated {new Date(brief.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </Card>
  );

  return (
    <>
      <div className="flex-1 bg-bg-deepest overflow-y-auto">
        {!selectedBrief && !isCreating ? (
          // Full-screen SmartBriefs browser
          <div className="p-8">
            {/* Header Bar */}
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-2xl font-bold text-text-primary flex-1">SmartBriefs</h1>

              {/* Guide link */}
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-text-secondary">
                <a href="/smartbrief-guide" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-4 w-4" />
                  How to Create SmartBriefs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>

              {/* Search */}
              <div className="relative w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Sort */}
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className="h-9 px-3 text-sm rounded-lg border border-border-default bg-bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              >
                <option value="last_modified">Last Modified</option>
                <option value="date_created">Date Created</option>
                <option value="alpha_az">A → Z</option>
                <option value="alpha_za">Z → A</option>
              </select>

              <Button onClick={startNewBriefFull} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Create New SmartBrief
              </Button>
            </div>

            {browserLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
              </div>
            ) : (
                <div className="space-y-8">
                  {/* My SmartBriefs */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-text-tertiary" />
                      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                        My SmartBriefs
                      </h2>
                      <span className="text-xs text-text-tertiary font-mono">({myBriefs.length})</span>
                    </div>
                    {myBriefs.length === 0 ? (
                      searchQuery ? (
                        <p className="text-sm text-text-tertiary">No SmartBriefs match your search.</p>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <BookOpen className="h-10 w-10 text-text-muted mb-3 opacity-30" />
                          <p className="text-text-secondary font-medium">No SmartBriefs yet</p>
                          <p className="text-sm text-text-tertiary mt-1 mb-4">
                            Create your first SmartBrief to define a content structure
                          </p>
                          <Button onClick={startNewBriefFull} size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create New SmartBrief
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {myBriefs.map((brief) => <BriefCard key={brief.id} brief={brief} />)}
                      </div>
                    )}
                  </section>

                  {/* Shared SmartBriefs */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 pt-2 border-t border-border-subtle">
                      <Users2 className="w-4 h-4 text-text-tertiary mt-2" />
                      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mt-2">
                        Shared SmartBriefs
                      </h2>
                      <span className="text-xs text-text-tertiary font-mono mt-2">({sharedBriefs.length})</span>
                    </div>
                    {sharedBriefs.length === 0 ? (
                      <p className="text-sm text-text-tertiary">
                        {searchQuery ? 'No shared SmartBriefs match your search.' : 'No SmartBriefs have been shared yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sharedBriefs.map((brief) => <BriefCard key={brief.id} brief={brief} />)}
                      </div>
                    )}
                  </section>
                </div>
            )}
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
                  <Button size="sm" variant="ghost" onClick={resetForm}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to SmartBriefs
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

              <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="briefName">SmartBrief Name <span className="text-red-400">*</span></Label>
                  <Input
                    id="briefName"
                    value={briefName}
                    onChange={(e) => setBriefName(e.target.value)}
                    placeholder="e.g., NFL Team Analysis Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="briefDescription">Description <span className="text-text-tertiary text-xs">(optional)</span></Label>
                  <Input
                    id="briefDescription"
                    value={briefDescription}
                    onChange={(e) => setBriefDescription(e.target.value)}
                    placeholder="Short description shown in the SmartBrief browser"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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

                <div className="flex items-end pb-1">
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

    </>
  );
}
