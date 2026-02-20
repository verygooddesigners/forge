# Tasks to Complete

Generated from Spark on 2/19/2026, 5:55:46 PM

Project: Forge
Status: in_development
Tech Stack: ai: Grok API (Claude-ready), ui: Shadcn UI, auth: Supabase Auth, editor: TipTap, styling: Tailwind CSS, database: Supabase PostgreSQL + pgvector, language: TypeScript, framework: Next.js 16, workspace: GDC, deployment: Vercel

> **Build Order:** Tasks are sorted in optimal order — dependencies resolved first, then by priority (critical → high → medium → low), then grouped by feature area to minimize context switching.

---

## Incomplete Tasks (12 total)

### 1. Build Roles Editor Admin Screen

**Priority:** high
**Status:** to_do
**Feature Area:** Admin Panel
**Depends On:** None
**Created:** 2/19/2026
**ID:** 2498165c-82c1-4b30-8ee6-a77bb30914d7

Create the new Roles Editor admin screen that replaces RoleWizard with full CRUD for dynamic roles.

**List View (default):**
- Header: "Roles Editor" with ShieldCheck icon
- Subtitle: "Manage roles and their permissions across the platform."
- "Create New Role" button in top right corner
- Card list of all roles, each showing: role name (bold), description (muted text), permission count badge
- Click a role card to enter edit mode

**Create/Edit View:**
- Back button to return to list
- Card containing:
  - "Role Name" text input (required)
  - "Role Description" textarea
  - "Permissions" section with a bordered box containing:
    - 2-column grid of permission toggles (each: label + Switch component)
    - Grouped by category with group headers
  - "Create Role" or "Update Role" button
  - For editing: "Delete Role" button (with confirmation dialog, cannot delete if users are assigned to this role)

**Permission Groups (28 total):**
- **Content:** can_create_projects, can_edit_own_projects, can_delete_own_projects, can_share_projects, can_use_smartbriefs, can_edit_any_brief, can_delete_any_brief, can_export_content, can_manage_own_writer_model
- **AI & Tools:** can_use_ai_agents, can_tune_ai_agents, can_toggle_ai_agents, can_edit_master_ai, can_manage_trusted_sources
- **Analytics:** can_view_analytics, can_view_team_analytics
- **User Management:** can_view_users, can_create_users, can_edit_users, can_delete_users, can_create_teams, can_manage_teams
- **Admin Access:** can_access_admin, can_view_user_guide, can_manage_api_keys, can_manage_sso, can_manage_tools, can_manage_role_permissions

**Data operations:**
- Fetch all roles from `roles` table with permission counts from `role_permissions`
- On create: insert into `roles`, then insert all 28 permission rows into `role_permissions` (default false)
- On edit: update `roles` row, upsert `role_permissions`
- On delete: check if any users have this role first. If yes, show error toast. If no, delete from `roles`

**Update AdminDashboard.tsx:**
- Change `case 'role-wizard':` (or `'roles-editor'`) to render `<RolesEditor>` instead of `<RoleWizard>`

**UI:** Follow existing admin screen patterns - Card, Dialog, Table, Button, Switch, Badge, toast notifications from Sonner. Same styling/color system.

**Depends on:** Tasks 3-4 (types + permissions hook)

**Files:**
- `components/admin/RolesEditor.tsx` (new)
- `components/admin/AdminDashboard.tsx` (update)
- `components/admin/RoleWizard.tsx` (delete)

---

### 2. Create Roles API Routes

**Priority:** high
**Status:** to_do
**Feature Area:** API / Roles System
**Depends On:** None
**Created:** 2/19/2026
**ID:** 6a7975a7-e2e1-4a55-8ab6-814a1420915b

Create CRUD API endpoints for the Roles Editor screen.

**`GET /api/admin/roles`**
- List all roles with permission counts
- Requires: `can_manage_role_permissions` permission
- Returns: array of roles with `{ id, name, description, permission_count, created_at, updated_at }`

