# Testing Guide: Platform Detection & Payment Bypass

## Overview

This guide provides step-by-step instructions for testing the platform detection system and verifying that payment UI is correctly hidden in the Android app.

## Test Environment Setup

### Prerequisites

- ✅ Web browser (Chrome recommended)
- ✅ Android device or emulator
- ✅ Android app installed
- ✅ Test account credentials

### Test Accounts

Create two test accounts:
1. **Free User**: Test free plan limitations
2. **Pro User**: Test subscription sync

## Web Testing

### Test 1: Web Platform Detection

**Objective**: Verify payment UI is visible on web

**Steps**:
1. Open browser: `http://localhost:3000` (or production URL)
2. Open DevTools (F12)
3. Go to Console tab
4. Run:
   ```javascript
   import('./src/lib/platform-utils.js').then(m => m.logPlatformInfo())
   ```
5. Verify output shows:
   - Platform: `web`
   - Is Android App: `false`
   - Show Payment UI: `true`

**Expected Result**: ✅ Payment UI should be visible

---

### Test 2: Web Pricing Page

**Objective**: Verify full pricing page with payment options

**Steps**:
1. Navigate to `/pricing`
2. Verify all 4 pricing cards are visible:
   - Free
   - Pro Monthly
   - Pro Yearly
   - Lifetime
3. Click on "Upgrade to Pro Yearly" button
4. Verify payment modal/checkout appears

**Expected Result**: ✅ Full pricing page with payment buttons

---

### Test 3: Web Payment Flow

**Objective**: Test complete payment process

**Steps**:
1. Log in with test account
2. Navigate to `/pricing`
3. Click "Upgrade to Pro Yearly"
4. Complete payment with test card:
   - Razorpay Test Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
5. Verify redirect to success page
6. Navigate to `/dashboard`
7. Verify "Pro" badge is visible

**Expected Result**: ✅ Payment successful, subscription active

---

## Android App Testing

### Test 4: Simulate Android Platform

**Objective**: Test Android detection in web browser

**Steps**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   localStorage.setItem('consistencygrid_platform', 'android');
   location.reload();
   ```
4. Navigate to `/pricing`
5. Verify you see:
   - "Unlock Premium Features" heading
   - "Upgrade via Website" button
   - NO pricing cards
   - NO payment forms

**Expected Result**: ✅ Android-specific UI shown

**Cleanup**:
```javascript
localStorage.removeItem('consistencygrid_platform');
location.reload();
```

---

### Test 5: Android App Platform Detection

**Objective**: Verify platform flag is set in Android app

**Steps**:
1. Build and install Android app
2. Open app
3. Connect device via USB
4. Open Chrome on computer
5. Navigate to `chrome://inspect`
6. Click "Inspect" on your WebView
7. In Console, run:
   ```javascript
   localStorage.getItem('consistencygrid_platform')
   ```
8. Verify output: `"android"`

**Expected Result**: ✅ Platform flag is set to "android"

---

### Test 6: Android Pricing Page

**Objective**: Verify payment UI is hidden in Android app

**Steps**:
1. Open Android app
2. Navigate to Pricing page (via menu or direct link)
3. Verify you see:
   - ✅ "Unlock Premium Features" heading
   - ✅ "Upgrade via Website" button with external link icon
   - ✅ "Already subscribed?" info box
   - ✅ List of Pro features
   - ❌ NO pricing cards
   - ❌ NO payment buttons
   - ❌ NO price information

**Expected Result**: ✅ Android-specific UI, no payment options

---

### Test 7: External Browser Opening

**Objective**: Verify "Upgrade via Website" opens external browser

**Steps**:
1. In Android app, navigate to Pricing page
2. Click "Upgrade via Website" button
3. Verify:
   - External browser (Chrome/default) opens
   - Website loads with full pricing page
   - Payment options are visible in browser
   - App remains in background

**Expected Result**: ✅ External browser opens with full website

---

### Test 8: Subscription Sync

**Objective**: Verify subscription purchased on website syncs to app

