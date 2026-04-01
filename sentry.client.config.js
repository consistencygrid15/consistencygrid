// Sentry Client-Side Configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Integrations
  integrations: [
    new Sentry.Replay({
      // Mask all text content
      maskAllText: true,
      // Block all media elements
      blockAllMedia: true,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set `tracePropagationTargets` to control what URLs requests should be traced for.
  // Controls what requests distributed tracing should be enabled for
  tracePropagationTargets: ["localhost", /^\//],

  // Capture Replay for 10% of all sessions,
  // plus, capture replays for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release
  release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",

  // Before send hook
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.url?.includes("password")) {
      return null;
    }
    return event;
  },
});
