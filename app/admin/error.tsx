'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-[15px] font-semibold text-text-primary">Something went wrong</h2>
        <p className="text-[13px] text-text-tertiary max-w-sm">
          An error occurred in the admin panel. Your data is safe.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={reset}
      >
        Try again
      </Button>
    </div>
  );
}
