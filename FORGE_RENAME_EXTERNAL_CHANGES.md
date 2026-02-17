# Forge Rename - External Changes Required

This document outlines all the external changes you need to make after renaming the application from RotoWrite to Forge.

## ✅ Completed in Codebase

The following changes have been completed in the codebase:

- ✅ `package.json` - Updated name to "forge"
- ✅ `app/layout.tsx` - Updated metadata title to "Forge - Editorial Command Center"
- ✅ `README.md` - Updated all references to Forge
- ✅ All documentation files (`.md`) - Updated references
- ✅ All TypeScript/TSX files - Updated references
- ✅ HTML mockup files - Renamed from `rotowrite-*` to `forge-*`
- ✅ `.cursorrules` - Updated project name
- ✅ All AI agent prompts - Updated references
- ✅ All component files - Updated references

## 🔧 External Changes Required

### 1. Vercel Deployment

**Project Settings:**

1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to **Settings** → **General**
4. Update the following:
   - **Project Name**: `gdc-forge` ✅ (Already updated)
   - **Production URL**: `gdcforce.vercel.app` ✅ (Already set)
   - **Production Branch**: Verify it's still `main`

**Environment Variables:**

No changes needed to environment variables - they remain the same:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROK_API_KEY
OPENAI_API_KEY
TAVILY_API_KEY
NEXT_PUBLIC_APP_URL
BETA_SIGNUP_TOKEN
CURSOR_REMOTE_AGENT_TOKEN
```

**Domain Settings:**

Current setup:
- **Vercel Project**: `gdc-forge`
- **Production URL**: `https://gdcforce.vercel.app`

If you want to add a custom domain:
1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `forge.yourdomain.com`)
3. Update DNS records as instructed by Vercel

**Redeploy:**

After code changes, trigger a new deployment:
- Push to your main branch, or
- Click **Deployments** → **Redeploy** on the latest deployment

---

### 2. Supabase Configuration

**Project Settings:**

