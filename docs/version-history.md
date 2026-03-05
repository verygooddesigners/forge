# Forge — Version History

_Organized by date, newest first. All versions tracked since initial changelog (v1.02.00, Feb 18 2026)._

---

## March 5, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.11.25** | Feature | Manual research curation — "Manual" badge, × remove button in modal and sidebar, `is_manual` flag, new `POST /api/research/remove-story` endpoint |
| **v1.11.24** | Feature | Add Reference Story — expandable URL input in Research panel, URL scraping + AI body extraction, auto-added to generation bundle |
| **v1.11.23** | Fix | Bug Tracker email-app layout (fixed-column master-detail), UserPanel `h-screen` overflow bug, "storyies" typo |
| **v1.11.22** | Fix | Research pipeline stories not saved for regular users — service role client now used for all `project_research` writes inside streaming responses |
| **v1.11.21** | Fix | Content generation word count — added hard ±10% constraint rule to system prompt; table cell content excluded from count |
| **v1.11.20** | Fix | Service role key used for all privileged research DB operations (bypasses unreliable `is_admin()` RLS in async contexts) |
| **v1.11.19** | Fix | Research stories not appearing for super admin — new `GET/PATCH /api/research/load` server-side endpoint replaces direct client Supabase queries in RightSidebar |
| **v1.11.18** | Fix | Super admin research pipeline blocked by RLS — updated `is_admin()` to include "Super Administrator", added `project_research` RLS bypass |

---

## March 4, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.11.13** | Feature | Beta scheduling — `scheduled_start_at` / `scheduled_end_at` on betas table; Create Beta converted to split panel; auto-end logic on GET |
| **v1.11.12** | Feature | AI Helper Bot — full platform knowledge base injected from `docs/forge-ai-helper-context.md` into every chat system prompt |
| **v1.11.11** | Fix | Beta Toolbar — "Bug Report" button opens modal again; tracker icon uses custom SVG bug icon instead of emoji |
| **v1.11.10** | Improvement | Bug tracker notes visible to all permissioned users (not just admins); non-admins see placeholder when empty |
| **v1.11.9** | Fix | Sidebar wordmark — centered, increased font size 42px → 64px to fill column width |
| **v1.11.8** | Redesign | Sidebar wordmark replaces logo image — "FORGE" in accent-primary at 42px, "BETA vX.X.XX" below in tracking |
| **v1.11.7** | Fix | Sidebar logo — removed duplicate "Forge" text; logo image fills ~50% of column width |
| **v1.11.6** | Improvement | Bug tracker deep-links — per-bug `/bugs/[id]` URLs, URL updates on selection, copy link button, `GET /api/bugs/[id]` |
| **v1.11.5** | Improvement | Bug Tracker UX polish — master-detail inline layout, edit button for permissioned users, `PATCH /api/bugs/[id]` title/description/severity |
| **v1.11.4** | Feature | Full-Page Bug Tracker at `/bugs` — active/archive tabs, severity filter, ReportBugModal with screenshot upload, bug detail dialog, comments, admin notes, auto-archive |
| **v1.11.3** | Fix | Writer Model not visible in project creation for admin-assigned users — OR filter now includes `default_writer_model_id` |

---

## March 3, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.11.2** | Fix | API Keys bug (queried non-existent `system_settings` table); Tavily & OpenAI health checks added; Vercel Speed Insights added |
| **v1.11.1** | Feature | Admin API Key Management — manage Anthropic/Tavily/OpenAI keys from Admin panel without redeploys; DB-first key resolution with 5-min in-memory cache |

---

