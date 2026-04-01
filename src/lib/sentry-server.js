/**
 * ============================================================================
 * SENTRY ERROR TRACKING - SERVER CONFIGURATION
 * ============================================================================
 * 
 * Captures backend errors, API failures, and server-side performance issues
 * Automatically reports errors to Sentry dashboard
 * 
 * ============================================================================
 */

import * as Sentry from "@sentry/nextjs";

export function initSentryServer() {
    Sentry.init({
        // Your Sentry DSN from https://sentry.io
        dsn: process.env.SENTRY_DSN,

        // Environment
        environment: process.env.NODE_ENV,

        // Release version for tracking
        release: process.env.APP_VERSION || "0.1.0",

        // Send 10% of server transactions to Sentry
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

        integrations: [
            // Capture database errors
            new Sentry.PrismaIntegration(),
        ],

        // Ignore certain errors
        ignoreErrors: [
            // Database connection errors (temporary)
            "connection refused",
            "ECONNREFUSED",
            // Expected auth errors
            "Unauthorized",
            "Forbidden",
        ],

        beforeSend(event) {
            // Don't send 404 errors (common and not useful)
            if (event.exception) {
                const error = event.exception.values?.[0];
                if (error?.value?.includes("404")) {
                    return null;
                }
            }
            return event;
        },
    });
}

/**
 * Capture an exception and report to Sentry
 */
export function captureException(error, context = {}) {
    Sentry.captureException(error, {
        tags: context,
    });
}

/**
 * Capture a message for informational purposes
 */
export function captureMessage(message, level = "info") {
    Sentry.captureMessage(message, level);
}

/**
 * Add context to subsequent error reports
 */
export function setUserContext(userId, userEmail) {
    Sentry.setUser({
        id: userId,
        email: userEmail,
    });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
    Sentry.setUser(null);
}