**`POST /api/admin/roles`**
- Create a new role
- Requires: `can_manage_role_permissions` permission
- Body: `{ name, description }`
- On creation: also insert all 28 permission rows into `role_permissions` with `enabled: false`
- Returns: 201 with created role

**`PATCH /api/admin/roles/[roleId]`**
- Update role name, description, and/or permissions
- Requires: `can_manage_role_permissions` permission
- Body: `{ name?, description?, permissions?: Record<string, boolean> }`
- If permissions provided: upsert all into `role_permissions`
- Returns: updated role

**`DELETE /api/admin/roles/[roleId]`**
- Delete a role
- Requires: `can_manage_role_permissions` permission
- Pre-check: query `users` table for any users with this role name. If found, return 409 error "Cannot delete role with assigned users"
- On success: delete from `roles` (cascade handles `role_permissions`)
- Returns: 200

**Use `checkApiPermission()` helper from auth-config.ts for all permission checks.**

**Depends on:** Task 3 (auth-config must have checkApiPermission)

**Files:**
- `app/api/admin/roles/route.ts` (new)
- `app/api/admin/roles/[roleId]/route.ts` (new)

---

### 3. Database Migration: Dynamic Roles System (00018_dynamic_roles.sql)

**Priority:** high
**Status:** to_do
**Feature Area:** Database / Roles System
**Depends On:** None
**Created:** 2/19/2026
**ID:** a4aa3a8b-8ccb-4811-9890-d3f3d3d10ab4

Create the foundational migration that converts from enum-based roles to a dynamic `roles` table.

**Steps:**
1. Create `roles` table (id UUID PK, name TEXT UNIQUE, description TEXT, created_at, updated_at)
2. Seed 5 initial roles: "Super Administrator", "Administrator", "Manager", "Team Leader", "Content Creator"
3. Add `is_tool_creator BOOLEAN DEFAULT false` to `users` table
4. Convert `users.role` from ENUM to TEXT (add column, map old values, drop old, rename)
5. Delete all users except `jeremy.botter@gdcgroup.com` (set to "Super Administrator")
6. Drop `user_role` ENUM type
7. Drop old helper functions (`role_level`, `has_minimum_role`)
8. Create new `has_permission(user_id, permission_key)` SQL function (checks user_permission_overrides first, then role_permissions)
9. Create `is_super_admin(user_id)` helper
10. Update `handle_new_user()` trigger (default role = "Content Creator")
11. Re-seed `role_permissions` with new role names + add `can_create_teams` permission (28 total permissions)
12. Enable RLS on `roles` table (read: all authenticated; write: has_permission('can_manage_role_permissions'))

**Files:**
- `supabase/migrations/00018_dynamic_roles.sql` (new)

**IMPORTANT:** This migration deletes all users except jeremy.botter@gdcgroup.com. Back up production database before running. Auth user cleanup in auth.users may need to happen via Supabase dashboard.

---

### 4. Rewrite All RLS Policies to Use has_permission()

**Priority:** high
**Status:** to_do
**Feature Area:** Database / Roles System
**Depends On:** None
**Created:** 2/19/2026
**ID:** 801eab08-5544-4804-9d43-cb944b95f497

Rewrite every RLS policy that currently uses `has_minimum_role()` to use the new `has_permission()` function. Include in the same migration file (00018_dynamic_roles.sql).

