# RotoWrite → Forge Rename Summary

The app has been renamed from **RotoWrite** to **Forge** across the codebase. Here’s what changed and what you may need to update manually.

## What Was Changed (Automatically)

- **package.json** – Package name updated to `forge`
- **App metadata** – Title set to "Forge - Editorial Command Center"
- **UI text** – All user-facing references updated (sidebar, modals, guides, etc.)
- **Agent prompts** – All 8 AI agent prompts reference Forge
- **Documentation** – Docs, README, presentation materials, and guides updated
- **Design files** – HTML mockups and style guide text updated
- **Supabase migrations** – Agent config comments and tools system comments updated

## What You Need to Change Manually

### 1. Deployment & URLs

| Item | Old Value | New Value |
|------|-----------|-----------|
| **Vercel project** | Create new project or rename existing | `forge` / `forge.vercel.app` |
| **Production URL** | `https://rotowrite.vercel.app` | `https://forge.vercel.app` (or your custom domain) |
| **Environment variable** | `NEXT_PUBLIC_APP_URL=https://rotowrite.vercel.app` | `NEXT_PUBLIC_APP_URL=https://forge.vercel.app` |

Update `NEXT_PUBLIC_APP_URL` in your Vercel project settings for the new deployment URL.

### 2. GitHub Repository (Optional)

If you’re renaming the repo:

- Old: `https://github.com/verygooddesigners/rotowrite`
- New: `https://github.com/verygooddesigners/forge` (or your preferred org/name)

Update `DEPLOYMENT.md` if you use a different repo URL.

### 3. External Services

- **Claude API** – If you have keys named `rotowrite-production` or `rotowrite-multi-agent`, consider creating/renaming them to `forge-production` / `forge-multi-agent` for clarity. The app does not rely on these exact names; the important part is that the keys work.

- **Microsoft SSO (Azure AD)** – If used:
  - Rename app registration from `RotoWrite SSO` to `Forge SSO`
  - Update description from `RotoWrite Supabase Integration` to `Forge Supabase Integration`

- **Supabase** – No Supabase project changes required. Agent configs stored in the database were not modified; only migration comments were updated. If you rely on those comments, they now reference Forge.

### 4. Design File Names (Optional)

The following files still use the `rotowrite` prefix. You can rename them for consistency:

- `design/rotowrite-style-guide.html` → `design/forge-style-guide.html`
- `design/files/rotowrite-mockup-1.html` through `rotowrite-mockup-7-admin.html` → `forge-mockup-*`
- `docs/rotowrite-content-engine.md` → `docs/forge-content-engine.md`

If you rename these, update any links or references in the design docs.

### 5. User-Facing Domain (rotowrite.com)

The User-Agent in `app/api/briefs/analyze-urls/route.ts` uses `https://forge.com`. Update this to your real domain if different.

---

**Quick checklist:**

- [ ] Set `NEXT_PUBLIC_APP_URL` to the new Forge deployment URL
- [ ] Update Vercel project/deployment if needed
- [ ] Update Microsoft SSO app names (if used)
- [ ] Optionally rename design/content files
- [ ] Optionally rename GitHub repo
