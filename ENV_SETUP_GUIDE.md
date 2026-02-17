# Forge Environment Variables Setup Guide

**Purpose:** Complete guide for setting up all required environment variables for beta launch

---

## 📋 Current Status

### ✅ Already Configured (Development)

```bash
# Claude API (Primary AI Engine)
CLAUDE_API_KEY=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

# Supabase (Current - Personal Account)
NEXT_PUBLIC_SUPABASE_URL=https://ybrhwafnetvcgrrmxgvy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aII9NCsk7urNhQYWL37TFw_bf2ONoHb
SUPABASE_SERVICE_ROLE_KEY=sb_secret_puAZ96UmtgKrt-KdRBi_dw_Y9huffXQ

# Tavily API (News Search)
TAVILY_API_KEY=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

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:5309
```

### ⏳ Need to Add

```bash
# OpenAI API (Embeddings + Vision)
OPENAI_API_KEY=

# LanguageTool API (Grammar - Optional)
LANGUAGETOOL_API_KEY=

# Beta Signup Token (Internal)
BETA_SIGNUP_TOKEN=
```

---

## 🔴 CRITICAL: Production Environment Variables

### Step 1: Get Missing API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign in or create account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

#### LanguageTool API Key (Optional)
1. Go to https://languagetool.org/
2. Sign up for account
3. Can use free tier initially
4. For premium, get API key from dashboard
5. Add to `.env.local`:
   ```bash
   LANGUAGETOOL_API_KEY=your-key-here
   ```

#### Beta Signup Token
1. Generate a secure random string
2. Example: `beta-rotowrite-2026-secure-XYZ123`
3. Add to `.env.local`:
   ```bash
   BETA_SIGNUP_TOKEN=beta-rotowrite-2026-secure-XYZ123
   ```

---

### Step 2: Update Supabase Keys (After Migration)

Once IT grants permissions and you create the company Supabase project:

1. Go to new Supabase project settings
2. Navigate to API section
3. Copy the three keys:
   - Project URL
   - Anon/Public key
   - Service Role key

4. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
   ```

---

### Step 3: Configure Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your Forge project
3. Go to Settings → Environment Variables
4. Add ALL variables from `.env.local`:

**Production Environment Variables:**

```bash
# AI Services
CLAUDE_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key
TAVILY_API_KEY=your-tavily-key
LANGUAGETOOL_API_KEY=your-languagetool-key

# Supabase (Company Account)
NEXT_PUBLIC_SUPABASE_URL=https://your-company-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-company-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-company-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://rotowrite.vercel.app

# Beta Access
BETA_SIGNUP_TOKEN=your-secure-token

# Optional Development Tools
CURSOR_REMOTE_AGENT_TOKEN=your-cursor-token (optional)
```

5. Set environment for each variable:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Click "Save"

---

### Step 4: Redeploy Application

After adding all environment variables to Vercel:

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger auto-deploy:
   ```bash
   git commit --allow-empty -m "Update environment variables"
   git push origin main
   ```

4. Wait for deployment to complete
5. Test production site: https://rotowrite.vercel.app

---

## 🔒 Security Best Practices

### DO:
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use different keys for dev and production
- ✅ Rotate keys quarterly
- ✅ Use service role key only server-side
- ✅ Store keys in password manager

### DON'T:
- ❌ Commit `.env.local` to git
- ❌ Share keys in Slack/email
- ❌ Use production keys in development
- ❌ Expose service role key to client
- ❌ Hardcode keys in source code

---

## 📝 Environment Variable Reference

### Required for Core Functionality

| Variable | Purpose | Where Used | Critical |
|----------|---------|------------|----------|
| `CLAUDE_API_KEY` | Powers all 8 AI agents | All AI features | 🔴 Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | Everywhere | 🔴 Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public database access | Client-side | 🔴 Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access | Server-side | 🔴 Yes |
| `OPENAI_API_KEY` | Embeddings + Vision | Writer Factory, NFL Odds | 🔴 Yes |

### Required for Key Features

| Variable | Purpose | Where Used | Critical |
|----------|---------|------------|----------|
| `TAVILY_API_KEY` | News search | NewsEngine, Research | 🟡 High |
| `BETA_SIGNUP_TOKEN` | Signup access control | Registration | 🟡 High |
| `NEXT_PUBLIC_APP_URL` | Redirects, emails | Auth callbacks | 🟡 High |

### Optional Enhancements

| Variable | Purpose | Where Used | Critical |
|----------|---------|------------|----------|
| `LANGUAGETOOL_API_KEY` | Grammar checking | Quality Assurance | 🟢 Optional |
| `CURSOR_REMOTE_AGENT_TOKEN` | Dev tool | Development only | 🟢 Optional |

---

## 🧪 Testing Environment Variables

### Local Testing

1. Ensure `.env.local` has all required variables
2. Restart dev server:
   ```bash
   npm run dev
   ```
3. Test each feature:
   - Content generation (Claude)
   - Writer Factory (OpenAI embeddings)
   - NewsEngine (Tavily)
   - Database operations (Supabase)

### Production Testing

1. After deploying with new env vars
2. Test in production:
   - Login/logout
   - Create project
   - Generate content
   - Search news
   - Train writer model
3. Check Vercel logs for errors
4. Verify all API calls succeed

---

## 🆘 Troubleshooting

### "Unauthorized" Errors
- Check Supabase keys are correct
- Verify keys are added to Vercel
- Ensure redeploy after adding keys

### "API Key Invalid" Errors
- Verify API key format (starts with correct prefix)
- Check key hasn't expired
- Ensure key has correct permissions

### Features Not Working
- Check Vercel deployment logs
- Verify environment variable names match exactly
- Ensure variables are set for Production environment
- Try redeploying

### Database Connection Issues
- Verify Supabase URL is correct
- Check anon key and service role key
- Ensure Supabase project is active
- Verify RLS policies are correct

---

## 📞 Support

**Issue with API Keys?**
- Check service provider documentation
- Verify billing is set up
- Check usage limits

**Issue with Deployment?**
- Check Vercel deployment logs
- Verify all env vars are set
- Try redeploying

**Issue with Database?**
- Check Supabase dashboard
- Verify migrations ran successfully
- Check RLS policies

---

## ✅ Checklist

Before beta launch, verify:

- [ ] All API keys obtained
- [ ] All keys added to `.env.local`
- [ ] All keys added to Vercel
- [ ] Supabase migrated to company account
- [ ] Production URL updated in env vars
- [ ] Beta signup token created
- [ ] Application redeployed
- [ ] All features tested in production
- [ ] Keys stored securely
- [ ] Documentation updated

---

**Last Updated:** February 11, 2026  
**Status:** Ready for final configuration 🔐
