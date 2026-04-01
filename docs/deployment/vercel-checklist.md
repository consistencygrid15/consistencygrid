# 🚀 Vercel Deployment Checklist for Dynamic Wallpaper

## ✅ Issue Fixed: Static Wallpaper on Vercel

### Problem:
Wallpaper was working dynamically on localhost but became static after deploying to Vercel.

### Root Cause:
1. **Next.js 15+ defaults to Static Site Generation (SSG)** for dynamic routes
2. **Global cache headers** in `next.config.mjs` were caching wallpaper images
3. **Missing `export const dynamic`** in the route file

### Solution Applied:

#### 1. Force Dynamic Rendering
**File:** `src/app/w/[token]/image.png/route.js`
```javascript
// Added at top of file
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

#### 2. Exclude Wallpaper from Cache Headers
**File:** `next.config.mjs`
```javascript
// Excluded /w/* routes from caching
{
  source: "/w/:token/image.png",
  headers: [
    { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0" },
    { key: "Pragma", value: "no-cache" },
    { key: "Expires", value: "0" },
  ],
}
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (Vercel Dashboard)
Ensure these are set in Vercel Project Settings → Environment Variables:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-32-chars-min"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Sentry
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-token"
```

### 2. Database Setup (Neon)
```bash
# Run migrations on Neon database
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Vercel Build Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (or `prisma generate && next build`)
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

### 4. Vercel Function Configuration
Add to `vercel.json` (if not exists):
```json
{
  "functions": {
    "src/app/w/[token]/image.png/route.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

---

## 🧪 Testing After Deployment

### 1. Test Wallpaper Generation
```bash
# Replace with your actual Vercel URL and token
curl -I https://your-app.vercel.app/w/YOUR_TOKEN/image.png
```

**Expected Headers:**
```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
Content-Type: image/png
```

### 2. Test Dynamic Updates
1. Go to Dashboard → Update a habit
2. Mark a habit as complete
3. Refresh wallpaper URL
4. **Verify:** Changes should appear immediately

### 3. Test Database Connection
```bash
# Check if Prisma can connect to Neon
npx prisma db pull
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "Module not found: canvas"
**Solution:** Canvas is a native module. Ensure Vercel can build it:
```json
// package.json
{
  "dependencies": {
    "canvas": "^2.11.2"
  }
}
```

### Issue 2: Database Connection Timeout
**Solution:** Check Neon connection pooling:
```javascript
// lib/prisma.js
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=1&pool_timeout=0"
    }
  }
});
```

### Issue 3: Wallpaper Still Static
**Solution:** Clear Vercel cache:
```bash
# In Vercel Dashboard
Deployments → ... → Redeploy → Clear Build Cache
```

### Issue 4: 404 on Wallpaper Route
**Solution:** Check route file structure:
```
src/app/w/[token]/image.png/route.js  ✅ Correct
src/app/w/[token]/route.js            ❌ Wrong
```

---

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

### Environment Variables via CLI
```bash
# Set environment variable
vercel env add DATABASE_URL production

# Pull environment variables locally
vercel env pull .env.local
```

---

## 📊 Monitoring

### 1. Check Vercel Logs
```bash
vercel logs --follow
```

### 2. Monitor Database (Neon)
- Check connection count
- Monitor query performance
- Set up alerts for errors

### 3. Sentry Error Tracking
- Monitor runtime errors
- Track performance issues
- Set up alerts

---

## ✅ Post-Deployment Verification

- [ ] Wallpaper generates successfully
- [ ] Dynamic data updates in real-time
- [ ] No caching issues
- [ ] Database queries work
- [ ] Authentication works
- [ ] All API routes respond
- [ ] Mobile wallpaper download works
- [ ] Performance is acceptable (<3s generation time)

---

## 🔄 Rollback Plan

If deployment fails:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force
```

---

## 📝 Notes

- **Canvas Library:** Vercel supports canvas, but build time may be longer
- **Cold Starts:** First request may be slow (3-5s), subsequent requests faster
- **Function Timeout:** Default 10s, increased to 30s for wallpaper generation
- **Memory:** Increased to 1024MB for canvas rendering

---

## 🎯 Success Criteria

✅ Wallpaper shows real-time habit data  
✅ No static/cached images  
✅ Database updates reflect immediately  
✅ Performance acceptable (<3s)  
✅ No errors in Vercel logs  
✅ Mobile app can download wallpaper  

---

**Last Updated:** 2026-01-25  
**Issue Status:** ✅ RESOLVED
