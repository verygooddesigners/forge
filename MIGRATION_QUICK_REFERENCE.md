# Supabase Migration Quick Reference

## ✅ Migration Status: COMPLETE

**Date:** February 13, 2026  
**Status:** All data successfully migrated and verified

---

## 🔑 New Credentials

### Company Supabase Project
- **Project ID:** `hjnmeaklpgcjwzafakwt`
- **URL:** `https://hjnmeaklpgcjwzafakwt.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/hjnmeaklpgcjwzafakwt

### Environment Variables (Already Updated in `.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hjnmeaklpgcjwzafakwt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 What Was Migrated

| Item | Count |
|------|-------|
| Users | 8 |
| Writer Models | 8 |
| Training Content | 16 |
| Projects | 18 |
| Briefs | 6 |
| Categories | 18 |
| AI Settings | 6 |
| Agent Configs | 8 |
| Trusted Sources | 17 |

**Total:** 113 records + full database schema

---

## ✅ Next Steps

### 1. Test Locally (In Progress)
```bash
npm run dev
# Visit: http://localhost:5309
```

### 2. Test Checklist
- [ ] Login with admin account
- [ ] Verify dashboard loads
- [ ] Check writer models
- [ ] Open and edit a project
- [ ] Test content generation
- [ ] Verify AI settings

### 3. Update Production (If Deployed)

**Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select your Forge project
3. Settings → Environment Variables
4. Update these 3 variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Redeploy

### 4. Cleanup (After 30 Days)
```bash
./scripts/cleanup-migration.sh
```

---

## 🔧 Useful Commands

### Verify Migration
```bash
node scripts/verify-migration.js
```

### Re-import Data (If Needed)
```bash
node scripts/import-data-fixed.js
node scripts/import-remaining-data.js
```

### Check Dev Server
```bash
lsof -ti:5309  # Check if running
```

---

## 📁 Important Files

- `SUPABASE_MIGRATION_COMPLETE.md` - Full migration documentation
- `migration-data/` - Backup of all exported data (keep for 30 days)
- `.env.local` - Updated with new credentials
- `scripts/verify-migration.js` - Verification script

---

## 🆘 Troubleshooting

### Can't Login?
1. Check Supabase dashboard: https://supabase.com/dashboard/project/hjnmeaklpgcjwzafakwt/auth/users
2. Verify user exists
3. Reset password if needed

### Data Missing?
```bash
node scripts/verify-migration.js
```

### Application Won't Start?
1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Check terminal for errors

---

## 📞 Support Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/hjnmeaklpgcjwzafakwt
- **Migration Docs:** `SUPABASE_MIGRATION_COMPLETE.md`
- **Deployment Guide:** `DEPLOYMENT.md`

---

## 🗑️ Old Supabase Account

**Old Project ID:** `ybrhwafnetvcgrrmxgvy`

**Recommendation:** Keep active for 30 days as backup, then delete.

**To Delete:**
1. Go to: https://supabase.com/dashboard/project/ybrhwafnetvcgrrmxgvy/settings/general
2. Scroll to "Danger Zone"
3. Click "Delete Project"

---

**Migration completed successfully! 🎉**
