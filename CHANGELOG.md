# Changelog

All notable changes to Forge are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

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
