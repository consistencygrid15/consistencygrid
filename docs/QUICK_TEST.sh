#!/bin/bash

# Quick Testing Commands

echo "🧪 PAYMENT FLOW TESTING GUIDE"
echo "=============================="
echo ""

echo "📍 STEP 1: Website Testing"
echo "1. Open browser: http://localhost:3000/pricing"
echo "2. In browser console (F12), run:"
echo "   localStorage.setItem('consistencygrid_platform', 'android');"
echo "   location.reload();"
echo ""

echo "📍 STEP 2: Check Platform Detection"
echo "1. Should show 'Upgrade to Pro' (NOT full pricing)"
echo "2. Should show 'Get Premium' button"
echo "3. Click button → Opens payment page"
echo ""

echo "📍 STEP 3: Test Payment"
echo "1. Enter card details:"
echo "   Card: 4111 1111 1111 1111"
echo "   CVV: 123"
echo "   Date: 12/25"
echo "   Name: Test User"
echo ""

echo "📍 STEP 4: Check Webhook"
echo "1. After payment, check server logs:"
echo "   npm run dev"
echo "   Look for: [Webhook] Received: payment.captured"
echo ""

echo "📍 STEP 5: Test App Deep Link"
echo "1. Manual deep link test:"
echo "   adb shell am start -W -a android.intent.action.VIEW \\"
echo '   -d "consistencygrid://payment-success?token=test_token&plan=pro_yearly" \\'
echo "   com.consistencygridwallpaper"
echo ""

echo "📍 STEP 6: Check App Logs"
echo "1. Terminal: adb logcat | grep DeepLink"
echo "2. Should show: [DeepLink] ✅ Subscription saved successfully"
echo ""

echo "✅ If all steps pass, payment flow is WORKING!"
echo ""
echo "🚀 Next: Build signed APK and submit to PlayStore"
