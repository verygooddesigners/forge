'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function ToolSubmissionClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    github_repo_url: '',
    contact_email: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit tool');
      }
    } catch (err) {
      console.error('Error submitting tool:', err);
      setError('Failed to submit tool. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-primary p-10">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Tool Submitted Successfully!
            </h2>
            <p className="text-text-secondary mb-6">
              Your tool has been submitted for review. An admin will review your submission and
              you'll be notified once it's approved.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/tools">
                <Button variant="outline">
                  Back to Marketplace
                </Button>
              </Link>
              <Button onClick={() => {
                setSubmitted(false);
                setFormData({ github_repo_url: '', contact_email: '', notes: '' });
              }}>
                Submit Another Tool
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/tools">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Submit a Tool
          </h1>
          <p className="text-text-secondary mt-2">
            Submit your Forge Tool for review and approval
          </p>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-violet-500/5 border-violet-500/20">
          <h3 className="font-semibold text-text-primary mb-2">
            Before you submit
          </h3>
          <ul className="text-sm text-text-secondary space-y-2">
            <li>• Make sure your GitHub repository is public</li>
            <li>• Include a <code className="bg-bg-elevated px-1 py-0.5 rounded">tool-manifest.json</code> file in the root</li>
            <li>• Review the <Link href="/tools/docs" className="text-violet-500 hover:underline">Developer Documentation</Link></li>
            <li>• Test your tool locally before submitting</li>
          </ul>
        </Card>

        {/* Submission Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="github_repo_url">
                GitHub Repository URL *
              </Label>
              <Input
                id="github_repo_url"
                type="url"
                placeholder="https://github.com/username/forge-tool"
                value={formData.github_repo_url}
                onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
                required
              />
              <p className="text-xs text-text-tertiary">
                The public GitHub repository containing your tool's code and manifest
              </p>
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">
                Contact Email (optional)
              </Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
              <p className="text-xs text-text-tertiary">
                We'll use this to contact you about your submission
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Additional Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about your tool..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.github_repo_url}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Tool for Review'
              )}
            </Button>
          </form>
        </Card>

        {/* Help Card */}
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-2">
            Need help?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Check out our comprehensive developer documentation to learn how to build Forge Tools.
          </p>
          <Link href="/tools/docs">
            <Button variant="outline">
              View Documentation
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
