'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Link as LinkIcon, Settings, Search, ChevronDown, ArrowUp, ArrowDown, Check, Info, HelpCircle } from 'lucide-react';
import { Project, ResearchBrief } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { ResearchResultsModal } from '@/components/modals/ResearchResultsModal';

interface SEOOptimizationSidebarProps {
  projectId: string | null;
  content: any; // TipTap JSON content
  project: Project | null;
  onContentUpdate?: (content: any) => void;
  onProjectUpdate?: () => void;
}

interface ContentMetrics {
  words: number;
  headings: number;
  paragraphs: number;
  images: number;
}

interface TermData {
  term: string;
  current: number;
  target: string;
  status: 'optimal' | 'under' | 'over';
  category: string;
}

interface SuggestedKeyword {
  keyword: string;
  importance: 'high' | 'medium' | 'low';
  selected: boolean;
}

export function SEOOptimizationSidebar({
  projectId,
  content,
  project,
  onContentUpdate,
  onProjectUpdate,
}: SEOOptimizationSidebarProps) {
  const [activeTab, setActiveTab] = useState('guidelines');
  const [seoScore, setSeoScore] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [researchComplete, setResearchComplete] = useState(false);
  
  const [metrics, setMetrics] = useState<ContentMetrics>({
    words: 0,
    headings: 0,
    paragraphs: 0,
    images: 0,
  });
  
  // Calculate target ranges based on project word count target
  const targetRanges = useMemo(() => {
    const wordTarget = project?.word_count_target || 800;
    
    // Calculate reasonable ranges based on word count
    // Word count: +/- 10% of target
    const wordMin = Math.floor(wordTarget * 0.9);
    const wordMax = Math.ceil(wordTarget * 1.1);
    
    // Headings: scale based on content length
    let headingsMin, headingsMax;
    if (wordTarget < 800) {
      // Short content: fewer headings (1 heading per 150-200 words)
      const target = Math.max(2, Math.ceil(wordTarget / 180));
      headingsMin = Math.max(2, target - 1);
      headingsMax = target + 2;
    } else if (wordTarget < 2000) {
      // Medium content: standard ratio (1 heading per 120-150 words)
      const target = Math.ceil(wordTarget / 130);
      headingsMin = Math.max(5, target - 3);
      headingsMax = target + 4;
    } else {
      // Long content: more headings (1 heading per 100 words)
      const target = Math.ceil(wordTarget / 100);
      headingsMin = Math.max(10, target - 5);
      headingsMax = target + 8;
    }
    
    // Paragraphs: scale based on content length
    let paragraphsMin;
    if (wordTarget < 800) {
      // Short content: roughly 1 paragraph per 80-100 words
      paragraphsMin = Math.max(4, Math.ceil(wordTarget / 90));
    } else if (wordTarget < 2000) {
      // Medium content: roughly 1 paragraph per 80 words
      paragraphsMin = Math.max(8, Math.ceil(wordTarget / 80));
    } else {
      // Long content: roughly 1 paragraph per 70 words
      paragraphsMin = Math.max(15, Math.ceil(wordTarget / 70));
    }
    
    // Images: scale based on content length
    let imagesMin, imagesMax;
    if (wordTarget < 800) {
      // Short content: 1-2 images
      imagesMin = 1;
      imagesMax = 2;
    } else if (wordTarget < 2000) {
      // Medium content: roughly 1 image per 300 words
      const target = Math.max(2, Math.ceil(wordTarget / 300));
      imagesMin = Math.max(2, target - 1);
      imagesMax = target + 2;
    } else {
      // Long content: roughly 1 image per 250 words
      const target = Math.ceil(wordTarget / 250);
      imagesMin = Math.max(4, target - 2);
      imagesMax = target + 4;
    }
    
    return {
      words: { min: wordMin, max: wordMax },
      headings: { min: headingsMin, max: headingsMax },
      paragraphs: { min: paragraphsMin, max: 999 },
      images: { min: imagesMin, max: imagesMax },
    };
  }, [project?.word_count_target]);
  
  const [terms, setTerms] = useState<TermData[]>([]);
  const [termSearch, setTermSearch] = useState('');
  const [termFilter, setTermFilter] = useState<'all' | 'headings' | 'nlp'>('all');
  const [suggestedKeywords, setSuggestedKeywords] = useState<SuggestedKeyword[]>([]);
  
  const debouncedContent = useDebounce(content, 2000);

  // Extract metrics from content
  useEffect(() => {
    if (content && projectId) {
      extractMetrics(content);
      updateKeywordCounts(content);
    } else {
      setMetrics({ words: 0, headings: 0, paragraphs: 0, images: 0 });
      setSeoScore(0);
    }
  }, [debouncedContent, projectId]);

  const extractMetrics = (tipTapContent: any) => {
    if (!tipTapContent || !tipTapContent.content) {
      setMetrics({ words: 0, headings: 0, paragraphs: 0, images: 0 });
      return;
    }

    let words = 0;
    let headings = 0;
    let paragraphs = 0;
    let images = 0;

    const countInNode = (node: any) => {
      if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
        headings++;
      }
      if (node.type === 'paragraph') {
        paragraphs++;
      }
      if (node.type === 'image') {
        images++;
      }
      if (node.text) {
        words += node.text.split(/\s+/).filter(Boolean).length;
      }
      if (node.content) {
        node.content.forEach(countInNode);
      }
    };

    tipTapContent.content.forEach(countInNode);
    
    const newMetrics = { words, headings, paragraphs, images };
    setMetrics(newMetrics);
    
    // Calculate simple SEO score
    if (words > 0) {
      calculateScore(newMetrics);
    }
  };

  const updateKeywordCounts = (tipTapContent: any) => {
    if (!tipTapContent || !tipTapContent.content || terms.length === 0) {
      return;
    }

    // Extract all text from content
    let fullText = '';
    const extractText = (node: any) => {
      if (node.text) {
        fullText += node.text + ' ';
      }
      if (node.content) {
        node.content.forEach(extractText);
      }
    };
    
    tipTapContent.content.forEach(extractText);
    const lowerText = fullText.toLowerCase();

    // Update term counts
    const updatedTerms = terms.map(term => {
      const regex = new RegExp(`\\b${term.term.toLowerCase()}\\b`, 'gi');
      const matches = lowerText.match(regex);
      const currentCount = matches ? matches.length : 0;
      
      // Parse target as number (it may be a string from API)
      const targetCount = typeof term.target === 'string' ? parseInt(term.target) : term.target;
      
      // Determine status based on current vs target
      let status: 'optimal' | 'under' | 'over' = 'under';
      if (currentCount >= targetCount) {
        status = 'optimal';
      } else if (currentCount > targetCount * 1.5) {
        status = 'over';
      }
      
      return {
        ...term,
        current: currentCount,
        status,
      };
    });

    setTerms(updatedTerms);
  };

  const calculateScore = (currentMetrics: ContentMetrics) => {
    let score = 0;
    
    // Word count (30 points)
    if (currentMetrics.words >= targetRanges.words.min && currentMetrics.words <= targetRanges.words.max) {
      score += 30;
    } else if (currentMetrics.words > 0) {
      const distance = Math.abs(currentMetrics.words - targetRanges.words.min);
      score += Math.max(0, 30 - (distance / 100));
    }
    
    // Headings (25 points)
    if (currentMetrics.headings >= targetRanges.headings.min && currentMetrics.headings <= targetRanges.headings.max) {
      score += 25;
    } else if (currentMetrics.headings > 0) {
      const distance = Math.abs(currentMetrics.headings - targetRanges.headings.min);
      score += Math.max(0, 25 - distance);
    }
    
    // Paragraphs (20 points)
    if (currentMetrics.paragraphs >= targetRanges.paragraphs.min) {
      score += 20;
    } else if (currentMetrics.paragraphs > 0) {
      score += (currentMetrics.paragraphs / targetRanges.paragraphs.min) * 20;
    }
    
    // Images (15 points)
    if (currentMetrics.images >= targetRanges.images.min && currentMetrics.images <= targetRanges.images.max) {
      score += 15;
    } else if (currentMetrics.images > 0) {
      const distance = Math.abs(currentMetrics.images - targetRanges.images.min);
      score += Math.max(0, 15 - distance);
    }
    
    // Bonus points for having keywords (10 points)
    if (project?.primary_keyword && content) {
      score += 10;
    }
    
    setSeoScore(Math.min(100, Math.round(score)));
  };

  const getMetricStatus = (current: number, min: number, max: number) => {
    if (current >= min && current <= max) return 'optimal';
    if (current < min) return 'under';
    return 'over';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'optimal') return <Check className="h-4 w-4 text-green-600" />;
    if (status === 'under') return <ArrowUp className="h-4 w-4 text-orange-500" />;
    return <ArrowDown className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'optimal') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'under') return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const handleResearchStory = () => {
    if (!project || !projectId) return;
    setResearchModalOpen(true);
  };

  const handleResearchComplete = (researchBrief: ResearchBrief) => {
    setResearchComplete(true);
    setAnalyzed(true);
    setResearchModalOpen(false);
    
    // Populate suggested keywords from research
    if (researchBrief.verified_facts && researchBrief.verified_facts.length > 0) {
      const keywords = extractKeywordsFromFacts(researchBrief.verified_facts);
      setSuggestedKeywords(keywords);
    }
    
    // Trigger project reload in parent component
    if (onProjectUpdate) {
      onProjectUpdate();
    }
  };

  const extractKeywordsFromFacts = (facts: any[]): SuggestedKeyword[] => {
    // Extract key terms from verified facts
    const keywordSet = new Set<string>();
    
    facts.forEach(fact => {
      const words = fact.fact.split(/\s+/).filter((w: string) => w.length > 4);
      words.forEach((w: string) => keywordSet.add(w.toLowerCase()));
    });
    
    // Convert to suggested keywords (simple implementation)
    return Array.from(keywordSet).slice(0, 20).map(keyword => ({
      keyword,
      importance: 'medium' as const,
      selected: false,
    }));
  };

  const handleAnalyzeSEOPackage = async () => {
    if (!project || !projectId) return;
    
    setAnalyzing(true);
    try {
      // Call API to analyze SEO package
      const response = await fetch('/api/seo/analyze-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          headline: project.headline,
          primaryKeyword: project.primary_keyword,
          secondaryKeywords: project.secondary_keywords || [],
          topic: project.topic,
          wordCount: project.word_count_target,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Populate terms from analysis
        if (data.suggestedTerms) {
          setTerms(data.suggestedTerms);
          
          // Build suggested keywords list with importance levels
          const keywords: SuggestedKeyword[] = [];
          
          // Primary keyword - high importance (green)
          if (project.primary_keyword) {
            keywords.push({
              keyword: project.primary_keyword,
              importance: 'high',
              selected: true,
            });
          }
          
          // Secondary keywords - medium importance (orange)
          if (project.secondary_keywords && project.secondary_keywords.length > 0) {
            project.secondary_keywords.forEach((kw: string) => {
              keywords.push({
                keyword: kw,
                importance: 'medium',
                selected: true,
              });
            });
          }
          
          // Suggested keywords from AI - categorize by position
          const suggestedFromAI = data.suggestedTerms.filter((t: TermData) => t.category === 'Suggested');
          suggestedFromAI.forEach((term: TermData, index: number) => {
            // First 3 are high importance, next 4 are medium, rest are low
            let importance: 'high' | 'medium' | 'low' = 'low';
            if (index < 3) {
              importance = 'high';
            } else if (index < 7) {
              importance = 'medium';
            }
            
            keywords.push({
              keyword: term.term,
              importance,
              selected: false,
            });
          });
          
          setSuggestedKeywords(keywords);
        }
        setAnalyzed(true);
      }
    } catch (error) {
      console.error('Error analyzing SEO package:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleKeywordSelection = (keyword: string) => {
    setSuggestedKeywords(prev => 
      prev.map(kw => 
        kw.keyword === keyword ? { ...kw, selected: !kw.selected } : kw
      )
    );
  };

  const filteredTerms = terms.filter(term => {
    if (termSearch && !term.term.toLowerCase().includes(termSearch.toLowerCase())) {
      return false;
    }
    // Add filter logic here
    return true;
  });

  const scoreColor = seoScore >= 70 ? 'text-green-600' : seoScore >= 40 ? 'text-orange-500' : 'text-red-500';
  const gaugeColor = seoScore >= 70 ? '#16a34a' : seoScore >= 40 ? '#f97316' : '#dc2626';

  return (
    <div className="w-80 flex flex-col gap-3">
      <Card className="bg-white shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guidelines" className="text-xs uppercase">
                Guidelines
              </TabsTrigger>
              <TabsTrigger value="outline" className="text-xs uppercase">
                Outline
              </TabsTrigger>
              <TabsTrigger value="brief" className="text-xs uppercase">
                Brief
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="space-y-4">
            <TabsContent value="guidelines" className="mt-0 space-y-4">
              {/* Content Score Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-1">
                    Content Score
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </h3>
                </div>

                {/* Semi-circular Gauge */}
                <div className="flex flex-col items-center py-4">
                  <div className="relative w-48 h-24">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Background arc */}
                      <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      {/* Score arc */}
                      <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(seoScore / 100) * 251.2} 251.2`}
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className={`text-3xl font-bold ${scoreColor}`}>
                        {seoScore}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">/100</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Avg</p>
                      <p className="text-sm font-semibold">{avgScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Top</p>
                      <p className="text-sm font-semibold">{topScore}</p>
                    </div>
                  </div>
                  
                  {showDetails && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <p>Score breakdown coming soon...</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {metrics.words > 0 && (
                  <div className="space-y-2">
                    <Button className="w-full gap-2" disabled>
                      <Sparkles className="h-4 w-4" />
                      Auto-Optimize
                    </Button>
                    <Button variant="outline" className="w-full gap-2" disabled>
                      <LinkIcon className="h-4 w-4" />
                      Insert internal links
                    </Button>
                  </div>
                )}

                {/* Research Story Button (before content) */}
                {!researchComplete && metrics.words === 0 && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={handleResearchStory}
                    disabled={!project}
                  >
                    <Search className="h-4 w-4" />
                    Research Story
                  </Button>
                )}
              </div>

              {/* Suggested Keywords Section */}
              {analyzed && suggestedKeywords.length > 0 && (
                <>
                  <div className="divider" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Suggested Keywords</h3>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {suggestedKeywords.map((kw, index) => {
                        const colorClass = 
                          kw.importance === 'high' 
                            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                            : kw.importance === 'medium'
                            ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200'
                            : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
                        
                        const selectedClass = kw.selected ? 'ring-2 ring-offset-1 ring-violet-500' : '';
                        
                        return (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`cursor-pointer text-xs px-2 py-1 ${colorClass} ${selectedClass} transition-all`}
                            onClick={() => toggleKeywordSelection(kw.keyword)}
                          >
                            {kw.keyword}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span>High priority - Must use</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                        <span>Medium priority - Good idea</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span>Low priority - Use sparingly</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="divider" />

              {/* Content Structure */}
              {(analyzed || metrics.words > 0) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Content Structure</h3>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {/* Words */}
                    <div className={`p-3 rounded-lg border ${getStatusColor(getMetricStatus(metrics.words, targetRanges.words.min, targetRanges.words.max))}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium uppercase">Words</span>
                        {getStatusIcon(getMetricStatus(metrics.words, targetRanges.words.min, targetRanges.words.max))}
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">{metrics.words.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Target: {targetRanges.words.min.toLocaleString()}-{targetRanges.words.max.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Headings */}
                    <div className={`p-3 rounded-lg border ${getStatusColor(getMetricStatus(metrics.headings, targetRanges.headings.min, targetRanges.headings.max))}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium uppercase">Headings</span>
                        {getStatusIcon(getMetricStatus(metrics.headings, targetRanges.headings.min, targetRanges.headings.max))}
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">{metrics.headings}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Target: {targetRanges.headings.min}-{targetRanges.headings.max}
                        </span>
                      </div>
                    </div>

                    {/* Paragraphs */}
                    <div className={`p-3 rounded-lg border ${getStatusColor(getMetricStatus(metrics.paragraphs, targetRanges.paragraphs.min, 999))}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium uppercase">Paragraphs</span>
                        {getStatusIcon(getMetricStatus(metrics.paragraphs, targetRanges.paragraphs.min, 999))}
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">{metrics.paragraphs}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Target: at least {targetRanges.paragraphs.min}
                        </span>
                      </div>
                    </div>

                    {/* Images */}
                    <div className={`p-3 rounded-lg border ${getStatusColor(getMetricStatus(metrics.images, targetRanges.images.min, targetRanges.images.max))}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium uppercase">Images</span>
                        {getStatusIcon(getMetricStatus(metrics.images, targetRanges.images.min, targetRanges.images.max))}
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">{metrics.images}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Target: {targetRanges.images.min}-{targetRanges.images.max}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Section */}
              {analyzed && terms.length > 0 && (
                <>
                  <div className="divider" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Terms</h3>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="Search"
                        value={termSearch}
                        onChange={(e) => setTermSearch(e.target.value)}
                        className="pl-7 h-8 text-sm"
                      />
                    </div>

                    {/* Category tags */}
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs cursor-pointer">
                        #Content - 14 <ChevronDown className="h-3 w-3 ml-1" />
                      </Badge>
                      <Badge variant="outline" className="text-xs cursor-pointer">
                        #Market - 12 <ChevronDown className="h-3 w-3 ml-1" />
                      </Badge>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-1 border-b">
                      <button
                        onClick={() => setTermFilter('all')}
                        className={`px-3 py-1 text-xs font-medium ${
                          termFilter === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        All 80
                      </button>
                      <button
                        onClick={() => setTermFilter('headings')}
                        className={`px-3 py-1 text-xs font-medium ${
                          termFilter === 'headings'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        Headings 5
                      </button>
                      <button
                        onClick={() => setTermFilter('nlp')}
                        className={`px-3 py-1 text-xs font-medium ${
                          termFilter === 'nlp'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        NLP 65
                      </button>
                    </div>

                    {/* Terms list */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredTerms.map((term, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-xs ${getStatusColor(term.status)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{term.term}</span>
                            {getStatusIcon(term.status)}
                          </div>
                          <div className="text-xs mt-1">
                            {term.current}/{term.target}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="outline" className="mt-0">
              <p className="text-sm text-muted-foreground">Outline view coming soon...</p>
            </TabsContent>

            <TabsContent value="brief" className="mt-0">
              <p className="text-sm text-muted-foreground">Brief view coming soon...</p>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Floating Help Button */}
      <Button
        variant="default"
        size="sm"
        className="fixed bottom-4 right-4 rounded-full h-10 w-10 p-0 shadow-lg z-50"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Research Results Modal */}
      {project && projectId && (
        <ResearchResultsModal
          open={researchModalOpen}
          onOpenChange={setResearchModalOpen}
          projectId={projectId}
          project={project}
          onResearchComplete={handleResearchComplete}
        />
      )}
    </div>
  );
}