**Policy mappings:**
- `users` SELECT: `auth.uid() = id OR has_permission(auth.uid(), 'can_view_users')`
- `users` UPDATE: `has_permission(auth.uid(), 'can_edit_users')`
- `users` INSERT: `has_permission(auth.uid(), 'can_create_users')`
- `agent_configs`: `has_permission(auth.uid(), 'can_tune_ai_agents')`
- `trusted_sources` write: `has_permission(auth.uid(), 'can_manage_trusted_sources')`
- `ai_settings`: `has_permission(auth.uid(), 'can_edit_master_ai')`
- `ai_helper_entries`: `has_permission(auth.uid(), 'can_edit_master_ai')`
- `api_keys`: `has_permission(auth.uid(), 'can_manage_api_keys')`
- `tools` SELECT/UPDATE/DELETE: `has_permission(auth.uid(), 'can_manage_tools')`
- `tool_permissions`: `has_permission(auth.uid(), 'can_manage_tools')`
- `briefs` UPDATE: `created_by = auth.uid() OR has_permission(auth.uid(), 'can_edit_any_brief')`
- `briefs` DELETE: `created_by = auth.uid() OR has_permission(auth.uid(), 'can_delete_any_brief')`
- `briefs` SELECT: `is_shared = true OR created_by = auth.uid() OR has_permission(auth.uid(), 'can_edit_any_brief')`
- `role_permissions` write: `has_permission(auth.uid(), 'can_manage_role_permissions')`
- `user_permission_overrides` read: `user_id = auth.uid() OR has_permission(auth.uid(), 'can_edit_users')`
- `user_permission_overrides` write: `has_permission(auth.uid(), 'can_manage_role_permissions')`
- `cursor_remote_commands`: `is_super_admin(auth.uid())`
- `cursor_agent_status`: `is_super_admin(auth.uid())`
- `roles` table (new): SELECT all authenticated; WRITE has_permission('can_manage_role_permissions')

**Depends on:** Task 1 (has_permission function must exist first)

**Files:**
- `supabase/migrations/00018_dynamic_roles.sql` (appended to same file)

---

### 5. Update TypeScript Types & Permission Infrastructure

**Priority:** high
**Status:** to_do
**Feature Area:** Permissions Infrastructure
**Depends On:** None
**Created:** 2/19/2026
**ID:** 4e7ebc9b-ad34-4531-8e7b-3c93df18a1fa

Replace hardcoded `UserRole` type, `ROLE_LEVELS`, `ROLE_LABELS` with dynamic types and DB-driven permission checks.

**Changes to `types/index.ts`:**
- Remove `UserRole` union type (`'super_admin' | 'admin' | ...`)
- Remove `ROLE_LEVELS` constant
- Remove `ROLE_LABELS` constant
- Change `User.role` to `string` (now a display name like "Super Administrator")
- Add `is_tool_creator?: boolean` to User interface
- Add new `Role` interface: `{ id: string; name: string; description?: string; created_at: string; updated_at: string; }`
- Add `PermissionKey` union type for all 28 permission string literals

**Changes to `lib/auth-config.ts`:**
- Remove all 16 hardcoded `can*()` functions (canAccessAdmin, canViewUsers, canEditUsers, canDeleteUsers, canCreateUsers, canManageTeams, canEditMasterInstructions, canTuneAgents, canToggleAgents, canManageApiKeys, canManageSso, canManageTrustedSources, canAccessCursorRemote, canEditAnyBrief, canDeleteAnyBrief, canManageTools, canViewTeamAnalytics, canExportAnalytics)
- Remove `hasMinimumRole`, `getMaxAssignableRole`, `getAssignableRoles`
- Keep `isSuperAdmin()` hardcoded email check as safety net
- Add `getUserPermissions(userId)` - async, fetches from DB, merges role_permissions + user_permission_overrides
- Add `hasPermission(userId, key)` - async, single permission check
- Add `checkPermissionFromMap(perms, key)` - sync, checks from pre-fetched map
- Add `checkApiPermission(permissionKey)` - async helper for API routes (verifies auth, fetches profile, checks permission)

**Depends on:** Tasks 1-2 (migration must be complete)

**Files:**
- `types/index.ts`
- `lib/auth-config.ts`

---

### 6. Create Frontend Permissions Hook

**Priority:** high
**Status:** to_do
**Feature Area:** Permissions Infrastructure
**Depends On:** None
**Created:** 2/19/2026
**ID:** 8a911e32-c6ca-45c0-9d50-021ecaefcb45

Create a centralized React hook for admin components to access the current user's permissions without individual DB calls.

