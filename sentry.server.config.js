// Sentry Server-Side Configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Set sample rate for errors
  sampleRate: process.env.NODE_ENV === "production" ? 0.9 : 1.0,

  // Capture all exceptions
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],

  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
  
  // Before send hook to filter sensitive data
  beforeSend(event, hint) {
    // Filter out certain errors if needed
    if (event.exception) {
      const error = hint.originalException;
      if (error?.message?.includes("NetworkError")) {
        return null; // Don't send network errors
      }
    }
    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
  ],
});
