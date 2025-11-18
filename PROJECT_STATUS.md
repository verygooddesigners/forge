# RotoWrite - Project Status

**Last Updated:** November 18, 2025  
**Deployed:** https://rotowrite.vercel.app  
**Repository:** https://github.com/verygooddesigners/rotowrite

---

## ✅ What's Been Built

### Core Application
- **Next.js 14 App** (App Router, React 19, TypeScript)
- **Supabase Backend** (PostgreSQL, Auth, Row Level Security)
- **Claude API Integration** (content generation, style analysis)
- **TipTap Rich Text Editor** (with toolbar, word count)
- **Shadcn UI Components** (Tailwind CSS, violet theme, Inter font)

### Features Implemented

#### 1. Writer Factory (70% width modal)
- Create and manage AI writer models
- Training system with progress tracking (X% trained, 0/25 stories)
- Training content submission with automatic style analysis
- Sidebar for model selection
- Success notifications after training
- Auto-clear textarea after submission

#### 2. Brief Builder (70% width modal)
- Create and manage SEO briefs/scaffolds
- TipTap editor for content templates
- Category management
- Shared/private briefs
- Same layout as Writer Factory

#### 3. Project Creation Workflow
- Multi-step wizard: Details → Writer Model → Brief
- Headline, keywords, topic, word count input
- Writer model selection
- Brief template selection
- Creates project in database

#### 4. Dashboard Layout
- Left Sidebar: User profile, navigation (Projects, Writer Factory, Briefs, Admin)
- Center: Editor Panel with Generate Content button
- Right Sidebar: Writer Model card, NewsEngine, SEO Assistant
- Project headline/keywords display in editor header

#### 5. Generate Content Button
- Loads project data (headline, keywords, topic, brief)
- Calls RAG system to find training examples
- Streams AI-generated content into editor
- Converts plain text to TipTap JSON format
- Auto-saves content

#### 6. NewsEngine (Tavily API)
- Searches for relevant news articles
- Uses headline + keywords + topic
- Displays in right sidebar
- Refresh button
- Last 3 weeks of news

#### 7. SEO Assistant
- Real-time SEO score display (placeholder)
- AI-powered suggestions
- Keyword density tracking
- Heading structure validation

#### 8. Admin Panel
- User management (create, edit, delete users)
- Password-based user creation
- Role management (Admin/Strategist)
- API key configuration (placeholder)
- AI master instructions tuner

#### 9. Authentication
- Supabase Auth integration
- Login page
- Password reset flow (email link → reset-password page)
- "Forgot password?" functionality
- Protected routes with middleware
- Row Level Security (RLS) policies

#### 10. Auto-Save
- Debounced auto-save (2-second delay)
- Save status indicator
- Word count tracking
- Last saved timestamp

---

## 🐛 Current Known Issues

### 1. Writer Model Card Shows Wrong Model
**Problem:** RightSidebar shows "Jeremy Botter" instead of the selected writer model (e.g., "Blake Weishaar")

**Cause:** Likely one of:
- `writerModelId` prop not being passed correctly from DashboardLayout
- Project data not loading writer_model_id
- State not updating when project changes
- Caching issue

**What's Been Tried:**
- Added writer model loading from project data
- Added console logging (check browser console)
- Reset writer model state when project changes
- Load from both `writerModelId` prop and `project.writer_model_id`

**Next Steps:**
- Check browser console for logs: "Loading writer model: [id]", "Writer model loaded: [name]"
- Verify project has correct `writer_model_id` in database
- Check if `writerModelId` prop is being passed from DashboardLayout

### 2. Generate Content Button Fails
**Problem:** Clicking "Generate Content" shows error: "Failed to generate content, please try again"

**Possible Causes:**
- Claude API key not set in Vercel environment
- Missing training content for writer model
- Brief content not loading correctly
- API route error

**What's Been Tried:**
- Added TipTap JSON to text conversion for brief content
- Improved error handling to show specific error messages
- Added console logging
- Added fallback for missing brief content

**Next Steps:**
- Check browser console for error details
- Check Vercel function logs for server-side errors
- Verify Claude API key is set in Vercel
- Verify writer model has training content
- Check that brief content loads correctly

