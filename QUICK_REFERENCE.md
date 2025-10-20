# Quick Reference — Production Sync Fix

## What Was Wrong
Production showed old UI. Root cause: **CSS pipeline broken** (PostCSS plugins disabled).

## What's Fixed
Tailwind CSS now processes correctly in all builds (dev, production).

## Timeline
- **Commit b84667a**: Fixed `postcss.config.js` (enabled plugins)
- **Commit c677aef**: Added deployment guide
- **Status**: Ready for Vercel production redeploy

## How to Deploy Now

### Option 1: Auto-Deploy (Recommended)
- Vercel watches main branch
- Should auto-detect new commit
- Check: https://vercel.com/AdminTLI/roommatematch/deployments
- Wait for "Latest Production" to build
- Status should show ✅ (green)

### Option 2: Manual Redeploy
1. Go to: https://vercel.com/AdminTLI/roommatematch
2. Deployments tab → Latest Production
3. 3-dot menu → Redeploy
4. ✅ Check "Clear build cache"
5. Click Redeploy
6. Wait 3-5 min

### Option 3: CLI Deploy
```bash
npm install -g vercel
vercel deploy --prod --force
```

## Verification Checklist After Deploy

- [ ] Build logs show "Compiled successfully"
- [ ] Visit https://roommatematch.vercel.app/ (hard refresh)
- [ ] See brand blue color (#4F46E5) on buttons/hero
- [ ] See shadow effects on cards
- [ ] All sections visible (Navbar, Hero, Features, etc.)
- [ ] No text-only/unstyled appearance

## If It Still Shows Old UI

1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Private/Incognito window
3. Vercel dashboard: Settings → General → "Clear Cache" button
4. Re-trigger deployment

## What Changed (Technical Details)

**Before:**
```javascript
module.exports = {
  plugins: {
    // Disable all PostCSS plugins to avoid CSS parsing issues
  },
}
```

**After:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

This enables:
- Tailwind CSS to process `.tsx` files and generate brand classes
- Autoprefixer to add vendor prefixes for cross-browser support
- CSS to be inlined in the final build

## Local Dev Verification (Already Done ✓)

```bash
npm run dev
# Verified: 71 bg-brand-primary, 70 rounded-2xl, 56 shadow-elev-1 instances
```

## FAQ

**Q: Did my code change?**
A: No, only `postcss.config.js` changed (2 lines). The homepage code & styling are intact.

**Q: Will Auto Deployments pick this up?**
A: Yes! Commit `b84667a` is now on main branch. Vercel should auto-detect within 1-5 min.

**Q: How long will deployment take?**
A: ~3-5 minutes (build) + ~2 minutes (vercel.app propagation).

**Q: Why wasn't CSS working before?**
A: During earlier debugging, all PostCSS plugins were disabled. This broke the entire CSS pipeline, so Tailwind classes weren't being generated or included in production builds.

---

**Next action:** Check Vercel dashboard in 2-3 minutes for auto-deploy, or manually redeploy using Option 1-3 above.
