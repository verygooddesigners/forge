import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Skip middleware during build if env vars are missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null;
  try {
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('getUser timeout')), 5000)
    );

    const result = await Promise.race([getUserPromise, timeoutPromise]) as any;
    user = result?.data?.user || null;
  } catch {
    // On timeout or error, continue without user (fail open for non-protected routes)
    user = null;
  }

  // Public routes that don't require authentication
  const publicPaths = ['/system-architecture', '/login', '/signup', '/reset-password', '/api/auth', '/smartbrief-guide', '/guide'];
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // The awaiting-confirmation page is accessible to logged-in users
  const isAwaitingPage = request.nextUrl.pathname === '/awaiting-confirmation';

  // Protected routes - require authentication
  if (!isPublicPath && !isAwaitingPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if logged in and trying to access login
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // For authenticated users, check account_status
  // Skip for API routes, public paths, and the awaiting-confirmation page itself
  if (
    user &&
    !isPublicPath &&
    !isAwaitingPage &&
    !request.nextUrl.pathname.startsWith('/api/')
  ) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('account_status')
        .eq('id', user.id)
        .single();

      if (profile && profile.account_status === 'awaiting_confirmation') {
        const url = request.nextUrl.clone();
        url.pathname = '/awaiting-confirmation';
        return NextResponse.redirect(url);
      }
    } catch {
      // If we can't check status, let them through (fail open)
    }
  }

  return supabaseResponse;
}
