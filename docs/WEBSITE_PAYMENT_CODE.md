# Website Payment Integration - Exact Code to Add

## 📍 THESE ARE THE ONLY FILES YOU NEED TO UPDATE IN NEXT.JS APP

---

## 🔧 FILE 1: Update Pricing Page

**Location**: `src/app/pricing/page.js` or `src/app/pricing/page.tsx`

Replace your pricing page with this:

```javascript
'use client';

import React from 'react';
import { shouldShowPaymentUI, isAndroidApp } from '@/lib/platform-utils';
import PricingCards from '@/components/payment/PricingCards';

export default function PricingPage() {
    const [showPayment, setShowPayment] = React.useState(true);
    const [isApp, setIsApp] = React.useState(false);

    React.useEffect(() => {
        // Check platform on client side
        setShowPayment(shouldShowPaymentUI());
        setIsApp(isAndroidApp());
        
        console.log('[Pricing] Platform:', isApp ? 'Android App' : 'Web');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600">
                        {isApp
                            ? 'Unlock premium features on ConsistencyGrid'
                            : 'Get the most out of ConsistencyGrid'}
                    </p>
                </div>

                {/* MAIN CONTENT */}
                {showPayment ? (
                    // 🌐 WEBSITE VERSION - Show full payment UI
                    <>
                        <PricingCards />
                        
                        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <p className="text-blue-900">
                                💳 Secure payment powered by Razorpay
                            </p>
                        </div>
                    </>
                ) : (
                    // 📱 APP VERSION - User is in Android app
                    <AppUpgradeSection />
                )}
            </div>
        </div>
    );
}

/**
 * Shown to Android app users
 * They're already on website, just show them why premium is great!
 */
function AppUpgradeSection() {
    return (
        <div className="max-w-2xl mx-auto">
            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
                <div className="text-5xl mb-4">✨</div>
                <h2 className="text-3xl font-bold mb-4">Upgrade to Premium</h2>
                <p className="text-lg mb-8 text-blue-100">
                    Get unlimited wallpapers, custom themes, and priority support
                </p>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <FeatureItem icon="🎨" text="Unlimited wallpapers" />
                    <FeatureItem icon="🎯" text="Custom colors & themes" />
                    <FeatureItem icon="⚡" text="Faster wallpaper generation" />
                    <FeatureItem icon="🚀" text="Priority support" />
                    <FeatureItem icon="📱" text="Sync across devices" />
                    <FeatureItem icon="🎬" text="Animation effects" />
                </div>

                {/* Price */}
                <div className="mb-8 border-t border-blue-400 pt-8">
                    <div className="text-center">
                        <p className="text-blue-100 mb-2">Starting at</p>
                        <div className="text-5xl font-bold">
                            ₹99<span className="text-lg text-blue-100">/month</span>
                        </div>
                        <p className="text-sm text-blue-200 mt-2">or ₹999/year - Save 17%</p>
                    </div>
                </div>
            </div>

            {/* Plan Comparison */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Compare Plans
                    </h3>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Feature
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                Free
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                Pro
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                                Premium
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <PlanRow
                            feature="Wallpapers"
                            free="5"
                            pro="50"
                            premium="Unlimited"
                        />
                        <PlanRow
                            feature="Custom themes"
                            free="❌"
                            pro="✅"
                            premium="✅"
                        />
                        <PlanRow
                            feature="Animations"
                            free="❌"
                            pro="❌"
                            premium="✅"
                        />
                        <PlanRow
                            feature="Support"
                            free="Email"
                            pro="Priority"
                            premium="VIP"
                        />
                    </tbody>
                </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => window.open('https://app.consistencygrid.com/dashboard', '_blank')}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Continue with Free Plan
                </button>

                <div className="text-center text-sm text-gray-600">
                    <p>💳 Premium features will sync to your app immediately after payment</p>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Frequently Asked Questions
                </h3>
                <FAQItem
                    q="Can I cancel anytime?"
                    a="Yes! Cancel your subscription anytime with no penalties."
                />
                <FAQItem
                    q="Does premium work in the app?"
                    a="Yes! Premium features sync automatically to your app."
                />
                <FAQItem
                    q="What payment methods do you accept?"
                    a="We accept all major credit cards, debit cards, and UPI via Razorpay."
                />
            </div>
        </div>
    );
}

function FeatureItem({ icon, text }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="text-blue-100">{text}</span>
        </div>
    );
}

function PlanRow({ feature, free, pro, premium }) {
    return (
        <tr>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
            <td className="px-6 py-4 text-center text-sm text-gray-600">{free}</td>
            <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">
                {pro}
            </td>
            <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">
                {premium}
            </td>
        </tr>
    );
}

function FAQItem({ q, a }) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center"
            >
                {q}
                <span className="text-gray-600">{open ? '−' : '+'}</span>
            </button>
            {open && <div className="px-6 py-4 bg-gray-50 text-gray-700">{a}</div>}
        </div>
    );
}
```

---

## 🔧 FILE 2: Update Payment Success Page

**Location**: `src/app/payment/success/page.js` or `src/app/payment/success/page.tsx`

