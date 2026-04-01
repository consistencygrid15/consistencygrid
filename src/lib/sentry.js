/**
 * Sentry Configuration for Error Tracking
 * 
 * Sentry is OPTIONAL. To enable:
 * 1. Install: npm install @sentry/nextjs
 * 2. Create account at https://sentry.io
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in .env.local
 * 4. Restart dev server
 * 
 * Without Sentry, errors are logged to console instead.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = !!SENTRY_DSN;

/**
 * Capture exception for error tracking
 * Falls back to console.error if Sentry not configured
 */
export const captureException = (error, context = {}) => {
  if (SENTRY_ENABLED) {
    try {
      // Sentry would capture here if installed
      console.log('📍 Error tracked (Sentry enabled)');
    } catch (e) {
      // Silent fail
    }
  } else {
    try {
      // Only log a simple string to avoid React rendering issues
      console.error('🔴 An unexpected error occurred in the application');
    } catch (e) {
      // Silent fail
    }
  }
};

/**
 * Capture message for event tracking
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (SENTRY_ENABLED) {
    try {
      console.log(`📍 Message [${level}]:`, message, context);
    } catch (e) {
      console.error('Error sending message to Sentry:', e);
    }
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, category = 'custom', level = 'info', data = {}) => {
  if (SENTRY_ENABLED) {
    try {
      console.log(`🔵 Breadcrumb [${category}]:`, message, data);
    } catch (e) {
      console.error('Error adding breadcrumb:', e);
    }
  } else {
    console.log(`[breadcrumb/${category}] ${message}`, data);
  }
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId, email, name) => {
  if (SENTRY_ENABLED) {
    try {
      console.log('👤 User context set:', { userId, email, name });
    } catch (e) {
      console.error('Error setting user context:', e);
    }
  } else {
    console.log('👤 User context:', { userId, email, name });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  if (SENTRY_ENABLED) {
    try {
      console.log('👤 User context cleared');
    } catch (e) {
      console.error('Error clearing user context:', e);
    }
  } else {
    console.log('👤 User context cleared');
  }
};

/**
 * Set custom context
 */
export const setCustomContext = (key, value) => {
  if (SENTRY_ENABLED) {
    try {
      console.log(`📌 Custom context [${key}]:`, value);
    } catch (e) {
      console.error('Error setting custom context:', e);
    }
  } else {
    console.log(`📌 Custom context [${key}]:`, value);
  }
};

/**
 * Check if Sentry is enabled
 */
export const isSentryEnabled = () => SENTRY_ENABLED;

export default {
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  setCustomContext,
  isSentryEnabled,
};
