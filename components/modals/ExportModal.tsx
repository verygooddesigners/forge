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
import { AlertTriangle, Download, Copy, CheckCircle2, FileText, Code, FileType, FileDown } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { toast } from 'sonner';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

type ExportFormat = 'text' | 'markdown' | 'docx' | 'html';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  projectHeadline?: string;
}

function htmlToMarkdown(html: string): string {
  let text = html;

  // Convert headings
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

  // Convert formatting
  text = text.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  text = text.replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // Convert lists
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<ul[^>]*>/gi, '\n');
  text = text.replace(/<\/ul>/gi, '\n');
  text = text.replace(/<ol[^>]*>/gi, '\n');
  text = text.replace(/<\/ol>/gi, '\n');

  // Convert blockquotes
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');

  // Convert paragraphs and breaks
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode entities
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n+/g, '\n\n').trim();

  return text;
}

function tipTapJsonToDocxElements(json: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (!json?.content) return paragraphs;

  for (const node of json.content) {
    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level || 1;
        const headingLevel = level === 1 ? HeadingLevel.HEADING_1
          : level === 2 ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;
        paragraphs.push(
          new Paragraph({
            heading: headingLevel,
            children: inlineContentToRuns(node.content || []),
            spacing: { before: 240, after: 120 },
          })
        );
        break;
      }
      case 'paragraph': {
        paragraphs.push(
          new Paragraph({
            children: inlineContentToRuns(node.content || []),
            spacing: { after: 200 },
          })
        );
        break;
      }
      case 'bulletList':
      case 'orderedList': {
        if (node.content) {
          for (const listItem of node.content) {
            const itemContent = listItem.content?.[0]?.content || [];
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ text: node.type === 'bulletList' ? '• ' : '- ' }),
                  ...inlineContentToRuns(itemContent),
                ],
                indent: { left: 720 },
                spacing: { after: 80 },
              })
            );
          }
        }
        break;
      }
      case 'blockquote': {
        if (node.content) {
          for (const child of node.content) {
            paragraphs.push(
              new Paragraph({
                children: inlineContentToRuns(child.content || []),
                indent: { left: 720 },
                spacing: { after: 200 },
              })
            );
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return paragraphs;
}

function inlineContentToRuns(content: any[]): TextRun[] {
  if (!content || content.length === 0) {
    return [new TextRun({ text: '' })];
  }

  return content.map((item) => {
    const marks = item.marks || [];
    const isBold = marks.some((m: any) => m.type === 'bold');
    const isItalic = marks.some((m: any) => m.type === 'italic');
    const isCode = marks.some((m: any) => m.type === 'code');

    return new TextRun({
      text: item.text || '',
      bold: isBold,
      italics: isItalic,
      font: isCode ? 'Courier New' : undefined,
    });
  });
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'html', label: 'HTML', description: 'Formatted HTML code', icon: <Code className="h-4 w-4" /> },
  { value: 'markdown', label: 'Markdown', description: 'Markdown syntax', icon: <FileType className="h-4 w-4" /> },
  { value: 'text', label: 'Plain Text', description: 'Unformatted text', icon: <FileText className="h-4 w-4" /> },
  { value: 'docx', label: 'DOCX', description: 'Word document', icon: <FileDown className="h-4 w-4" /> },
];

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  text: 'txt',
  markdown: 'md',
  docx: 'docx',
  html: 'html',
};

const MIME_TYPES: Record<ExportFormat, string> = {
  text: 'text/plain',
  markdown: 'text/markdown',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  html: 'text/html',
};

export function ExportModal({ open, onOpenChange, editor, projectHeadline }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('html');
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const getBaseFilename = () => {
    return projectHeadline
      ? projectHeadline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : 'forge-export';
  };

  const getTextContent = (): string => {
    if (!editor) return '';

    switch (exportFormat) {
      case 'html':
        return editor.getHTML();
      case 'markdown':
        return htmlToMarkdown(editor.getHTML());
      case 'text':
        return editor.getText();
      case 'docx':
        return editor.getText(); // For clipboard copy fallback
      default:
        return editor.getText();
    }
  };

  const handleCopyToClipboard = async () => {
    if (!acknowledged || !editor) return;

    const content = getTextContent();

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!acknowledged || !editor) return;

    const filename = `${getBaseFilename()}.${FILE_EXTENSIONS[exportFormat]}`;

    try {
      if (exportFormat === 'docx') {
        const json = editor.getJSON();
        const doc = new Document({
          sections: [{
            children: tipTapJsonToDocxElements(json),
          }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename);
      } else {
        const content = getTextContent();
        const blob = new Blob([content], { type: MIME_TYPES[exportFormat] });
        saveAs(blob, filename);
      }
      toast.success(`Downloaded as ${filename}`);
    } catch (err) {
      toast.error('Failed to download file');
    }
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
              <p className="text-base">IMPORTANT: Review Before Publishing!</p>
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
            this content before publishing. I understand that AI-generated content
            requires human verification.
          </label>
        </div>

        {/* Export Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Export Format:</label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setExportFormat(option.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  exportFormat === option.value
                    ? 'border-accent-primary bg-accent-muted text-text-primary'
                    : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-default hover:text-text-primary'
                }`}
              >
                <span className={exportFormat === option.value ? 'text-accent-primary' : 'text-text-tertiary'}>
                  {option.icon}
                </span>
                <div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-text-tertiary">{option.description}</div>
                </div>
              </button>
            ))}
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
            {exportFormat !== 'docx' && (
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
            )}
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
