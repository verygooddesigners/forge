'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithMicrosoft, isMicrosoftSSOEnabled } from '@/lib/auth-microsoft';

interface MicrosoftSignInButtonProps {
  redirectTo?: string;
  className?: string;
  disabled?: boolean;
}

export function MicrosoftSignInButton({
  redirectTo = '/dashboard',
  className,
  disabled = false,
}: MicrosoftSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render if Microsoft SSO is not configured
  if (!isMicrosoftSSOEnabled()) {
    return null;
  }

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithMicrosoft(redirectTo);
      // User will be redirected to Microsoft's OAuth page
    } catch (err: any) {
      console.error('[Microsoft Sign In] Error:', err);
      setError(err.message || 'Failed to sign in with Microsoft');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        className={`w-full ${className}`}
        onClick={handleSignIn}
        disabled={disabled || loading}
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Microsoft'}
      </Button>
      {error && (
        <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
