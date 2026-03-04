# Changelog

## [1.11.7] - 2026-03-04

### Fix: Sidebar logo — remove "Forge" wordmark, fill 50% width

Removed the "Forge" text next to the logo in the sidebar (it's already in the logo image itself). Logo image now fills ~50% of the sidebar column width (`w-[50%] h-auto`).

---

## [1.11.6] - 2026-03-04

### Improvement: Bug tracker deep-links + toolbar fix

- **Per-bug URLs** — Each bug now has its own route at `/bugs/[id]`; navigating directly to that URL loads the tracker with that bug pre-selected in the detail panel
- **URL updates** — Selecting a bug pushes `/bugs/[id]` to the browser history; deselecting or switching tabs navigates back to `/bugs`; works with browser back/forward
- **Copy link button** — Link icon button in the bug detail header copies the shareable URL to clipboard with a toast confirmation
- **Beta Toolbar reports icon** — The 📋/📬 icon now navigates to `/bugs` instead of opening the old My Reports modal
- **API** — `GET /api/bugs/[id]` added for fetching a single bug by ID

---

## [1.11.5] - 2026-03-04

### Improvement: Bug Tracker UX polish

- **Master-detail layout** — Bug detail now opens inline in the same panel (list collapses to 380px left column, detail fills the right); no more modal dialog
- **Edit button** — Any permissioned user can edit a bug's title, description, and severity directly in the detail view; Save/Cancel buttons replace Edit when in edit mode; saves via `PATCH /api/bugs/[id]`
- **Beta Toolbar** — "Bug Report" button now navigates to `/bugs` instead of opening the old inline submission modal; `API /api/beta-feedback` modal submission path removed from that button
- **API** — `PATCH /api/bugs/[id]` now accepts `title`, `description`, and `severity` fields in addition to existing `status`, `admin_notes`, and `archive`

---

## [1.11.4] - 2026-03-04

### Feature: Full-Page Bug Tracker

Replaced the old bug tracker modal with a proper full-page tracker at `/bugs`.

- **`/bugs` route** — New dedicated page (server + client) with full app chrome, accessible from the sidebar
- **`BugTrackerPanel`** — Full-page panel with Active / Archive tabs, sortable bug list (severity → date), inline search, severity filter, and status filter
- **`ReportBugModal`** — Revamped report form with title, description, severity selector (Critical/High/Medium/Low) with color indicators, and screenshot upload to Supabase Storage (`bug-screenshots` bucket)
- **Bug detail dialog** — Click any bug to open full detail: description, screenshot display, admin notes (editable by managers, visible to all), status change dropdown, comments/activity thread, Archive/Restore + Delete buttons
- **Auto-archive** — Setting status to "Completed" automatically moves the bug to the Archive tab; bugs can be manually restored
- **Delete** — Admins can permanently delete bugs (with confirmation dialog); cascade-deletes all comments
- **Comments** — Any permissioned user can add comments on a bug; threaded with user name, email, and timestamp
- **DB migration `00034_bug_tracker.sql`** — Adds `severity` + `archived_at` to `beta_feedback`; creates `bug_comments` table with RLS; creates `bug-screenshots` storage bucket
- **Permissions** — Two new permission keys: `can_view_bugs` (view/submit) and `can_manage_bugs` (status/notes/delete/archive); both added to RolesEditor and UserManagement permission overrides panel
- **Sidebar** — "Bug Tracker" nav link added, visible to anyone with `can_view_bugs`, `can_manage_bugs`, or `can_access_admin`

**Required manual step:** Run `supabase/migrations/00034_bug_tracker.sql` in the Supabase Dashboard SQL Editor.

---

## [1.11.3] - 2026-03-04

### Fix: Writer Model not visible in project creation for admin-assigned users

Users who had a writer model assigned by an admin (via `default_writer_model_id`) could not see or select that model in the project creation flow — only house models were shown.

- **Root cause** — Both `NewProjectPageClient.tsx` and `ProjectCreationModal.tsx` used `.or('strategist_id.eq.${userId},is_house_model.eq.true')`, which excluded admin-assigned models entirely
- **Fix** — Both files now first fetch `default_writer_model_id` from the `users` table, then append `id.eq.${defaultId}` to the Supabase OR filter so the assigned model is included in the query
- **Dropdown** — Added an "assignedModels" group (models not owned by the user and not house models) rendered as "Your Model" at the top of the dropdown; the assigned model is also auto-selected on load
- **Affected files**: `app/projects/new/NewProjectPageClient.tsx`, `components/modals/ProjectCreationModal.tsx`

---

## [1.11.2] - 2026-03-03

### Fix: API Keys + Health Checks + Speed Insights

- **API Keys bug fix** — Admin API Keys tab was erroring ("Could not load current API key status") because the settings route was querying a `system_settings` table that never existed. Updated all routes and key resolvers (`lib/ai.ts`, `lib/agents/base.ts`, health route) to use the pre-existing `api_keys` table (`service_name`/`key_encrypted` columns)
- **Tavily & OpenAI health checks** — Added `GET /api/generate/health/tavily` and `GET /api/generate/health/openai` routes; System Health tracker now shows all three API services (Claude, Tavily, OpenAI) with live status and latency
- **Vercel Speed Insights** — Added `<SpeedInsights />` to root layout for Core Web Vitals tracking across all pages
- **Build fix** — Added `.npmrc` with `legacy-peer-deps=true` to resolve peer dependency conflict between `@vercel/speed-insights` and Next.js 16 canary

---

## [1.11.1] - 2026-03-03

### Feature: Admin API Key Management

Admins can now manage API keys for external services (Anthropic, Tavily, OpenAI) directly from the Admin panel — no code deploys or environment variable changes required.

- **`system_settings` table** — New Supabase table (`supabase/migrations/00033_system_settings.sql`) stores admin-managed key/value config, protected by admin-only RLS
- **`GET/PUT /api/admin/settings`** — New API route returns masked key status and upserts individual keys; protected by `can_manage_api_keys` permission
- **`lib/settings-cache.ts`** — Shared in-memory cache (5-min TTL) to avoid a DB round-trip on every AI request; invalidated immediately on admin save
- **DB-first key resolution** — `lib/ai.ts`, `lib/agents/base.ts`, and the health route all resolve the Claude API key via cache → DB → env var fallback, so an admin-saved key takes precedence over `.env.local` without a redeploy
- **APIKeyManagement component** — Complete rewrite of the Admin → API Keys tab: real load/save, masked current key display with last-updated timestamp, per-key save buttons with loading states, Enter-key support
- **⚠️ Manual step required**: Run `supabase/migrations/00033_system_settings.sql` in the Supabase Dashboard SQL Editor to create the table

---

## [1.11.0] - 2026-03-02

### Performance: Major speed & bloat reduction (audit-driven)

Systematic performance overhaul based on full codebase audit of all API routes, components, and lib/config files.

**Tier 1 — App-wide wins:**
- **Removed `force-dynamic` from root layout** — was forcing every page to re-render on every request, killing all static generation and ISR. Pages that need dynamic data now opt in individually.
- **Singleton pattern for browser Supabase client** (`lib/supabase/client.ts`) — previously created a new client instance on every `createClient()` call. Now cached at module level. Fixes the 17-component render-body allocation issue in one shot.
- **Singleton pattern for admin Supabase client** (`lib/supabase/admin.ts`) — same fix for the service-role client used in API routes.
- **Reduced `checkApiPermission` from 4 → 2 DB round-trips** — passes pre-fetched role to `getUserPermissions` to skip redundant user lookup; parallelizes role_permissions + user_permission_overrides queries with `Promise.all`.
- **Eliminated N+1 query pattern in analytics** — `analytics/team` and `analytics/export` routes were running 3 sequential DB queries per user (150+ queries for 50 users). Replaced with 3 bulk queries + in-memory grouping.

**Tier 2 — Component fixes:**
- **Fixed ResearchHub infinite re-render loop** — `onComplete` callback prop in `useEffect` dependency array created new reference every render, triggering infinite API calls. Fixed with `useRef` pattern.
- **Fixed InternalLinksModal keystroke storm** — `content` in dependency array fired an API call on every character typed. Removed from deps; content now snapshotted when modal opens.
- **Lazy-loaded UserGuideModal** (1,700+ lines) — was eagerly bundled even when never opened. Now uses `React.lazy` + `Suspense`, only loaded on demand.
- **Removed production console.logs** in WriterFactoryModal — `[BADGE_RENDER]` logged internal model metadata on every badge render.

**Tier 3 — CSS cleanup:**
- **Deduplicated ProseMirror CSS** — removed ~30 duplicate lines in `globals.css` where styles were defined twice with conflicting values.

---

## [1.10.51] - 2026-03-02

### Fix: "Unauthorized" error when training writer models (VER-6)

Root cause: Personal writer models had `strategist_id: null` in the database, and the training permission check only allowed (a) managers+, (b) model owner via `strategist_id`, or (c) house models. Content Creators with an assigned `default_writer_model_id` failed all three checks.

- **train/route.ts**: Added fourth permission check — users can train their assigned default model (`default_writer_model_id === model_id`), fetching `default_writer_model_id` alongside `role` in the user profile query
- **writer-models/route.ts**: Updated GET for regular users to also include models matching their `default_writer_model_id` in the OR filter, not just `strategist_id` matches
- Systemic fix — works for all users with assigned personal models, not just one account

---

## [1.10.50] - 2026-03-02

### Feat: Dark Mode v2 — systematic implementation

Complete dark mode with full pre-implementation codebase audit (120+ hardcoded color instances across 37+ files identified and fixed).

- **Three-layer strategy**: CSS variable overrides → global safety-net CSS → inline style replacements
- **globals.css**: `@custom-variant dark` for Tailwind v4, full dark palette token overrides in `html.dark {}`, glassmorphism overrides, safety-net selectors for `bg-white/bg-slate-*/text-gray-*`
- **Anti-flash**: Synchronous `<script>` in `<head>` reads `localStorage` before first paint; no white flash on page reload
- **Toggle**: Sun/Moon button in AppSidebar nav section; Dark Mode switch in Settings > Appearance; preference persists via `localStorage` key `forge-theme`
- **Dashboard panels**: `EditorPanel`, `LeftSidebar`, `RightSidebar`, `SEOOptimizationSidebar` — `bg-white` → semantic token classes
- **BetaToolbar**: All inline `style={}` hex colors replaced with CSS variable references (`var(--color-bg-elevated)`, `var(--color-text-primary)`, etc.); floating pill uses dedicated `--beta-pill-*` CSS vars
- **Page containers**: `NewProjectPageClient`, `ContentAnalyticsClient` — removed inline white gradients, semantic bg tokens
- **Settings**: Re-added Dark Mode toggle (Switch) in Appearance card
- **Guide pages**: `SavingsCalculator`, `TimeSavingsPage` — hardcoded slate/white → semantic tokens
- **TipTap editor canvas** intentionally stays white (Word-processor style) — existing `!important` rules preserved

---

## [1.10.49] - 2026-03-02

### Revert: Remove dark mode (deferred to future beta)

- Removed all dark mode CSS variable overrides from globals.css
- Removed dark mode toggle from sidebar profile menu
- Removed theme setting from Settings page
- Removed anti-flash script from layout
- Removed `@custom-variant dark` directive
- Fixed `bg-bg-primary` (invalid class) → `bg-bg-deep` in admin and settings pages
- App is now consistently light mode; dark mode will return in a future beta

## [1.10.48] - 2026-03-02

### Fix: Dark Mode — comprehensive overhaul for readability

- **Admin panel**: Removed hardcoded white gradient (`#FAFAFA → #FFFFFF`) from `AdminPageClient` and `AdminPageWrapper` main content areas — these now correctly use CSS variable backgrounds that flip in dark mode.
- **Form inputs & textareas**: Changed `bg-white` to `bg-bg-elevated` in the core `Input` and `Textarea` shadcn components — affects every form field across the entire app.
- **Global dark mode safety net**: Added comprehensive `html.dark` overrides in `globals.css` that catch any remaining `bg-white`, `bg-gray-50`, `bg-white/80` and similar light-only Tailwind classes throughout dashboard sidebars, modals, and panels.
- **White border fixes**: `border-white/60`, `border-white/40`, `border-black/5` variants now render as appropriate subtle dark borders.
- **Text colour fixes**: `text-gray-600/700/800/900`, `text-slate-*`, `text-zinc-*` overridden to use proper CSS variable text colours in dark mode.
- **TipTap editor preserved**: Editor content area remains white-on-white intentionally (Word-processor style) — added `.tiptap-editor-wrapper` CSS exception so the override doesn't bleed into the writing surface.
- **Select dropdowns**: Radix `[role="listbox"]` and `[role="combobox"]` elements mapped to dark surface colours.

## [1.10.46] - 2026-03-02

### Fix: System Health screen — actually works now

- **AI API "degraded" bug**: The health check was pinging `/api/generate/health` which didn't exist. Created the endpoint — it makes a minimal 1-token Claude API call and returns `healthy`, `degraded` (rate limited), or `error` (bad key / unreachable) with latency.
- **Storage "degraded" bug**: The check was looking for an `avatars` bucket that doesn't exist in this project. Changed to `listBuckets()` which returns the actual bucket list and shows their names when healthy.
- **Refresh UX**: Refresh button now resets all checks to "Checking" state first, then re-runs — instead of showing stale results while new ones load.
- **Better diagnostics**: Each degraded/error check now shows a specific message (e.g. "API key is invalid or expired") and a detail line with the raw error or HTTP status code, so you know exactly what's wrong and how to fix it.
- **Latency coloring**: Response time shown in yellow when >500ms, orange/red when >1000ms.
- **Last checked timestamp** shown on the overall status banner.

## [1.10.45] - 2026-03-02

### Feature: Edit Writer Models in Admin

- Added Edit (pencil) icon button to every row in the Writer Models admin table
- Clicking Edit opens a dialog pre-populated with the model's current name, description, and House Model toggle
- All three fields are fully editable and saved via the existing PATCH `/api/writer-models` endpoint
- Edit button appears before the Assign User and Delete buttons in the Actions column
- No API changes needed — the endpoint already supported updating name, description, and is_house_model

## [1.10.44] - 2026-03-02

### Fix: Teams screen errors (crash on New Team + missing DB tables)

- **White screen crash on "New Team" button**: Fixed by replacing `<SelectItem value="">` with `<SelectItem value="__none__">` in the Team Manager dialog. Radix UI throws when a SelectItem has an empty string value, which triggered the admin error boundary and showed the "Something went wrong" screen.
- **`public.teams` not found**: Added migration `00032_teams.sql` that creates the `teams` and `team_members` tables with proper indexes, foreign keys, and RLS policies. **Run this migration in Supabase SQL editor to enable the Teams feature.**

### Migration required (00032_teams.sql)

Run the following in Supabase → SQL Editor to create the tables needed by the Teams section:
```sql
-- See supabase/migrations/00032_teams.sql
```

## [1.10.43] - 2026-03-02

### Feature: Beta Management gated behind can_manage_betas permission

- Added `can_manage_betas` permission key to `PermissionKey` type, `ALL_PERMISSION_KEYS`, and `AdminMenu`
- Beta Management section is now hidden from non-super-admins; only users with `can_manage_betas` can see it
- Super admins receive this permission automatically (no DB changes required)
- Other admin roles can be granted `can_manage_betas` via the Roles Editor when needed
- API routes already enforced `isSuperAdmin` — this adds matching frontend visibility control

## [1.10.42] - 2026-03-02

### Fix: Beta Notes modal now shows on first magic link sign-in

- **Root cause**: `ClientInit` lives in the root layout and mounts once on `/auth/magic`. The initial `getSession()` call finds no session (the user isn't signed in yet), so beta data is never fetched. When `/auth/magic` calls `setSession()` and navigates to `/dashboard`, the layout doesn't re-mount so `getSession()` never fires again.
- **Fix**: Added `supabase.auth.onAuthStateChange` listener to `ClientInit`. When `setSession()` fires `SIGNED_IN`, the listener immediately fetches beta notes and triggers the modal — regardless of which page caused the sign-in.
- Also resets `betaModalDismissed` state on `SIGNED_OUT` so the modal shows correctly on next login.

### Fix: Tyler Olsen → Tyler Olson (migration data)

- Corrected spelling in `migration-data/writer_models.json`
- Run the SQL below in Supabase to fix live records

## [1.10.41] - 2026-03-02

### Fix: Magic links no longer consumed by Slack/email pre-fetchers

- **Root cause**: Sharing the raw Supabase verification URL (`supabase.co/auth/v1/verify?token=xxx`) via Slack or email causes those platforms to pre-fetch the URL for link previews, consuming the one-time token before the recipient can click it.
- **Fix**: Created `/auth/go` intermediary page. Links now look like `gdcforge.vercel.app/auth/go?url=BASE64_SUPABASE_URL`. Pre-fetchers visit the page but don't execute JavaScript — so the Supabase token is never consumed. Real users' browsers execute the JS and are redirected instantly.
- Added `/auth/go` to middleware public paths.

## [1.10.40] - 2026-03-02

### Fix: BetaToolbar version now auto-syncs from package.json

- Removed hardcoded `VERSION` constant from `BetaToolbar.tsx`
- Version is now imported directly from `package.json` — always stays in sync automatically

## [1.10.39] - 2026-03-02

### Fix: Magic link redirectTo now uses correct production domain

- **Root cause**: `generateLink` was building the `redirectTo` URL from `NEXT_PUBLIC_APP_URL` env var (not set in Vercel production) and falling back to `https://forge.gdcgroup.com`. But the Supabase allowlist only had `https://gdcforge.vercel.app/auth/magic`. Domain mismatch → Supabase rejected the redirect → users landed on login screen.
- **Fix**: Derive the URL from the incoming request's `host` and `x-forwarded-proto` headers. This works correctly across all domains (gdcforge.vercel.app, forge.gdcgroup.com, etc.) with no env var required.

## [1.10.38] - 2026-03-02

### Fix: Magic links now actually sign users in (root cause fixed)

- **Root cause**: Supabase magic links redirect with hash fragments (`#access_token=xxx`) when using implicit auth flow. Hash fragments are never sent to the server, so the old server-side `/api/auth/callback` route received nothing and bounced users to login every time.
- **Fix**: Created `/auth/magic` — a client-side page that handles all three Supabase auth redirect formats: implicit flow (hash fragments), PKCE code exchange (`?code=xxx`), and OTP token hash (`?token_hash=xxx&type=magiclink`). The page reads whichever format Supabase uses, sets the session, then redirects to dashboard.
- Updated `generateLink` `redirectTo` to point to `/auth/magic` instead of the old server-side route.
- Added `/auth/magic` to middleware public paths so unauthenticated users can reach the page.
- **Login link modal**: Fixed two UI bugs — dialog now has explicit dark background so it's visible, and the URL uses `break-all` so it wraps instead of overflowing off screen. Copy button is now full-width for easier clicking.

## [1.10.37] - 2026-02-28

### Fix: BetaToolbar version corrected

- Fixed hardcoded version string in `BetaToolbar.tsx` — was stuck showing v1.10.32, now correctly shows v1.10.36

## [1.10.36] - 2026-02-28

### Fix: Magic link now routes through auth callback (session established correctly)

- Magic links generated from Beta Management now redirect to `/api/auth/callback?next=/dashboard` instead of directly to `/dashboard` — this is the required step that exchanges the one-time token for a real session cookie. Without it, users landed on the dashboard with no session and were bounced to login.

## [1.10.35] - 2026-02-28

### Fix: Layout broken on authenticated pages + Change Password feature

- **Layout fix**: All authenticated pages (Profile, Settings, Guide pages, Change Password) were using `min-h-screen` which doesn't work inside the root layout's fixed-height flex container — changed to `flex-1 overflow-y-auto` so pages fill the viewport and scroll correctly
- **Change Password page**: New `/change-password` route with show/hide password toggles, match validation, and immediate redirect to dashboard on success
- **Sidebar**: Added "Change Password" (key icon) to the user menu popup
- **Magic link fix**: Login links generated from Beta Management now redirect to `/dashboard` instead of `/` (which was bouncing users to the login screen)

## [1.10.34] - 2026-02-28

### Feature: Get Login Link for beta users

- Added **Link** button per user row in Beta Management — generates a magic login link via the admin API (no email sent)
- Clean dialog with one-click copy; send the link via Slack, iMessage, or any channel
- Links expire after 1 hour; works without any SMTP/email setup
- Solves the Supabase email rate limit problem for onboarding beta users

## [1.10.33] - 2026-02-28

### Fix: Remove email confirmation gate entirely

- **Middleware**: Removed `awaiting_confirmation` account_status check — authenticated users are no longer redirected to `/awaiting-confirmation`. Access is controlled solely by Supabase authentication.
- **DB trigger (migration 00031)**: `handle_new_user` now defaults `account_status` to `'confirmed'` for all new signups instead of `'awaiting_confirmation'`. Also bulk-updates any existing users still stuck on `awaiting_confirmation`.
- **Result**: Super admins and all users can log in directly to the dashboard without email confirmation steps.

## [1.10.32] - 2026-02-28

### Fix: redirect loop and DB constraint for beta user first-login

- **Redirect loop broken**: `dashboard/page.tsx` now auto-provisions a missing `public.users` profile (using admin client) instead of redirecting to `/login`, which caused an infinite loop when middleware bounced authenticated users back to `/dashboard`
- **DB constraint fix**: Live database had the old `account_status` constraint (`pending`, `strategist`, etc.) — migrations 00013/00016 were not applied. SQL provided to normalize existing rows and update the constraint to `(awaiting_confirmation, confirmed)` before inserting Jeremy's profile
- **`provisionUser` always updates existing rows**: Changed `ignoreDuplicates: true` to `false` so the upsert always sets `account_status: confirmed` even on pre-existing rows

All notable changes to Forge are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.10.31] - 2026-02-28

### Fix: three first-login issues for beta users

- **Blank dashboard**: `provisionUser` was setting `account_status: 'awaiting_confirmation'`, which caused middleware to redirect users to `/awaiting-confirmation` instead of the dashboard. Changed to `'confirmed'` since email is already pre-confirmed via `email_confirm: true`
- **Migration 00030**: One-time fix for existing beta users already stuck in `awaiting_confirmation` — updates them all to `confirmed`
- **Beta notes modal on reset-password page**: `ClientInit` now skips fetching and showing the beta toolbar/modal when the current path is an auth page (`/login`, `/reset-password`, `/signup`, `/awaiting-confirmation`)
- **Reset-password page layout**: Changed from `min-h-screen bg-bg-deepest` to `w-full h-full` to match the login page layout inside the root floating card

## [1.10.30] - 2026-02-28

### Fix: Writer Model assignment available for all active beta users

- `canAssignModel` now depends on `beta.status === 'active'` instead of `!!bu.user_id` — the dropdown shows for all users once the beta is started
- If `user_id` is missing in `beta_users` (e.g. users invited by old broken flow), the API auto-provisions the account via email and backfills `user_id` before assigning the model
- Removed early guard (`if (!bu.user_id) return`) from `handleAssignWriterModel`
- Fallback label changed from "Invite first" to "Start beta first"

## [1.10.29] - 2026-02-28

### Simplify beta onboarding — users self-serve via Forgot Password

- Removed `generateLink` step from `provisionUser` — no links generated or displayed
- Removed "Password Setup Links" modal and `magicLinks` state from BetaManagement
- Toast messages now instruct admin to tell users to use Forgot Password at login
- Unused `Copy` and `Link2` imports removed

## [1.10.28] - 2026-02-28

### Fix: bypass email entirely — createUser + recovery link flow

- **No more invite emails**: `start_beta` and `resend_invite` now use `admin.auth.admin.createUser({ email_confirm: true })` to create accounts silently — no email is ever sent, so Supabase email delivery issues are irrelevant
- **Password setup links**: After provisioning accounts, a `generateLink({ type: 'recovery' })` URL is generated for each user — admins share these directly (Slack, email, etc.). Users click the link, set their password, and log in normally
- **Graceful existing-user handling**: If `createUser` fails because the user already exists, the API falls back to `listUsers` to find their UUID — same provisioning flow proceeds without error
- **Updated UI copy**: Magic Links dialog now says "Password Setup Links" with updated instructions explaining the click-to-set-password flow
- **Migration 00029**: Captures the EXCEPTION wrapper added to `handle_new_user` trigger — suppresses any trigger errors as warnings so they never block auth user creation

## [1.10.27] - 2026-02-28

### Fix: beta invite flow — stale user cleanup + trigger fix

- **Migration 00028**: Changed `handle_new_user` trigger from `ON CONFLICT (id) DO NOTHING` to `ON CONFLICT DO NOTHING` — this catches both `id` AND `email` unique constraint violations, so auth operations (inviteUserByEmail, generateLink) no longer fail with "Database error saving new user" when the email already exists in `public.users`
- **Proactive stale row cleanup**: Before sending any invite, the API now checks if the email has an orphaned `public.users` row (UUID exists in public.users but NOT in auth.users). If found, the stale row is deleted automatically — this lets the trigger correctly create the right row after the invite lands
- **Removed debug code**: Cleaned up temporary `link_error` field from resend_invite response and corresponding toast branch in BetaManagement

## [1.10.26] - 2026-02-28

### Fix: magic link modal for existing beta users

- Replaced unreliable OTP email approach with `admin.auth.admin.generateLink()` — generates a real one-click login URL server-side without relying on Supabase's email system
- New "Login Links" modal pops up automatically after Resend or Start Beta when existing users are found — shows each email with a copyable link you can share via Slack, email, or any channel
- Toast messages updated to reflect the new flow

## [1.10.25] - 2026-02-28

### Fix: OTP magic link redirect_to as query param (not body)

- Fixed OTP endpoint call for existing users — `redirect_to` must be a URL query parameter, not nested inside the request body; previous format caused 4xx responses and `email_sent: false`

## [1.10.24] - 2026-02-28

### Fix: beta invites now send magic link to existing Supabase users

- **OTP magic link for existing users**: When `inviteUserByEmail` fails because the email already has a Supabase auth account, the API now calls `/auth/v1/otp` to send a magic link sign-in email so the user still receives something in their inbox
- **Transparent toast feedback**: `start_beta` toast now distinguishes between "invites sent" (new users), "magic links sent (existing account)", "already registered (can log in directly)", and "failed" — so admins know exactly what happened for each user
- **Resend invite toast updated**: Shows appropriate message for existing users — either "magic link sent" or "can log in directly" depending on whether OTP succeeded
- Both `start_beta` and `resend_invite` API responses now include `already_existed` and `email_sent` fields per user

## [1.10.23] - 2026-02-28

### Beta UX fixes + screenshot bug reports

- **Screenshot attachment for Bug Reports**: Users can now attach a screenshot when submitting a bug report — drag & drop or click-to-upload, image preview with remove button, uploads to Supabase Storage `bug-screenshots` bucket; screenshots visible in My Reports / All Feedback panel
- **Beta Toolbar hidden on login**: `BetaToolbar` now only renders when user is authenticated (was showing on `/login` page)
- **Login page layout fixed**: Login form now properly fills and centers within the frosted glass app container
- **SmartBrief guide scrolling fixed**: Added `w-full` to SmartBriefGuideClient root so it fills the flex-row layout container and content area scrolls correctly
- **Beta invite resilient to existing users**: Both `resend_invite` and `start_beta` now handle the "Database error saving new user" Supabase auth error gracefully — looks up existing user by email in `public.users` and updates `beta_users` record instead of failing
- Migration 00027: `screenshot_url` column on `beta_feedback` + `bug-screenshots` Supabase Storage bucket with RLS

## [1.10.22] - 2026-02-28

### Fix: writer model assignment constraint error

- Fixed `users_account_status_check` violation in betas API — `account_status` must be `'confirmed'` not `'active'`; affected all three `public.users` upserts (start_beta, resend_invite, assign_writer_model)

## [1.10.21] - 2026-02-28

### Writer Factory restored to sidebar + model scoping

- **Writer Factory link** added back to `AppSidebar` main nav for all users (was missing — only existed in profile dropdown as "Writer Model")
- **Writer Factory panel** now scoped per user: shows only their assigned personal model (`default_writer_model_id`) + in-house models (`is_house_model = true`); no longer shows all models globally
- Personal model is auto-selected on open if assigned; falls back to first in-house model otherwise

## [1.10.20] - 2026-02-28

### Minor

- Renamed "Suggest Feature" button in Beta Toolbar to "Suggest/Feedback"

## [1.10.19] - 2026-02-28

### Beta Writer Model Assignment + User Guide Updates

- **Writer Model assignment in Beta Management**: each user row now has a "Writer Model" dropdown to assign their personal writer model directly from the beta admin panel — no longer need to go to Writer Models admin separately
- **Fix: invited users now appear in Writer Models admin**: `start_beta` and `resend_invite` now upsert the invited user into `public.users` immediately after Supabase invite, so they appear in the assignment dropdowns even before first login
- **New `assign_writer_model` API action** on `/api/admin/betas` PATCH: upserts user into public.users then sets `default_writer_model_id` — can be called even if user hasn't logged in yet
- **GET `/api/admin/betas`** now includes `default_writer_model_id` on each beta user row (fetched from `public.users`)
- **User Guide updated**: registration section rewritten for invite-only beta onboarding; added in-house model callout for RotoWire NFL / RotoWire MLB; corrected export formats (HTML + Plain Text); updated walkthrough phases for beta users

## [1.10.18] - 2026-02-28

### Beta Notes TipTap Editor + House Model Training
- **Beta Notes editor** now uses TipTap rich text editor (bold, italic, H2/H3, bullet + ordered lists, undo/redo) — notes stored as HTML
- **BetaNotesModal** renders notes as formatted HTML (headings, lists, bold, links) instead of plain pre-wrapped text
- **New `BetaNotesEditor` component** (`components/beta/BetaNotesEditor.tsx`) — lightweight dark-themed TipTap wrapper for admin use
- **House model training**: any authenticated user can now contribute training content to in-house writer models (RotoWire NFL, RotoWire MLB) — no longer restricted to model owner only

## [1.10.17] - 2026-02-28

### Beta Management System
- New **Beta Management** admin section at the top of the Admin menu (FlaskConical icon)
- Create named betas (e.g. "Beta 1") with goals/notes; manage users and invites per beta
- **Start Beta**: sends Supabase invite emails to all added users in one click
- **End Beta**: marks beta as ended, user accounts become permanent with same permissions
- **Resend Invite**: per-user button to re-send a fresh invite link (useful after 24hr expiry)
- Beta Notes editor with version tracking and "Mark as major update" toggle
- **Beta Notes Modal**: mandatory acknowledgment on first login; dismissible X for major updates
- **Beta Toolbar**: new ScrollText icon opens Beta Notes panel for users in active betas
- **Toolbar collapse**: X button minimizes toolbar to a small "⚡ BETA" pill to avoid covering UI buttons; click to restore; preference saved to localStorage
- New Supabase migration: `00026_betas.sql` (betas + beta_users tables with RLS)
- New API routes: `/api/admin/betas` (CRUD + start/end/resend) and `/api/beta-notes` (user-facing read + acknowledge)

## [1.10.16] - 2026-02-28

### UI Fixes
- Quick Actions: Replaced NFL Odds card with a Guides card linking to User Guide and SmartBriefs Guide
- SmartBriefs: AutoBuilder button now uses primary purple border and icon
- Suggested Keywords: Smaller text (10px), compact padding, overflow contained with truncation and tooltips

## [1.10.15] - 2026-02-28

### Added
- **Writer Models Admin**: New "Writer Models" section in Admin → AI & Content. Create house or personal models, view training counts, assign/unassign users as default, and delete models.
- **Writer Models API**: Full CRUD at `/api/writer-models` (GET/POST/PATCH/DELETE) with super-admin auth.

## [1.10.14] - 2026-02-28

### Added
- **Beta Toolbar**: Floating lavender pill (top-right) showing version + date with "Suggest Feature" and "New Bug Report" buttons. Visible to all authenticated users throughout the app.
- **Beta Feedback System**: Full in-app bug/feature submission with Supabase `beta_feedback` table, REST API (POST/GET/PATCH), and modals. Users see their own submissions; Super Admins see all with status management and user notes.

## [1.10.13] - 2026-02-28

### Bug fix
- Admin Panel: Fixed full-screen black error when opening Edit User dialog. Root cause was `<SelectItem value="">` conflicting with Radix UI Select v2's internal empty-string sentinel. Replaced with `__none__` sentinel, mapped back to empty string in state. Also added route-level `app/admin/error.tsx` so future admin errors show a contained in-page error instead of the global boundary.

## [1.10.12] - 2026-02-26

### Improvements
- Research stories: orchestrator returns partial results (verify/keywords/synopsis wrapped in try-catch so stories always saved); fallback to project.research_brief when project_research.stories empty; save research_brief to projects when project_research update fails; RightSidebar fetches research_brief when stories empty.
- Editor: TipTap normalizes empty/invalid content to valid doc so no "Unknown node type" when content is {}.
- Research UI: Replace inline story list with "View / Select Reference Sources" button; large modal with instructions and story grid; selection icon on cards changed from checkmark to bookmark (filled when selected).

## [1.10.11] - 2026-02-26

### Bug fix
- Research stories empty in sidebar: pipeline now checks project_research update result and sends error if save fails; serialize stories as plain JSON for Supabase; RightSidebar fallback uses project.research_brief.articles when project_research.stories is empty; parse stories when Supabase returns JSONB as string.

## [1.10.10] - 2026-02-26

### Bug fix
- Research Hub: do not navigate to editor when pipeline sends error (e.g. "No articles found"); forward orchestrator error events as type 'error'; add "Continue to editor" when research fails so user is not stuck.

## [1.10.09] - 2026-02-26

### Bug fix
- Research stories not showing after pipeline: load project and project_research in parallel so stories appear even if project fetch fails (e.g. 400); add one delayed refetch of project_research when editor mounts with no stories.

## [1.10.08] - 2026-02-26

### Improvement
- New project Create: save optional description again now that projects.description column exists (migration applied).

## [1.10.07] - 2026-02-26

### Bug fix
- New project Create: stop sending `description` in insert so it works when projects table has no description column (run migration 00020 to add column and persist description).

## [1.10.06] - 2026-02-26

### Bug fix
- New project Create: show toast on insert error or missing response so user sees why research mode never starts; handle no-data case and catch block.

## [1.10.05] - 2026-02-26

### Bug fix
- New project: secondary keywords no longer split on spaces; only commas separate keywords so multi-word phrases (e.g. "fantasy football") stay as one.

## [1.10.04] - 2026-02-26

### Bug fix
- Fix Vercel build: wrap Supabase promise in Promise.resolve() so .finally() is valid (PromiseLike has no finally in strict TS).

## [1.10.03] - 2026-02-26

### Improvements
- Project creation & research: debug logging (Forge:ProjectCreate, ResearchHub, ResearchPipeline, ResearchOrchestrator); enable with NEXT_PUBLIC_DEBUG_RESEARCH=1 / DEBUG_RESEARCH=1 or in dev
- SmartBrief add-category: fix INP (defer handler + startTransition) so UI stays responsive; loading state and toasts on Create New SmartBrief and BriefBuilderModal
- SmartBriefs My SmartBriefs cards: move category tag to bottom of card to prevent long names overlapping title

## [1.10.02] - 2026-02-25

### Bug fix — Admin User Edit dialog
- Fix black-screen error when clicking Edit on any user: roles API 403 left availableRoles empty; Role Select now uses DEFAULT_ROLES fallback and always has a valid value in the options list.

## [1.10.01] - 2026-02-25

### Documentation — User Guide, AI architecture, SmartBrief guide
- User Guide: Research Orchestrator (replaces Creative Features), Research Pipeline & Research Hub flow, keyword pills, Insert Internal Links, no Auto-Optimize, Project Settings, Generation Context
- AI Team page & AgentDiagram: Research Orchestrator; architecture-data: 8 agents, research pipeline API
- Docs: app-overview, api-key-setup-guide, ai-models-api-requirements, rotowrite-content-engine updated for 8 agents and Research Orchestrator

## [1.10.00] - 2026-02-25

### Project Creation and Content Generation Workflow Overhaul
- Research pipeline: new project_research table, Research Orchestrator agent (replaces Creative Features), SSE pipeline API, Research Hub with live activity feed
- Writer models: is_house_model, user default_writer_model_id, grouped dropdown (Your Model / RotoWire Models) and auto-select on new project and in Project Settings
- Editor: ProjectSettingsPanel, GenerationContext strip (selected stories/keywords, brief, model), Research story cards in right sidebar, SEO keyword pills (pre/post generation), Internal Links modal, Generate API uses selected stories and keywords
- Admin: default writer model assignment in User Management; Agent Tuner shows Research agent instead of Creative

## [1.09.01] - 2026-02-25

### Bug Fix — Guide Page Scrolling
- Fixed User Guide and SmartBrief Guide pages not scrolling within the glassmorphism container
- Replaced `min-h-screen` with proper flex layout and `overflow-y-auto` so content scrolls correctly inside the fixed-height app shell

## [1.09.00] - 2026-02-25

### Major Redesign — Glassmorphism UI
- Floating app container: entire app now floats as a 32px rounded glassmorphism card against a soft gray gradient background
- New sidebar: semi-transparent glass sidebar with updated nav pills, gradient active states, purple count badge, and existing logo preserved
- Glass card system: all cards use `rgba(255,255,255,0.9)` with `backdrop-blur`, 20px radius, and animated gradient border-on-hover
- Quick Action cards: full-gradient colored icon containers (purple-pink, blue-cyan, orange-red)
- Stat cards, project cards, and all interactive cards use gradient border hover effects with colored shadows
- Auth bypass helper for local dev (never affects production)
- New design tokens: gradient palette, glassmorphism variables, updated radius scale (up to 32px)

## [1.08.01] - 2026-02-24

Documentation update: User Guide, SmartBrief Guide, AI Agent docs, and rotowrite-content-engine.md brought fully in sync with current codebase.

- User Guide: Fixed agent count (7→8), added Fact Verification Agent, added SmartBrief AutoBuilder section, removed stale "NEW!" label from AI Configuration tab
- AI Team Page: Updated all agent count references (7→8), added Fact Verification to model config table, guardrails table, and workflow steps; added Fact Check pill to agent list
- Overview Page: Corrected Next.js version (14→16) and updated Claude model name
- rotowrite-content-engine.md: Added Fact Verification Agent, added AutoBuilder feature description
- SmartBrief Guide: Added AutoBuilder section with step-by-step instructions

---

## [1.08.00] - 2026-02-24

SmartBrief AutoBuilder: paste any story URL and the AI Agent auto-constructs a SmartBrief scaffold, AI instructions, name, and description.

- New API route `/api/briefs/auto-build` fetches the URL content and uses Claude to reverse-engineer a complete SmartBrief
- AutoBuilder section (violet-themed) added to the Create SmartBrief screen above the form
- AutoBuilder button added to the SmartBriefs browser header, next to Create New SmartBrief

---

## [1.07.12] - 2026-02-24

- Center the Create New Project form in the content panel so it adapts to screen width instead of being left-aligned.

## [1.07.11] - 2026-02-24

Fix user deletion failing on foreign key constraints. Add migration to set ON DELETE SET NULL for content tables (projects, briefs, writer_models, api_keys, ai_settings) and ON DELETE CASCADE for per-user data (ai_helper_entries, research_feedback). Update Project type to allow nullable `user_id`.

---

## [1.07.10] - 2026-02-24

Fix deployment build failure: remove `JSX.IntrinsicElements` reference in TipTap preview renderer (TypeScript namespace not available in Next.js 16). Refactor project creation flow to use dedicated `/projects/new` page instead of modal.

---

## [1.07.09] - 2026-02-24

Fix INP performance issue on user delete: replace blocking `confirm()` with async Dialog, move deletion to server-side API route with `can_delete_users` permission check and `auth.users` cleanup.

---

## [1.07.08] - 2026-02-19

Add "Create New..." button to sidebar navigation with animated dropdown for Project and SmartBrief creation. Clicking Project opens the existing creation wizard modal; clicking SmartBrief navigates to /smartbriefs and auto-opens the creation form.

---

## [1.07.07] - 2026-02-19

Fix password reset redirect: added `?type=recovery` to the `redirectTo` URL in `resetPasswordForEmail` so Supabase preserves the recovery type through its auth redirect, allowing the callback to correctly route users to the reset-password page instead of the login screen.

---

## [1.07.06] - 2026-02-24

- **Fix login fetch error (root cause)**: Removed trailing `\n` garbage characters from `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables. The corrupted URL was causing browser fetch to throw "Failed to execute 'fetch' on 'Window': Invalid value" on every login attempt. Rebuilt and redeployed with clean values.

## [1.07.05] - 2026-02-24

- **Upgrade Supabase packages**: Upgraded `@supabase/supabase-js` from 2.81.1 → 2.97.0 and `@supabase/ssr` from 0.7.0 → 0.8.0.

## [1.07.04] - 2026-02-20

- **Fix Save Profile**: Profile updates (name, job title, avatar) were failing with "Failed to Update Profile" because the Supabase RLS policy on the `users` table only allows admins to update rows. Created `/api/profile` PATCH route that verifies the user's session then uses the service role client to update only the authenticated user's own `full_name`, `job_title`, and `avatar_url`. Updated `ProfilePageClient` to call this API route instead of querying Supabase directly.

## [1.07.03] - 2026-02-20

- **Fix Next.js 16 + React 19 prerender build failures**: Resolved critical `useContext = null` errors during static prerendering that blocked Vercel deployments. Converted all `'use client'` pages to Server Component wrappers (`page.tsx` → `*Client.tsx`) with `force-dynamic`. Added `mounted` pattern to `LoginForm`, `SmartBriefGuideClient`, `StyleGuideClient`, and `ClientInit` to prevent Radix UI hook calls during SSR. Replaced `nextDynamic + ssr:false` in `ClientInit` with the mounted pattern to avoid `BailoutToCSRError` in React 19. Fixed `jspdf`/`fflate` Node.js module bundling error in `ContentAnalyticsClient` by wrapping `AnalyticsExportModal` with `nextDynamic + ssr:false`. Upgraded Next.js to `16.2.0-canary.53`. All 30+ routes now build and deploy successfully.

## [1.07.02] - 2026-02-20

- **Fix Roles Editor errors**: Applied missing DB migrations to the Forge Supabase project. Created `roles` table, converted `users.role` from old enum to display-name TEXT, updated `role_permissions` to use display names, seeded `has_permission()` / `is_super_admin()` functions, and rewrote RLS policies. Updated Supabase connection credentials to point to the correct Forge project.
- **Fix login fetch error**: Switched Supabase API keys from new `sb_publishable_` format to legacy JWT format for compatibility with `@supabase/supabase-js` v2.x.

## [1.07.01] - 2026-02-20

- **Super Admin bypass in `usePermissions`**: Super admin emails now bypass the DB permission lookup on the client side, granting full access to all admin dashboard menu items immediately. Extracted `isSuperAdmin` to `lib/super-admin.ts` (client-safe shared module) and updated `usePermissions` hook and `AdminPageClient` to use it.

## [1.07.00] - 2026-02-19

- **Dynamic Roles System**: Replaced hardcoded enum-based roles (`super_admin`, `admin`, etc.) with a fully dynamic `roles` table. Role names are now human-readable strings ("Super Administrator", "Administrator", etc.) stored in the DB with full CRUD via the new Roles Editor admin screen.
- **Permission-Driven Access Control**: Replaced 16+ hardcoded `can*()` functions with a single `has_permission(user_id, permission_key)` SQL function and matching `checkApiPermission()` server-side helper. All 28 permissions are configurable per role.
- **Roles Editor**: New admin screen replacing the old Role Wizard. Full CRUD for roles with permission toggles grouped by category (Content, AI & Tools, Analytics, User Management, Admin Access).
- **`usePermissions` hook**: New React hook for client components to fetch and check permissions against the DB without individual queries.
- **DB Migration (00018)**: Converts `users.role` from ENUM to TEXT, seeds 5 default roles, adds `is_tool_creator` field to users, rewrites all RLS policies to use `has_permission()`, adds `is_super_admin()` helper.
- **RLS policies rewritten**: All policies now use `has_permission()` function — `agent_configs`, `trusted_sources`, `ai_settings`, `api_keys`, `tools`, `briefs`, `role_permissions`, `user_permission_overrides`, `cursor_remote_*`, and new `roles` table.
- **Admin menu permission-driven**: `AdminMenu.tsx` now uses `requiredPermission` per item instead of `minRole` hierarchy. Menu visibility is driven by the user's actual permission set.
- **UserManagement updated**: Role dropdown is now fetched dynamically from the `roles` table. `is_tool_creator` checkbox added to create/edit user dialogs.
- **ClientInit component**: Extracted `PasswordResetHandler` and `Toaster` into a `ClientInit` wrapper using `next/dynamic` with `ssr: false` to prevent Radix UI hook errors during static prerendering.
- **Build fixes**: Added `force-dynamic` to `/nfl-odds`, `/projects`, `/smartbriefs`, `/writer-factory` pages. Created custom `global-error.tsx` and `not-found.tsx` pages. Fixed `PasswordResetHandler` to use `window.location` instead of `usePathname()`.

## [1.06.11] - 2026-02-19

- **Fix Generate Content button blocked after setup wizard**: Removed the `fact_check_complete` gate from `canGenerate` and from `handleGenerateContent`. The button is now active as soon as a project and writer model are selected. Research/fact-checking can be done after content is generated, matching the intended workflow.
- **SmartBrief code audit**: Removed dead `startNewBrief` function (never called, incomplete). Removed unused imports (`CardContent`, `CardHeader`, `CardTitle`, `ArrowUpDown`). Added error toast to `deleteBrief` failure case. Removed debug `console.log` statements from `analyzeExampleUrls`. Moved `BriefCard` outside the parent component to prevent unnecessary unmount/remount on every render.
- **PostgREST schema reload**: Forced `NOTIFY pgrst, 'reload schema'` so the UPDATE path recognises the `description` column immediately after migration.

## [1.06.10] - 2026-02-19

- **Fix SmartBrief description column (final)**: Confirmed that the production Supabase project is `hjnmeaklpgcjwzafakwt` (not the dev DB in `.env.local`). Migration 00017 added the `description` column there. Reverted the `seo_config` workaround — `description` now saves and loads as a proper column. Old records that stored description in `seo_config` still display correctly via fallback read.

## [1.06.09] - 2026-02-19

- **Fix migration script**: `scripts/migrate.mjs` now auto-detects the Supabase project ref from `NEXT_PUBLIC_SUPABASE_URL` (no more hardcoded wrong project ref). When the PAT lacks access, it now prints the exact SQL and the Supabase dashboard URL where the user can run it manually.
- **Fix migration SQL**: Added `NOTIFY pgrst, 'reload schema'` to `00017_add_description_to_briefs.sql` so PostgREST picks up the new column immediately without a restart.
- **Fix production URL**: Corrected `gdcforce` → `gdcforge` in PROJECT_STATUS.md.

## [1.06.08] - 2026-02-19

- **Fix SmartBrief saves**: Diagnosed that the production Supabase project (`ybrhwafnetvcgrrmxgvy`) is in a different org than the PAT-accessible project, so the `description` column migration was applied to the wrong DB. Fixed by re-applying the seo_config workaround: `description` is stored in `seo_config.description` (loaded from both locations for forward compat). After creating a new SmartBrief, the user is now navigated back to the list view so the saved brief is immediately visible. Toast message updated to "SmartBrief Saved Successfully".

## [1.06.07] - 2026-02-19

- **Migration tooling**: Added `scripts/migrate.mjs` — a Management API-powered migration runner. Run `npm run migrate` to apply all SQL files in `supabase/migrations/`, or `npm run migrate 00017_add_description_to_briefs.sql` for a specific file. Requires `SUPABASE_ACCESS_TOKEN` in `.env.local`.
- **Fix SmartBrief description column**: Applied migration `00017_add_description_to_briefs.sql` to add `description TEXT` to the `briefs` table via the Management API. Reverted the `seo_config` workaround — `description` now saves and loads directly from its proper column.

## [1.06.06] - 2026-02-19

- **Fix SmartBrief save error ("description" column not found)**: Temporarily stored `description` in `seo_config` JSONB as a workaround while the proper migration was prepared.

## [1.06.05] - 2026-02-19

- **Fix SmartBrief save button blocking UI (240ms)**: The TipTap editor in `SmartBriefPanel` had a bidirectional content sync — it received `briefContent` as a prop (updated every keystroke via `onChange`), which triggered an expensive `JSON.stringify` comparison in TipTap's internal `useEffect` on every keystroke, blocking the main thread. Fixed by: (1) adding `key={selectedBrief?.id ?? 'new'}` so the editor remounts cleanly when switching briefs (no programmatic `setContent` needed); (2) passing only the stable initial content (`selectedBrief?.content ?? null`) as the `content` prop so TipTap's sync effect no longer fires on every keystroke; (3) capturing the editor instance via `onEditorReady` + `editorRef`, so `saveBrief` reads content directly from `editorRef.current.getJSON()` instead of relying on React state — guaranteeing the latest editor content is always saved.

## [1.06.04] - 2026-02-19

- **Teams feature — fully wired**: Complete Teams management system in the Admin panel. Managers+ can create, edit, and delete teams; click a team to open its members panel. Split-panel UI shows current members and available users — drag users onto the members panel (or click the + button) to add them instantly. HTML5 drag-and-drop with live drop-zone highlight. Includes 4 new API routes (`/api/admin/teams`, `/api/admin/teams/[teamId]`, `/api/admin/teams/[teamId]/members`, `/api/admin/teams/[teamId]/members/[userId]`) and `Team`/`TeamMember` types added to `types/index.ts`. RLS policies (manager+ can manage, team_leader+ can view) were already in place from migration 00014.

## [1.06.03] - 2026-02-19

- **Fix saving user edits**: Resolved "Could not find the 'account_status' column in the schema cache" error when editing users in the admin panel. User updates now go through a new server-side API route (`PATCH /api/admin/users/[userId]`) using the service role key, which bypasses PostgREST schema cache issues. Added migration `00016_ensure_account_status.sql` to defensively ensure the `account_status` column exists with the correct constraint and triggers a schema cache reload via `NOTIFY pgrst`.

## [1.06.02] - 2026-02-19

- **Fix SmartBrief create button**: `saveBrief` in `SmartBriefPanel` was silently swallowing DB errors — wrapped in `try/catch/finally` so failures now surface a `toast.error()` with the actual message, and loading state is always properly reset.
- **Cleanup**: removed leftover Spark debug instrumentation (console logs + HTTP requests to localhost:7242) from `BriefBuilderModal`.

## [1.06.01] - 2026-02-19

- **Fix dropdown z-index behind modals**: bumped `SelectContent` from `z-50` to `z-[300]` so all dropdowns (writer model, role, category, etc.) render above dialogs — fixes the role dropdown in User Management and writer model dropdown in the new project wizard.
- **Writer model selection**: admins and super-admins now see all writer models in the project creation wizard; regular users see only their own assigned model. Added `userRole` prop to `ProjectCreationModal`.
- **DB migration fix**: added explicit `::user_role` type casts in `role_permissions` and `user_permission_overrides` RLS policies.

## [1.06.00] - 2026-02-19

- **MenuBar (AppSidebar) revamp**: new nav structure with Projects, SmartBriefs, User Guide, Tools (Coming Soon), Admin links. ProfileMenuBox at bottom shows user avatar, full name, and role. UserProfileMenu (expands upward) adds direct Writer Model link alongside Profile and Settings.
- **AdminMenu overhaul**: grouped navigation with User Management, AI & Content, Integrations, and Platform sections. New sections: Role Wizard, Odds API Management, Audit Log, System Health.
- **Role Wizard** (new admin screen): super-admin can configure permissions per role using toggles across 5 categories — Content, AI & Tools, Analytics, User Management, Admin Access. Backed by new `role_permissions` DB table with full seed data.
- **Per-user permission overrides**: edit dialog in User Management now includes a collapsible "Individual Permission Overrides" section with toggles for every permission, saved to `user_permission_overrides` DB table.
- **Projects screen**: revamped with "My Projects" and "Shared Projects" sections, sort dropdown (Last Modified, Date Created, A→Z, Z→A), plus the new `is_shared` column on the `projects` table.
- **SmartBriefs screen**: revamped with "My SmartBriefs" and "Shared SmartBriefs" sections, sort dropdown, How-to Guide link and Create New SmartBrief button in header. Added `description` field (shown on cards) to SmartBrief creation/edit form, backed by new `description` column on the `briefs` table.
- **Settings page**: expanded with Appearance (theme, compact cards), Editor (font size, spell check, auto-save, word count, SEO score), Content Defaults (word count target), Export Preferences (format), and Notifications sections.
- **System Health admin screen**: real-time health checks for Database, Authentication, Storage, and AI API services.
- **DB migration 00015**: adds `role_permissions`, `user_permission_overrides` tables with RLS; adds `description` to `briefs`; adds `is_shared` to `projects`; seeds default permissions for all 5 roles.

## [1.05.01] - 2026-02-19

- **SmartBriefs full-screen browser**: replaced the modal-based SmartBriefs browser with a full-screen panel view matching the Projects screen pattern. Includes search bar, summary stats (total, shared, AI configured), and a responsive card grid. "Back to Dashboard" in the editor now navigates back to the SmartBriefs browser.

## [1.05.00] - 2026-02-18

- **Twigs Template System**: 70+ template variables across 8 categories (Sportsbook, Geography, Offer, Sports, Date, Author, Content, SEO). Twig Inserter button in both SmartBrief and Content Editor toolbars with searchable dropdown. Auto-replacement of date twigs and content metadata during generation.
- **Research Story workflow fixes**: project data now reloads after research completion; research articles, verified facts, and disputed facts are passed to the AI content generation agent.
- **Clickable research cards**: click anywhere on a research card to select/deselect it for fact verification (not just the checkbox).
- **User Profile enhancements**: popup menu now opens upward with Profile, Settings, and Light/Dark toggle. Profile page adds Job Title field and photo upload. Settings page streamlined to Writer Factory training link.
- **Projects panel improvements**: Edit and Delete action icons on hover for each project card.
- **SmartBriefs modal**: larger modal (85vh) with 4-column grid and updated date display.
- **Sidebar cleanup**: removed NFL Odds Extractor from menu, moved Writer Factory under SmartBriefs in Workspace section.
- **Writer Factory URL extraction**: fixed extraction by creating dedicated `/api/extract-url` endpoint that fetches page content and uses AI to extract article text.
- **User Guide**: added comprehensive Twigs documentation section.

## [1.04.00] - 2026-02-18

- **Final Forge logo**: replaced all placeholder "F" monograms with the official Forge icon across sidebar, login page, style guide, and legacy left sidebar.
- Updated favicon and added app icon using the new Forge logo.

## [1.03.00] - 2026-02-18

- **Content Analytics Dashboard**: interactive analytics page with stat cards, area/bar/line/pie charts, date range picker with presets, and daily breakdowns.
- Team leader+ can view cumulative and per-member team stats with user selector and sortable member table.
- Analytics export in CSV, Excel, PDF, and interactive HTML formats.
- Save/share named filter configs with unique shareable URL tokens.
- Event tracking for project creation, export, brief creation/edit/share with backfill API for existing data.
- Supabase migration: analytics_events, teams, team_members, saved_filters tables with RLS policies.

## [1.02.00] - 2026-02-18

- Admin Dashboard revamp: full-screen layout, collapsible Admin menu, section-based navigation with `?section=` query param.
- Updated admin permissions: Manage All Users and Teams (manager+), API Keys and Tools (super_admin only), AI Tuner (manager+), AI Agents and Trusted Sources (team_leader+).
- New Team Management placeholder (manager+) and Ship It workflow (GitHub push, Spark update, CHANGELOG, version bump).