**Create `hooks/use-permissions.ts`:**
- `usePermissions(userId: string)` hook that:
  1. On mount, fetches from Supabase: user's role, role_permissions for that role, and user_permission_overrides
  2. Merges them into a single `Record<string, boolean>` (overrides take precedence)
  3. Returns `{ permissions, loading, hasPermission(key: string): boolean }`

**Update `components/admin/AdminPageClient.tsx`:**
- Use the `usePermissions` hook to fetch permissions on mount
- Pass the permissions map down as prop to AdminMenu, AdminDashboard, and all child admin components
- Show loading state while permissions are being fetched

**Depends on:** Task 3 (types must be updated)

**Files:**
- `hooks/use-permissions.ts` (new)
- `components/admin/AdminPageClient.tsx`

---

### 7. Database Migration: Dynamic Roles System (00018_dynamic_roles.sql)

**Priority:** high
**Status:** to_do
**Feature Area:** Roles & Permissions
**Depends On:** None
**Created:** 2/19/2026
**ID:** 40ece816-6735-407b-9725-0ed8f7a1086c

Create the foundational migration that converts from enum-based roles to a dynamic `roles` table.

**Steps:**
1. Create `roles` table (id UUID PK, name TEXT UNIQUE, description TEXT, created_at, updated_at)
2. Seed 5 initial roles: "Super Administrator", "Administrator", "Manager", "Team Leader", "Content Creator"
3. Add `is_tool_creator BOOLEAN DEFAULT false` to `users` table
4. Convert `users.role` from ENUM to TEXT (add column, map old values, drop old, rename)
5. Delete all users except `jeremy.botter@gdcgroup.com` (set to "Super Administrator")
6. Drop `user_role` ENUM type
7. Drop old helper functions (`role_level`, `has_minimum_role`)
8. Create new `has_permission(user_id, permission_key)` SQL function (checks user_permission_overrides first, then role_permissions)
9. Create `is_super_admin(user_id)` helper
10. Update `handle_new_user()` trigger (default role = "Content Creator")
11. Re-seed `role_permissions` with new role names + add `can_create_teams` permission (28 total permissions)
12. Enable RLS on `roles` table

**Files:** `supabase/migrations/00018_dynamic_roles.sql` (new)

---

### 8. Update All RLS Policies to Use has_permission()

**Priority:** high
**Status:** to_do
**Feature Area:** Roles & Permissions
**Depends On:** None
**Created:** 2/19/2026
**ID:** 2e3cf2ad-f020-447e-b852-1d5a61a01645

Rewrite every RLS policy that uses `has_minimum_role()` to use `has_permission()`. Include in the same migration file (00018).

**Key policy mappings:**
- `users` SELECT: `auth.uid() = id OR has_permission(auth.uid(), 'can_view_users')`
- `users` UPDATE/INSERT: `has_permission('can_edit_users')` / `has_permission('can_create_users')`
- `agent_configs`: `has_permission('can_tune_ai_agents')`
- `trusted_sources`: `has_permission('can_manage_trusted_sources')`
- `ai_settings`: `has_permission('can_edit_master_ai')`
- `api_keys`: `has_permission('can_manage_api_keys')`
- `tools`: `has_permission('can_manage_tools')`
- `briefs` UPDATE: `created_by = auth.uid() OR has_permission('can_edit_any_brief')`
- `briefs` DELETE: `created_by = auth.uid() OR has_permission('can_delete_any_brief')`
- `role_permissions` write: `has_permission('can_manage_role_permissions')`
- `cursor_remote_*`: `is_super_admin(auth.uid())`

**Files:** `supabase/migrations/00018_dynamic_roles.sql` (appended)

---

### 9. Update AdminMenu to Permission-Driven Visibility

**Priority:** medium
**Status:** to_do
**Feature Area:** Admin Panel
**Depends On:** None
**Created:** 2/19/2026
**ID:** 348da99d-4fd0-4ea4-8529-c99782011050

Replace the `minRole` system with `requiredPermission` per menu item so menu visibility is driven by the user's actual permissions.

