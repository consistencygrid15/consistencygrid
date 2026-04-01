/**
 * ============================================================================
 * SENTRY ERROR TRACKING - CLIENT CONFIGURATION
 * ============================================================================
 * 
 * Captures frontend errors, performance issues, and user sessions
 * Automatically reports errors to Sentry dashboard
 * 
 * ============================================================================
 */

import * as Sentry from "@sentry/nextjs";

export function initSentryClient() {
    Sentry.init({
        // Your Sentry DSN from https://sentry.io
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Environment (development, staging, production)
        environment: process.env.NODE_ENV,

        // Release version for tracking which version has the error
        release: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",

        // Send 10% of transactions to Sentry for performance monitoring
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

        // Capture replays for debugging
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        integrations: [
            // Capture session replays (video-like playback of user session)
            new Sentry.Replay({
                maskAllText: true,
                blockAllMedia: true,
            }),
            // Capture HTTP client errors
            new Sentry.CaptureConsole({
                levels: ["error", "warn"],
            }),
        ],

        // Ignore certain errors that are not useful
        ignoreErrors: [
            // Browser extensions
            "top.GLOBALS",
            // Random plugins/extensions
            "originalCreateNotification",
            "canvas.contentDocument",
            "MyApp_RemoveAllHighlights",
            // See http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
            "Can't find variable: ZiteReader",
            "jigsaw is not defined",
            "ComboSearch is not defined",
            // Network errors (usually temporary)
            "NetworkError",
            "Network request failed",
        ],

        // Only capture errors from your domain in production
        beforeSend(event) {
            if (process.env.NODE_ENV === "production") {
                // Filter out errors from non-production domains
                const url = event.request?.url;
                if (url && !url.includes("yourdomain.com")) {
                    return null;
                }
            }
            return event;
        },
    });
}
