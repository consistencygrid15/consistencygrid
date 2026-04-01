# 🔧 RAZORPAY SETUP COMPLETE CHECKLIST

## ✅ Current Status

### Already Implemented in Code:

✅ **Payment Provider**
- `src/lib/payment/providers/razorpay-provider.js` - Complete implementation
- Order creation: `createOrder()`
- Payment verification: `verifyPayment()`
- Webhook verification: `verifyWebhook()`
- Signature validation with crypto/sha256

✅ **API Endpoints**
- `POST /api/payment/create-order` - Creates Razorpay order (rate limited)
- `POST /api/payment/webhook` - Handles Razorpay webhooks
- Signature verification in webhook handler
- Database transaction logging

✅ **Security**
- Rate limiting (10 orders/min per user)
- HMAC-SHA256 signature verification
- Timing-safe comparison (prevent timing attacks)
- Server-side payment verification

---

## ⚠️ What's Missing (You Need to Do):

### 1️⃣ Razorpay Account Setup

```
[ ] Go to https://razorpay.com
[ ] Sign up for account (or use existing)
[ ] Verify email
[ ] Complete KYC (Know Your Customer)
    - ID proof
    - Address proof
    - Business details
[ ] Get account activated
```

### 2️⃣ Get Razorpay Credentials

```
[ ] Go to Dashboard → Settings → API Keys
[ ] Copy: Key ID (public)
[ ] Copy: Key Secret (private/sensitive)
[ ] Copy: Webhook Secret (for webhook verification)
```

### 3️⃣ Add to .env.local File

```bash
# File: d:\startup\consistencygrid\.env.local

RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXX
```

### 4️⃣ Configure Webhook in Razorpay Dashboard

```
Steps:
[ ] Go to Dashboard → Settings → Webhooks
[ ] Click "Add New Webhook"
[ ] URL: https://yourwebsite.com/api/payment/webhook
    (Replace yourwebsite.com with your actual domain)
[ ] Select Events:
    - payment.authorized
    - payment.failed
    - payment.captured
[ ] Secret: Copy from RAZORPAY_WEBHOOK_SECRET
[ ] Click Save
```

### 5️⃣ Test Webhook Configuration

```bash
# After adding webhook, Razorpay will send a test event
# Check server logs for:
[Webhook] Received: payment.authorized

# If you see this, webhook is working! ✅
```

---

## 📊 What Each Component Does

### Create Order Flow

```
User clicks "Pay" on website
  ↓
Frontend sends to: POST /api/payment/create-order
  ↓
Backend (razorpay-provider.js):
  - Creates order via Razorpay API
  - Returns: orderId, amount, currency
  ↓
Frontend gets orderId
  ↓
Opens Razorpay payment modal with orderId
  ↓
User enters card details
  ↓
Razorpay processes payment
```

### Webhook Flow

```
Payment succeeds on Razorpay
  ↓
Razorpay sends webhook to: /api/payment/webhook
  ↓
Server (webhook handler):
  - Gets signature from request header
  - Verifies signature with RAZORPAY_WEBHOOK_SECRET
  - If valid: Updates database, marks subscription as active
  - If invalid: Logs security error, returns 400
  ↓
Server returns 200 to Razorpay
  ↓
Razorpay marks webhook as delivered
```

---

## 🔑 Environment Variables Needed

### Current Status:

```
File: d:\startup\consistencygrid\.env.local

CURRENTLY HAS:
✅ NEXTAUTH_URL
✅ NEXTAUTH_SECRET
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ RESEND_API_KEY
✅ DATABASE_URL

MISSING:
❌ RAZORPAY_KEY_ID
❌ RAZORPAY_KEY_SECRET
❌ RAZORPAY_WEBHOOK_SECRET
```

### Add These Lines:

```bash
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXX

# Payment Settings
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
PAYMENT_ENVIRONMENT=production
```

---

## 🧪 Testing Without Real Razorpay Account

### Option 1: Use Test Keys

```
Razorpay provides TEST keys for development:
[ ] In Razorpay Dashboard, toggle to "Test Mode"
[ ] Copy Test Key ID and Test Key Secret
[ ] Add to .env.local
[ ] Test payment with test card:
    Card: 4111 1111 1111 1111
    CVV: Any 3 digits
    Date: Any future date
```

### Option 2: Mock Payment (For Development)

```javascript
// File: src/lib/payment/providers/razorpay-provider.js

// You can temporarily add for testing:
async createOrder({ amount, currency = 'INR', metadata = {} }) {
    // TEMP FOR TESTING ONLY
    if (process.env.NODE_ENV === 'development') {
        return {
            orderId: 'order_test_' + Date.now(),
            amount: amount,
            currency: currency,
            status: 'created',
        };
    }
    
    // Real Razorpay code...
}
```

---

## ✨ Workflow After Setup

### Step 1: Local Testing
```bash
1. Add test keys to .env.local
2. npm run dev
3. Visit /pricing
4. Try payment with test card
5. Check webhook logs
```

### Step 2: Staging Testing
```bash
1. Deploy to staging server
2. Configure webhook URL: https://staging.yourdomain.com/api/payment/webhook
3. Test with test keys
4. Verify database updates after payment
```

### Step 3: Production Deployment
```bash
1. Get live Razorpay keys
2. Add to production .env (via hosting platform)
3. Deploy to production
4. Configure webhook URL: https://yourdomain.com/api/payment/webhook
5. Do one test payment with real card
6. Monitor webhook logs
```

---

## 🔐 Security Checklist for Razorpay

### Credentials Management

✅ **Key Secret**
- Should NEVER be in frontend code
- NEVER pushed to GitHub
- Should be in .env files only
- Rotate every 6 months

