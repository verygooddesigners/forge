# Cursor Prompt: Share Functionality for Projects & SmartBriefs

## Context

Forge is a Next.js 16 (App Router) / React 19 / TypeScript app using Supabase (PostgreSQL + Auth + RLS), Tailwind CSS 4, Shadcn UI components, and TipTap editor. All styles follow the existing violet accent (`accent-primary`) design system. All toasts use Sonner. Auth uses Supabase SSR.

Read the following files before writing any code — they define the patterns you must follow:
- `types/index.ts` — all shared interfaces
- `lib/auth-config.ts` — permission check helpers
- `lib/supabase/server.ts` and `client.ts` — Supabase client creation
- `components/editor/EditorToolbar.tsx` — the toolbar you'll be modifying
- `components/dashboard/SmartBriefPanel.tsx` — the SmartBrief UI you'll be modifying
- `components/dashboard/ProjectsPanel.tsx` — the Projects UI you'll be modifying
- `components/layout/AppSidebar.tsx` — the sidebar you'll be modifying
- `supabase/migrations/00024_research_overhaul.sql` — reference for migration style

---

## Feature Overview

Build a **Share** feature that allows users to share their Projects and SmartBriefs with other users within the Forge app. There are no public links — sharing is always scoped to the Forge user base.

### Sharing Options
- **Private** (default) — only the owner can see it
- **Specific People** — owner selects individual users via autocomplete
- **My Team** — shares with all members of the team the owner belongs to
- **Everyone** — visible to all confirmed users in the Forge app

### Permissions
Each share has a permission level:
- **View** — recipient can open and read but not edit
- **Edit** — recipient can open and edit (controlled by an "Allow editing" toggle in the Share modal)

### Recipient Experience
When something is shared with a user:
1. It appears in their **main Projects or SmartBriefs list** with a "Shared" badge
2. It also appears in a new **"Shared with Me"** section accessible from the sidebar

---

## Step 1: Database Migration

Create `supabase/migrations/00025_sharing_system.sql`.

```sql
-- Share visibility options for projects and briefs
-- visibility: 'private' | 'specific' | 'team' | 'everyone'

-- Add sharing columns to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS share_visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (share_visibility IN ('private', 'specific', 'team', 'everyone')),
  ADD COLUMN IF NOT EXISTS allow_editing BOOLEAN NOT NULL DEFAULT false;

-- Add sharing columns to briefs table
ALTER TABLE public.briefs
  ADD COLUMN IF NOT EXISTS share_visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (share_visibility IN ('private', 'specific', 'team', 'everyone')),
  ADD COLUMN IF NOT EXISTS allow_editing BOOLEAN NOT NULL DEFAULT false;

-- Project-level per-user share grants (for 'specific' visibility)
CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, shared_with)
);

-- Brief-level per-user share grants (for 'specific' visibility)
CREATE TABLE IF NOT EXISTS public.brief_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(brief_id, shared_with)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with ON public.project_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_brief_shares_brief_id ON public.brief_shares(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_shares_shared_with ON public.brief_shares(shared_with);

-- RLS for project_shares
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Owner can read/write their project's shares
CREATE POLICY "project_shares_owner" ON public.project_shares
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- Recipient can see shares that include them
CREATE POLICY "project_shares_recipient_read" ON public.project_shares
  FOR SELECT USING (shared_with = auth.uid());

-- RLS for brief_shares
ALTER TABLE public.brief_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brief_shares_owner" ON public.brief_shares
  USING (
    EXISTS (
      SELECT 1 FROM public.briefs b
      WHERE b.id = brief_id AND b.created_by = auth.uid()
    )
  );

CREATE POLICY "brief_shares_recipient_read" ON public.brief_shares
  FOR SELECT USING (shared_with = auth.uid());

-- Update RLS on projects to allow shared access
-- Drop and recreate the SELECT policy to include shared visibility
DROP POLICY IF EXISTS "projects_select" ON public.projects;

CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (
    user_id = auth.uid()
    OR share_visibility = 'everyone'
    OR (
      share_visibility = 'specific'
      AND EXISTS (
        SELECT 1 FROM public.project_shares ps
        WHERE ps.project_id = id AND ps.shared_with = auth.uid()
      )
    )
    OR (
      share_visibility = 'team'
      AND EXISTS (
        SELECT 1 FROM public.team_members tm1
        JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
        WHERE tm1.user_id = user_id AND tm2.user_id = auth.uid()
      )
    )
  );

-- Allow shared users to update projects if allow_editing = true
DROP POLICY IF EXISTS "projects_update_shared" ON public.projects;

CREATE POLICY "projects_update_shared" ON public.projects
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (
      allow_editing = true
      AND (
        share_visibility = 'everyone'
        OR (
          share_visibility = 'specific'
          AND EXISTS (
            SELECT 1 FROM public.project_shares ps
            WHERE ps.project_id = id AND ps.shared_with = auth.uid()
          )
        )
        OR (
          share_visibility = 'team'
          AND EXISTS (
            SELECT 1 FROM public.team_members tm1
            JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
            WHERE tm1.user_id = user_id AND tm2.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Update briefs SELECT policy similarly
DROP POLICY IF EXISTS "briefs_select" ON public.briefs;

CREATE POLICY "briefs_select" ON public.briefs
  FOR SELECT USING (
    created_by = auth.uid()
    OR is_shared = true
    OR share_visibility = 'everyone'
    OR (
      share_visibility = 'specific'
      AND EXISTS (
        SELECT 1 FROM public.brief_shares bs
        WHERE bs.brief_id = id AND bs.shared_with = auth.uid()
      )
    )
    OR (
      share_visibility = 'team'
      AND EXISTS (
        SELECT 1 FROM public.team_members tm1
        JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
        WHERE tm1.user_id = created_by AND tm2.user_id = auth.uid()
      )
    )
  );
```

