import { createClient } from './supabase/client';

/**
 * Microsoft SSO Configuration
 */
export const MICROSOFT_SSO_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
  tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || 'common',
  authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY || 'common',
};

/**
 * Check if Microsoft SSO is configured
 */
export function isMicrosoftSSOEnabled(): boolean {
  return !!MICROSOFT_SSO_CONFIG.clientId;
}

/**
 * Sign in with Microsoft using Supabase Azure OAuth
 * @param redirectTo - URL to redirect to after successful sign-in (defaults to dashboard)
 */
export async function signInWithMicrosoft(redirectTo: string = '/dashboard') {
  try {
    const supabase = createClient();
    
    // Construct the redirect URL for after authentication
    const redirectURL = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    
    // Use Supabase's Azure OAuth provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile openid',
        redirectTo: redirectURL,
        queryParams: {
          // Use the tenant ID if configured
          tenant: MICROSOFT_SSO_CONFIG.tenantId,
        },
      },
    });

    if (error) {
      console.error('[Microsoft SSO] Sign in error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Microsoft SSO] Failed to initiate sign in:', error);
    throw error;
  }
}

/**
 * Handle Microsoft SSO callback
 * This is called after the user returns from Microsoft's OAuth flow
 */
export async function handleMicrosoftCallback() {
  try {
    const supabase = createClient();
    
    // Supabase automatically handles the OAuth callback
    // and sets the session cookie
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Microsoft SSO] Callback error:', error);
      throw error;
    }

    if (!session) {
      throw new Error('No session found after Microsoft sign in');
    }

    return session;
  } catch (error) {
    console.error('[Microsoft SSO] Callback handling failed:', error);
    throw error;
  }
}

/**
 * Get Microsoft user info from the current session
 */
export async function getMicrosoftUserInfo() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) return null;

    // Check if user signed in with Azure/Microsoft
    const isMicrosoftUser = user.app_metadata?.provider === 'azure';

    return {
      isMicrosoftUser,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      provider: user.app_metadata?.provider,
    };
  } catch (error) {
    console.error('[Microsoft SSO] Failed to get user info:', error);
    return null;
  }
}
