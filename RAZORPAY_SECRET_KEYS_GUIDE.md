# 🔐 WHERE RAZORPAY SECRET KEYS ARE STORED & USED

## 📍 Location Reference Guide

### 1. ENVIRONMENT FILES (.env files)

#### Development File
📄 **File**: `.env.local`  
📍 **Path**: `d:\startup\consistencygrid\.env.local`

```dotenv
# Current configuration (March 2, 2026)
RAZORPAY_KEY_ID=rzp_test_SAtb4x3b4mc7Ke           ← PUBLIC (safe to commit concept)
RAZORPAY_KEY_SECRET=SEElXVjpX50fEskzp5laEIng     ← SECRET (never commit!)
RAZORPAY_WEBHOOK_SECRET=XXXXXXX                   ← SECRET (needs update)
```

**Status**: ✅ Partially configured  
**To Do**: Update `RAZORPAY_WEBHOOK_SECRET` with actual value

---

#### Production Template
📄 **File**: `.env.production.example`  
📍 **Path**: `d:\startup\consistencygrid\.env.production.example`

```dotenv
# Lines 29-34
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Status**: 📋 Template only (copy to `.env.production` for production)

---

### 2. WHERE KEYS ARE USED IN CODE

#### File 1: Razorpay Provider Initialization
📄 **File**: `src/lib/payment/providers/razorpay-provider.js`  
📍 **Lines**: 14-25

```javascript
export class RazorpayProvider extends PaymentProvider {
    constructor() {
        super();

        // ✅ Keys are read from environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
        }

        this.keyId = process.env.RAZORPAY_KEY_ID;              // ← Used here
        this.keySecret = process.env.RAZORPAY_KEY_SECRET;      // ← Used here
        this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;  // ← Used here

        // Lazy load Razorpay SDK
        this.razorpay = null;
    }
```

**How it works**:
1. Reads `RAZORPAY_KEY_ID` - Public key (used to initialize Razorpay SDK)
2. Reads `RAZORPAY_KEY_SECRET` - Secret key (used to create orders & verify payments)
3. Reads `RAZORPAY_WEBHOOK_SECRET` - Used to verify webhook signatures

---

#### File 2: Razorpay SDK Initialization
📄 **File**: `src/lib/payment/providers/razorpay-provider.js`  
📍 **Lines**: 28-37

```javascript
async getRazorpay() {
    if (!this.razorpay) {
        const Razorpay = (await import('razorpay')).default;
        this.razorpay = new Razorpay({
            key_id: this.keyId,           // ← RAZORPAY_KEY_ID used here
            key_secret: this.keySecret,   // ← RAZORPAY_KEY_SECRET used here
        });
    }
    return this.razorpay;
}
```

---

#### File 3: Order Creation
📄 **File**: `src/lib/payment/providers/razorpay-provider.js`  
📍 **Lines**: 40-80

```javascript
async createOrder({ amount, currency = 'INR', metadata = {} }) {
    try {
        const razorpay = await this.getRazorpay();  // ← Uses key_id + key_secret
        
        // Creates order using authenticated SDK
        const order = await razorpay.orders.create({
            amount: Math.round(amount),
            currency: currency.toUpperCase(),
            receipt,
            notes: { ...metadata, provider: 'razorpay' },
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            createdAt: order.created_at,
        };
    } catch (error) {
        // Error handling
    }
}
```

---

#### File 4: Payment Verification
📄 **File**: `src/lib/payment/providers/razorpay-provider.js`  
📍 **Lines**: 105-130

```javascript
async verifyPayment(paymentData) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = paymentData;

        // ✅ CRITICAL: Verify signature using RAZORPAY_KEY_SECRET
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', this.keySecret)  // ← Uses RAZORPAY_KEY_SECRET
            .update(body)
            .digest('hex');

        // Constant-time comparison
        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(razorpay_signature, 'hex')
        );

        if (!isValid) {
            console.error('Payment signature verification failed');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Payment verification error:', error);
        return false;
    }
}
```

---

#### File 5: Webhook Verification
📄 **File**: `src/lib/payment/providers/razorpay-provider.js`  
📍 **Lines**: 155-175

```javascript
async verifyWebhook(body, signature) {
    try {
        if (!this.webhookSecret) {
            console.warn('Razorpay webhook secret not configured');
            return false;
        }

        // ✅ CRITICAL: Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
        const hash = crypto
            .createHmac('sha256', this.webhookSecret)  // ← Uses RAZORPAY_WEBHOOK_SECRET
            .update(body)
            .digest('hex');

        // Constant-time comparison (prevent timing attacks)
        const isValid = crypto.timingSafeEqual(
            Buffer.from(hash, 'hex'),
            Buffer.from(signature, 'hex')
        );

        if (!isValid) {
            console.warn('Webhook signature verification failed');
            return false;
        }

        console.log('Webhook signature verified successfully');
        return true;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}
```

---

#### File 6: Payment Config Initialization
📄 **File**: `src/lib/payment/payment-config.js`  
📍 **Lines**: 113-130

```javascript
export function getPaymentProvider() {
    const providerName = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'razorpay';

    try {
        switch (providerName.toLowerCase()) {
            case 'razorpay':
                // ✅ Initializes RazorpayProvider (which reads env vars)
                return new RazorpayProvider();

            case 'stripe':
                return new StripeProvider();

            default:
                console.warn(`Unknown payment provider: ${providerName}, falling back to Razorpay`);
                return new RazorpayProvider();
        }
    } catch (error) {
        console.error(`Failed to initialize payment provider ${providerName}:`, error);
        throw error;
    }
}
```

---

#### File 7: Create Order API Route
📄 **File**: `src/app/api/payment/create-order/route.js`  
📍 **Lines**: 77-92

```javascript
// 7. Create order with payment provider
const provider = getProviderInstance();  // ← Initializes with env vars
const order = await provider.createOrder({
    amount,
    currency: plan.currency,
    metadata: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        planId,
        planName: plan.name,
    },
});
```

---

#### File 8: Webhook Handler
📄 **File**: `src/app/api/payment/webhook/route.js`  
📍 **Lines**: 48-52

```javascript
// Get payment provider (reads env vars)
const provider = getProviderInstance();

