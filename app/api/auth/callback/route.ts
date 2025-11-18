import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');

    // Handle password reset redirect
    if (type === 'recovery') {
      // Redirect to reset-password page with hash fragment
      const hash = requestUrl.hash || requestUrl.searchParams.get('hash') || '';
      return NextResponse.redirect(new URL(`/reset-password${hash}`, requestUrl.origin));
    }

    if (code) {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    // If Supabase is not configured, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}


