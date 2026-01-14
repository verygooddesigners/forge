import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');
    const token_hash = requestUrl.searchParams.get('token_hash');

    // Handle password reset with token_hash
    if (type === 'recovery' && token_hash) {
      const supabase = await createClient();
      
      // Verify the token_hash and get session tokens
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      });

      if (error) {
        console.error('Error verifying recovery token:', error);
        return NextResponse.redirect(
          new URL('/reset-password?error=invalid_token', requestUrl.origin)
        );
      }

      // Redirect to reset-password page with session tokens in hash fragment
      if (data.session) {
        const hash = `#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&type=recovery`;
        return NextResponse.redirect(new URL(`/reset-password${hash}`, requestUrl.origin));
      }

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

      // Check if this is a newly verified user
      if (data.user && type === 'signup') {
        // Update user profile to ensure full_name is set if it was provided
        const fullName = data.user.user_metadata?.full_name;
        if (fullName) {
          await supabase
            .from('users')
            .update({ full_name: fullName })
            .eq('id', data.user.id);
        }
      }
    }

    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    // If Supabase is not configured, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}