**Changes to `components/admin/AdminMenu.tsx`:**
- Remove `ROLE_LEVELS` constant from this file
- Change `MenuItem` interface: replace `minRole: UserRole` with `requiredPermission: string`
- Update `AdminSectionId` type: rename `'role-wizard'` to `'roles-editor'`
- Accept `permissions: Record<string, boolean>` as a new prop
- Update `canAccessItem()` to check permissions map instead of role hierarchy
- Update `getDefaultSection()` to accept permissions map
- Rename "Role Wizard" label to "Roles Editor"

**Menu item -> permission mapping:**
| Menu Item | requiredPermission |
|-----------|-------------------|
| users | can_view_users |
| teams | can_manage_teams |
| roles-editor | can_manage_role_permissions |
| ai-tuner | can_edit_master_ai |
| ai-agents | can_tune_ai_agents |
| ai-helper | can_edit_master_ai |
| trusted-sources | can_manage_trusted_sources |
| api-keys | can_manage_api_keys |
| sso | can_manage_sso |
| odds-api | can_manage_api_keys |
| tools | can_manage_tools |
| audit-log | can_access_admin |
| system-health | can_manage_api_keys |

**Depends on:** Task 4 (permissions hook must exist)

**Files:**
- `components/admin/AdminMenu.tsx`

---

### 10. Update UserManagement for Dynamic Roles

**Priority:** medium
**Status:** to_do
**Feature Area:** Admin Panel
**Depends On:** None
**Created:** 2/19/2026
**ID:** 0859029b-e4a7-4488-995f-7df955b0ca06

Update the UserManagement admin screen to work with the new dynamic roles system.

**Changes:**
- Replace hardcoded role dropdown (currently uses `getAssignableRoles()` which returns `UserRole[]`) with a dynamic dropdown fetched from the `roles` table
- Fetch all roles from `/api/admin/roles` (or direct Supabase query to `roles` table) on component mount
- Display role names directly (no more `ROLE_LABELS` mapping needed since roles now have human-readable names)
- Add `is_tool_creator` checkbox to the create user dialog and edit user dialog
- Replace `canCreateUsers(role)`, `canEditUsers(role)`, `canDeleteUsers(role)` imports with permission map checks using the permissions prop
- Remove all `UserRole`, `ROLE_LABELS` imports
- Update the permission overrides section to include all 28 permissions (add `can_create_teams`)
- Update the user create API call to include `is_tool_creator` field
- Update the user edit API call to include `is_tool_creator` field

**Also update the user API routes:**
- `app/api/admin/users/route.ts` - Accept `is_tool_creator` in POST body
- `app/api/admin/users/[userId]/route.ts` - Accept `is_tool_creator` in PATCH body, validate role name exists in roles table

**Depends on:** Tasks 3-4, 7 (types, permissions hook, roles API)

**Files:**
- `components/admin/UserManagement.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[userId]/route.ts`

---

### 11. Update All Remaining Components & API Routes

**Priority:** medium
**Status:** to_do
**Feature Area:** Full Codebase
**Depends On:** None
**Created:** 2/19/2026
**ID:** 689213ac-308c-404b-8f31-cf312144db4b

Remove all remaining references to the old `UserRole` type, `ROLE_LEVELS`, `ROLE_LABELS`, and hardcoded `can*()` permission functions across the entire codebase.

