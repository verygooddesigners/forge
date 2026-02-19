'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Sparkles } from 'lucide-react';

interface SettingsPageClientProps {
  user: User;
}

export function SettingsPageClient({ user }: SettingsPageClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Customize your Forge experience</p>
        </div>

        <div className="space-y-6">
          {/* Writer Model Training */}
          <Card className="bg-bg-surface border-border-default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <Sparkles className="h-5 w-5 text-accent-primary" />
                Writer Model Training
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Train your personal AI writer model to match your writing style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">
                The Writer Factory lets you train an AI model on your writing style by providing sample content.
                The more samples you provide, the better the model will match your voice and tone.
              </p>
              <Button
                onClick={() => router.push('/writer-factory')}
                className="gap-2"
              >
                <Wrench className="h-4 w-4" />
                Open Writer Factory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
