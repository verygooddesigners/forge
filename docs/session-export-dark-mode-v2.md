# Session Export — Dark Mode v2
**Project:** Forge (gdcforge.vercel.app)
**Date:** March 2, 2026
**Version shipped:** 1.10.50
**Repo:** https://github.com/verygooddesigners/forge
**Spark Project ID:** `7bf75473-0a06-469c-9fd2-2229efff76e0`

---

## What Was Built

A complete, systematic dark mode implementation for the Forge Next.js app. Previous dark mode attempts had failed or been reverted. This implementation started with a full codebase audit (120+ hardcoded color instances across 37+ files), then followed a deliberate three-layer strategy to ensure zero visual regressions.

---

## Architecture

### Three-Layer Strategy

**Layer 1 — CSS Variable Overrides (`html.dark {}`)**
The design system already uses semantic CSS variables (e.g. `--color-bg-elevated`, `--color-text-primary`). When `.dark` is added to `<html>`, the `html.dark {}` block in `globals.css` flips all 17 tokens to dark values. Any component using semantic token classes (`bg-bg-elevated`, `text-text-primary`, etc.) gets dark mode for free.

**Layer 2 — Global Safety-Net CSS**
For hardcoded Tailwind utility classes that couldn't be replaced in every file (e.g. `bg-white`, `bg-slate-100`, `text-gray-700`), blanket overrides in `globals.css` catch them:
```css
html.dark .bg-white { background-color: var(--color-bg-elevated) !important; }
html.dark .text-gray-600 { color: var(--color-text-secondary) !important; }
/* ...etc */
```

**Layer 3 — Direct Inline Style Replacements**
JSX `style={}` objects use hex strings that CSS classes can't override. These were replaced with `var()` references:
```tsx
// Before
style={{ background: '#fff', color: '#111827' }}

// After
style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
```

### Theme Persistence
- **Key:** `localStorage.setItem('forge-theme', 'dark' | 'light')`
- **Anti-flash:** Synchronous `<script>` in `<head>` reads this key before first paint and adds `.dark` to `<html>` if needed — prevents white flash on page reload.

### Toggle Locations
1. **AppSidebar** — Sun/Moon button in the nav section (always visible)
2. **Settings > Appearance** — Dark Mode Switch toggle

---

## Dark Mode Color Palette

From the Figma Make reference screenshot provided by the user:

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--color-bg-deep` | `#F3F4F6` | `#080808` |
| `--color-bg-surface` | `#FAFAFA` | `#0a0a0a` |
| `--color-bg-elevated` | `#FFFFFF` | `#1a1a1a` |
| `--color-bg-hover` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.06)` |
| `--color-text-primary` | `#111827` | `#f0f0f0` |
| `--color-text-secondary` | `#374151` | `#a0a0a0` |
| `--color-text-muted` | `#6B7280` | `#606060` |
| `--color-border-default` | `#E5E7EB` | `rgba(255,255,255,0.1)` |
| `--color-border-subtle` | `#F3F4F6` | `rgba(255,255,255,0.06)` |
| `--color-accent-primary` | `#7C3AED` | `#A021FE` (same purple) |
| `--color-accent-muted` | `#F5F3FF` | `rgba(160,33,254,0.15)` |

