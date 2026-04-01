# 🧪 COMPLETE TESTING GUIDE - Ready to Test

## ✅ Prerequisites Check

Before testing, make sure you have:

```
[ ] API Keys added to .env.local
    RAZORPAY_KEY_ID=rzp_test_XXXXXXX
    RAZORPAY_KEY_SECRET=XXXXXXX
    RAZORPAY_WEBHOOK_SECRET=XXXXXXX

[ ] Website running: npm run dev (port 3000)

[ ] Android app built and ready: react-native run-android

[ ] Test card ready:
    Card: 4111 1111 1111 1111
    CVV: Any 3 digits (e.g., 123)
    Date: Any future date (e.g., 12/25)
    Name: Any name
```

---

## 🧪 TEST PLAN

### Phase 1: Website Testing (5 min)

#### Test 1.1: Check Platform Detection

```
Step 1: Open browser console (F12)
Step 2: Visit http://localhost:3000/pricing
Step 3: In console, run:
        localStorage.setItem('consistencygrid_platform', 'android');
        location.reload();

Expected:
✅ Page reloads
✅ Shows "Upgrade to Pro" title (NOT full pricing)
✅ Shows "Get Premium" button
✅ Hides pricing cards

Then: Clear flag
     localStorage.removeItem('consistencygrid_platform');
     location.reload();

Expected:
✅ Shows full pricing page with all plans
✅ Shows "Flexible Plans" hero
```

#### Test 1.2: Web Payment Flow

```
Step 1: Visit http://localhost:3000/pricing (no localStorage flag)
Step 2: Make sure logged in (if not, sign up)
Step 3: Click on any "Get Pro Yearly" or similar button
Step 4: Should open payment modal

Expected:
✅ Razorpay modal appears
✅ Can see amount, order ID
✅ Form for card details appears
```

#### Test 1.3: Test Payment

```
Step 1: In Razorpay modal, enter:
        Card: 4111 1111 1111 1111
        CVV: 123
        Date: 12/25
        Name: Test User

Step 2: Click "Pay"

Expected:
✅ Payment processes
✅ Shows success message
✅ Browser should start redirect (if source=app)
✅ Check server logs for: [Webhook] Received: payment.captured
```

---

### Phase 2: App Testing (10 min)

#### Test 2.1: Build & Launch App

```bash
# Terminal 1: React Native app
cd D:\startup\ConsistencyGridWallpaper
react-native run-android

Expected:
✅ App builds without errors
✅ App opens on device/emulator
✅ Home screen displays
```

#### Test 2.2: Check App.js Deep Link Handler

```bash
# Terminal 2: Check if App.js is correct
cat App.js | findstr "handleDeepLink"

Expected:
✅ Should see handleDeepLink function
✅ Should see AsyncStorage.multiSet
✅ Should see subscription_token being saved
```

#### Test 2.3: Test Deep Link (Manual)

```bash
# Terminal 3: Manually send deep link to app
adb shell am start -W -a android.intent.action.VIEW \
-d "consistencygrid://payment-success?token=test_token_12345&plan=pro_yearly&expiryDate=2026-12-31" \
com.consistencygridwallpaper

Expected:
✅ App opens
✅ Check phone logs:
   adb logcat | findstr "DeepLink"
   Should show: [DeepLink] Received: consistencygrid://payment-success?...
   Should show: [DeepLink] ✅ Subscription saved successfully
```

#### Test 2.4: Verify AsyncStorage

```bash
# After deep link test, check if data saved:
adb shell

# In shell:
cd /data/data/com.consistencygridwallpaper/files/RCTAsyncStorage_V1

# View saved data (this is internal test):
cat *.json | grep subscription_token

Expected:
✅ Should find subscription_token saved
✅ Should find user_plan=pro_yearly
✅ Should find is_premium=true
```

---

### Phase 3: End-to-End Test (15 min)

#### Test 3.1: Complete Flow

```
Step 1: Open website on computer
        http://localhost:3000/pricing?source=app&platform=android

Step 2: Set localStorage flag:
        localStorage.setItem('consistencygrid_platform', 'android');
        location.reload();

Step 3: Click "Get Premium" button
        → Should open payment modal

Step 4: Pay with test card:
        4111 1111 1111 1111 (CVV: 123, Date: 12/25)

Step 5: Wait for success page
        Should see: "Redirecting to app in 3 seconds..."

Step 6: Check server logs:
        Should show: [Webhook] payment.captured
        Should show: [DeepLink] Subscription saved

Expected:
✅ Payment succeeds
✅ Webhook received
✅ Deep link sent
✅ App receives token
```

#### Test 3.2: App Recognizes Premium

```
After Step 6 above:

Step 1: On app, check if premium unlocked
        - Restart app to verify persistence
        - Open file manager
        - Check AsyncStorage for subscription_token

Step 2: Create check component:
        import AsyncStorage from '@react-native-async-storage/async-storage';
        
        useEffect(() => {
          AsyncStorage.getItem('is_premium').then(isPremium => {
            console.log('[App] Premium status:', isPremium); // should be 'true'
          });
        }, []);

Expected:
✅ AsyncStorage shows is_premium = true
✅ App recognizes user as premium
✅ Premium features available
```

---

## 🔍 Debug Checklist

### Website Level Debugging

