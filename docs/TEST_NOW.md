# ✅ TESTING READY - QUICK START

## 🚀 You Can Test Now!

### What's Running:

✅ Website: http://localhost:3000 (Next.js dev server)
✅ API: http://localhost:3000/api/payment/webhook
✅ Code: All payment logic ready
✅ Razorpay: Keys configured (test or live)
✅ App: Ready to receive deep links

---

## 🧪 QUICK 15 MIN TEST

### TEST 1: Website Platform Detection

```
1. Open: http://localhost:3000/pricing
2. Press F12 (browser console)
3. Run in console:
   localStorage.setItem('consistencygrid_platform', 'android');
   location.reload();

Expected:
✅ Page shows: "Upgrade to Pro" (NOT pricing cards)
✅ Button: "Get Premium"
✅ Shows list of features
```

### TEST 2: Website Payment

```
1. From TEST 1 page, click "Get Premium"
2. Should open payment form/modal
3. Enter test card:
   Card: 4111 1111 1111 1111
   CVV: 123
   Date: 12/25
   Name: Test User

Expected:
✅ Payment processes (may take 5-10 sec)
✅ Shows success page
✅ Check server logs for: [Webhook] payment.captured
```

### TEST 3: App Deep Link

```
1. Open terminal
2. Run:
   adb shell am start -W -a android.intent.action.VIEW \
   -d "consistencygrid://payment-success?token=testtoken123&plan=pro_yearly" \
   com.consistencygridwallpaper

Expected:
✅ App opens
✅ Check logs: adb logcat | grep DeepLink
✅ Should show: [DeepLink] ✅ Subscription saved successfully
```

---

## 📊 Test Results

| Test | Expected | Your Result | Status |
|------|----------|-------------|--------|
| Website detects app | Shows app UI | | ⚪ |
| Payment modal opens | Form appears | | ⚪ |
| Test payment works | Succeeds | | ⚪ |
| Webhook received | Logs show event | | ⚪ |
| Deep link works | App opens | | ⚪ |
| Token saved | AsyncStorage has data | | ⚪ |

---

## 🔍 If Something Fails

### Website not detecting app?
```
1. Check: localStorage.getItem('consistencygrid_platform')
   Should return: "android"

2. Check console for errors (F12)

3. Restart server: Ctrl+C then npm run dev
```

### Payment not working?
```
1. Check: Do you have Razorpay keys in .env.local?
2. Check: Are you logged in on website?
3. Check server logs for errors:
   npm run dev (look at terminal output)
```

### Deep link not working?
```
1. Check: adb logcat | grep DeepLink
2. Check: Is AndroidManifest.xml updated?
   grep -A 2 "payment-success" android/app/src/main/AndroidManifest.xml
3. Check: Is App.js updated?
   grep "handleDeepLink" App.js
4. Rebuild app: react-native run-android
```

---

## 📝 Files Modified

```
✅ d:\startup\consistencygrid\src\app\payment\success\page.js
   - Deep link redirect added

✅ D:\startup\ConsistencyGridWallpaper\App.js
   - Deep link listener added

✅ D:\startup\ConsistencyGridWallpaper\android\app\src\main\AndroidManifest.xml
   - Intent-filter for deep link added

✅ d:\startup\consistencygrid\.env.local
   - Razorpay keys added (you need to do this)
```

---

## 🎯 Success Checklist

If ALL pass → READY FOR PRODUCTION! 🚀

- [ ] Website shows app UI when flag set
- [ ] Payment form opens
- [ ] Test card payment succeeds
- [ ] Server logs show webhook received
- [ ] Webhook signature verified successfully
- [ ] Deep link opens app
- [ ] App logs show subscription saved
- [ ] Premium features unlock in app
- [ ] Data persists after app restart

---

## 🚀 What's Next

1. **All tests PASS?**
   → Build signed APK for PlayStore
   → Deploy to production

2. **Need to debug something?**
   → Check TESTING_COMPLETE.md (detailed guide)
   → Check IMPLEMENTATION_COMPLETE.md (troubleshooting)

3. **Questions about Razorpay?**
   → Check RAZORPAY_SETUP_GUIDE.md

---

## 📞 Quick Commands

```bash
# Website logs
npm run dev

# App logs
adb logcat | grep "DeepLink\|Payment"

# Test deep link
adb shell am start -W -a android.intent.action.VIEW \
-d "consistencygrid://payment-success?token=test&plan=pro_yearly" \
com.consistencygridwallpaper

# Stop website
Ctrl+C in terminal

# Restart app
react-native run-android
```

---

**Ready? Let's test! 🧪**

Open http://localhost:3000/pricing and start testing! ✨
