# Folder Comparison Report

**Date:** February 17, 2026  
**Comparison:** Main Development Folder vs. iCloud Folder

---

## 📍 Folder Locations

1. **Main Development Folder (Local)**
   - Path: `/Users/jeremybotter/Development/rotowrite`
   - This is your primary development location

2. **iCloud Folder (Sync)**
   - Path: `/Users/jeremybotter/Desktop/Development/RotoWrite`
   - This is where we just performed the Forge rename

---

## ✅ Good News: Same Codebase

Both folders have the **SAME git commit history**:
- Latest commit: `b556486` (test: trigger webhook)
- Same 10 most recent commits
- Both are on `main` branch
- Both are up to date with `origin/main`

**Conclusion:** They're both clones of the same repository, not separate development branches.

---

## 🔍 Key Differences

### 1. Package Name
- **Main folder**: `"name": "forge"` ✅ (Already renamed!)
- **iCloud folder**: `"name": "forge"` ✅ (Just renamed by me)

**Status:** BOTH folders already have the Forge rename applied!

### 2. Documentation Files

**Files ONLY in iCloud folder (15 files):**
These are mostly documentation I created or migration-related docs:
- `API_KEYS_REQUEST.md`
- `BETA_LAUNCH_CHECKLIST.md`
- `BETA_LAUNCH_EXECUTIVE_SUMMARY.md`
- `BETA_LAUNCH_ONE_PAGER.md`
- `BETA_LAUNCH_README.md`
- `BETA_LAUNCH_VISUAL_SUMMARY.md`
- `DEPLOYMENT_CHECKLIST.md` ⭐ (Just created)
- `ENV_SETUP_GUIDE.md`
- `FORGE_RENAME_EXTERNAL_CHANGES.md` ⭐ (Just created)
- `MIGRATION_QUICK_REFERENCE.md`
- `NEXT_STEPS_ROADMAP.md`
- `QUICK_START_AFTER_RENAME.md` ⭐ (Just created)
- `RENAME_COMPLETE_SUMMARY.md` ⭐ (Just created)
- `SUPABASE_MIGRATION_COMPLETE.md`
- `WHAT_I_BUILT_FOR_YOU.md`

**Files ONLY in main folder (2 files):**
- `MICROSOFT_SSO_CHECKLIST.md` (old SSO docs)
- `RENAME_TO_FORGE_SUMMARY.md` (older rename doc)

### 3. Directories

**Directories ONLY in iCloud folder:**
- `./smartbriefs/` ⭐ **IMPORTANT** - Contains content scaffold
  - `michigan-sportsbook-promos-scaffold.md` (7,936 bytes)
- `./migration-data/` ⭐ **IMPORTANT** - Database migration backup
  - Contains JSON exports of all database data
  - agent_configs.json, ai_settings.json, briefs.json, etc.
- `./.vercel/` - Vercel deployment config
- `./ReStock Notifier/` - Unrelated project?
- `./commands/` - Unknown content

**Directories ONLY in main folder:**
- `./.spark/` - Spark-related files

### 4. Deleted Files (HTML Mockups)

**In iCloud folder:**
- Old `rotowrite-mockup-*.html` files DELETED
- New `forge-mockup-*.html` files CREATED

**In main folder:**
- Old `rotowrite-mockup-*.html` files still exist (not renamed yet)

---

## 🎯 Recommendation: Consolidation Strategy

### Option 1: Use Main Folder as Primary ✅ (RECOMMENDED)

**Why:** It's in your standard Development folder, not iCloud (better for git performance)

**Steps:**
1. Copy important files FROM iCloud TO main folder:
   - `smartbriefs/` folder (your content work)
   - `migration-data/` folder (database backups)
   - New Forge rename documentation (4 files I just created)
   - Beta launch documentation (if needed)

2. Apply the Forge rename changes to main folder (HTML mockups, etc.)

3. Delete or archive the iCloud folder

### Option 2: Use iCloud Folder as Primary

**Why:** Already has all the Forge rename complete + extra docs

**Steps:**
1. Move iCloud folder to: `/Users/jeremybotter/Development/forge`
2. Delete old main folder
3. Update git remote if needed

---

## 📋 Files to Copy from iCloud to Main

### Critical (Must Copy):
```
smartbriefs/michigan-sportsbook-promos-scaffold.md
migration-data/ (entire folder - database backups)
```

### Helpful Documentation (Recommended):
```
DEPLOYMENT_CHECKLIST.md
FORGE_RENAME_EXTERNAL_CHANGES.md
QUICK_START_AFTER_RENAME.md
RENAME_COMPLETE_SUMMARY.md
BETA_LAUNCH_CHECKLIST.md
BETA_LAUNCH_README.md
ENV_SETUP_GUIDE.md
SUPABASE_MIGRATION_COMPLETE.md
WHAT_I_BUILT_FOR_YOU.md
```

### HTML Mockups (Need to Rename in Main):
The iCloud folder has these renamed to `forge-*`:
```
design/files/forge-mockup-1.html
design/files/forge-mockup-2-projects.html
design/files/forge-mockup-3-smartbriefs.html
design/files/forge-mockup-4-create-smartbrief.html
design/files/forge-mockup-5-writer-factory.html
design/files/forge-mockup-6-odds-extractor.html
design/files/forge-mockup-7-admin.html
design/forge-style-guide.html
forge-style-guide.html
```

---

## ⚠️ Important Notes

1. **Both folders have Forge rename in package.json** - This suggests you may have already started the rename in the main folder before

2. **SmartBriefs folder is ONLY in iCloud** - This is active work that needs to be preserved

3. **Migration-data is ONLY in iCloud** - These are your database backups from the Supabase migration

4. **Git status is identical** - Both have the same uncommitted changes (the Forge rename modifications)

---

## 🚀 Recommended Action Plan

**I recommend Option 1: Consolidate into Main Folder**

Here's what I can do for you:

1. **Copy critical files** from iCloud to main folder:
   - smartbriefs/
   - migration-data/
   - New documentation

2. **Complete the rename** in main folder:
   - Rename HTML mockups
   - Update any remaining references

3. **Verify** both folders are in sync

4. **Archive** the iCloud folder (don't delete yet, just in case)

Would you like me to proceed with this consolidation?

---

## 📊 Summary

| Aspect | Main Folder | iCloud Folder |
|--------|-------------|---------------|
| Git commits | Same (b556486) | Same (b556486) |
| Package name | "forge" ✅ | "forge" ✅ |
| Code files | Same | Same |
| HTML mockups | Old names | Renamed to forge-* |
| SmartBriefs | ❌ Missing | ✅ Present |
| Migration data | ❌ Missing | ✅ Present |
| Docs count | 20 MD files | 33 MD files |
| Location | Better (local) | Slower (iCloud) |

**Verdict:** Main folder is better location, but iCloud has important content (smartbriefs, migration-data) that must be copied over.
