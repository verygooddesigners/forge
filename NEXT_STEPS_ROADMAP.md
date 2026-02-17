# Forge - Next Steps Roadmap

**Date:** February 11, 2026  
**Status:** ✅ Major commit pushed to production

---

## ✅ Just Completed

### Commit: c37c8b1
**Title:** feat: integrate 8th AI agent and complete tools marketplace system

**What Was Deployed:**
- ✅ 8th AI Agent (Fact Verification) fully integrated
- ✅ Tools/Plugins Marketplace (35+ files, complete system)
- ✅ Presentation Materials (25-slide deck + diagrams)
- ✅ User Roles Documentation
- ✅ Project Status Report (Feb 2026)
- ✅ Bug fixes and documentation updates

**Files Changed:** 56 files, 9,086 insertions, 62 deletions

**Deployment:**
- Pushed to GitHub: ✅
- Vercel auto-deploy: In progress...
- Production URL: https://rotowrite.vercel.app

---

## 🎯 Next Priority Tasks

### 1. Microsoft SSO Integration (Next Up)

**Goal:** Enable Microsoft Single Sign-On for enterprise authentication

**Documentation Available:**
- `docs/microsoft-sso-setup.md`
- `docs/microsoft-sso-quick-start.md`
- `MICROSOFT_SSO_CHECKLIST.md`

**Steps:**
1. Set up Azure AD B2C or Azure AD application
2. Configure redirect URIs
3. Get client ID and secret
4. Update authentication flow
5. Test with Microsoft accounts
6. Deploy to production

**Estimated Time:** 2-3 hours

---

### 2. User Permission Levels Implementation

**Goal:** Implement the complete user role system

**Roles to Implement:**
- ✅ Super Administrator (already exists)
- ✅ Administrator (partially implemented)
- 🔄 Manager (needs implementation)
- 🔄 Editor (database field exists, needs UI)
- 🔄 Content Creator (needs full implementation)
- 🔄 Developer (add-on role, needs checkbox)

**Documentation:**
- `docs/Rotowrite User Roles and Permissions.md`
- `# USER PERMISSION SYSTEM.md`

**Database Changes Needed:**
- Add department/team structure
- Update RLS policies for new roles
- Add role-specific permissions

**UI Changes Needed:**
- Update user management to show all roles
- Add department/team selection
- Add developer checkbox toggle
- Role-based feature visibility

**Estimated Time:** 1-2 days

---

### 3. Forge Tools & Tools Market

**Goal:** Activate the tools marketplace system

**Current Status:**
- ✅ Complete codebase implemented (35+ files)
- ✅ Database migration ready (`00012_tools_system.sql`)
- ❌ Migration not yet run
- ❌ Not tested in production

**Steps to Activate:**

#### 3.1 Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/00012_tools_system.sql
```

This creates:
- `tools` table (tool registry)
- `user_installed_tools` table (installation tracking)
- `tool_permissions` table (12 permissions seeded)
- `tool_data` table (isolated storage)

#### 3.2 Test Marketplace
1. Visit `/tools` in production
2. Browse marketplace (will be empty initially)
3. Test submission form at `/tools/submit`
4. Test developer docs at `/tools/docs`

#### 3.3 Create Example Tools
- Use `tools/example-tool/` as template
- Create 2-3 sample tools
- Submit via GitHub
- Test approval workflow

#### 3.4 Admin Testing
1. Log in as super admin
2. Go to Admin Dashboard → Tools tab
3. Review pending submissions
4. Test approve/reject workflow
5. Verify tools appear in marketplace

#### 3.5 User Testing
1. Log in as regular user
2. Browse tools marketplace
3. Install a tool
4. Verify tool appears in sidebar
5. Test tool functionality
6. Uninstall tool

**Estimated Time:** 3-4 hours

---

## 🔄 Pending: Supabase Migration

**Waiting On:** IT to grant project-creation permissions in company Supabase account

**When Ready:**
1. Create new Supabase project in company account
2. Run all 12 migrations (including new agent & tools migrations)
3. Export and import data
4. Update environment variables
5. Test and verify
6. Deploy to production

**Preparation:**
- ✅ Migration guide created
- ✅ All migrations ready
- ✅ Documentation complete
- ⏳ Waiting for IT permissions

---

## 📋 Detailed Implementation Plans

### Microsoft SSO - Step by Step

**Phase 1: Azure Setup (30 min)**
1. Log into Azure Portal
2. Navigate to Azure Active Directory
3. Register new application
4. Configure redirect URIs:
   - `http://localhost:5309/api/auth/callback/azure`
   - `https://rotowrite.vercel.app/api/auth/callback/azure`
5. Create client secret
6. Note down:
   - Client ID
   - Tenant ID
   - Client Secret

**Phase 2: Code Implementation (1 hour)**
1. Install dependencies:
   ```bash
   npm install @azure/msal-node @azure/msal-browser
   ```
2. Create Azure AD provider configuration
3. Update authentication routes
4. Add Microsoft sign-in button
5. Test locally

**Phase 3: Testing (30 min)**
1. Test sign-in flow
2. Test sign-out
3. Verify user data syncs
4. Test token refresh

