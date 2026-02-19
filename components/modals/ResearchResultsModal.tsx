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
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Project, ResearchArticle, ResearchBrief, ArticleFeedback } from '@/types';
import { ResearchCard } from './ResearchCard';
import { FeedbackModal } from './FeedbackModal';

interface ResearchResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  project: Project;
  onResearchComplete: (researchBrief: ResearchBrief) => void;
}

export function ResearchResultsModal({
  open,
  onOpenChange,
  projectId,
  project,
  onResearchComplete,
}: ResearchResultsModalProps) {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFeedback, setUserFeedback] = useState<ArticleFeedback[]>([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [researchComplete, setResearchComplete] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && projectId) {
      performResearch();
    }
  }, [open, projectId]);

  const performResearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/research/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          headline: project.headline,
          primaryKeyword: project.primary_keyword,
          secondaryKeywords: project.secondary_keywords || [],
          topic: project.topic,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const loadedArticles = data.articles || [];
        setArticles(loadedArticles);
        // Auto-select all unflagged articles
        setSelectedArticleIds(new Set(loadedArticles.filter((a: ResearchArticle) => !a.is_flagged).map((a: ResearchArticle) => a.id)));
      } else {
        console.error('Research failed:', await response.text());
      }
    } catch (error) {
      console.error('Error performing research:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (articleId: string) => {
    setSelectedArticleIds(prev => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  };

  const handleThumbsDown = (articleId: string) => {
    setSelectedArticleId(articleId);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (reason: string, notes?: string) => {
    if (!selectedArticleId) return;

    const feedback: ArticleFeedback = {
      article_id: selectedArticleId,
      reason: reason as any,
      notes,
    };

    setUserFeedback([...userFeedback, feedback]);

    // Update article to mark as flagged and deselect it
    setArticles(articles.map(article =>
      article.id === selectedArticleId
        ? { ...article, is_flagged: true, feedback_reason: reason }
        : article
    ));
    setSelectedArticleIds(prev => {
      const next = new Set(prev);
      next.delete(selectedArticleId);
      return next;
    });

    // Submit feedback to API
    try {
      await fetch('/api/research/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          articleId: selectedArticleId,
          reason,
          notes,
        }),
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }

    setFeedbackModalOpen(false);
    setSelectedArticleId(null);
  };

  const handleVerifyFacts = async () => {
    setVerifying(true);
    try {
      // Use only selected articles
      const unflaggedArticles = articles.filter(a => selectedArticleIds.has(a.id));

      const response = await fetch('/api/research/verify-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          articles: unflaggedArticles,
          userFeedback,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationResults(data);
        setResearchComplete(true);
        
        // Call the callback with the research brief
        onResearchComplete(data.research_brief);
      } else {
        console.error('Fact verification failed:', await response.text());
      }
    } catch (error) {
      console.error('Error verifying facts:', error);
    } finally {
      setVerifying(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = selectedArticleIds.size;
  const unflaggedCount = articles.filter(a => !a.is_flagged).length;
  const trustedCount = articles.filter(a => a.is_trusted && !a.is_flagged).length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-[90vw] !w-[90vw] max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-default">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent-primary" />
              Research Story: {project.headline}
            </DialogTitle>
            <DialogDescription>
              Review research results, flag inaccurate sources, then verify facts with AI
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-accent-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">Researching...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gathering latest information from trusted sources
                  </p>
                </div>
              </div>
            ) : researchComplete ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-2xl">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Research Complete!</h3>
                  <div className="space-y-4 text-left">
                    <div className="bg-bg-elevated border border-border-default rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Verification Results</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verified Facts:</span>
                          <span className="font-medium">{verificationResults?.verified_facts?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disputed Facts:</span>
                          <span className="font-medium text-orange-600">{verificationResults?.disputed_facts?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence Score:</span>
                          <span className="font-medium text-green-600">{verificationResults?.confidence_score || 0}%</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => onOpenChange(false)} 
                      className="w-full"
                      size="lg"
                    >
                      Use Research for Content Generation
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Bar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-default">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Articles</p>
                      <p className="text-lg font-bold">{articles.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Selected</p>
                      <p className="text-lg font-bold text-accent-primary">{selectedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Trusted Sources</p>
                      <p className="text-lg font-bold text-green-600">{trustedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Flagged</p>
                      <p className="text-lg font-bold text-orange-600">{articles.length - unflaggedCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      onClick={handleVerifyFacts}
                      disabled={verifying || selectedCount === 0}
                      className="gap-2"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Verify Facts ({selectedCount})
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Articles Grid */}
                <div className="flex-1 overflow-y-auto">
                  {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                      {filteredArticles.map((article) => (
                        <ResearchCard
                          key={article.id}
                          article={article}
                          onThumbsDown={handleThumbsDown}
                          isTrusted={article.is_trusted}
                          isFlagged={article.is_flagged}
                          isSelected={selectedArticleIds.has(article.id)}
                          onToggleSelect={handleToggleSelect}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">No articles found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}
