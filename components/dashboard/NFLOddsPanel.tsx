'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface NFLOddsPanelProps {
  user: User;
  onProjectCreated: (projectId: string, writerModelId: string) => void;
}

export function NFLOddsPanel({ user, onProjectCreated }: NFLOddsPanelProps) {
  const [weekNumber, setWeekNumber] = useState('');
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear().toString());
  const [headline, setHeadline] = useState('');
  const [scheduleImage, setScheduleImage] = useState<string | null>(null);
  const [oddsImage, setOddsImage] = useState<string | null>(null);
  const [scheduleFileName, setScheduleFileName] = useState('');
  const [oddsFileName, setOddsFileName] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (file: File, type: 'schedule' | 'odds') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'schedule') {
        setScheduleImage(base64);
        setScheduleFileName(file.name);
      } else {
        setOddsImage(base64);
        setOddsFileName(file.name);
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
      setSuccess(true);
      
      // Project created, notify parent
      setTimeout(() => {
        if (result.data?.projectId) {
          onProjectCreated(result.data.projectId, result.data.writerModelId);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to extract NFL odds data');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-deepest p-8">
      <div className="max-w-[1000px] mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-success-muted flex items-center justify-center mx-auto mb-5">
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-[28px] font-bold text-text-primary mb-3 tracking-tight">Extract & Generate</h1>
          <p className="text-[15px] text-text-secondary max-w-lg mx-auto leading-relaxed">
            Upload screenshots from ESPN and RotoWire to automatically extract odds data and generate a complete betting article.
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="p-8 mb-6 hover:translate-y-0">
          <h2 className="text-base font-semibold text-text-primary mb-6 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-accent-muted text-accent-primary flex items-center justify-center text-xs font-bold font-mono">1</span>
            Configure Extraction
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-text-secondary">
                Week Number <span className="text-accent-primary">*</span>
              </label>
              <Input
                type="number"
                placeholder="14"
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
                min="1"
                max="18"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-text-secondary">
                Season Year <span className="text-accent-primary">*</span>
              </label>
              <Input
                type="number"
                placeholder="2026"
                value={seasonYear}
                onChange={(e) => setSeasonYear(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-text-secondary">
              Custom Headline (optional)
            </label>
            <Input
              placeholder="Auto-generated if left blank"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
        </Card>

        {/* Upload Card */}
        <Card className="p-8 mb-6 hover:translate-y-0">
          <h2 className="text-base font-semibold text-text-primary mb-6 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-accent-muted text-accent-primary flex items-center justify-center text-xs font-bold font-mono">2</span>
            Upload Screenshots
          </h2>

          <div className="grid grid-cols-2 gap-5 mb-6">
            {/* ESPN Schedule Upload */}
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              scheduleImage
                ? 'border-success bg-success-muted'
                : 'border-border-default hover:border-accent-primary hover:bg-accent-muted'
            }`}>
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'schedule');
                  }}
                  className="hidden"
                />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  scheduleImage ? 'bg-success-muted' : 'bg-bg-hover'
                }`}>
                  {scheduleImage ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Upload className="w-6 h-6 text-text-muted" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">ESPN Schedule</h3>
                <p className="text-xs text-text-tertiary mb-3">Screenshot of weekly game schedule</p>
                {scheduleFileName && (
                  <p className="text-[11px] font-mono text-success">{scheduleFileName}</p>
                )}
                {!scheduleFileName && (
                  <span className="text-xs text-text-secondary">Choose file</span>
                )}
              </label>
            </div>

            {/* RotoWire Odds Upload */}
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              oddsImage
                ? 'border-success bg-success-muted'
                : 'border-border-default hover:border-accent-primary hover:bg-accent-muted'
            }`}>
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'odds');
                  }}
                  className="hidden"
                />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  oddsImage ? 'bg-success-muted' : 'bg-bg-hover'
                }`}>
                  {oddsImage ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Upload className="w-6 h-6 text-text-muted" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">RotoWire Odds</h3>
                <p className="text-xs text-text-tertiary mb-3">Screenshot of betting odds table</p>
                {oddsFileName && (
                  <p className="text-[11px] font-mono text-success">{oddsFileName}</p>
                )}
                {!oddsFileName && (
                  <span className="text-xs text-text-secondary">Choose file</span>
                )}
              </label>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleExtract}
              disabled={extracting || !scheduleImage || !oddsImage || !weekNumber || !seasonYear}
              size="lg"
              className="px-8"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract & Generate Article
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="bg-error-muted border-error">
            <AlertCircle className="h-4 w-4 text-error" />
            <AlertDescription className="text-text-primary">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-success bg-success-muted">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-text-primary">
              Article generated successfully! Opening project...
            </AlertDescription>
          </Alert>
        )}

        {/* How It Works */}
        <Card className="p-8 hover:translate-y-0">
          <h2 className="text-base font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ai-accent" />
            How the AI Extraction Works
          </h2>
          
          <div className="grid grid-cols-4 gap-6">
            {[
              { num: 1, title: 'Upload Images', desc: 'Provide screenshots of the ESPN schedule and RotoWire odds', color: 'accent-primary' },
              { num: 2, title: 'Visual AI Extracts', desc: 'Claude Vision parses games, times, spreads, and totals', color: 'ai-accent' },
              { num: 3, title: 'Data Structured', desc: 'Extracted data is organized into a clean format', color: 'success' },
              { num: 4, title: 'Article Generated', desc: 'Content Agent creates your complete article', color: 'accent-primary' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className={`w-8 h-8 rounded-full border-2 border-${step.color} flex items-center justify-center mx-auto mb-3 text-[13px] font-bold font-mono text-${step.color}`}>
                  {step.num}
                </div>
                <h3 className="text-[13px] font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-xs text-text-tertiary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
