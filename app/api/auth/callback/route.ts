import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

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


