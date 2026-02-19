# Changelog

All notable changes to Forge are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

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