## March 2, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.11.0** | Performance | Major speed overhaul — removed root `force-dynamic`, singleton Supabase clients, reduced `checkApiPermission` from 4→2 DB calls, eliminated analytics N+1 queries, fixed ResearchHub infinite re-render and InternalLinksModal keystroke storm, lazy-loaded UserGuideModal |
| **v1.10.51** | Fix | "Unauthorized" when training writer models — fourth permission check added for `default_writer_model_id` assigned models |
| **v1.10.50** | Feature | **Dark Mode v2** — systematic implementation after full codebase audit; CSS variable overrides, anti-flash script, Sun/Moon toggle in sidebar and Settings |
| **v1.10.49** | Revert | Dark mode reverted (deferred to future beta — too many hardcoded colors caused white sections) |
| **v1.10.48** | Fix | Dark Mode overhaul attempt — input/textarea `bg-white` → `bg-bg-elevated`, global safety-net CSS for remaining hardcoded colors |
| **v1.10.46** | Fix | System Health screen — created `/api/generate/health` endpoint; fixed storage bucket check; better diagnostics and latency coloring |
| **v1.10.45** | Feature | Edit Writer Models in Admin — pencil icon opens pre-populated edit dialog |
| **v1.10.44** | Fix | Teams screen crashes — `SelectItem` empty-value Radix bug; added migration `00032_teams.sql` for missing teams/team_members tables |
| **v1.10.43** | Feature | Beta Management gated behind `can_manage_betas` permission |
| **v1.10.42** | Fix | Beta Notes modal now shows on first magic link sign-in — `onAuthStateChange` listener in `ClientInit` |
| **v1.10.41** | Fix | Magic links no longer consumed by Slack/email pre-fetchers — `/auth/go` intermediary page with base64-encoded URL |
| **v1.10.40** | Fix | BetaToolbar version auto-syncs from `package.json` (removed hardcoded constant) |
| **v1.10.39** | Fix | Magic link `redirectTo` derived from request headers (not env var) — works across all domains |
| **v1.10.38** | Fix | Magic links now actually sign users in — `/auth/magic` client-side handler for all three Supabase auth redirect formats |

---

