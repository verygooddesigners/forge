import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');
    const token_hash = requestUrl.searchParams.get('token_hash');

    console.log('[Auth Callback] Request params:', { type, hasCode: !!code, hasTokenHash: !!token_hash });

    // Handle password reset - check for either token_hash OR code with type=recovery
    if (type === 'recovery') {
      const supabase = await createClient();
      
      if (token_hash) {
        // Method 1: Using token_hash (PKCE flow)
        console.log('[Auth Callback] Using verifyOtp with token_hash');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'recovery',
        });

        if (error) {
          console.error('[Auth Callback] Error verifying recovery token:', error);
          return NextResponse.redirect(
            new URL('/reset-password?error=invalid_token', requestUrl.origin)
          );
        }

        if (data.session) {
          console.log('[Auth Callback] Session established via verifyOtp');
          const hash = `#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&type=recovery`;
          return NextResponse.redirect(new URL(`/reset-password${hash}`, requestUrl.origin));
        }
      } else if (code) {
        // Method 2: Using code (standard flow)
        console.log('[Auth Callback] Using exchangeCodeForSession with recovery type');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('[Auth Callback] Error exchanging code:', error);
          return NextResponse.redirect(
            new URL('/reset-password?error=invalid_token', requestUrl.origin)
          );
        }

        if (data.session) {
          console.log('[Auth Callback] Session established via exchangeCodeForSession');
          const hash = `#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&type=recovery`;
          return NextResponse.redirect(new URL(`/reset-password${hash}`, requestUrl.origin));
        }
      }

      console.log('[Auth Callback] No valid token method found for recovery');
      return NextResponse.redirect(
        new URL('/reset-password?error=no_session', requestUrl.origin)
      );
    }

    // Handle regular OAuth/email verification with code
    if (code) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
      }

      console.log('[Auth Callback] Session established for user:', {
        userId: data.user?.id,
        email: data.user?.email,
        provider: data.user?.app_metadata?.provider,
      });

      // Handle user metadata for OAuth providers (Microsoft, etc.)
      if (data.user) {
        const provider = data.user.app_metadata?.provider;
        const isSSOUser = provider === 'azure' || provider === 'google' || provider === 'github';
        
        // For SSO users, sync metadata to users table
        if (isSSOUser) {
          const fullName = 
            data.user.user_metadata?.full_name || 
            data.user.user_metadata?.name ||
            data.user.user_metadata?.preferred_username?.split('@')[0];
          
          const avatarUrl = 
            data.user.user_metadata?.avatar_url || 
            data.user.user_metadata?.picture;

          if (fullName) {
            await supabase
              .from('users')
              .update({ 
                full_name: fullName,
                ...(avatarUrl && { avatar_url: avatarUrl })
              })
              .eq('id', data.user.id);
          }
        }

        // Check if this is a newly verified user (email signup)
        if (type === 'signup') {
          const fullName = data.user.user_metadata?.full_name;
          if (fullName) {
            await supabase
              .from('users')
              .update({ full_name: fullName })
              .eq('id', data.user.id);
          }
        }
      }

      // Check for custom redirect URL
      const next = requestUrl.searchParams.get('next');
      const redirectPath = next || '/dashboard';
      
      // Redirect to the specified path after successful authentication
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // No valid auth flow detected
    console.log('[Auth Callback] No valid auth flow detected, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    // If Supabase is not configured, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}


