'use client';

import { NewsArticle } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Image */}
            {article.image_url && (
              <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2 mb-1">
                {article.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {article.description}
              </p>

              {/* Meta info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{article.source}</span>
                <span>•</span>
                <span>{formatDate(article.published_date)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getScoreColor(article.relevance_score)}`}
                  />
                  <span>{Math.round(article.relevance_score * 100)}%</span>
                </div>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}


