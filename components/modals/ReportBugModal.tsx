'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ReportBugModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmitted: () => void;
}

export function ReportBugModal({
  open,
  onOpenChange,
  userId,
  onSubmitted,
}: ReportBugModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const reset = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setSubmitting(false);
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null;
    setUploading(true);
    try {
      const ext = screenshotFile.name.split('.').pop() || 'png';
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('bug-screenshots')
        .upload(path, screenshotFile, { upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('bug-screenshots')
        .getPublicUrl(path);
      return publicUrl;
    } catch (err: any) {
      console.error('Screenshot upload error:', err);
      toast.error('Screenshot upload failed — bug will be submitted without it');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSubmitting(true);
    try {
      let screenshot_url: string | null = null;
      if (screenshotFile) {
        screenshot_url = await uploadScreenshot();
      }

      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          severity,
          screenshot_url,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }

      onSubmitted();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit bug report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg bg-bg-surface border-border-default">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">Report a Bug</DialogTitle>
          <DialogDescription className="text-text-tertiary text-sm">
            Describe the issue you encountered and we&apos;ll look into it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="bug-title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="bug-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short summary of the issue"
              className="form-field-bottom-line"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bug-desc">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="bug-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what happened, what you expected, and any steps to reproduce..."
              rows={4}
              className="text-sm"
            />
          </div>

          {/* Severity */}
          <div className="space-y-1.5">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Critical — app is unusable / data at risk
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                    High — major feature broken
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                    Medium — feature partially broken
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    Low — minor issue or cosmetic
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Screenshot upload */}
          <div className="space-y-1.5">
            <Label>Screenshot (optional)</Label>
            {screenshotPreview ? (
              <div className="relative inline-block">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="rounded-lg border border-border-default max-h-48 object-contain"
                />
                <button
                  onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-bg-surface border border-border-default shadow-sm hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3 text-text-tertiary" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-border-default rounded-xl text-text-tertiary hover:border-accent-primary/40 hover:text-accent-primary transition-all"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Click to upload a screenshot</span>
                <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-default">
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || submitting || uploading}
          >
            {(submitting || uploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Bug Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