## February 28, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.10.37** | Fix | BetaToolbar version corrected (was stuck showing v1.10.32) |
| **v1.10.36** | Fix | Magic link routes through auth callback so session is established correctly |
| **v1.10.35** | Fix | Layout broken on authenticated pages (`min-h-screen` → `flex-1 overflow-y-auto`); new Change Password page at `/change-password` |
| **v1.10.34** | Feature | Get Login Link for beta users — generates magic link via admin API; copy dialog; no email required |
| **v1.10.33** | Fix | Removed email confirmation gate entirely — `account_status` defaults to `confirmed` for all new signups |
| **v1.10.32** | Fix | Redirect loop and DB constraint for beta user first-login — auto-provisions `public.users` profile on dashboard load |
| **v1.10.31** | Fix | Three first-login issues — blank dashboard (status `confirmed`), beta notes modal on auth pages, reset-password layout |
| **v1.10.30** | Fix | Writer Model assignment available for all active beta users; auto-provisions missing accounts before assigning |
| **v1.10.29** | Simplification | Beta onboarding — removed `generateLink` step; users self-serve via Forgot Password |
| **v1.10.28** | Fix | Bypass email entirely — `createUser + recovery link` flow; password setup links shared manually |
| **v1.10.27** | Fix | Beta invite flow — stale user cleanup + trigger fix for email unique constraint violations |
| **v1.10.26** | Fix | Magic link modal for existing beta users using `admin.auth.admin.generateLink()` |
| **v1.10.25** | Fix | OTP magic link `redirect_to` as query param (not body) |
| **v1.10.24** | Fix | Beta invites send magic link to existing Supabase users via OTP endpoint |
| **v1.10.23** | Fix | Screenshot attachment for Bug Reports; Beta Toolbar hidden on login; SmartBrief guide scrolling |
| **v1.10.22** | Fix | Writer model assignment `account_status` constraint error (`active` → `confirmed`) |
| **v1.10.21** | Feature | Writer Factory restored to sidebar; panel scoped per user (assigned personal + house models only) |
| **v1.10.20** | Minor | Renamed "Suggest Feature" → "Suggest/Feedback" in Beta Toolbar |
| **v1.10.19** | Feature | Writer Model assignment in Beta Management panel; invited users now appear in Writer Models admin |
| **v1.10.18** | Feature | Beta Notes editor uses TipTap rich text; any user can contribute house model training content |
| **v1.10.17** | Feature | **Beta Management System** — named betas, invite/start/end flows, Beta Notes, Beta Toolbar collapse pill |
| **v1.10.16** | Fix | Quick Actions: Odds card → Guides card; SmartBriefs AutoBuilder button style; Suggested Keywords compact |
| **v1.10.15** | Feature | Writer Models Admin — create/edit house and personal models, view training counts, assign users |
| **v1.10.14** | Feature | Beta Toolbar — floating pill with version, Suggest Feature, New Bug Report |
| **v1.10.13** | Fix | Admin panel black-screen error — `SelectItem value=""` Radix conflict fixed with `__none__` sentinel |
| **v1.10.12** | Improvement | Research stories partial results (orchestrator try-catch); TipTap empty content normalization; Reference Sources button with modal |
| **v1.10.11** | Fix | Research stories empty in sidebar — parse JSONB strings, fallback to `project.research_brief.articles` |
| **v1.10.10** | Fix | Research Hub: don't navigate to editor on pipeline error; "Continue to editor" button on failure |
| **v1.10.09** | Fix | Research stories not showing after pipeline — parallel load of project + project_research, delayed refetch on mount |
| **v1.10.08** | Improvement | New project create — save optional `description` (migration 00020 applied) |
| **v1.10.07** | Fix | New project create — stop sending `description` when column doesn't exist yet |
| **v1.10.06** | Fix | New project create — toast on insert error so user knows why research never starts |
| **v1.10.05** | Fix | Secondary keywords only split on commas (not spaces) — multi-word phrases preserved |
| **v1.10.04** | Fix | Vercel build — wrap Supabase promise in `Promise.resolve()` for `.finally()` TS compat |
| **v1.10.03** | Improvement | Debug logging for research pipeline; SmartBrief INP fix; category tag moved to bottom of card |

---

## February 25, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.10.02** | Fix | Admin User Edit dialog — roles API 403 fixed with `DEFAULT_ROLES` fallback |
| **v1.10.01** | Docs | User Guide, AI architecture, SmartBrief guide — updated for Research Orchestrator and 8 agents |
| **v1.10.00** | Major | **Research Pipeline overhaul** — `project_research` table, Research Orchestrator agent, SSE pipeline API, Research Hub, story selection UI, writer model grouping, GenerationContext strip, Internal Links modal |
| **v1.09.01** | Fix | Guide pages not scrolling inside glassmorphism container — `min-h-screen` → flex + `overflow-y-auto` |
| **v1.09.00** | Major | **Glassmorphism UI redesign** — floating app container, semi-transparent glass sidebar, glass card system, new design tokens |

---

## February 24, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.08.01** | Docs | User Guide, AI Team page, Overview, SmartBrief Guide — synced to current codebase (8 agents, Fact Verification, AutoBuilder) |
| **v1.08.00** | Feature | **SmartBrief AutoBuilder** — paste URL → AI reverse-engineers a complete SmartBrief scaffold |
| **v1.07.12** | Fix | Center Create New Project form in content panel |
| **v1.07.11** | Fix | User deletion foreign key constraint — `ON DELETE SET NULL` for content tables, cascade for per-user data |
| **v1.07.10** | Fix | Build failure — removed `JSX.IntrinsicElements` ref; project creation refactored to dedicated `/projects/new` page |
| **v1.07.09** | Fix | INP performance on user delete — replaced `confirm()` with async Dialog; server-side deletion via API route |
| **v1.07.06** | Fix | Login fetch error (root cause) — trailing `\n` garbage removed from Supabase env vars |
| **v1.07.05** | Upgrade | Supabase packages upgraded (`@supabase/supabase-js` 2.81.1 → 2.97.0, `@supabase/ssr` 0.7.0 → 0.8.0) |