---

## Step 2: TypeScript Types

Update `types/index.ts`. Add the following:

```typescript
export type ShareVisibility = 'private' | 'specific' | 'team' | 'everyone';

export interface ProjectShare {
  id: string;
  project_id: string;
  shared_with: string;
  user?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_url'>;
  created_at: string;
}

export interface BriefShare {
  id: string;
  brief_id: string;
  shared_with: string;
  user?: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_url'>;
  created_at: string;
}

export interface ShareSettings {
  visibility: ShareVisibility;
  allow_editing: boolean;
  shared_users: Array<Pick<User, 'id' | 'full_name' | 'email' | 'avatar_url'>>;
}
```

Also update the `Project` and `Brief` interfaces to include:
```typescript
share_visibility?: ShareVisibility;
allow_editing?: boolean;
```

---

## Step 3: API Routes

### 3a. User Search — `app/api/users/search/route.ts`

`GET /api/users/search?q=<query>`

- Requires authenticated user
- Searches `users` table by `full_name` (ilike) or `email` (ilike) using the query param `q`
- Excludes the current user from results
- Only returns `confirmed` account_status users
- Returns max 8 results: `[{ id, full_name, email, avatar_url }]`

```typescript
// Pattern to follow — use createClient from lib/supabase/server.ts
// Return NextResponse.json(results)
```

### 3b. Project Share Settings — `app/api/shares/projects/[projectId]/route.ts`

**GET** — fetch current share settings for a project
- Verify the requesting user owns the project (or has `can_edit_any_brief`)
- Return: `{ visibility: ShareVisibility, allow_editing: boolean, shared_users: User[] }`
- Fetch `project_shares` joined with `users` for the shared_users list

**POST** — save share settings for a project
- Body: `{ visibility: ShareVisibility, allow_editing: boolean, user_ids: string[] }`
- Verify ownership
- Update `projects.share_visibility` and `projects.allow_editing`
- If visibility is `'specific'`: delete all existing `project_shares` for this project, re-insert with `user_ids`
- If visibility is not `'specific'`: delete all `project_shares` for this project (individual grants no longer needed)
- Return updated settings