✅ **Webhook Secret**
- Used to verify webhook signature
- Also sensitive - keep in .env
- Different from Key Secret

✅ **Key ID**
- Can be public (some call it "publishable key")
- Often sent to frontend for payment modal
- Less sensitive than secret

### Protection Measures in Code

✅ **Signature Verification**
```javascript
// In razorpay-provider.js
const expectedSignature = crypto
    .createHmac('sha256', this.keySecret)  // Uses secret key
    .update(body)
    .digest('hex');

// Timing-safe comparison
crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(razorpay_signature, 'hex')
);
```

✅ **Rate Limiting**
```javascript
// In create-order/route.js
if (isRateLimited(`order:${session.user.email}`, 10, 60000)) {
    return NextResponse.json(
        { error: 'Too many order requests' },
        { status: 429 }
    );
}
```

---

## 📋 Complete Checklist

### Before Going Live

#### Razorpay Account
- [ ] Created Razorpay account
- [ ] Completed KYC verification
- [ ] Account activated (can create live orders)
- [ ] Have both Test and Live keys

#### Environment Setup
- [ ] Added RAZORPAY_KEY_ID to .env.local
- [ ] Added RAZORPAY_KEY_SECRET to .env.local
- [ ] Added RAZORPAY_WEBHOOK_SECRET to .env.local
- [ ] Verified keys are correct format (rzp_test_* or rzp_live_*)

#### Webhook Configuration
- [ ] Added webhook in Razorpay Dashboard
- [ ] Webhook URL is correct: https://yourdomain.com/api/payment/webhook
- [ ] Selected events: payment.authorized, payment.captured, payment.failed
- [ ] Webhook secret matches RAZORPAY_WEBHOOK_SECRET in .env

#### Code Verification
- [ ] razorpay-provider.js loads successfully
- [ ] create-order endpoint responds with orderId
- [ ] webhook endpoint responds with { received: true }
- [ ] Database transaction logs payment events

#### Testing
- [ ] Test payment creates order in database
- [ ] Test payment triggers webhook
- [ ] Webhook updates subscription status to 'active'
- [ ] User sees "Premium Unlocked" after payment
- [ ] Deep link redirect works (app receives token)

#### Deployment
- [ ] Switch to Live keys in production
- [ ] Update webhook URL in Razorpay Dashboard (production domain)
- [ ] Test one real payment with real card
- [ ] Monitor logs for 24 hours
- [ ] Have backup support email ready

---

## 🆘 Troubleshooting Razorpay Issues

### "Razorpay credentials not configured" Error

```
Problem: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET
Solution:
1. Check .env.local has both variables
2. Restart dev server (npm run dev)
3. Verify no typos in env variable names
```

### "Failed to create Razorpay order" Error

```
Problem: API call to Razorpay failed
Solution:
1. Check internet connection
2. Verify Key ID and Key Secret are correct
3. Check Razorpay account is activated
4. If test keys: Make sure account is in Test Mode
5. If live keys: Make sure account passed KYC
```

### Webhook Not Receiving Events

```
Problem: Webhook URL never gets called after payment
Solution:
1. Verify webhook URL in Razorpay Dashboard:
   - Should be: https://yourdomain.com/api/payment/webhook
   - Should be HTTPS (not HTTP)
   - Should be publicly accessible
2. Check webhook secret is correct
3. Check Razorpay Dashboard → Webhooks → View Logs
4. Manually trigger test webhook from dashboard
5. Check server logs for [Webhook] messages
```

### Signature Verification Failed

```
Problem: Webhook signature doesn't match
Solution:
1. Check RAZORPAY_WEBHOOK_SECRET in .env is correct
2. Check signature comparison logic in code:
   - Should use crypto.timingSafeEqual()
   - Should use SHA256
3. Check webhook payload is not modified
4. Check server logs for exact signature mismatch
```

### Payment Verification Failed

```
Problem: User pays but server says "invalid signature"
Solution:
1. Check RAZORPAY_KEY_SECRET is correct
2. Check payment verification logic uses same secret
3. Make sure razorpay_order_id, razorpay_payment_id,
   razorpay_signature are all present
4. Check order exists in Razorpay (not fake data)
```

---

## 📞 Quick Reference

### Razorpay Dashboard Links

```
Main: https://dashboard.razorpay.com
API Keys: Settings → API Keys
Webhooks: Settings → Webhooks
Test Mode: Toggle in top-right
Payments: Transactions → Payments
```

### Important Razorpay Concepts

```
Order ID: rzp_test_XXXXXXX (created by your API)
Payment ID: pay_XXXXXXX (generated after user pays)
Signature: HMAC-SHA256 of order_id|payment_id
Test Card: 4111 1111 1111 1111 (always works in test mode)
```

### API Endpoints Used

```
POST /api/payment/create-order
  Input: { planId, userId }
  Output: { orderId, amount, currency }
  Rate Limited: 10 req/min per user

POST /api/payment/webhook
  Input: Webhook event from Razorpay
  Header: x-razorpay-signature
  Output: { received: true }
  Public: No auth required
```

---

## ✅ Summary

### Already Done:
✅ Code for Razorpay integration
✅ Order creation API
✅ Webhook handling
✅ Signature verification
✅ Database transaction logging
✅ Rate limiting

### You Need to Do:
1. Create Razorpay account
2. Complete KYC
3. Get API keys
4. Add to .env.local
5. Configure webhook in dashboard
6. Test webhook
7. Deploy

### Files to Update:
```
d:\startup\consistencygrid\.env.local
  + RAZORPAY_KEY_ID
  + RAZORPAY_KEY_SECRET
  + RAZORPAY_WEBHOOK_SECRET
```

---

**That's it! Once Razorpay is configured, everything else is automatic!** ✅
