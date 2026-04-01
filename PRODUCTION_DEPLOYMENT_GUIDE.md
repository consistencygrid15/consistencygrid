# 🚀 PRODUCTION DEPLOYMENT GUIDE - ConsistencyGrid

**Last Updated:** March 1, 2026  
**Status:** ✅ Ready for Launch  
**Estimated Deployment Time:** 30-45 minutes

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup (5 minutes)

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all required secrets:
  - `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
  - `DATABASE_URL` - PostgreSQL production connection string
  - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_SENTRY_DSN`

**⚠️ SECURITY**: Never commit `.env.production` to git. Add to `.gitignore`:
```bash
.env.production
.env.local
.env.*.local
```

### 2. Database Preparation (10 minutes)

Run migrations on production database:
```bash
# Test connection first
npm run prisma:test

# Apply migrations
npm run prisma:migrate:prod

# Verify database
npm run prisma:validate
```

**Critical Indexes to Verify:**
```sql
-- Check if indexes exist
SELECT * FROM pg_indexes 
WHERE tablename = 'User' OR tablename = 'PaymentTransaction';

-- If missing, apply them (see database-indexes.sql)
```

### 3. API Keys & Secrets (5 minutes)

#### Razorpay Setup
1. Go to https://dashboard.razorpay.com/app/settings/api-keys
2. Copy **Key ID** (Live mode)
3. Copy **Key Secret** (Live mode)
4. Add to environment variables
5. Configure webhook:
   - URL: `https://consistencygrid.netlify.app/api/payment/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Store webhook secret in `RAZORPAY_WEBHOOK_SECRET`

#### Sentry Setup
1. Go to https://sentry.io/ and create project
2. Copy DSN
3. Add to `.env.production`

#### Email Setup (Resend)
1. Go to https://resend.com/api-keys
2. Generate API key
3. Add to `RESEND_API_KEY`
4. Set sender email: `RESEND_FROM_EMAIL`

### 4. Security Verification (10 minutes)

- [ ] SSL/TLS enabled on domain
- [ ] Security headers configured (in `next.config.mjs`)
- [ ] Rate limiting enabled (in `src/lib/rate-limit.js`)
- [ ] CSRF protection enabled (in `middleware.js`)
- [ ] Input validation active (in `src/lib/validation.js`)
- [ ] API signature verification working

**Test security headers:**
```bash
curl -I https://consistencygrid.netlify.app
# Should see: X-Frame-Options, X-Content-Type-Options, etc.
```

### 5. Monitoring Setup (5 minutes)

- [ ] Sentry configured for error tracking
- [ ] Health check working: `curl https://consistencygrid.netlify.app/api/health`
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Alert rules configured

---

## 🚀 Deployment Steps

### Option A: Deploy to Netlify (Recommended)

```bash
# 1. Connect repository to Netlify
# Go to https://app.netlify.com and link GitHub repo

# 2. Set production environment variables in Netlify dashboard:
# Settings → Build & Deploy → Environment → Add environment variables

# 3. Configure build settings:
# Build command: npx prisma generate && npm run build
# Publish directory: .next

# 4. Enable auto-deploy on main branch

# 5. Trigger deployment:
npm run build
git push origin main
```

### Option B: Deploy to Vercel (Alternative)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Connect repository
vercel link

# 3. Set environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
# ... add all vars from .env.production

# 4. Deploy
vercel --prod
```

### Option C: Deploy to AWS/DigitalOcean (Advanced)

See `docs/deployment/deployment-guide.md` for detailed instructions.

---

## ✅ Post-Deployment Verification

### 1. Basic Health Checks (2 minutes)

```bash
# Health check
curl https://consistencygrid.netlify.app/api/health

