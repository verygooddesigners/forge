'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // #region agent log
    const loginStartTime = Date.now();
    console.log('[Login] Starting login attempt:', { email, timestamp: new Date().toISOString() });
    // #endregion

    try {
      const supabase = createClient();
      
      // #region agent log
      console.log('[Login] Client created, calling signInWithPassword');
      // #endregion
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // #region agent log
      console.log('[Login] signInWithPassword completed:', {
        hasUser: !!data?.user,
        hasError: !!error,
        errorMessage: error?.message,
        duration: Date.now() - loginStartTime
      });
      // #endregion

      if (error) throw error;

      if (data.user) {
        // #region agent log
        console.log('[Login] Login successful, redirecting to dashboard');
        // #endregion
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      // #region agent log
      console.error('[Login] Login error:', {
        errorType: err?.constructor?.name,
        message: err?.message,
        fullError: err,
        duration: Date.now() - loginStartTime
      });
      // #endregion
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegisterSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegisterSuccess(true);
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      });

      if (error) throw error;

      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deepest p-4">
      <Card className="w-full max-w-md border-border-default hover:translate-y-0">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center font-mono font-bold text-sm text-bg-deepest">
              RW
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Roto<span className="text-accent-primary">Write</span>
          </CardTitle>
          <CardDescription className="text-text-secondary">
            {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="border-b-2 border-t-0 border-l-0 border-r-0 border-primary/30 focus:border-primary rounded-none px-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="border-b-2 border-t-0 border-l-0 border-r-0 border-primary/30 focus:border-primary rounded-none px-0"
                  />
                </div>
                {error && activeTab === 'login' && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}
                {resetSent && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    Password reset email sent! Check your inbox.
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-muted-foreground hover:text-primary underline"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="border-b-2 border-t-0 border-l-0 border-r-0 border-primary/30 focus:border-primary rounded-none px-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="border-b-2 border-t-0 border-l-0 border-r-0 border-primary/30 focus:border-primary rounded-none px-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="border-b-2 border-t-0 border-l-0 border-r-0 border-primary/30 focus:border-primary rounded-none px-0"
                  />
                </div>
                {error && activeTab === 'register' && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}
                {registerSuccess && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    Registration successful! Please check your email to verify your account.
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


