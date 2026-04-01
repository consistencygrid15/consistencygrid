/**
 * Platform Detection Utilities
 * 
 * This module provides utilities to detect the platform (Web vs Android App)
 * and adjust the UI accordingly for an optimal experience on each platform.
 * 
 * @module platform-utils
 */

/**
 * Detect if the application is running in the ConsistencyGrid Android app
 * 
 * Detection methods (in priority order):
 * 1. App-specific user-agent string ("ConsistencyGridApp")
 * 2. Native Android JavaScript interface (window.Android)
 * 3. Platform marker in localStorage (set on first app load)
 * 
 * @returns {boolean} True if running in the Android app, false otherwise
 * 
 * @example
 * if (isAndroidApp()) {
 *   console.log('Running in Android app');
 * }
 */
export function isAndroidApp() {
    // Server-side rendering check
    if (typeof window === 'undefined') return false;

    try {
        const userAgent = navigator.userAgent;

        // Primary: check for our app-specific user-agent identifier
        // This is injected by MainActivity.kt: userAgentString += " ConsistencyGridApp"
        const isOurApp = /ConsistencyGridApp/i.test(userAgent);

        // Secondary: check for native Android JavaScript interface
        const hasAndroidInterface = typeof window.Android !== 'undefined';

        // Tertiary: check for platform marker set on first load
        const hasAppFlag = localStorage.getItem('consistencygrid_platform') === 'android';

        return isOurApp || hasAndroidInterface || hasAppFlag;
    } catch (error) {
        console.error('Error detecting Android platform:', error);
        return false;
    }
}

/**
 * Get the current platform name
 * 
 * @returns {'web' | 'android'} Platform identifier
 */
export function getPlatform() {
    return isAndroidApp() ? 'android' : 'web';
}

/**
 * Determine if payment UI should be displayed
 * 
 * Payment UI is only shown on the web platform.
 * The Android app directs users to the website for account management.
 * 
 * @returns {boolean} True if payment UI should be shown, false otherwise
 */
export function shouldShowPaymentUI() {
    return !isAndroidApp();
}

/**
 * Get the appropriate account management URL based on platform
 * 
 * - Web: Internal route (/pricing)
 * - Android: External website URL
 * 
 * @returns {string} URL for account management
 */
export function getUpgradeUrl() {
    if (isAndroidApp()) {
        // External website for Android app users
        return process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`
            : 'https://consistencygrid.com/pricing';
    }

    // Internal route for web users
    return '/pricing';
}

/**
 * Navigate to account management page with platform-appropriate method
 * 
 * - Web: Internal navigation
 * - Android: Opens external browser
 */
export function openUpgradePage() {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const url = getUpgradeUrl();

        if (isAndroidApp()) {
            // Open in external browser for account management
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // Internal navigation for web
            window.location.href = url;
        }
    } catch (error) {
        console.error('[Platform] Error navigating to account page:', error);
    }
}

/**
 * Get platform-specific messaging
 * 
 * Android messages use neutral account-management language
 * to comply with app store guidelines. Web messages use
 * standard upgrade/pricing language.
 * 
 * @returns {Object} Platform-specific messages
 */
export function getPlatformMessages() {
    if (isAndroidApp()) {
        return {
            upgradeButton: 'Manage Account on Website',
            upgradeDescription: 'Visit our website to manage your account and access additional features.',
            pricingHidden: 'Manage your account on our website',
            alreadySubscribed: 'Already a member? Your features sync automatically when you sign in.',
            featureLocked: 'This feature is available with an active membership.',
            limitReached: 'You\'ve reached the current limit. Visit our website to manage your account.',
        };
    }

    return {
        upgradeButton: 'Upgrade to Pro',
        upgradeDescription: 'Unlock all premium features',
        pricingHidden: null,
        alreadySubscribed: 'Manage your subscription in Settings',
        featureLocked: 'This feature requires a Pro subscription. Upgrade to unlock.',
        limitReached: 'Upgrade to Pro for unlimited access.',
    };
}

/**
 * Mark the app as Android platform (called from Android WebView on initialization)
 * This provides an additional detection method beyond user agent
 */
export function markAsAndroidApp() {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('consistencygrid_platform', 'android');
        } catch (error) {
            console.error('[Platform] Failed to mark as Android app:', error);
        }
    }
}

/**
 * Clear platform marker (for testing purposes)
 */
export function clearPlatformMarker() {
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem('consistencygrid_platform');
        } catch (error) {
            console.error('[Platform] Failed to clear platform marker:', error);
        }
    }
}

/**
 * Log platform detection info (for debugging)
 */
export function logPlatformInfo() {
    if (typeof window === 'undefined') {
        return;
    }

    console.group('[Platform Detection]');
    console.log('Platform:', getPlatform());
    console.log('Is Android App:', isAndroidApp());
    console.log('Show Payment UI:', shouldShowPaymentUI());
    console.log('Has Android Interface:', typeof window.Android !== 'undefined');
    console.groupEnd();
}

// Default export
export default {
    isAndroidApp,
    getPlatform,
    shouldShowPaymentUI,
    getUpgradeUrl,
    openUpgradePage,
    getPlatformMessages,
    markAsAndroidApp,
    clearPlatformMarker,
    logPlatformInfo,
};