```
Issue: Platform not detecting as app

Debug:
1. In browser console:
   console.log(localStorage.getItem('consistencygrid_platform'));
   // Should show 'android' if set correctly
   
2. Check User-Agent:
   console.log(navigator.userAgent);
   // Should contain 'Android' or 'webview' if in app
   
3. Check if function works:
   localStorage.setItem('consistencygrid_platform', 'android');
   location.reload();
   // If still shows full pricing, check isAndroidApp() function
```

```
Issue: Payment not creating order

Debug:
1. Open DevTools → Network
2. Click "Get Pro Yearly" button
3. Look for XHR request to /api/payment/create-order
4. Check:
   - Status: 200 (success) or 401 (not logged in)
   - Response has orderId
5. If fails:
   - Check you're logged in
   - Check .env has RAZORPAY_KEY_ID
   - Restart server: npm run dev
```

```
Issue: Webhook not received

Debug:
1. Check server console:
   npm run dev
   // Should show logs with [Webhook] prefix
   
2. If no logs:
   - Check webhook URL in Razorpay dashboard
   - Make sure it's: https://yourdomain.com/api/payment/webhook
   - Check endpoint is public (no auth)
   - Check RAZORPAY_WEBHOOK_SECRET is correct
```

### App Level Debugging

```
Issue: Deep link not working

Debug:
1. Check AndroidManifest.xml:
   grep -A 5 "payment-success" android/app/src/main/AndroidManifest.xml
   // Should show intent-filter

2. Check App.js:
   grep "handleDeepLink" App.js
   // Should show function

3. Test manually:
   adb shell am start -W -a android.intent.action.VIEW \
   -d "consistencygrid://payment-success?token=test&plan=pro" \
   com.consistencygridwallpaper

4. Check logs:
   adb logcat | grep DeepLink
   // Should show [DeepLink] messages
```

```
Issue: AsyncStorage not saving

Debug:
1. Check React Native version:
   npm list react-native
   // Should be 0.63+

2. Check AsyncStorage installed:
   npm list @react-native-async-storage/async-storage
   // Should be installed

3. Test directly:
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   await AsyncStorage.setItem('test', 'value');
   const val = await AsyncStorage.getItem('test');
   console.log('Test value:', val); // Should show 'value'
```

---

## 📋 Test Results Template

Use this to track your tests:

```
=== WEBSITE TESTS ===

Platform Detection (Web Mode):
  [ ] Full pricing shows
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

Platform Detection (App Mode):
  [ ] Simplified UI shows
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

Payment Flow:
  [ ] Modal opens
  [ ] Payment processes
  [ ] Success page shows
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

=== APP TESTS ===

Deep Link Reception:
  [ ] Intent-filter configured
  [ ] handleDeepLink working
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

AsyncStorage Saving:
  [ ] Token saved
  [ ] Plan saved
  [ ] Premium flag set
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

Persistence:
  [ ] Survives app restart
  [ ] Data remains after close
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

=== END-TO-END TESTS ===

Complete Payment Flow:
  [ ] Click button → Website opens
  [ ] User pays with test card
  [ ] Webhook received
  [ ] Deep link sent
  [ ] App receives token
  [ ] Premium unlocked
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

Multiple Payments:
  [ ] Second payment works
  [ ] Plan updated correctly
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________

App Restart Persistence:
  [ ] Close app completely
  [ ] Restart app
  [ ] Premium still active
  [ ] Date: ____
  [ ] Result: ✅ PASS / ❌ FAIL
  [ ] Notes: ________________
```

---

## 🚀 How to Run Tests

### Quick Test (5 min)

```bash
# Terminal 1: Website
cd d:\startup\consistencygrid
npm run dev
# Wait for "Ready on http://localhost:3000"

# Terminal 2: Mobile App
cd D:\startup\ConsistencyGridWallpaper
react-native run-android
# Wait for app to open on device

# Then:
# 1. Open browser to http://localhost:3000/pricing
# 2. Set localStorage flag
# 3. Click upgrade button
# 4. Pay with test card
# 5. Check if deep link works in app
```

### Full Test (30 min)

```bash
# Follow all test phases above
# Document all results
# Fix any issues found
# Re-test until all pass
```

---

## ✅ Success Criteria

### Website ✅
- [ ] Platform detection works (switches UI based on flag)
- [ ] Payment form appears and accepts input
- [ ] Razorpay modal opens with correct amount
- [ ] Test payment completes without errors
- [ ] Success page shows with redirect message

### Webhook ✅
- [ ] Server receives webhook event
- [ ] Signature verification passes
- [ ] Database updates subscription status
- [ ] Logs show [Webhook] messages

### App ✅
- [ ] Deep link received via intent-filter
- [ ] handleDeepLink function executes
- [ ] AsyncStorage saves token and plan
- [ ] App recognizes user as premium
- [ ] Data persists after app restart

### Security ✅
- [ ] Secret keys not exposed in logs
- [ ] Signature verification prevents fake payments
- [ ] Deep link URL validated before processing
- [ ] Rate limiting prevents order spam

---

## 🎯 Next Steps After Testing

1. **All tests PASS?**
   - You're ready for production! 🎉
   - Deploy website changes
   - Build signed APK for PlayStore

2. **Some tests FAIL?**
   - Check debug checklist above
   - Look at error logs
   - Fix issue
   - Re-run failing test

3. **Need help?**
   - Check IMPLEMENTATION_COMPLETE.md for troubleshooting
   - Check RAZORPAY_SETUP_GUIDE.md for Razorpay issues
   - Review code comments in source files

---

**You're ready to test! Let's go! 🚀**