### 3. NewsEngine Shows "Open a project to see relevant news"
**Problem:** NewsEngine tab doesn't show news articles even when project is open

**Possible Causes:**
- Project not loading correctly in RightSidebar
- Condition checking for headline/keyword too strict
- Tavily API key not set or API error
- News fetch not being called

**What's Been Tried:**
- Removed strict condition (now checks if project exists)
- Added topic field to news search
- Load project data in RightSidebar

**Next Steps:**
- Check browser console for "Loading project: [id]" and "Project loaded: [headline]"
- Check if fetchNews() is being called
- Verify Tavily API key is set in Vercel
- Check network tab for API request/response

---

## 🔧 Tech Stack

- **Frontend:** Next.js 16.0.3, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn UI, Inter font
- **Editor:** TipTap 3.10.7
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **AI:** Claude API (Anthropic) - Sonnet 3.5
- **News:** Tavily AI Search API
- **Deployment:** Vercel
- **Port:** localhost:5309 (development)

---

## 🔑 Environment Variables

### Required in Vercel

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ybrhwafnetvcgrrmxgvy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[JWT token starting with eyJ...]
SUPABASE_SERVICE_ROLE_KEY=[JWT token starting with eyJ...]

# AI Provider
CLAUDE_API_KEY=[Your Claude API key]

# News Search (optional)
TAVILY_API_KEY=[Your Tavily API key]