1. Log into [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Update **Project Name**: Change to "Forge" (optional, for clarity)

**Database Changes:**

⚠️ **IMPORTANT**: No database schema changes are required. All table names, column names, and data remain the same.

**API Keys:**

No changes needed - your Supabase API keys remain valid:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Row Level Security (RLS):**

No changes needed - all RLS policies remain active and unchanged.

**Auth Settings:**

1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL**:
   - Current: `https://gdcforce.vercel.app`
   - Verify this is set correctly
3. Update **Redirect URLs**:
   - Add: `https://gdcforce.vercel.app/**`
   - Keep: `http://localhost:5309/**` (for local dev)
   - Remove old RotoWrite URLs if present

---

### 3. GitHub Repository (Optional)

If you want to rename the GitHub repository:

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Repository name**
4. Change from `RotoWrite` to `Forge`
5. Click **Rename**

**Update Local Git Remote:**

After renaming on GitHub, update your local repository:

```bash
cd /Users/jeremybotter/Desktop/Development/RotoWrite
git remote set-url origin https://github.com/YOUR_USERNAME/Forge.git
```

**Rename Local Folder:**

```bash
cd /Users/jeremybotter/Desktop/Development
mv RotoWrite Forge
cd Forge
```

---

### 4. API Keys & External Services

**No changes required** for the following services:
- ✅ **Grok API** - Key remains valid
- ✅ **OpenAI API** - Key remains valid
- ✅ **Tavily API** - Key remains valid

These services don't care about your application name.

---

### 5. Custom Domain / DNS (If Applicable)

If you have a custom domain pointing to your app:

**Option A: Keep existing domain**
- No changes needed
- The app will work with the new name

**Option B: Update to new domain**

1. **Purchase/Configure New Domain** (e.g., `forge.yourdomain.com`)
2. **Update DNS Records:**
   - Add CNAME record pointing to Vercel
   - Example: `forge.yourdomain.com` → `cname.vercel-dns.com`
3. **Add Domain in Vercel:**
   - Go to **Settings** → **Domains**
   - Add new domain
   - Verify DNS propagation
4. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_APP_URL=https://gdcforce.vercel.app
   ```
   
   Or if using custom domain:
   ```env
   NEXT_PUBLIC_APP_URL=https://forge.yourdomain.com
   ```
5. **Update Supabase Auth URLs** (see section 2 above)

---

### 6. Email Notifications (If Configured)

If you're using email notifications for user registration/password resets:

1. **Check Email Templates** in Supabase:
   - Go to **Authentication** → **Email Templates**
   - Update any references to "RotoWrite" in email content
   - Update links to use new domain (if changed)

2. **Email Subjects:**
   - Change "Welcome to RotoWrite" → "Welcome to Forge"
   - Change "RotoWrite Password Reset" → "Forge Password Reset"

---

### 7. Browser Bookmarks & Favorites

**For You and Your Team:**

Update any bookmarks to:
- **Production URL**: `https://gdcforce.vercel.app`
- **Local Dev**: `http://localhost:5309`

---

### 8. Documentation & Communication

**Update External Documentation:**

- [ ] Update any external wikis or documentation
- [ ] Update team communication (Slack, Discord, etc.)
- [ ] Update any training materials or guides
- [ ] Update any presentation decks or demos

**Notify Users:**

If you have existing users, consider:
- Sending an email announcement about the rebrand
- Adding a banner in the app (temporary)
- Updating any marketing materials

---

## 🚀 Deployment Checklist

Use this checklist to ensure everything is updated:

### Pre-Deployment
- [x] All code references updated to "Forge"
- [x] Package.json updated
- [x] README updated
- [x] Documentation updated
- [ ] Local folder renamed (optional)
- [ ] Git repository renamed (optional)

### Vercel
- [x] Project name updated to `gdc-forge`
- [x] Production URL set to `gdcforce.vercel.app`
- [ ] Environment variables verified (no changes needed)
- [ ] New deployment triggered after code push

### Supabase
- [ ] Project name updated (optional)
- [ ] Auth Site URL set to `https://gdcforce.vercel.app`
- [ ] Auth Redirect URLs include `https://gdcforce.vercel.app/**`
- [ ] Email templates updated (if applicable)

### Communication
- [ ] Team notified of rebrand
- [ ] Users notified (if applicable)
- [ ] Bookmarks updated
- [ ] External documentation updated

---

## 🔍 Verification Steps

After making all changes, verify everything works:

1. **Local Development:**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:5309`
   - Verify app title shows "Forge - Editorial Command Center"
   - Check browser tab title

2. **Production Deployment:**
   - Visit your production URL
   - Verify app title shows "Forge"
   - Test user login/registration
   - Test all major features

3. **Database Connectivity:**
   - Verify Supabase connection works
   - Test creating/reading data
   - Verify RLS policies still work

4. **Auth Flow:**
   - Test user registration
   - Test user login
   - Test password reset
   - Check email notifications (if configured)

---

## 📞 Support

If you encounter any issues during the rename:

1. **Check Vercel Logs:**
   - Vercel Dashboard → Deployments → View Logs

2. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → API Logs

3. **Check Browser Console:**
   - Open DevTools → Console tab
   - Look for any errors

4. **Rollback if Needed:**
   - Vercel: Redeploy a previous working deployment
   - Code: `git revert` to previous commit

---

## 📝 Notes

- **Database**: No schema changes required - all tables, columns, and data remain unchanged
- **API Keys**: All API keys remain valid - no need to regenerate
- **User Data**: All user accounts, projects, and content remain intact
- **Functionality**: No code functionality changes - only branding updates

---

## ✨ Summary

**What Changed:**
- Application name: RotoWrite → Forge
- UI branding and text references
- File names (HTML mockups, etc.)

**What Stayed the Same:**
- Database schema and data
- API keys and credentials
- Core functionality
- User accounts and permissions
- Environment variable names

**Time Estimate:**
- Vercel updates: ~5 minutes
- Supabase updates: ~5 minutes
- Domain updates (if applicable): ~15-30 minutes
- Testing: ~10 minutes
- **Total: ~25-50 minutes**

---

**Last Updated:** February 17, 2026
**Version:** 1.0