**Phase 4: Deployment (30 min)**
1. Add environment variables to Vercel:
   - `AZURE_AD_CLIENT_ID`
   - `AZURE_AD_CLIENT_SECRET`
   - `AZURE_AD_TENANT_ID`
2. Deploy and test in production

---

### User Roles - Implementation Plan

**Phase 1: Database Schema (1 hour)**

```sql
-- Add departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update users table
ALTER TABLE users ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE users ADD COLUMN team_id UUID REFERENCES teams(id);
ALTER TABLE users ADD COLUMN is_developer BOOLEAN DEFAULT false;

-- Update role enum to include all roles
ALTER TYPE user_role ADD VALUE 'manager';
ALTER TYPE user_role ADD VALUE 'content_creator';
```

**Phase 2: RLS Policies (1 hour)**
- Update policies for Manager role
- Add policies for Content Creator role
- Implement department-scoped access
- Test policy enforcement

**Phase 3: UI Updates (2-3 hours)**
- Update User Management component
- Add department/team dropdowns
- Add role selection with all options
- Add developer checkbox
- Update admin dashboard visibility

**Phase 4: Feature Gating (1-2 hours)**
- Implement role-based feature visibility
- Update sidebar based on role
- Restrict admin features
- Test all role combinations

---

### Tools Marketplace - Activation Plan

**Phase 1: Database Setup (15 min)**
```sql
-- Run in Supabase SQL Editor
-- Execute: supabase/migrations/00012_tools_system.sql
```

**Phase 2: Create Example Tools (1 hour)**

Tool 1: Project Analytics
- Shows project statistics
- Permissions: `projects.read`
- Simple dashboard widget

Tool 2: SEO Checker
- Quick SEO analysis
- Permissions: `seo.analyze`
- Sidebar integration

Tool 3: Content Templates
- Pre-built article templates
- Permissions: `briefs.read`, `briefs.write`
- Modal interface

**Phase 3: Submission & Approval (30 min)**
1. Create GitHub repos for each tool
2. Add tool-manifest.json files
3. Submit via `/tools/submit`
4. Approve in admin dashboard
5. Test installation

**Phase 4: Documentation (30 min)**
- Update developer docs with real examples
- Create video walkthrough (optional)
- Add screenshots to docs
- Publish developer guide

**Phase 5: Marketing (1 hour)**
- Announce tools marketplace to team
- Create internal documentation
- Train users on installation
- Encourage tool development

---

## 🎯 Success Criteria

### Microsoft SSO
- [ ] Users can sign in with Microsoft accounts
- [ ] User data syncs correctly
- [ ] Token refresh works
- [ ] Sign-out works properly
- [ ] Works in both dev and production

### User Roles
- [ ] All 5 roles implemented (Super Admin, Admin, Manager, Editor, Content Creator)
- [ ] Developer add-on works
- [ ] Department/team structure functional
- [ ] RLS policies enforce permissions
- [ ] UI shows/hides features based on role
- [ ] Admin can assign all roles

### Tools Marketplace
- [ ] Database migration runs successfully
- [ ] Marketplace page loads and displays tools
- [ ] Users can install/uninstall tools
- [ ] Tools appear in sidebar
- [ ] Admin can approve/reject submissions
- [ ] Developer docs are clear and helpful
- [ ] At least 3 example tools created

---

## 📅 Suggested Timeline

**This Week:**
- Day 1 (Today): Microsoft SSO setup and testing
- Day 2: User roles database schema and RLS policies
- Day 3: User roles UI implementation
- Day 4: Tools marketplace activation and testing
- Day 5: Create example tools and documentation

**Next Week:**
- Polish and bug fixes
- User training
- Documentation updates
- Prepare for Supabase migration (when IT ready)

---

## 🚀 Quick Start Commands

### Start Development
```bash
cd /Users/jeremybotter/Desktop/Development/Forge
npm run dev
# Open http://localhost:5309
```

### Run Database Migrations
```bash
# In Supabase SQL Editor
# Copy and paste migration files one by one
# Or use Supabase CLI:
supabase db push
```

### Deploy to Production
```bash
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys
```

### Check Production
- URL: https://rotowrite.vercel.app
- Vercel Dashboard: Check deployment status
- Supabase Dashboard: Check database

---

## 📞 Resources

### Documentation
- Microsoft SSO: `docs/microsoft-sso-setup.md`
- User Roles: `docs/Rotowrite User Roles and Permissions.md`
- Tools System: `TOOLS_SYSTEM_README.md`
- Project Status: `PROJECT_STATUS_REPORT_FEB_2026.md`

### Key Files
- Auth: `lib/auth-microsoft.ts`, `lib/auth.ts`
- User Management: `components/admin/UserManagement.tsx`
- Tools Admin: `components/admin/ToolsAdmin.tsx`
- Migrations: `supabase/migrations/`

### External Links
- Supabase: https://supabase.com/dashboard/project/ybrhwafnetvcgrrmxgvy
- Vercel: https://vercel.com (check your dashboard)
- Azure Portal: https://portal.azure.com

---

**Ready to start with Microsoft SSO? Let's do it!** 🚀
