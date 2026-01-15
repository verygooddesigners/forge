'use client';

import { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/types';

interface NFLOddsExtractorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onProjectCreated?: (project: Project) => void;
}

export function NFLOddsExtractorModal({
  open,
  onOpenChange,
  userId,
  onProjectCreated,
}: NFLOddsExtractorModalProps) {
  const [weekNumber, setWeekNumber] = useState('');
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear().toString());
  const [headline, setHeadline] = useState('');
  const [scheduleImage, setScheduleImage] = useState<string | null>(null);
  const [oddsImage, setOddsImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleImageUpload = (file: File, type: 'schedule' | 'odds') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'schedule') {
        setScheduleImage(base64);
      } else {
        setOddsImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!scheduleImage || !oddsImage || !weekNumber || !seasonYear) {
      setError('Please upload both images and fill in all fields');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      // Call extraction API
      const response = await fetch('/api/nfl-odds/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleImage,
          oddsImage,
          weekNumber: parseInt(weekNumber),
          seasonYear: parseInt(seasonYear),
          headline,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to extract odds data');
      }

      const result = await response.json();

      // Create project with extracted content
      const articleHeadline = result.data.headline;
      const primaryKeyword = `nfl week ${weekNumber} odds`;
      const secondaryKeywords = [`week ${weekNumber} picks`, 'nfl predictions', 'betting odds'];

      // Convert HTML to TipTap JSON (simplified)
      const content = htmlToTipTap(result.data.articleContent);

      // Get default writer model and brief
      const { data: models } = await supabase
        .from('writer_models')
        .select('id')
        .limit(1)
        .single();

      const { data: briefs } = await supabase
        .from('briefs')
        .select('id')
        .or(`is_shared.eq.true,created_by.eq.${userId}`)
        .limit(1)
        .single();

      if (!models || !briefs) {
        throw new Error('Please create a writer model and brief first');
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          headline: articleHeadline,
          primary_keyword: primaryKeyword,
          secondary_keywords: secondaryKeywords,
          topic: `NFL Week ${weekNumber} ${seasonYear}`,
          word_count_target: 3000,
          writer_model_id: models.id,
          brief_id: briefs.id,
          content,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      setSuccess(true);
      setTimeout(() => {
        onProjectCreated?.(project);
        onOpenChange(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract NFL odds data');
    } finally {
      setExtracting(false);
    }
  };

  const resetForm = () => {
    setWeekNumber('');
    setSeasonYear(new Date().getFullYear().toString());
    setHeadline('');
    setScheduleImage(null);
    setOddsImage(null);
    setError(null);
    setSuccess(false);
  };

  const htmlToTipTap = (html: string) => {
    // Simplified HTML to TipTap conversion
    // In production, this would use a proper parser
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: html,
            },
          ],
        },
      ],
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-bg-surface border-border-default">
        <DialogHeader>
          <DialogTitle className="text-text-primary">NFL Odds Extractor</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Upload screenshots of ESPN schedule and RotoWire odds to automatically generate your article
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Week & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week">Week Number *</Label>
              <Input
                id="week"
                type="number"
                placeholder="14"
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
                disabled={extracting}
                min="1"
                max="18"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Season Year *</Label>
              <Input
                id="year"
                type="number"
                placeholder="2025"
                value={seasonYear}
                onChange={(e) => setSeasonYear(e.target.value)}
                disabled={extracting}
              />
            </div>
          </div>

          {/* Headline (optional) */}
          <div className="space-y-2">
            <Label htmlFor="headline">Custom Headline (optional)</Label>
            <Input
              id="headline"
              placeholder="Auto-generated if left blank"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              disabled={extracting}
            />
          </div>

          {/* ESPN Schedule Upload */}
          <div className="space-y-2">
            <Label htmlFor="schedule">ESPN Schedule Screenshot *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="schedule"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'schedule');
                }}
                disabled={extracting}
                className="flex-1"
              />
              {scheduleImage && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
          </div>

          {/* RotoWire Odds Upload */}
          <div className="space-y-2">
            <Label htmlFor="odds">RotoWire Odds Screenshot *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="odds"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'odds');
                }}
                disabled={extracting}
                className="flex-1"
              />
              {oddsImage && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="bg-error-muted border-error">
              <AlertCircle className="h-4 w-4 text-error" />
              <AlertDescription className="text-text-primary">{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-success bg-success-muted">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-text-primary">
                Article generated successfully! Opening project...
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={extracting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExtract}
            disabled={extracting || !scheduleImage || !oddsImage || !weekNumber || !seasonYear}
            className="gap-2"
          >
            {extracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting Data...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Extract & Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
