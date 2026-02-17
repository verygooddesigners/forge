# 🚀 Forge Deployment Checklist

**Project Name:** Forge (formerly RotoWrite)  
**Vercel Project:** `gdc-forge`  
**Production URL:** `https://gdcforce.vercel.app`  
**Date:** February 17, 2026

---

## ✅ Completed

- [x] Codebase renamed from RotoWrite to Forge (100+ files)
- [x] Package.json updated to "forge"
- [x] App metadata updated (browser title, etc.)
- [x] All documentation updated
- [x] All components updated
- [x] HTML mockups renamed
- [x] Vercel project renamed to `gdc-forge`
- [x] Production URL set to `gdcforce.vercel.app`

---

## ⏳ Next Steps

### 1. Update Supabase Auth URLs (5 minutes)

**Required because Vercel URL changed:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update the following:

**Site URL:**
```
https://gdcforce.vercel.app
```

**Redirect URLs (add these):**
```
https://gdcforce.vercel.app/**
http://localhost:5309/**
```

5. Remove old RotoWrite URLs if present
6. Click **Save**

---

### 2. Update Environment Variable (if needed)

Check your `.env.local` and Vercel environment variables:

```env
NEXT_PUBLIC_APP_URL=https://gdcforce.vercel.app
```

**In Vercel:**
1. Go to **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Update value to: `https://gdcforce.vercel.app`
4. Save changes

---

### 3. Deploy Code Changes

Push your renamed codebase to trigger deployment:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Rename application from RotoWrite to Forge"

# Push to main branch (triggers Vercel deployment)
git push origin main
```

**Vercel will automatically:**
- Build the new code
- Deploy to `gdcforce.vercel.app`
- Show "Forge - Editorial Command Center" in browser

---

### 4. Test Deployment (10 minutes)

**After deployment completes:**

#### Local Testing First
```bash
npm run dev
```
- Visit `http://localhost:5309`
- Verify browser tab shows "Forge - Editorial Command Center"
- Test login/registration
- Test creating a project
- Test Writer Factory
- Test SmartBrief builder

#### Production Testing
- Visit `https://gdcforce.vercel.app`
- Verify browser tab shows "Forge - Editorial Command Center"
- Test user login/registration
- Test password reset flow
- Test creating projects
- Test content generation
- Verify all features work

#### Check Logs
- **Vercel**: Dashboard → Deployments → View Function Logs
- **Supabase**: Dashboard → Logs → API Logs
- **Browser**: DevTools → Console (check for errors)

---

## 📋 Verification Checklist

### Visual Checks
- [ ] Browser tab title shows "Forge - Editorial Command Center"
- [ ] No "RotoWrite" text visible in UI
- [ ] All pages load correctly
- [ ] No console errors

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Email notifications work (if configured)
- [ ] Session persistence works

### Core Features
- [ ] Dashboard loads
- [ ] Writer Factory works
- [ ] SmartBrief builder works
- [ ] Project creation works
- [ ] Content generation works
- [ ] SEO Assistant works
- [ ] NewsEngine works
- [ ] Export functionality works

### Admin Features (if admin user)
- [ ] Admin dashboard accessible
- [ ] User management works
- [ ] API key management works
- [ ] Agent Tuner works
- [ ] Tools marketplace works

---

## 🔧 Troubleshooting

### Issue: "Authentication failed" or redirect errors
**Solution:** Verify Supabase auth URLs include `gdcforce.vercel.app`

### Issue: Environment variable errors
**Solution:** Check `NEXT_PUBLIC_APP_URL` is set to `https://gdcforce.vercel.app`

### Issue: Build fails on Vercel
**Solution:** Check Vercel deployment logs for specific errors

### Issue: Database connection fails
**Solution:** Verify Supabase credentials in environment variables haven't changed

### Issue: Still seeing "RotoWrite" somewhere
**Solution:** Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R) to clear cache

---

## 📞 Support Resources

**Documentation:**
- `QUICK_START_AFTER_RENAME.md` - Quick reference guide
- `FORGE_RENAME_EXTERNAL_CHANGES.md` - Complete external changes guide
- `RENAME_COMPLETE_SUMMARY.md` - Full list of changes made

**External Dashboards:**
- [Vercel Dashboard](https://vercel.com/dashboard) - Deployment and logs
- [Supabase Dashboard](https://supabase.com/dashboard) - Database and auth
- [GitHub Repository](https://github.com) - Code repository

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Production URL (`gdcforce.vercel.app`) loads without errors
- ✅ Browser title shows "Forge - Editorial Command Center"
- ✅ User authentication works (login/register/reset)
- ✅ All core features functional
- ✅ No console errors
- ✅ Database connectivity confirmed
- ✅ No "RotoWrite" branding visible

---

## 📊 Deployment Timeline

**Estimated Total Time:** 20-30 minutes

1. Update Supabase auth URLs: ~5 minutes
2. Update environment variables: ~2 minutes
3. Push code and wait for deployment: ~5 minutes
4. Test local: ~5 minutes
5. Test production: ~10 minutes
6. Verify all features: ~5 minutes

---

## 🎉 Post-Deployment

After successful deployment:

1. **Notify Team:**
   - Send email/Slack message about rebrand
   - Share new URL: `https://gdcforce.vercel.app`
   - Update team bookmarks

2. **Update Documentation:**
   - Update any external wikis
   - Update training materials
   - Update presentation decks

3. **Monitor:**
   - Watch Vercel logs for errors
   - Check Supabase logs for issues
   - Monitor user feedback

4. **Optional Cleanup:**
   - Rename GitHub repository (if desired)
   - Rename local folder (if desired)
   - Archive old documentation

---

**Last Updated:** February 17, 2026  
**Status:** Ready for deployment  
**Next Action:** Update Supabase auth URLs → Push code → Test