```javascript
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isAndroidApp } from '@/lib/platform-utils';
import Confetti from 'react-confetti';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showConfetti, setShowConfetti] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    const token = searchParams.get('token');
    const plan = searchParams.get('plan');
    const expiryDate = searchParams.get('expiryDate');
    const isApp = isAndroidApp();

    useEffect(() => {
        // Log success
        console.log('[PaymentSuccess]', { token, plan, isApp });

        // If in app, redirect back via deep link after 2 seconds
        if (isApp && token) {
            setTimeout(() => {
                redirectToApp();
            }, 2000);
        }
    }, [token, isApp]);

    const redirectToApp = () => {
        setRedirecting(true);
        
        // Construct deep link URL
        const deepLink = `consistencygrid://payment-success?token=${token}&plan=${plan}&expiryDate=${encodeURIComponent(expiryDate || '')}`;
        
        console.log('[PaymentSuccess] Redirecting to app:', deepLink);
        
        // Redirect to deep link (app will handle it)
        window.location.href = deepLink;
    };

    const handleContinue = () => {
        if (isApp) {
            redirectToApp();
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
            {/* Confetti Animation */}
            {showConfetti && (
                <Confetti
                    width={typeof window !== 'undefined' ? window.innerWidth : 0}
                    height={typeof window !== 'undefined' ? window.innerHeight : 0}
                    recycle={false}
                    numberOfPieces={200}
                />
            )}

            {/* Main Card */}
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Main Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Payment Successful! 🎉
                </h1>
                <p className="text-gray-600 mb-6">
                    Your {plan?.toUpperCase()} subscription is now active
                </p>

                {/* Plan Details */}
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                            <p className="text-sm text-gray-600">Plan</p>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                                {plan || 'Unknown'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Expires</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {expiryDate
                                    ? new Date(expiryDate).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* What's Included */}
                <div className="text-left mb-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                        You now have access to:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Unlimited wallpapers
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Custom themes & colors
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Priority support
                        </li>
                        <li className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Ad-free experience
                        </li>
                    </ul>
                </div>

                {/* Status Message */}
                {isApp ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-blue-900">
                            {redirecting
                                ? '⏳ Opening app...'
                                : '🔄 Redirecting to app in 2 seconds...'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-gray-900">
                            ✨ Your subscription is active on web
                        </p>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={handleContinue}
                    disabled={redirecting}
                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                    {redirecting ? 'Redirecting...' : isApp ? 'Return to App' : 'Go to Dashboard'}
                </button>

                {/* Support Link */}
                <p className="text-xs text-gray-500 mt-4">
                    Need help?{' '}
                    <a href="/help" className="text-blue-600 hover:underline">
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    );
}
```

---

## 🔧 FILE 3: Verify Platform Utils

**Location**: `src/lib/platform-utils.js`

Check if this exists and is correct:

```javascript
/**
 * Platform Detection Utilities
 * 
 * Detects if app is running in Android WebView vs web browser
 * Website uses this to hide payment UI in app (to avoid PlayStore 15% commission)
 */

export function isAndroidApp() {
    // Server-side rendering check
    if (typeof window === 'undefined') return false;

    try {
        const userAgent = navigator.userAgent.toLowerCase();

        // 1. Check WebView pattern in user agent
        const isWebView = /webview|wv|android.*applewebkit(?!.*chrome)/i.test(userAgent);

        // 2. Check custom Android interface (if app injects one)
        const hasAndroidInterface = typeof window.Android !== 'undefined';

        // 3. Check localStorage flag (app sets this on first load)
        const hasAppFlag = 
            typeof window !== 'undefined' &&
            localStorage.getItem('consistencygrid_platform') === 'android';

        const detected = isWebView || hasAndroidInterface || hasAppFlag;
        
        console.log('[Platform] Detection:', {
            userAgent: userAgent.substring(0, 50),
            isWebView,
            hasAndroidInterface,
            hasAppFlag,
            result: detected ? 'ANDROID APP' : 'WEB'
        });

        return detected;
    } catch (error) {
        console.error('[Platform] Detection error:', error);
        return false;
    }
}

export function getPlatform() {
    return isAndroidApp() ? 'android' : 'web';
}

/**
 * CRITICAL: Determines if payment UI should be shown
 * Returns FALSE in Android app (hide payment, user already on website)
 * Returns TRUE on website (show payment UI)
 */
export function shouldShowPaymentUI() {
    return !isAndroidApp();
}

export function getUpgradeUrl() {
    if (isAndroidApp()) {
        // In app - open external website
        return process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`
            : 'https://consistencygrid.com/pricing';
    }
    // On website - use internal route
    return '/pricing';
}

export default {
    isAndroidApp,
    getPlatform,
    shouldShowPaymentUI,
    getUpgradeUrl,
};
```

---

## ✅ TESTING CHECKLIST

### Test on Website

```bash
cd d:\startup\consistencygrid
npm run dev

# Open http://localhost:3000/pricing
# Should show full payment UI

# Open console, run:
localStorage.setItem('consistencygrid_platform', 'android')
location.reload()

# Should now show APP VERSION (no payment UI)
```

### Test on Android Device

```bash
# Build app from React Native folder
cd D:\startup\ConsistencyGridWallpaper
react-native run-android

# In app, click "Upgrade"
# Should open browser with website
# Website should show app version (no payment buttons)
# Complete test payment
# Should redirect back to app via deep link
```

---

## 🎯 Summary

✅ Update Pricing Page - Show app version to Android users
✅ Update Success Page - Send deep link back to app
✅ Verify Platform Utils - Detection working

That's it! Website side is done! 🚀

Now implement the React Native app side from:
`D:\startup\consistencygrid\docs\REACT_NATIVE_PAYMENT_IMPLEMENTATION.md`
