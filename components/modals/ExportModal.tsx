'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Download, Copy, CheckCircle2 } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  projectHeadline?: string;
}

export function ExportModal({ open, onOpenChange, editor, projectHeadline }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'html' | 'text'>('html');
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const getContent = () => {
    if (!editor) return '';
    
    if (exportFormat === 'html') {
      return editor.getHTML();
    } else {
      return editor.getText();
    }
  };

  const handleCopyToClipboard = async () => {
    if (!acknowledged) {
      return;
    }

    const content = getContent();
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!acknowledged) {
      return;
    }

    const content = getContent();
    const filename = projectHeadline 
      ? `${projectHeadline.toLowerCase().replace(/\s+/g, '-')}.${exportFormat === 'html' ? 'html' : 'txt'}`
      : `rotowrite-export.${exportFormat === 'html' ? 'html' : 'txt'}`;
    
    const blob = new Blob([content], { type: exportFormat === 'html' ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setAcknowledged(false);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-bg-surface border-border-default">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Export Content</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Choose how you want to export your content.
          </DialogDescription>
        </DialogHeader>

        {/* Critical Warning */}
        <Alert variant="destructive" className="border-2 bg-error-muted border-error">
          <AlertTriangle className="h-5 w-5 text-error" />
          <AlertDescription className="ml-2 font-semibold text-text-primary">
            <div className="space-y-2">
              <p className="text-base">⚠️ IMPORTANT: DO NOT Copy & Paste Directly into RotoWire CMS!</p>
              <p className="text-sm font-normal text-text-secondary">
                This AI-generated content MUST be reviewed, edited, and fact-checked before publishing. 
                It may contain inaccuracies, outdated information, or errors that need correction.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Acknowledgement Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-bg-elevated border border-border-subtle rounded-lg">
          <input
            type="checkbox"
            id="acknowledge"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border-default bg-bg-surface accent-accent-primary"
          />
          <label htmlFor="acknowledge" className="text-sm cursor-pointer text-text-secondary">
            <span className="font-semibold text-text-primary">I acknowledge</span> that I will review, edit, and fact-check 
            this content before publishing it to the RotoWire CMS. I understand that AI-generated content 
            requires human verification.
          </label>
        </div>

        {/* Export Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Export Format:</label>
          <div className="flex gap-2">
            <Button
              variant={exportFormat === 'html' ? 'default' : 'ghost'}
              onClick={() => setExportFormat('html')}
              className="flex-1"
            >
              HTML
            </Button>
            <Button
              variant={exportFormat === 'text' ? 'default' : 'ghost'}
              onClick={() => setExportFormat('text')}
              className="flex-1"
            >
              Plain Text
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCopyToClipboard}
              disabled={!acknowledged || !editor}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!acknowledged || !editor}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
