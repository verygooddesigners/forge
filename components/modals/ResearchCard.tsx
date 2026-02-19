'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, ExternalLink, ChevronDown, ChevronUp, Shield, ShieldCheck, AlertTriangle, Check } from 'lucide-react';
import { ResearchArticle } from '@/types';

interface ResearchCardProps {
  article: ResearchArticle;
  onThumbsDown: (articleId: string) => void;
  onThumbsUp?: (articleId: string) => void;
  isTrusted: boolean;
  isFlagged: boolean;
  isSelected?: boolean;
  onToggleSelect?: (articleId: string) => void;
}

export function ResearchCard({
  article,
  onThumbsDown,
  onThumbsUp,
  isTrusted,
  isFlagged,
  isSelected = false,
  onToggleSelect,
}: ResearchCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getTrustBadge = () => {
    if (article.trust_score >= 0.8) {
      return (
        <Badge variant="default" className="bg-green-500">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Trusted
        </Badge>
      );
    } else if (article.trust_score >= 0.5) {
      return (
        <Badge variant="secondary">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      );
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle selection if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) return;
    if (onToggleSelect && !isFlagged) {
      onToggleSelect(article.id);
    }
  };

  return (
    <Card
      className={`transition-all cursor-pointer ${
        isFlagged
          ? 'opacity-50 border-red-300'
          : isSelected
            ? 'ring-2 ring-accent-primary border-accent-primary shadow-lg'
            : 'hover:shadow-lg'
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {onToggleSelect && !isFlagged && (
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected
                  ? 'bg-accent-primary border-accent-primary'
                  : 'border-border-default hover:border-accent-primary'
              }`}>
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            )}
            {getTrustBadge()}
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-xs font-semibold ${getRelevanceColor(article.relevance_score)}`}>
              {Math.round(article.relevance_score * 100)}%
            </span>
          </div>
        </div>
        
        <CardTitle className="text-sm leading-tight">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-accent-primary transition-colors flex items-start gap-1 group"
          >
            <span className="flex-1">{article.title}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </CardTitle>
        
        <CardDescription className="text-xs mt-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{article.source}</span>
            <span>{formatDate(article.published_date)}</span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Article Snippet */}
        <div className="text-xs text-muted-foreground">
          <p className={expanded ? '' : 'line-clamp-3'}>
            {article.description}
          </p>
          {article.description && article.description.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-accent-primary hover:underline flex items-center gap-1 mt-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>

        {/* Flagged Status */}
        {isFlagged && article.feedback_reason && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-xs">
            <p className="font-semibold text-red-800">
              Flagged: {article.feedback_reason.replace(/_/g, ' ')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isFlagged && (
          <div className="flex gap-2 pt-2">
            {onThumbsUp && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => onThumbsUp(article.id)}
              >
                <ThumbsUp className="h-3 w-3" />
                Helpful
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1 hover:bg-red-50 hover:border-red-300"
              onClick={() => onThumbsDown(article.id)}
            >
              <ThumbsDown className="h-3 w-3" />
              Flag
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
