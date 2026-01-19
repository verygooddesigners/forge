'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, notes?: string) => void;
}

const feedbackReasons = [
  { value: 'inaccurate_information', label: 'Inaccurate Information', description: 'Contains factual errors or false claims' },
  { value: 'outdated_information', label: 'Outdated Information', description: 'Information is no longer current or relevant' },
  { value: 'unreliable_source', label: 'Unreliable Source', description: 'Source lacks credibility or trustworthiness' },
  { value: 'off_topic', label: 'Off-Topic/Not Relevant', description: 'Content doesn\'t relate to the story topic' },
  { value: 'duplicate_content', label: 'Duplicate Content', description: 'Same information already covered by another source' },
  { value: 'misleading_headline', label: 'Misleading Headline', description: 'Title doesn\'t match actual content' },
  { value: 'other', label: 'Other', description: 'Different issue not listed above' },
];

export function FeedbackModal({ open, onOpenChange, onSubmit }: FeedbackModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    onSubmit(selectedReason, additionalNotes || undefined);
    
    // Reset form
    setSelectedReason('');
    setAdditionalNotes('');
  };

  const handleCancel = () => {
    setSelectedReason('');
    setAdditionalNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Why are you flagging this article?
          </DialogTitle>
          <DialogDescription>
            Help us improve research quality by letting us know what's wrong with this source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            <div className="space-y-3">
              {feedbackReasons.map((reason) => (
                <div key={reason.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={reason.value} 
                    id={reason.value}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={reason.value}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{reason.label}</div>
                    <div className="text-xs text-muted-foreground">{reason.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedReason && (
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Provide more details about the issue..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedReason}
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