// Verify webhook signature (uses RAZORPAY_WEBHOOK_SECRET)
const isValid = await provider.verifyWebhook(body, signature);

if (!isValid) {
    console.error('Webhook signature verification failed');
    return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
    );
}
```

---

### 3. KEY SECURITY POINTS

#### 🔴 CRITICAL: What Each Key Does

| Key | Purpose | Visibility | Where Used |
|-----|---------|------------|-----------|
| **RAZORPAY_KEY_ID** | Identifies your account | Public (can share) | SDK initialization, Frontend |
| **RAZORPAY_KEY_SECRET** | Authenticates your account | 🔐 PRIVATE (never share!) | Payment creation, Signature generation |
| **RAZORPAY_WEBHOOK_SECRET** | Verifies webhook authenticity | 🔐 PRIVATE (never share!) | Webhook signature verification |

---

#### 🔐 Security Rules

```
DO:
✅ Store secrets in .env.local and .env.production
✅ Add .env files to .gitignore (already done)
✅ Regenerate secrets if compromised
✅ Use different secrets for dev/production
✅ Rotate secrets periodically (every 90 days)

DON'T:
❌ Commit .env files to git
❌ Log secrets to console
❌ Share secrets in emails/messages
❌ Use same dev keys in production
❌ Store secrets in code/comments
```

---

### 4. ENVIRONMENT VARIABLE MAPPING

How environment variables flow through your system:

```
.env.local
    ↓
process.env.RAZORPAY_KEY_ID
    ↓
RazorpayProvider constructor
    ↓
this.keyId → Razorpay SDK initialization
    ↓
API endpoints use authenticated SDK
```

---

### 5. ADDING NEW KEYS (Step by Step)

#### Step 1: Get Keys from Razorpay
```
1. Go to https://dashboard.razorpay.com/app/settings/api-keys
2. Select "Test Mode" (for development)
3. Copy Key ID: rzp_test_XXXXXXXXXXXXX
4. Copy Key Secret: XXXXXXXXXXXXX
5. Go to Webhooks → Create webhook
6. Configure webhook URL
7. Copy Webhook Secret: XXXXXXXXXXXXX
```

#### Step 2: Update `.env.local`
```
D:\startup\consistencygrid\.env.local

Find:
RAZORPAY_KEY_ID=rzp_test_SAtb4x3b4mc7Ke
RAZORPAY_KEY_SECRET=SEElXVjpX50fEskzp5laEIng
RAZORPAY_WEBHOOK_SECRET=XXXXXXX

Replace with:
RAZORPAY_KEY_ID=rzp_test_[your_key_id]
RAZORPAY_KEY_SECRET=[your_secret_key]
RAZORPAY_WEBHOOK_SECRET=[your_webhook_secret]
```

#### Step 3: Restart Development Server
```powershell
# Press Ctrl+C to stop dev server
npm run dev
```

#### Step 4: Test
```
Go to http://localhost:3000/pricing
Click "Upgrade" button
Should see Razorpay payment modal
```

---

### 6. PRODUCTION SETUP

#### Create `.env.production`
```
NEW FILE: D:\startup\consistencygrid\.env.production

Add:
# Database
DATABASE_URL=postgresql://...

# Razorpay LIVE Keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXX

# Other prod configs...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
```

#### Important
- Never commit `.env.production`
- Store in secret manager (Netlify, Vercel, AWS Secrets Manager)
- Different keys for each environment
- Rotate keys every 90 days

---

### 7. VERIFICATION CHECKLIST

#### Development
```
[ ] .env.local has RAZORPAY_KEY_ID
[ ] .env.local has RAZORPAY_KEY_SECRET  
[ ] .env.local has RAZORPAY_WEBHOOK_SECRET
[ ] Keys are from Razorpay Test Mode
[ ] npm run dev starts without errors
[ ] No errors in console related to Razorpay
```

#### Production
```
[ ] .env.production created
[ ] .env.production has RAZORPAY_KEY_ID (live)
[ ] .env.production has RAZORPAY_KEY_SECRET (live)
[ ] .env.production has RAZORPAY_WEBHOOK_SECRET (live)
[ ] .env.production is NOT in git
[ ] Keys are from Razorpay Live Mode
[ ] Webhook URL configured in Razorpay
[ ] Test payment processed successfully
```

---

## 📞 Troubleshooting

### Error: "Razorpay credentials not configured"
**Cause**: Missing environment variables  
**Fix**: Check `.env.local` has all 3 keys configured

### Error: "Webhook signature verification failed"
**Cause**: Wrong webhook secret or mismatched  
**Fix**: Copy exact webhook secret from Razorpay dashboard

### Error: "Payment verification failed"
**Cause**: Key secret doesn't match Razorpay's record  
**Fix**: Copy exact key secret, no spaces

### Payments work but webhook fails
**Cause**: Webhook URL not configured or firewall blocked  
**Fix**: Verify webhook URL in Razorpay dashboard matches your domain

---

**Summary**: All keys go in `.env.local` (development) and `.env.production` (production). The code automatically reads them and uses them for API calls and signature verification. Never commit these files to git!