**Components to update:**
- `components/admin/TeamManagement.tsx` - Remove UserRole/ROLE_LABELS references, use permissions prop
- `components/admin/AgentTuner.tsx` - Replace canTuneAgents/canToggleAgents with permission map checks
- `components/layout/AppSidebar.tsx` - Replace `canAccessAdmin(user.role as UserRole)` with a DB permission check for `can_access_admin`. Remove ROLE_LABELS import (display user.role directly since it's now a display name like "Super Administrator")
- `components/profile/ProfilePageClient.tsx` - Remove ROLE_LABELS import, use user.role directly
- `app/content-analytics/ContentAnalyticsClient.tsx` - Remove ROLE_LEVELS import

**API routes to update (replace hardcoded permission checks with `checkApiPermission()`):**
- `app/api/admin/teams/route.ts` - Replace canManageTeams
- `app/api/admin/teams/[teamId]/route.ts`
- `app/api/admin/teams/[teamId]/members/route.ts`
- `app/api/admin/teams/[teamId]/members/[userId]/route.ts`
- `app/api/admin/agents/route.ts` - Replace canTuneAgents
- `app/api/admin/agents/[agentKey]/route.ts`
- `app/api/admin/agents/[agentKey]/reset/route.ts`
- `app/api/admin/cursor-remote/agents/route.ts`
- `app/api/admin/cursor-remote/commands/route.ts`
- `app/api/analytics/team/route.ts` - Replace ROLE_LEVELS check with can_view_team_analytics
- `app/api/analytics/export/route.ts` - Replace ROLE_LEVELS check with can_export_content
- `app/api/tools/pending/route.ts`
- `app/api/tools/[toolId]/route.ts`
- `app/api/generate/route.ts`
- `app/admin/page.tsx` - Replace canAccessAdmin with DB permission check

**Depends on:** Tasks 3-4 (types + permissions hook must be in place)

**Files:** ~15-20 files across components and API routes

---

### 12. Cleanup & Build Verification

**Priority:** medium
**Status:** to_do
**Feature Area:** QA / Cleanup
**Depends On:** None
**Created:** 2/19/2026
**ID:** 846f1fa8-1761-4918-af10-feea513bf707

Final cleanup pass and verification that the entire dynamic roles system works end-to-end.

**Cleanup:**
- Delete `components/admin/RoleWizard.tsx` (replaced by RolesEditor)
- Grep entire codebase for any remaining references to: `UserRole`, `ROLE_LEVELS`, `ROLE_LABELS`, `user_role` (the enum type), `has_minimum_role`, `role_level`, old role names like `super_admin`, `content_creator` (as enum values - note: these may legitimately appear in migration files)
- Remove any dead imports or unused code from the refactor
- Ensure `checkRole()` and `isAdmin()` functions in `lib/auth.ts` are updated or removed

**Build Verification:**
- Run `npm run build` and fix any TypeScript errors
- Verify no type errors from removed UserRole references

**Testing Checklist:**
1. Run migration on dev database
2. Verify jeremy.botter@gdcgroup.com survives and has "Super Administrator" role
3. Login as super admin, verify all admin menu sections visible
4. Open Roles Editor, verify all 5 seeded roles appear with correct permission counts
5. Create a new role with limited permissions (e.g., only can_create_projects + can_access_admin)
6. Create a new user, assign the new role
7. Login as that user, verify they only see permitted admin menu items
8. Test user-level permission overrides
9. Test is_tool_creator checkbox on user edit
10. Test role deletion protection (cannot delete role with assigned users)
11. Verify RLS policies work (restricted user cannot access unauthorized resources)

**Depends on:** All previous tasks (1-9)

**Files:**
- Various cleanup across the codebase
- `components/admin/RoleWizard.tsx` (delete)

---

## Instructions for Claude Code

**CRITICAL**: After completing each task, you MUST call the MCP tool **mcp__spark__spark_update_task** to mark it done in Spark.

### How to Mark Tasks Complete

After finishing a task, call the MCP tool **mcp__spark__spark_update_task** with these parameters:
- task_id: the task ID from above
- updates: {"status": "done"}

For example, to mark task #1 as done, call mcp__spark__spark_update_task with:
- task_id: "2498165c-82c1-4b30-8ee6-a77bb30914d7"
- updates: {"status": "done"}

This is an MCP tool call — invoke it directly, do NOT just write it in a comment or code block. The Spark UI polls and updates automatically.

**Build Order Strategy:** Work through tasks in the listed order for the most seamless build:
- Dependencies are resolved first (a task's "Depends On" items will already be completed)
- Tasks are grouped by feature area to minimize context switching
- Mark each task done before starting the next