**Steps**:
1. In external browser (from Test 7), log in
2. Subscribe to Pro plan (use test payment)
3. Complete payment successfully
4. Return to Android app (don't close it)
5. Navigate to Dashboard or Settings
6. Pull to refresh or restart app
7. Verify:
   - Subscription status shows "Pro"
   - Premium features are unlocked
   - No payment prompts appear

**Expected Result**: ✅ Subscription syncs automatically

---

### Test 9: Session Persistence

**Objective**: Verify session persists across app restarts

**Steps**:
1. Log in to Android app
2. Subscribe to Pro (via website)
3. Close app completely (swipe away from recent apps)
4. Reopen app
5. Verify:
   - Still logged in
   - Subscription status still shows "Pro"
   - No need to log in again

**Expected Result**: ✅ Session and subscription persist

---

## Component-Level Testing

### Test 10: PaymentCheckout Component

**File**: `src/components/payment/PaymentCheckout.js`

**Test Cases**:

| Platform | Expected Behavior |
|----------|-------------------|
| Web | Shows payment button, processes payment |
| Android | Shows "Upgrade via Website" button |

**Steps**:
1. Import component in test page
2. Test with `localStorage.setItem('consistencygrid_platform', 'android')`
3. Test without platform flag
4. Verify correct UI renders

---

### Test 11: UpgradeButton Component

**File**: `src/components/payment/UpgradeButton.js`

**Test Cases**:

```javascript
// Web
<UpgradeButton planName="Pro" onClick={handleUpgrade} />
// Should show: "Upgrade to Pro" with arrow icon

// Android
<UpgradeButton planName="Pro" />
// Should show: "Upgrade via Website" with external link icon
```

---

## Play Store Compliance Testing

### Test 12: Compliance Checklist

**Objective**: Verify app meets Play Store policies

**Checklist**:

- [ ] No payment buttons in app
- [ ] No pricing information visible in app
- [ ] No "Buy", "Purchase", "Subscribe" buttons in app
- [ ] "Upgrade via Website" opens external browser (not in-app browser)
- [ ] No mention of "cheaper on website" or pricing comparisons
- [ ] Subscription status syncs from backend
- [ ] No Google Play Billing integration required
- [ ] App functions normally without payment features

**Expected Result**: ✅ All items checked

---

## Debugging

### Enable Debug Logging

Add to any component:

```javascript
import { logPlatformInfo } from '@/lib/platform-utils';

useEffect(() => {
  logPlatformInfo();
}, []);
```

### Check Platform Detection

```javascript
// In browser console or app WebView console
import('./src/lib/platform-utils.js').then(m => {
  console.log('Platform:', m.getPlatform());
  console.log('Is Android:', m.isAndroidApp());
  console.log('Show Payment UI:', m.shouldShowPaymentUI());
  console.log('Upgrade URL:', m.getUpgradeUrl());
});
```

### Clear Platform Flag

```javascript
// Reset to web platform
localStorage.removeItem('consistencygrid_platform');
location.reload();
```

---

## Common Issues & Solutions

### Issue 1: Payment UI showing in Android app

**Symptoms**: Payment buttons visible in app

**Solutions**:
1. Check platform flag:
   ```javascript
   localStorage.getItem('consistencygrid_platform')
   ```
2. Verify it returns `"android"`
3. If null, check Android WebView integration
4. Ensure `setPlatformFlag()` is called in `onPageFinished`

---

### Issue 2: External browser not opening

**Symptoms**: Clicking upgrade button does nothing

**Solutions**:
1. Check `shouldOverrideUrlLoading` in WebView
2. Verify URL matching logic
3. Check Android permissions in manifest
4. Test with:
   ```kotlin
   val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://google.com"))
   startActivity(intent)
   ```

---

### Issue 3: Subscription not syncing

**Symptoms**: Subscribed on website but app shows Free

**Solutions**:
1. Verify same account on both platforms
2. Check session/cookie persistence
3. Force refresh app
4. Check API response:
   ```javascript
   fetch('/api/payment/subscription')
     .then(r => r.json())
     .then(console.log)
   ```

---

## Performance Testing

### Test 13: Page Load Time

**Objective**: Verify platform detection doesn't slow down page load

**Steps**:
1. Open DevTools > Performance tab
2. Record page load
3. Check time for platform detection
4. Should be < 10ms

---

### Test 14: Memory Usage

**Objective**: Verify no memory leaks

**Steps**:
1. Open DevTools > Memory tab
2. Take heap snapshot
3. Navigate between pages
4. Take another snapshot
5. Compare memory usage

---

## Automated Testing (Optional)

### Cypress Test Example

```javascript
describe('Platform Detection', () => {
  it('should show payment UI on web', () => {
    cy.visit('/pricing');
    cy.get('[data-testid="payment-button"]').should('be.visible');
  });

  it('should hide payment UI on Android', () => {
    cy.visit('/pricing', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('consistencygrid_platform', 'android');
      }
    });
    cy.contains('Upgrade via Website').should('be.visible');
    cy.get('[data-testid="payment-button"]').should('not.exist');
  });
});
```

---

## Test Report Template

```markdown
# Test Report: Platform Detection

**Date**: YYYY-MM-DD
**Tester**: Your Name
**Environment**: Production / Staging / Local

## Summary
- Total Tests: 14
- Passed: X
- Failed: Y
- Skipped: Z

## Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Web Platform Detection | ✅ Pass | |
| 2 | Web Pricing Page | ✅ Pass | |
| 3 | Web Payment Flow | ✅ Pass | |
| 4 | Simulate Android | ✅ Pass | |
| 5 | Android Platform Detection | ✅ Pass | |
| 6 | Android Pricing Page | ✅ Pass | |
| 7 | External Browser Opening | ✅ Pass | |
| 8 | Subscription Sync | ✅ Pass | |
| 9 | Session Persistence | ✅ Pass | |
| 10 | PaymentCheckout Component | ✅ Pass | |
| 11 | UpgradeButton Component | ✅ Pass | |
| 12 | Play Store Compliance | ✅ Pass | |
| 13 | Page Load Time | ✅ Pass | |
| 14 | Memory Usage | ✅ Pass | |

## Issues Found
1. [Issue description]
   - **Severity**: High/Medium/Low
   - **Steps to reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## Next Steps

After all tests pass:

1. ✅ Deploy to staging environment
2. ✅ Test on staging with real devices
3. ✅ Get QA approval
4. ✅ Deploy to production
5. ✅ Submit Android app to Play Store
6. ✅ Monitor for issues

---

## Support

For issues during testing:
- Check [Platform Detection Docs](./PLATFORM_DETECTION.md)
- Check [Android Integration Guide](./ANDROID_INTEGRATION.md)
- Check [Implementation Plan](../brain/implementation_plan.md)
