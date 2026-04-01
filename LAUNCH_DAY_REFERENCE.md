# 🚀 LAUNCH DAY QUICK REFERENCE

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Status:** ⏳ Preparing / 🚀 Deployed / ✅ Complete

---

## ⚡ 30-MINUTE LAUNCH CHECKLIST

### 🟢 5 MINUTES - Pre-Flight

```powershell
# Run verification
.\pre-launch-verify.bat

# Expected output: ALL CHECKS PASSED
```

- [ ] Windows script passes all checks
- [ ] Node.js and npm available
- [ ] node_modules exist
- [ ] All critical files present

### 🟢 5 MINUTES - Environment Check

```powershell
# Verify environment variables
echo %NEXTAUTH_SECRET%
echo %DATABASE_URL%
echo %RAZORPAY_KEY_ID%

# Should output values (not empty)
```

- [ ] `NEXTAUTH_SECRET` set
- [ ] `DATABASE_URL` set
- [ ] `RAZORPAY_KEY_ID` set
- [ ] All payment keys configured

### 🟢 5 MINUTES - Build & Deploy

```powershell
# Build
npm run build

# Deploy to Netlify
git push origin main

# OR deploy to Vercel
vercel --prod
```

- [ ] Build successful (no errors)
- [ ] Deployment triggered
- [ ] Monitor deployment progress

### 🟢 10 MINUTES - Post-Launch Verification

```bash
# Health check
curl https://consistencygrid.netlify.app/api/health

# Expected: { "status": "ok", "timestamp": "..." }
```

- [ ] Website loads
- [ ] Health check returns 200 OK
- [ ] No 502/503 errors
- [ ] Database connectivity works

### 🟢 5 MINUTES - Payment Verification

1. Visit: `https://consistencygrid.netlify.app/pricing`
2. Click "Get Premium"
3. Test card: `4111 1111 1111 1111`
4. Expiry: `12/25` (any future date)
5. CVV: `123` (any 3 digits)
6. Check: Razorpay dashboard for successful payment

- [ ] Payment form loads
- [ ] Payment processes successfully
- [ ] Webhook received (Razorpay dashboard)
- [ ] User subscription updated
- [ ] Receipt email sent

---

## 🔗 CRITICAL LINKS

| Resource | Link |
|----------|------|
| Website | https://consistencygrid.netlify.app |
| Health Check | https://consistencygrid.netlify.app/api/health |
| Pricing | https://consistencygrid.netlify.app/pricing |
| Netlify Dashboard | https://app.netlify.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Razorpay Dashboard | https://dashboard.razorpay.com |
| Sentry Errors | https://sentry.io |
| Database | `psql $DATABASE_URL` |

---

## 🆘 EMERGENCY PROCEDURES

### ❌ If Payment Not Working

```bash
# 1. Check webhook configuration
# Razorpay Dashboard → Settings → Webhooks
# URL should be: https://consistencygrid.netlify.app/api/payment/webhook

# 2. Verify keys
echo %RAZORPAY_KEY_ID%
echo %RAZORPAY_KEY_SECRET%

# 3. Check logs
# Sentry Dashboard → Issues

# 4. Test manually
curl -X POST https://consistencygrid.netlify.app/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"razorpay_payment_id":"...","razorpay_order_id":"...","razorpay_signature":"..."}'
```

### ❌ If Website Not Loading

```bash
# 1. Check deployment status
# Netlify: https://app.netlify.com/sites/consistencygrid/deploys

# 2. Check build logs
# Look for errors in deployment logs

# 3. Rebuild
git push origin main  # Trigger new build

# 4. Check DNS
nslookup consistencygrid.netlify.app
```

### ❌ If Database Connection Fails

```bash
# 1. Verify connection string
echo %DATABASE_URL%

# 2. Test connection
psql %DATABASE_URL% -c "SELECT 1"

# 3. Check credentials
# Verify user/password are correct

# 4. Check firewall
# Ensure your IP can access database server
```

### ❌ If SSL Certificate Issue

```bash
# 1. Check certificate expiry
curl -I https://consistencygrid.netlify.app

# 2. Force renewal
# Netlify auto-renews (usually fine)

# 3. If using custom domain, check DNS
# May need to point to Netlify nameservers
```

---

## 📊 MONITORING DASHBOARD

After deployment, monitor these metrics:

```
Homepage Load Time:    [____] ms (target: < 2000 ms)
API Response Time:     [____] ms (target: < 500 ms)
Error Rate:            [___]% (target: < 1%)
Uptime:                [___]% (target: > 99.9%)
Payment Success Rate:  [___]% (target: > 99%)
Database Connections:  [__]/100 (target: < 50)
Memory Usage:          [___] MB (target: < 500 MB)
CPU Usage:             [__]% (target: < 50%)
```

**Update every 5 minutes for first hour:**

| Time | Status | Issues |
|------|--------|--------|
| 12:00 | ✅ OK | - |
| 12:05 | ✅ OK | - |
| 12:10 | ✅ OK | - |
| ... | ... | ... |

---

## 💬 COMMUNICATION

### To Share with Team
```
🚀 LAUNCH SUCCESSFUL

Website: https://consistencygrid.netlify.app
Status: ✅ Live and operational
Payments: ✅ Processing normally
Database: ✅ Connected

All systems operating normally.
```

### If Issues Arise
```
⚠️ DEPLOYMENT ISSUE DETECTED

Issue: [Describe problem]
Severity: 🔴 Critical / 🟡 Medium / 🟢 Minor
Status: [Investigating / Resolving / Resolved]
ETA: [Time to fix]

Contact: [Your name] [Phone]
```

---

## 📝 DEPLOYMENT LOG

**Start Time:** _________________

**Environment Variables:** ✅ / ❌  
**Build Status:** ✅ / ❌  
**Deployment Status:** ✅ / ❌  
**Website Accessible:** ✅ / ❌  
**Database Connected:** ✅ / ❌  
**Payments Working:** ✅ / ❌  
**Webhooks Receiving:** ✅ / ❌  

**Completion Time:** _________________

**Total Deployment Time:** _______ minutes

**Notes:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

**Signed By:** _________________ **Date:** _______

---

## 🎉 LAUNCH COMPLETE!

**Expected:** 30 minutes  
**Actual:** _______ minutes  
**Status:** ✅ SUCCESS / ❌ ISSUES

**Next Steps:**
- [ ] Monitor for 24 hours
- [ ] Check error logs in Sentry
- [ ] Verify payment transactions
- [ ] Get user feedback
- [ ] Document any issues
- [ ] Plan post-launch review

---

**🚀 Welcome to production! Good luck! 🎊**
