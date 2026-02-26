'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react';
import type { ResearchStory } from '@/types';

interface ResearchStoryCardProps {
  story: ResearchStory;
  selected?: boolean;
  onToggleSelect?: (storyId: string) => void;
}

export function ResearchStoryCard({ story, selected, onToggleSelect }: ResearchStoryCardProps) {
  const openUrl = () => {
    if (story.url) window.open(story.url, '_blank');
  };

  const verificationLabel =
    story.verification_status === 'verified'
      ? 'Verified'
      : story.verification_status === 'unresolved'
        ? 'Unresolved'
        : null;

  return (
    <Card className="bg-bg-surface border-border-subtle overflow-hidden">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => onToggleSelect?.(story.id)}
            className="mt-0.5 shrink-0 rounded border border-border-subtle w-8 h-8 flex items-center justify-center transition-colors hover:bg-bg-hover"
            title={selected ? 'Deselect (remove from reference)' : 'Select as reference'}
            aria-pressed={selected}
          >
            {selected ? (
              <Bookmark className="w-4 h-4 text-accent-primary fill-accent-primary" />
            ) : (
              <Bookmark className="w-4 h-4 text-text-tertiary" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={openUrl}
              className="text-left w-full group"
            >
              <span className="text-sm font-medium text-text-primary group-hover:text-accent-primary line-clamp-2">
                {story.title}
              </span>
            </button>
            <p className="text-xs text-text-tertiary mt-0.5">{story.source}</p>
            {story.synopsis && (
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                {story.synopsis}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {verificationLabel && (
                <Badge
                  variant={story.verification_status === 'verified' ? 'default' : 'secondary'}
                  className="text-[10px] gap-0.5"
                >
                  {story.verification_status === 'verified' ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <AlertTriangle className="w-2.5 h-2.5" />
                  )}
                  {verificationLabel}
                </Badge>
              )}
              {story.url && (
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-primary hover:underline inline-flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
