# Microsoft SSO Quick Start Guide

## Current Status: ✅ Code Ready, ⏳ Waiting for Azure Configuration

All the code for Microsoft SSO integration is now in place. You just need the Azure AD credentials from your IT department to activate it.

## What's Been Implemented

### 1. Authentication Library (`lib/auth-microsoft.ts`)
- ✅ `signInWithMicrosoft()` - Initiates Microsoft OAuth flow
- ✅ `isMicrosoftSSOEnabled()` - Checks if SSO is configured
- ✅ `getMicrosoftUserInfo()` - Gets user info from Microsoft profile
- ✅ `handleMicrosoftCallback()` - Processes OAuth callback

### 2. UI Components
- ✅ `MicrosoftSignInButton` - Reusable Microsoft sign-in button with icon
- ✅ Login page updated with SSO option and divider
- ✅ Automatically shows/hides based on configuration

### 3. Auth Callback Handler
- ✅ Enhanced to handle Microsoft OAuth flow
- ✅ Syncs user metadata (name, avatar) from Microsoft profile
- ✅ Supports custom redirect after sign-in

### 4. Documentation
- ✅ Complete setup guide for IT department
- ✅ Environment variable templates
- ✅ Troubleshooting guide

## To Activate Microsoft SSO

### Step 1: Get Credentials from IT Department

Send them `docs/microsoft-sso-setup.md` and ask for:

```bash
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Configure Supabase

1. Log into your Supabase dashboard
2. Go to **Authentication** → **Providers**
3. Enable **Azure** provider
4. Enter the credentials from IT:
   - Client ID
   - Client Secret
   - Tenant ID (or use "common")
5. Save changes

### Step 3: Add Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id-here
```

### Step 4: Restart Development Server

```bash
npm run dev
```

### Step 5: Test It Out

1. Go to `http://localhost:5309/login`
2. You should see a "Sign in with Microsoft" button
3. Click it and test the OAuth flow

## How It Works

1. **User clicks "Sign in with Microsoft"**
   - Calls `signInWithMicrosoft()` from `lib/auth-microsoft.ts`
   - Redirects to Microsoft's OAuth page

2. **User authenticates with Microsoft**
   - Enters their Microsoft credentials
   - Approves access (first time only)

3. **Microsoft redirects back to your app**
   - Callback handler at `/api/auth/callback` processes the OAuth code
   - Exchanges code for session token
   - Syncs user data to your database

4. **User is logged in**
   - Redirects to dashboard
   - User metadata includes Microsoft profile info

## Testing Checklist

When you receive the credentials:

- [ ] Add environment variables to `.env.local`
- [ ] Configure Supabase Azure provider
- [ ] Restart dev server
- [ ] Verify "Sign in with Microsoft" button appears on login page
- [ ] Click button and complete OAuth flow
- [ ] Verify redirect to dashboard after successful sign-in
- [ ] Check user record in database has correct name and email
- [ ] Test sign-out and sign-in again
- [ ] Test on production environment

## Files Modified/Created

### New Files
- `lib/auth-microsoft.ts` - Microsoft authentication logic
- `components/auth/MicrosoftSignInButton.tsx` - Sign-in button component
- `docs/microsoft-sso-setup.md` - IT department setup guide
- `docs/microsoft-sso-quick-start.md` - This file

### Modified Files
- `app/login/page.tsx` - Added Microsoft SSO button and imports
- `app/api/auth/callback/route.ts` - Enhanced to handle Microsoft OAuth

## Security Notes

- Environment variables are in `.env.local` (already in `.gitignore`)
- Client secrets should ONLY be in Supabase dashboard, never in code
- The Azure Client ID is public-facing (safe to include in frontend)
- Session management is handled securely by Supabase

## Troubleshooting

### Button doesn't appear
- Check that `NEXT_PUBLIC_AZURE_CLIENT_ID` is set in `.env.local`
- Restart the dev server after adding environment variables

### OAuth redirect fails
- Verify redirect URIs in Azure match Supabase callback URL
- Check Supabase logs for error messages

### User data not syncing
- Check browser console for errors
- Verify the `users` table has appropriate triggers/RLS policies

## Need Help?

Reference the full setup guide: `docs/microsoft-sso-setup.md`