### 3c. Brief Share Settings — `app/api/shares/briefs/[briefId]/route.ts`

Same pattern as 3b but for `briefs` and `brief_shares`.

### 3d. Shared With Me — `app/api/shares/shared-with-me/route.ts`

**GET** — returns all projects and briefs shared with the current user (that they don't own)

```typescript
// Projects shared with me (everyone, team, or specific)
// Briefs shared with me (everyone, team, or specific)
// Return: { projects: Project[], briefs: Brief[] }
```

For each resource, determine share type by checking:
- `share_visibility = 'everyone'`
- `share_visibility = 'team'` and user is in the same team as owner
- `share_visibility = 'specific'` and a row exists in `project_shares`/`brief_shares` for this user

---

## Step 4: ShareModal Component

Create `components/modals/ShareModal.tsx`.

This is a **reusable modal** used for both Projects and SmartBriefs. Props:

```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'project' | 'brief';
  resourceId: string;
  resourceName: string;
  currentUserId: string;
}
```

### Modal Structure

Use `Dialog` from Shadcn UI (`@/components/ui/dialog`).

**Header:** `Share "[resourceName]"` with an `X` close button.

**Visibility Section — label: "Who can see this?"**

Four option cards in a 2×2 grid, each styled as a selectable card (border, rounded, padding). When selected, the card gets `border-accent-primary bg-accent-primary/5` styling. Each card:

| Option | Icon | Label | Sublabel |
|--------|------|-------|----------|
| `private` | `Lock` | Private | Only you |
| `specific` | `UserPlus` | Specific People | Choose who |
| `team` | `Users2` | My Team | Your team members |
| `everyone` | `Globe` | Everyone | All Forge users |

**Specific People Section** (only shown when `visibility === 'specific'`):

- User autocomplete input — `UserAutocomplete` component (see Step 5)
- List of currently added users, each showing avatar/initials + name + email + a remove (×) button
- If no users added yet, show muted placeholder text: "No one added yet"

**Permissions Section — label: "Permissions"**

A single row with a `Switch` component:
- Label: "Allow invited users to edit"
- Sublabel: "When off, shared users can view but not edit"
- Disabled and forced off when `visibility === 'private'`

**Footer:**
- Left: muted status text — e.g. "Shared with 3 people" or "Private" or "Visible to everyone"
- Right: `Cancel` button (ghost) + `Save` button (primary, violet)

### Behavior

On open, `GET /api/shares/[resourceType]s/[resourceId]` to load current settings. Show a loading skeleton while fetching.

On Save, `POST /api/shares/[resourceType]s/[resourceId]` with `{ visibility, allow_editing, user_ids }`. Show Sonner toast on success/error. Close modal on success.

---

## Step 5: UserAutocomplete Component

Create `components/ui/user-autocomplete.tsx`.

Props:
```typescript
interface UserAutocompleteProps {
  currentUserId: string;
  alreadyAdded: string[]; // user IDs to exclude from results
  onSelect: (user: Pick<User, 'id' | 'full_name' | 'email' | 'avatar_url'>) => void;
}
```

- Text input with `Search` icon, placeholder: "Search by name or email..."
- On each keystroke (debounced 300ms), fetch `GET /api/users/search?q=<value>`
- Show results in an absolute-positioned dropdown list below the input
- Each result row: avatar/initials circle + full_name (bold) + email (muted, smaller)
- Keyboard navigation: `ArrowUp` / `ArrowDown` to move through results, `Enter` to select, `Escape` to close
- On select, call `onSelect(user)` and clear the input
- Hide results if input is empty or loses focus (with a short delay to allow click)
- Exclude users already in `alreadyAdded` from results

Avatar fallback: if no `avatar_url`, show a circle with the user's initials using the same `getInitials()` pattern from `AppSidebar.tsx`, with a deterministic background color derived from the user's id.

---

## Step 6: Update EditorToolbar

File: `components/editor/EditorToolbar.tsx`

Add a `Share` button in the **Action Buttons** section (right side of toolbar), positioned **before** the `Export` button.

Add these props to `EditorToolbarProps`:
```typescript
onShare?: () => void;
```

The button:
```tsx
{onShare && (
  <Button onClick={onShare} variant="outline" className="gap-2">
    <Share2 className="h-4 w-4" />
    Share
  </Button>
)}
```

Import `Share2` from `lucide-react`.

---

## Step 7: Wire ShareModal into the Project Editor

File: `components/dashboard/EditorPanel.tsx`

- Add `useState` for `shareModalOpen: boolean`
- Pass `onShare={() => setShareModalOpen(true)}` to `EditorToolbar`
- Render `<ShareModal>` below the toolbar:
```tsx
<ShareModal
  isOpen={shareModalOpen}
  onClose={() => setShareModalOpen(false)}
  resourceType="project"
  resourceId={projectId}
  resourceName={project.headline}
  currentUserId={user.id}
/>
```
- Import `ShareModal` from `@/components/modals/ShareModal`

---

## Step 8: Update SmartBriefPanel

File: `components/dashboard/SmartBriefPanel.tsx`

**On the BriefCard component:**
- Add a Share icon button (ghost, small, `Share2` from lucide-react) that appears on hover (`opacity-0 group-hover:opacity-100`) in the top-right of the card
- Stop propagation on click so the card's `onClick` doesn't fire
- Call an `onShare(brief)` callback passed from the parent

**In SmartBriefPanel:**
- Add `shareModalBrief: Brief | null` state
- When a user opens a brief in detail/edit view, add a Share button in the header area (next to other action buttons), same style as the toolbar Share button
- Render `<ShareModal>` when `shareModalBrief` is set:
```tsx
<ShareModal
  isOpen={!!shareModalBrief}
  onClose={() => setShareModalBrief(null)}
  resourceType="brief"
  resourceId={shareModalBrief.id}
  resourceName={shareModalBrief.name}
  currentUserId={user.id}
/>
```

---

## Step 9: Update ProjectsPanel — Shared Badge + Shared With Me Section

File: `components/dashboard/ProjectsPanel.tsx`

This file already has a `sharedProjects` state. Extend it fully:

**Fetching shared projects:**

Replace the current shared projects query with a call to `GET /api/shares/shared-with-me`, which returns both projects and briefs. Use the `projects` array from the response for this panel.

**Displaying shared badge:**

On project cards, when `project.user_id !== user.id` (i.e. it belongs to someone else), show a `<Badge variant="secondary">Shared</Badge>` label. Also show the owner's name in muted text below the project title: "Shared by [owner name]". To get the owner name, the API should return projects with a `owner: { full_name, email }` join — update the API call accordingly.

**Section layout:**

Show two sections:
1. **My Projects** — projects owned by the current user
2. **Shared with Me** — projects shared with the current user (only shown if there are any)

Each section has a small heading label (`text-xs font-semibold text-text-tertiary uppercase tracking-wider`) before its list of cards.

---

## Step 10: Update SmartBriefPanel — Shared Badge + Shared With Me Section

File: `components/dashboard/SmartBriefPanel.tsx`

Same approach as Step 9 but for briefs:

- Fetch shared briefs from `GET /api/shares/shared-with-me`
- Show "Shared" badge on brief cards that belong to another user
- Show "Shared by [name]" muted text
- Split into "My SmartBriefs" and "Shared with Me" sections

---

## Step 11: Update AppSidebar — Shared With Me Nav Link

File: `components/layout/AppSidebar.tsx`

Add a **"Shared with Me"** nav item to the sidebar navigation, using the `Share2` icon from lucide-react.

- Place it directly below the SmartBriefs nav item
- Route to `/shared` (create a simple page — see Step 12)
- Show an unread count badge (small violet pill) if there are newly shared items the user hasn't seen. For the initial implementation, just show the total count of shared items. Fetch count from `GET /api/shares/shared-with-me` on sidebar mount and cache in state.
- Use the same `navLinkClass()` active state pattern already in the sidebar

---

## Step 12: Shared With Me Page

Create `app/shared/page.tsx` and `app/shared/SharedWithMeClient.tsx`.

This is a simple consolidated view of everything shared with the current user.

Layout: same pattern as other pages — `AppSidebar` on the left, content on the right.

Content area:
- Page title: "Shared with Me" with `Share2` icon
- Subtitle: "Projects and SmartBriefs others have shared with you."
- Two sections side by side (or stacked on smaller widths): **Projects** and **SmartBriefs**
- Each section renders the same card style as `ProjectsPanel` and `SmartBriefPanel`
- Each card shows "Shared by [name]" and the Shared badge
- Clicking a project card navigates to `/dashboard?project=[id]` (same as normal project open)
- Clicking a brief card navigates to `/smartbriefs?brief=[id]`
- Empty state per section: muted text + `Share2` icon if nothing shared

---

## Step 13: Handle View-Only Mode in Editor

File: `components/dashboard/EditorPanel.tsx` and `components/editor/TipTapEditor.tsx`

When the current user is not the project owner (`project.user_id !== user.id`) AND `project.allow_editing === false`, the editor must be read-only:

- Pass `editable={false}` to the TipTap editor (`editor.setEditable(false)`)
- Hide the `EditorToolbar` formatting buttons (or disable them)
- Show a read-only banner below the toolbar: a subtle info bar with the text "You're viewing this project in read-only mode." using the `Info` icon from lucide-react, styled with `bg-blue-50 border border-blue-200 text-blue-700`
- Still show the Share button in the toolbar (owner's share settings, read-only for non-owners — disable the Save button in the modal if user is not the owner)

---

## Styling Notes

- Follow the existing design system exactly: `accent-primary` for active/selected states, `text-text-primary/secondary/tertiary` for text, `border-border-subtle` for borders, `bg-bg-hover` for hover states
- Modal width: `max-w-md`
- All interactive elements use `transition-all` for smooth state changes
- Sonner toast on all async operations: success uses default, error uses `toast.error()`
- Use `Loader2` spinning icon for all loading states

---

## File Checklist

New files to create:
- `supabase/migrations/00025_sharing_system.sql`
- `app/api/users/search/route.ts`
- `app/api/shares/projects/[projectId]/route.ts`
- `app/api/shares/briefs/[briefId]/route.ts`
- `app/api/shares/shared-with-me/route.ts`
- `components/modals/ShareModal.tsx`
- `components/ui/user-autocomplete.tsx`
- `app/shared/page.tsx`
- `app/shared/SharedWithMeClient.tsx`

Files to modify:
- `types/index.ts` — add ShareVisibility, ProjectShare, BriefShare, ShareSettings types; update Project and Brief interfaces
- `components/editor/EditorToolbar.tsx` — add Share button + onShare prop
- `components/dashboard/EditorPanel.tsx` — wire ShareModal, handle read-only mode
- `components/dashboard/SmartBriefPanel.tsx` — add Share button on cards and detail header, wire ShareModal, add Shared With Me section
- `components/dashboard/ProjectsPanel.tsx` — update shared projects fetch, add badges, add Shared With Me section
- `components/layout/AppSidebar.tsx` — add Shared with Me nav item

---

## Important Notes for Cursor

1. **Do not** change the existing RLS policies for `projects` or `briefs` without first reading the existing policies in `supabase/migrations/00002_row_level_security.sql` and any later migrations — the new SELECT policy must preserve all existing access while adding the new sharing logic.

2. The `projects` table uses `user_id` as the owner field. The `briefs` table uses `created_by`. Use the correct field for ownership checks.

3. The `team_members` table (from `00013_role_system_overhaul.sql` or similar) stores team membership. Verify the exact table and column names before writing the team-based RLS policy.

4. Always use `createClient()` from `lib/supabase/server.ts` in API routes (server-side) and from `lib/supabase/client.ts` in client components.

5. All API routes should authenticate the user first. If not authenticated, return `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`.

6. The `can_share_projects` permission already exists in the permissions system. Check this permission in the share API routes before allowing share settings to be saved.