---

## February 20, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.07.04** | Fix | Save Profile — PATCH API route using service role client bypasses RLS for profile updates |
| **v1.07.03** | Fix | Next.js 16 + React 19 prerender build failures — `mounted` pattern, `force-dynamic`, `next/dynamic` + `ssr:false`, upgraded to Next.js 16.2.0-canary.53 |
| **v1.07.02** | Fix | Roles Editor errors — missing DB migrations applied; Supabase credentials pointed to correct Forge project |
| **v1.07.01** | Fix | Super Admin bypass in `usePermissions` — extracted `isSuperAdmin` to shared module |

---

## February 19, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.07.08** | Feature | "Create New…" animated dropdown in sidebar nav for Project and SmartBrief |
| **v1.07.07** | Fix | Password reset redirect — `?type=recovery` added to `redirectTo` URL |
| **v1.07.00** | Major | **Dynamic Roles System** — `roles` table, `has_permission()` SQL function, Roles Editor admin screen, `usePermissions` hook, rewrote all RLS policies |
| **v1.06.11** | Fix | Generate Content button no longer blocked by `fact_check_complete` gate; SmartBrief code audit and cleanup |
| **v1.06.10** | Fix | SmartBrief description column confirmed on correct production DB; `seo_config` workaround reverted |
| **v1.06.09** | Fix | Migration script auto-detects Supabase project ref; prints SQL for manual run if PAT fails |
| **v1.06.08** | Fix | SmartBrief description stored in `seo_config.description` (wrong DB workaround); navigate to list after save |
| **v1.06.07** | Tooling | `scripts/migrate.mjs` — Management API migration runner (`npm run migrate`) |
| **v1.06.06** | Fix | SmartBrief description stored in `seo_config` JSONB while migration was pending |
| **v1.06.05** | Fix | SmartBrief save button blocking UI (240ms) — TipTap content sync loop fixed with `key` prop and `editorRef` pattern |
| **v1.06.04** | Feature | **Teams Management** — split-panel UI, drag-and-drop members, 4 API routes, RLS policies |
| **v1.06.03** | Fix | User edit "account_status column not found" — server-side PATCH API route with service role key |
| **v1.06.02** | Fix | SmartBrief create button error swallowed — wrapped in try/catch/finally with toast |
| **v1.06.01** | Fix | Dropdown z-index behind modals (z-50 → z-[300]); writer model dropdown scoped by role |
| **v1.06.00** | Major | **AppSidebar revamp**, **AdminMenu overhaul**, **Role Wizard** with permission toggles, **Projects screen** with My/Shared sections and sort, **SmartBriefs screen** revamp, Settings page expanded, System Health admin screen |
| **v1.05.01** | Feature | SmartBriefs full-screen browser (replaced modal) matching Projects screen pattern |

---

## February 18, 2026

| Version | Type | Summary |
|---------|------|---------|
| **v1.05.00** | Major | **Twigs Template System** — 70+ variables across 8 categories, Twig Inserter in toolbars; research story workflow fixes; User Profile enhancements; Writer Factory URL extraction via dedicated endpoint |
| **v1.04.00** | Feature | Final Forge logo — replaced all "F" monograms; updated favicon and app icon |
| **v1.03.00** | Major | **Content Analytics Dashboard** — stat cards, charts, date range picker, team stats, CSV/Excel/PDF/HTML export, saved filter configs |
| **v1.02.00** | Major | **Admin Dashboard revamp** — full-screen layout, collapsible menu, section-based navigation; updated permissions; Ship It workflow |

---

_Total versions tracked: 90+ releases across 16 days (Feb 18 – Mar 5, 2026)_