### BetaToolbar Pill Vars
The floating BetaToolbar uses its own CSS vars (since it's all inline styles):
```css
:root {
  --beta-pill-bg: rgba(245, 243, 255, 0.92);
  --beta-pill-border: rgba(139, 92, 246, 0.25);
  --beta-pill-color: #5B21B6;
  --beta-pill-version-color: #7C3AED;
  --beta-pill-icon-color: #7C3AED;
}
html.dark {
  --beta-pill-bg: rgba(26, 26, 26, 0.95);
  --beta-pill-border: rgba(160, 33, 254, 0.3);
  --beta-pill-color: #c084fc;
  --beta-pill-version-color: #9d4edd;
  --beta-pill-icon-color: #a855f7;
}
```

---

## Files Changed

### `app/globals.css`
Foundation of the entire implementation. Added at the end of the file:
- `@custom-variant dark (&:is(.dark *));` — enables Tailwind v4 `dark:` variants
- `:root {}` block with `--beta-pill-*` CSS vars
- `html.dark {}` block overriding all 17 color tokens + beta pill vars
- Glassmorphism overrides for `.app-container`, `.app-sidebar`, `.app-floating-menu`
- Safety-net selectors: `html.dark .bg-white`, `.bg-gray-50`, `.bg-slate-100/200/300/400/500`, `.text-gray-600/700/800/900`, `.border-slate-200/300`, `.shadow-lg`, hover overrides, dark glass card overrides

### `app/layout.tsx`
Added anti-flash script in `<head>`:
```tsx
<head>
  <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('forge-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
</head>
```

### `components/layout/AppSidebar.tsx`
- Added `Sun`, `Moon` imports from `lucide-react`
- Added `isDark` state with `useEffect` to sync on mount
- Added `toggleTheme()` — toggles `.dark` on `<html>`, saves to localStorage
- Added Sun/Moon toggle button in nav section before closing `</nav>`

### `components/dashboard/EditorPanel.tsx`
- Main panel div: `bg-white border` → `bg-bg-elevated border`
- Status bar: `bg-white px-4` → `bg-bg-surface px-4`
- Status bar text: `text-gray-600` → `text-text-secondary`

### `components/dashboard/LeftSidebar.tsx`
- Container: `w-64 bg-white rounded-lg shadow-lg` → `w-64 bg-bg-elevated rounded-lg shadow-lg`

### `components/dashboard/RightSidebar.tsx`
- Card: `className="bg-white shadow-lg flex-1"` → `className="bg-bg-elevated shadow-lg flex-1"`

### `components/dashboard/SEOOptimizationSidebar.tsx`
- Card: `className="bg-white shadow-lg"` → `className="bg-bg-elevated shadow-lg"`

### `components/beta/BetaToolbar.tsx`
Most extensive changes — all inline hex colors replaced with CSS variable references:
- `background: '#fff'` → `'var(--color-bg-elevated)'` (5 occurrences via replace_all)
- `color: '#111827'` → `'var(--color-text-primary)'`
- `color: '#374151'` → `'var(--color-text-secondary)'`
- `color: '#9CA3AF'` / `'#6B7280'` → `'var(--color-text-muted)'`
- `background: '#F9F5FF'` → `'var(--color-accent-muted)'`
- Open/close ternary: `isOpen ? '#F9F5FF' : '#FAFAFA'` → CSS vars
- Drag-drop ternary: `dragOver ? '#F5F3FF' : '#FAFAFA'` → CSS vars
- Type badge: `'#FEF2F2' : '#F5F3FF'` → `rgba(239,68,68,0.1)` / CSS var
- Admin notes background/color → CSS vars
- Border `#E5E7EB` → `var(--color-border-default)` (replace_all)
- Border `#F3F4F6` → `var(--color-border-subtle)` (replace_all)
- onBlur border reset handlers → CSS vars
- Floating pill `rgba(245,243,255,0.92)` → `var(--beta-pill-bg)` (replace_all)
- Pill border → `var(--beta-pill-border)` (replace_all)
- Pill text `#5B21B6` → `var(--beta-pill-color)` (replace_all)
- Version/icon colors → `var(--beta-pill-version-color)` / `var(--beta-pill-icon-color)`

### `app/projects/new/NewProjectPageClient.tsx`
- Removed inline gradient `style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}` → Tailwind class `bg-bg-deep`
- `bg-white/80 backdrop-blur-md` → `bg-bg-surface/80 backdrop-blur-md`
- `border-white/60` → `border-border-subtle`

### `app/content-analytics/ContentAnalyticsClient.tsx`
- Same pattern as above: inline gradient removed → `bg-bg-deep`
- `bg-white/80 backdrop-blur-lg` → `bg-bg-surface/80`
- `border-white/60` → `border-border-subtle`

### `components/settings/SettingsPageClient.tsx`
- Added `isDark` state
- Synced `isDark` from `document.documentElement.classList` in existing `useEffect`
- Added "Dark Mode" `SettingRow` with `Switch` component in Appearance card:
```tsx
<SettingRow label="Dark Mode" description="Switch between light and dark color themes">
  <Switch checked={isDark} onCheckedChange={(v) => {
    document.documentElement.classList.toggle('dark', v);
    try { localStorage.setItem('forge-theme', v ? 'dark' : 'light'); } catch(e) {}
    setIsDark(v);
  }} />
</SettingRow>
```

### `app/guide/time-savings/SavingsCalculator.tsx`
- `bg-white border border-slate-200` → `bg-bg-elevated border border-border-default`
- `border-slate-100` → `border-border-subtle` (replace_all, 3 occurrences)
- `border border-slate-300` → `border border-border-default` (input)

### `app/guide/time-savings/TimeSavingsPage.tsx`
- `hover:bg-slate-100` → `hover:bg-bg-hover`

---

## Intentional Exclusions

**TipTap editor canvas** — The content writing area stays white (`#fff` background) in dark mode. This is intentional — it's a Word-processor metaphor. Existing `!important` rules in `globals.css` preserve this. No changes were made to TipTap-related styles.

---

## What Was NOT Changed

The design system's semantic token classes (`bg-bg-elevated`, `text-text-primary`, etc.) already covered the vast majority of the UI. Components using these classes get dark mode automatically from the CSS variable flip — no file edits needed. These include:
- All shadcn/ui components (Card, Button, Dialog, etc.)
- AppSidebar main structure
- Navigation components
- Most modal/dialog overlays
- Admin panel components using semantic tokens

---

## Codebase Notes for Future AI Sessions

### Design System
- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, Shadcn UI, Inter font
- **CSS variable naming convention:** `--color-{category}-{variant}` (e.g. `--color-bg-elevated`, `--color-text-secondary`)
- **Tailwind class naming:** matches CSS var names without the `--color-` prefix (e.g. `bg-bg-elevated`, `text-text-secondary`)
- **Dark mode class:** `.dark` on `<html>` element
- **Theme localStorage key:** `forge-theme` (values: `'dark'` or `'light'`)

### Key Files
| File | Purpose |
|------|---------|
| `app/globals.css` | All CSS variables, dark mode overrides, safety-net CSS |
| `app/layout.tsx` | Root layout, anti-flash script |
| `components/layout/AppSidebar.tsx` | Main sidebar with theme toggle |
| `components/beta/BetaToolbar.tsx` | Floating beta pill — all inline styles, uses `--beta-pill-*` vars |
| `components/settings/SettingsPageClient.tsx` | Settings page with Dark Mode switch |

### Known Patterns to Respect
1. Never use `bg-white` — use `bg-bg-elevated` instead
2. Never use `text-gray-*` for UI text — use `text-text-secondary` / `text-text-muted`
3. Never use `border-slate-*` — use `border-border-default` / `border-border-subtle`
4. Inline `style={}` objects must use `var(--color-*)` references, not hex values
5. The TipTap editor area is intentionally excluded from dark mode

### Git / Deploy
- Push to `main` → Vercel auto-deploys to https://gdcforge.vercel.app
- Use `mcp__spark__spark_git_push` with project_id `7bf75473-0a06-469c-9fd2-2229efff76e0`
- Always run Ship It after shipping: bump `package.json`, `PROJECT_STATUS.md`, `README.md`, update `CHANGELOG.md`, call `mcp__spark__spark_update_project`, commit and push

---

## Commits in This Session

```
32c4d33  chore: bump version to 1.10.50 — Ship It
79222cd  feat: Dark Mode v2 — systematic implementation with full codebase audit
```

---

*Session export generated March 2, 2026*