# Should return: { status: 'ok', timestamp: ... }
```

### 2. Authentication Flow (3 minutes)

- [ ] Sign up page loads: `/signup`
- [ ] Login works correctly
- [ ] Password reset flow works
- [ ] Email verification works

### 3. Payment Flow (5 minutes)

```bash
# 1. Navigate to pricing: https://consistencygrid.netlify.app/pricing
# 2. Click "Get Premium"
# 3. Use test card: 4111 1111 1111 1111
# 4. Expiry: Any future date (12/25)
# 5. CVV: Any 3 digits
# 6. Check Razorpay dashboard for successful transaction
```

### 4. Webhook Verification (2 minutes)

```bash
# Check Razorpay webhook delivery
# https://dashboard.razorpay.com/app/webhooks

# You should see:
# - payment.captured: Success (HTTP 200)
# - Error responses: <1%
```

### 5. Database Connectivity (1 minute)

```bash
# Check if database queries work
curl -X GET https://consistencygrid.netlify.app/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return user data
```

### 6. Error Tracking (2 minutes)

```bash
# Trigger test error
curl -X POST https://consistencygrid.netlify.app/api/test-error

# Check Sentry dashboard for error capture
# https://sentry.io/organizations/your-org/issues/
```

---

## 🔒 Security Hardening Checklist

After deployment, verify these are in place:

- [ ] HTTPS enforced (all traffic redirected to HTTPS)
- [ ] Security headers present:
  - `X-Frame-Options: DENY` (prevent clickjacking)
  - `X-Content-Type-Options: nosniff` (prevent MIME sniffing)
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (prevent XSS)

- [ ] Rate limiting active:
  - Payment endpoints: 10 requests/min per user
  - General API: 100 requests/min per user

- [ ] Input validation working (test with malformed input)
- [ ] CSRF protection enabled
- [ ] API keys rotated (never reuse dev keys in production)

**Test CSRF protection:**
```bash
# Try POST without proper headers
curl -X POST https://consistencygrid.netlify.app/api/payment/create-order \
  -H "Content-Type: application/json"

# Should get: 403 Forbidden or 400 Bad Request
```

---

## 📊 Performance Optimization (Optional)

For better performance, consider:

1. **Enable CDN** (Cloudflare, AWS CloudFront)
   - Cache static assets aggressively
   - Compress responses
   - Use regional edge locations

2. **Database Optimization**
   ```sql
   -- Enable query logging
   ALTER SYSTEM SET log_statement = 'all';
   SELECT pg_reload_conf();
   
   -- Vacuum and analyze
   VACUUM ANALYZE;
   ```

3. **Enable HTTP/2 Push** for critical resources

4. **Minify and bundle** JavaScript/CSS (already done by Next.js)

5. **Image optimization** (already configured in `next.config.mjs`)

---

## 🚨 Incident Response

### If Payment Processing Fails

1. Check Razorpay webhook delivery: Dashboard → Webhooks
2. Verify `RAZORPAY_WEBHOOK_SECRET` is correct
3. Check API logs in Sentry for errors
4. Test with test card again

### If Database Queries Slow Down

1. Check indexes are applied: `\di` in psql
2. Check query logs: `log_statement = 'all'`
3. Run `VACUUM ANALYZE`
4. Monitor connections: `SELECT count(*) FROM pg_stat_activity`

### If Error Rate Spikes

1. Check Sentry dashboard for error patterns
2. Review recent deployments
3. Check API rate limiting isn't being hit
4. Check database connectivity

---

## 📞 Support & Documentation

- **Architecture**: See `docs/APP_ARCHITECTURE.md`
- **API Reference**: See `docs/API.md`
- **Incident Playbook**: See `docs/INCIDENT_RESPONSE_PLAYBOOK.md`
- **Security**: See `docs/SECURITY_HARDENING.md`

---

## ✅ Sign-Off

- **Deployed By**: ___________________
- **Deployment Date**: ___________________
- **Environment**: Production
- **Status**: ✅ Ready / ⚠️ Issues

**Notes:**
```
____________________________________________________________________

____________________________________________________________________

____________________________________________________________________
```
