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
import { Copy, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface InternalLinkSuggestion {
  anchor_text: string;
  target_article: string;
  reason: string;
  url?: string;
}

interface InternalLinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  content: any;
}

export function InternalLinksModal({
  open,
  onOpenChange,
  projectId,
  content,
}: InternalLinksModalProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[]>([]);

  useEffect(() => {
    if (open && projectId && content) {
      setLoading(true);
      setSuggestions([]);
      fetch('/api/seo/internal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, content }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        })
        .catch(() => toast.error('Failed to load link suggestions'))
        .finally(() => setLoading(false));
    }
  }, [open, projectId, content]);

  const copyUrl = (url: string, title: string) => {
    const fullUrl = url.startsWith('http') ? url : (typeof window !== 'undefined' ? window.location.origin : '') + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success(`Copied: ${title}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Internal links
          </DialogTitle>
          <DialogDescription>
            Relevant links for this story. Copy the URL to paste into your content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Finding links...
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No internal link suggestions for this content.
            </p>
          ) : (
            suggestions.map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border-subtle bg-bg-surface space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{s.target_article}</p>
                    {s.reason && (
                      <p className="text-xs text-text-tertiary mt-0.5">{s.reason}</p>
                    )}
                    {s.anchor_text && (
                      <p className="text-xs text-text-secondary mt-1">
                        Anchor: &quot;{s.anchor_text}&quot;
                      </p>
                    )}
                  </div>
                  {s.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-8 w-8 p-0"
                      onClick={() => copyUrl(s.url!, s.target_article)}
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
