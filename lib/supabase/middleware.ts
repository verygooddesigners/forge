import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // #region agent log
  const startTime = Date.now();
  console.log('[Middleware] Entry:', { path: request.nextUrl.pathname, method: request.method, timestamp: new Date().toISOString() });
  // #endregion
  
  // Skip middleware during build if env vars are missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // #region agent log
  console.log('[Middleware] Env check:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey, urlPrefix: supabaseUrl?.substring(0, 30) });
  // #endregion
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // #region agent log
    console.log('[Middleware] Missing env vars - early exit:', { duration: Date.now() - startTime });
    // #endregion
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // #region agent log
  const beforeClientCreate = Date.now();
  console.log('[Middleware] Before client creation:', { cookieCount: request.cookies.getAll().length });
  // #endregion

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

  // #region agent log
  console.log('[Middleware] After client creation:', { duration: Date.now() - beforeClientCreate });
  // #endregion

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // #region agent log
  const beforeGetUser = Date.now();
  console.log('[Middleware] Before getUser call');
  // #endregion

  // Add timeout wrapper to prevent middleware hanging
  let user = null;
  try {
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getUser timeout')), 5000)
    );
    
    const result = await Promise.race([getUserPromise, timeoutPromise]) as any;
    user = result?.data?.user || null;
    
    // #region agent log
    console.log('[Middleware] After getUser call:', { hasUser: !!user, duration: Date.now() - beforeGetUser });
    // #endregion
  } catch (error) {
    // #region agent log
    console.error('[Middleware] getUser error:', { error: error instanceof Error ? error.message : 'unknown', duration: Date.now() - beforeGetUser });
    // #endregion
    // On timeout or error, continue without user (fail open for non-protected routes)
    user = null;
  }

  // Public routes that don't require authentication
  const publicPaths = ['/system-architecture', '/login', '/signup', '/reset-password', '/api/auth', '/smartbrief-guide'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // TEMPORARILY DISABLED FOR SCREENSHOTS - Protected routes
  // const protectedPaths = ['/dashboard', '/admin'];
  // const isProtectedPath = protectedPaths.some(path => 
  //   request.nextUrl.pathname.startsWith(path)
  // );

  // if (isProtectedPath && !isPublicPath && !user) {
  //   // #region agent log
  //   console.log('[Middleware] Redirecting to login:', { totalDuration: Date.now() - startTime });
  //   // #endregion
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }

  // Redirect to dashboard if logged in and trying to access login
  // if (request.nextUrl.pathname === '/login' && user) {
  //   // #region agent log
  //   console.log('[Middleware] Redirecting to dashboard:', { totalDuration: Date.now() - startTime });
  //   // #endregion
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/dashboard';
  //   return NextResponse.redirect(url);
  // }

  // #region agent log
  console.log('[Middleware] Complete:', { totalDuration: Date.now() - startTime, hasUser: !!user, path: request.nextUrl.pathname });
  // #endregion

  return supabaseResponse;
}


