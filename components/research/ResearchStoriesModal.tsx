'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectResearch } from '@/types';
import { ResearchStoryCard } from './ResearchStoryCard';

interface ResearchStoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectResearch: ProjectResearch | null;
  onToggleStorySelection: (storyId: string) => void;
}

const INSTRUCTIONS =
  'The following stories will be used as reference material when you click the Generate Content button. Verified stories have automatically been selected, but you can deselect them by clicking the highlighted bookmark icon. Select any other stories by clicking the unfilled bookmark icon.';

export function ResearchStoriesModal({
  open,
  onOpenChange,
  projectResearch,
  onToggleStorySelection,
}: ResearchStoriesModalProps) {
  const stories = projectResearch?.stories ?? [];
  const selectedIds = projectResearch?.selected_story_ids ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] flex flex-col gap-4 p-6"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Reference sources</DialogTitle>
          <p className="text-sm text-text-secondary leading-relaxed mt-1">
            {INSTRUCTIONS}
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border border-border-subtle bg-bg-surface/50 p-4">
          {stories.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">
              No research stories for this project.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stories.map((story) => (
                <ResearchStoryCard
                  key={story.id}
                  story={story}
                  selected={selectedIds.includes(story.id)}
                  onToggleSelect={onToggleStorySelection}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
