# Microsoft SSO Integration Setup Guide

## Overview
This guide covers the setup for Microsoft SSO (Single Sign-On) using Azure AD with Supabase authentication.

## Environment Variables Needed

Add these to your `.env.local` file once you receive the values from IT:

```bash
# Existing Supabase vars (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Azure AD / Microsoft SSO Configuration (from IT)
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
```

## For IT Department: Azure Portal Registration

### 1. Register Application in Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Name: `Forge SSO`
4. Supported account types: Choose based on your needs
   - **Single tenant**: Only your organization
   - **Multitenant**: Any organization
   - **Personal accounts**: Consumer Microsoft accounts

### 2. Configure Redirect URIs
Add these redirect URIs in the app registration:

**For Supabase Integration:**
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

**For local development:**
```
http://localhost:5309/auth/callback
http://localhost:54321/auth/v1/callback
```

### 3. Create Client Secret
1. Go to **Certificates & secrets** > **New client secret**
2. Description: `Forge Supabase Integration`
3. Expiry: Choose appropriate duration
4. **Save the secret value** - you'll need this for Supabase

### 4. API Permissions
Required permissions:
- `User.Read` (Delegated) - Read user profile
- `email` (Delegated) - Read user email
- `openid` (Delegated) - Sign in with OpenID Connect
- `profile` (Delegated) - Read user's basic profile

Grant admin consent if required by your organization.

### 5. Information to Provide
After registration, provide these values:
- **Application (client) ID**: Found on the app overview page
- **Directory (tenant) ID**: Found on the app overview page
- **Client Secret Value**: From step 3
- **Redirect URI**: Confirm the Supabase callback URL

## Supabase Dashboard Configuration

### Configure Azure Provider in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Azure** and enable it
4. Enter the following from Azure:
   - **Azure Client ID**: Application (client) ID from Azure
   - **Azure Client Secret**: Secret value from Azure
   - **Azure Tenant**: Tenant ID (or "common" for multi-tenant)
5. Save configuration

### Configure Site URL and Redirect URLs
In **Authentication** > **URL Configuration**, ensure:
- **Site URL**: `https://your-domain.com` (production) or `http://localhost:5309` (development)
- **Redirect URLs**: Add your application URLs

## Testing Checklist

- [ ] Azure app registration complete
- [ ] Client ID and Secret added to Supabase
- [ ] Redirect URIs configured correctly
- [ ] Environment variables added to `.env.local`
- [ ] Test SSO flow in development
- [ ] Test SSO flow in production
- [ ] Verify user data syncs correctly to users table

## Troubleshooting

### Common Issues

**"Redirect URI mismatch"**
- Ensure the redirect URI in Azure matches exactly what Supabase uses
- Check for trailing slashes

**"Invalid client secret"**
- Secret may have expired
- Create a new secret in Azure portal

**"User not created in database"**
- Check Supabase auth webhook or trigger functions
- Verify the `users` table insert trigger is working

## Security Notes

- Never commit `.env.local` or any file containing secrets
- Rotate client secrets regularly (set expiration in Azure)
- Use separate Azure app registrations for dev/staging/production
- Implement proper session management and token refresh