# App URL
NEXT_PUBLIC_APP_URL=https://rotowrite.vercel.app
```

### Where to Find Supabase Keys
1. Go to: https://supabase.com/dashboard/project/ybrhwafnetvcgrrmxgvy
2. Settings → API
3. Copy "anon public" and "service_role secret" keys

---

## 📊 Database Schema

### Tables
- `users` - User profiles (extends auth.users)
- `writer_models` - AI writer model configs
- `training_content` - Training examples with analyzed_style (no embeddings)
- `categories` - Categories for briefs/projects
- `briefs` - SEO scaffolds/templates
- `projects` - Content creation projects
- `api_keys` - Encrypted API keys
- `ai_settings` - Global AI configuration

### Migrations
1. `00001_initial_schema.sql` - Tables, indexes
2. `00002_row_level_security.sql` - RLS policies, roles
3. `00003_seed_data.sql` - Default categories

**Note:** The `training_content` table has an unused `embedding vector(1536)` column that should be removed (legacy from OpenAI embeddings).

---

## 🔄 RAG System (Claude-Only)

**Architecture:**
- No vector embeddings (removed OpenAI dependency)
- Stores writing samples in `training_content`
- Claude analyzes style (tone, voice, vocabulary)
- Retrieves most recent training examples (up to 5)
- Claude uses examples to match style during generation

**Files:**
- `lib/rag.ts` - RAG logic
- `lib/ai.ts` - Claude API integration
- `app/api/writer-models/train/route.ts` - Training endpoint
- `app/api/generate/route.ts` - Content generation endpoint

---

## 🚀 Deployment Status

### Latest Commits
```
07b7a74 - Fix three issues: writer model loading with debugging
5674c3f - Reset writer model when project changes
9430dbb - Improve writer model loading
b43cdf1 - Fix content generation: convert TipTap brief JSON
4310841 - Include topic field in NewsEngine
2c2a917 - Fix Writer Model display
7ced1ca - Add Generate Content button
a37df0f - Fix user creation
```

### Build Status
- ✅ TypeScript compilation passes
- ✅ All pages marked as `force-dynamic` to avoid SSR errors
- ✅ TipTap configured with `immediatelyRender: false`
- ✅ Error handling for missing Supabase env vars
- ⚠️ Runtime issues with writer model loading and content generation

---

## 🎯 Next Steps to Fix Issues

### 1. Debug Writer Model Display
```
Open browser console (F12) on rotowrite.vercel.app and check for:
- "Loading project: [id]"
- "Project loaded: [headline] Writer Model ID: [id]"
- "Loading writer model: [id]"
- "Writer model loaded: [name]"
- Any error messages
```

**If you see "Writer model loaded: Blake Weishaar" but it still shows "Jeremy Botter":**
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Clear browser cache
- Check if there's a stale build cache

**If you don't see the logs:**
- Project might not be loading
- writerModelId might be null
- Check database to verify project has correct writer_model_id

### 2. Debug Generate Content
```
Check browser console for:
- "Generating content with: {projectId, headline, ...}"
- Any error messages from the API
```

**Check Vercel function logs:**
- Go to Vercel dashboard → Deployments → [latest] → Functions
- Look for errors in the `/api/generate` function
- Common errors: Missing CLAUDE_API_KEY, no training content, API rate limits

**Verify:**
- Claude API key is set in Vercel environment variables
- Writer model has training content (go to Writer Factory, check model)
- Brief exists and has content

### 3. Debug NewsEngine
```
Check browser console for:
- "Loading project: [id]"
- "Project loaded: [headline] Writer Model ID: [id]"
- Network tab: Check if /api/news/search is being called
```

**Verify:**
- Tavily API key is set in Vercel (optional, will fail gracefully if missing)
- Project has headline or primary_keyword
- fetchNews() is being called (check console)

---

## 📝 Database Cleanup Needed

### Remove Unused Vector Column
The `training_content` table still has an `embedding vector(1536)` column that's no longer used (from when we used OpenAI embeddings).

**To remove:**
```sql
-- In Supabase SQL Editor
ALTER TABLE training_content DROP COLUMN IF EXISTS embedding;
```

### Remove Unused Function
The `match_training_content` SQL function in `00001_initial_schema.sql` references vector search and is no longer needed.

---

## 🔍 How to Debug Tomorrow

### 1. Check Vercel Logs
- Vercel Dashboard → Project → Logs
- Filter by "Errors" or specific function (e.g., `/api/generate`)
- Look for authentication errors, API key errors, database errors

### 2. Check Browser Console
- Open rotowrite.vercel.app
- F12 → Console tab
- Look for the console.log statements added for debugging
- Note any error messages

### 3. Check Supabase Data
- Go to Table Editor in Supabase Dashboard
- Check `projects` table: verify writer_model_id is set correctly
- Check `writer_models` table: verify models exist
- Check `training_content` table: verify training examples exist
- Check `briefs` table: verify brief content is TipTap JSON format

### 4. Test Locally
```bash
cd /Users/jeremy.botter/Desktop/Development/RotoWrite
npm run dev
# Open http://localhost:5309
# Test the same flow, check console for errors
```

---

## 🛠️ Quick Fixes to Try

### If Writer Model Still Shows Wrong Name:
1. Check database: `SELECT id, name FROM writer_models;`
2. Check project: `SELECT writer_model_id FROM projects WHERE id = '[your-project-id]';`
3. Verify writerModelId is being logged in console
4. Try creating a NEW project and see if it loads correctly

### If Generate Content Fails:
1. Check error message in alert (should be more specific now)
2. Check if Claude API key is set: Vercel → Settings → Environment Variables
3. Verify writer model has training content
4. Test the `/api/generate` endpoint directly in Postman/curl

### If NewsEngine Shows No Results:
1. Check if project loads (console should show "Project loaded: [headline]")
2. Check Network tab to see if `/api/news/search` is called
3. If Tavily API key missing, it will fail silently (check Vercel logs)

---

## 📋 Commands Reference

### Development
```bash
npm run dev          # Start dev server on port 5309
npm run build        # Build for production
npm run lint         # Run linter
```

### Git
```bash
git add -A           # Stage all changes
git commit -m "..."  # Commit
git push             # Push to GitHub (triggers Vercel deployment)
```

### Vercel Deployment
- Automatic on git push to main branch
- Manual: Vercel dashboard → Deployments → Redeploy

---

## 🎨 UI/UX Notes

### Modals
- Writer Factory: 70% width (`!max-w-[70vw] !w-[70vw]`), sidebar layout
- Brief Builder: 70% width, same as Writer Factory
- Project Creation: Standard size (`max-w-2xl`)

### Colors
- Primary: Violet (`hsl(var(--primary))`)
- Background gradient: `from-violet-50 to-purple-50`
- All using Oklch color space for consistency

### Layout
- Left Sidebar: 280px width, navigation
- Editor Panel: Flex-1, main content area
- Right Sidebar: 320px width, Writer Model + NewsEngine/SEO tabs

---

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Admin role: Full access to everything
- Strategist role: Access to own models, shared briefs, own projects
- Service role key: Used for admin operations (user creation)
- API keys: Stored in Vercel environment variables (not in code)

---

## 📦 Dependencies

### Added (Claude-only)
- `@supabase/ssr` - Supabase with SSR support
- `@supabase/supabase-js` - Supabase client
- `@tiptap/*` - Rich text editor
- Shadcn UI components

### Removed
- `openai` package (uninstalled)
- `lib/embeddings.ts` (deleted)
- OpenAI API dependency

---

## 🧪 Testing Checklist

### User Creation (Admin)
- [ ] Create new user with email + password
- [ ] User appears in table
- [ ] User can log in with credentials
- [ ] Role assignment works (Admin/Strategist)

### Writer Model Training
- [ ] Create new writer model
- [ ] Add training content (paste article)
- [ ] See "X% trained" badge (e.g., "4% trained" for 1/25 stories)
- [ ] Training count updates in listing
- [ ] Textarea clears after submission
- [ ] Success notification appears

### Project Creation
- [ ] Create project with headline, keywords, topic, word count
- [ ] Select writer model
- [ ] Select brief
- [ ] Project opens in editor
- [ ] Project headline shows in editor header

### Content Generation
- [ ] Click "Generate Content" button
- [ ] See "Generating..." status
- [ ] Content streams into editor
- [ ] Content auto-saves
- [ ] Word count updates

### NewsEngine
- [ ] Open project
- [ ] NewsEngine tab shows "Recent relevant news"
- [ ] News articles appear
- [ ] Refresh button works
- [ ] Articles show title, source, relevance score

### Brief Builder
- [ ] Create new brief
- [ ] Edit in TipTap editor
- [ ] Add categories
- [ ] Toggle shared/private
- [ ] Brief saves and appears in list

---

## 🔍 Debugging Tips

### Check These Console Logs (Browser)
```
Loading project: [projectId]
Project loaded: [headline] Writer Model ID: [modelId]
writerModelId changed: [modelId]
Loading writer model: [modelId]
Writer model loaded: [name]
Generating content with: {...}
```

### Check Vercel Function Logs
- Go to Vercel Dashboard → Deployments → [latest deployment] → Functions
- Look for errors in:
  - `/api/generate` - Content generation
  - `/api/writer-models/train` - Training
  - `/api/news/search` - News search
  - `/api/admin/users` - User creation

### Common Errors
- `CLAUDE_API_KEY is not configured` → Add to Vercel env vars
- `Missing Supabase environment variables` → Add to Vercel env vars
- `Unauthorized` → User not logged in
- `Forbidden` → User doesn't have permission (check role)
- `No training content found` → Add training to writer model

---

## 📞 Quick Contact Info

### Supabase Project
- **URL:** https://ybrhwafnetvcgrrmxgvy.supabase.co
- **Project ID:** ybrhwafnetvcgrrmxgvy
- **Dashboard:** https://supabase.com/dashboard/project/ybrhwafnetvcgrrmxgvy

### Vercel Project
- **URL:** https://rotowrite.vercel.app
- **Dashboard:** [Your Vercel project dashboard]

### GitHub Repo
- **URL:** https://github.com/verygooddesigners/rotowrite
- **Branch:** main

---

## 🎯 Tomorrow's Action Plan

1. **Check Browser Console Logs**
   - Open rotowrite.vercel.app
   - Open Developer Tools (F12)
   - Go to Console tab
   - Create a project and note all logs

2. **Check Vercel Function Logs**
   - Go to Vercel Dashboard
   - Find latest deployment
   - Check function logs for errors

3. **Verify Environment Variables**
   - Vercel → Settings → Environment Variables
   - Ensure all required keys are set
   - Redeploy if needed

4. **Test Data Integrity**
   - Supabase → Table Editor
   - Check if projects have writer_model_id
   - Check if writer models exist
   - Check if training content exists

5. **Share Console Logs**
   - Copy all console output
   - Copy any error messages
   - Share so we can identify the exact issue

---

## 💡 Notes

- All commits have been pushed to GitHub
- Vercel auto-deploys on push to main
- Console logging has been added for debugging
- Error messages are now more specific
- No OpenAI APIs are used (Claude-only)

---

**Ready to debug tomorrow with console logs and Vercel function logs!**

