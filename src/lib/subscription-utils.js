/**
 * Subscription Utilities
 * Centralized logic for handling feature access, limits, and subscription status
 * 
 * Platform-aware: Provides different upgrade URLs for web vs Android app
 */

import { getUpgradeUrl, openUpgradePage } from './platform-utils';

/**
 * Check if user can add a new habit
 * @param {Object} user - User object with subscription plan info
 * @returns {Object} { allowed: boolean, currentCount?: number, limit?: number, message?: string }
 */
export function canAddHabit(user) {
  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  // Check plan
  const isFreeUser = user.plan === "free" || !user.plan;
  const freeLimit = 3;

  if (isFreeUser) {
    // Count current habits (this should be passed or fetched separately)
    // For now, just return the limit info
    return {
      allowed: true,
      limit: freeLimit,
      isFreeUser: true,
      message: `You can add up to ${freeLimit} habits on the Free plan`,
    };
  }

  // Pro users have unlimited
  return {
    allowed: true,
    limit: null,
    isFreeUser: false,
    message: "Unlimited habits available",
  };
}

/**
 * Check if user can add a new goal
 * @param {Object} user - User object with subscription plan info
 * @returns {Object} { allowed: boolean, limit?: number, message?: string }
 */
export function canAddGoal(user) {
  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  const isFreeUser = user.plan === "free" || !user.plan;
  const freeLimit = 3;

  if (isFreeUser) {
    return {
      allowed: true,
      limit: freeLimit,
      isFreeUser: true,
      message: `You can create up to ${freeLimit} goals on the Free plan`,
    };
  }

  return {
    allowed: true,
    limit: null,
    isFreeUser: false,
    message: "Unlimited goals available",
  };
}

/**
 * Check if user can view history beyond 7 days
 * @param {Object} user - User object with subscription plan info
 * @param {Date} requestedDate - The date user is trying to view
 * @returns {Object} { allowed: boolean, maxDaysBack?: number, message?: string }
 */
export function canViewHistory(user, requestedDate) {
  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  const isFreeUser = user.plan === "free" || !user.plan;
  const freeHistoryDays = 7;

  if (isFreeUser) {
    // Check if requested date is within 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - freeHistoryDays * 24 * 60 * 60 * 1000);

    const requestedDateObj = new Date(requestedDate);
    const allowed = requestedDateObj >= sevenDaysAgo;

    return {
      allowed,
      maxDaysBack: freeHistoryDays,
      isFreeUser: true,
      message: allowed
        ? "Within your 7-day history view"
        : `Your current plan includes the last ${freeHistoryDays} days of history.`,
    };
  }

  return {
    allowed: true,
    maxDaysBack: null,
    isFreeUser: false,
    message: "Full history access available",
  };
}

/**
 * Check if user can access analytics
 * @param {Object} user - User object with subscription plan info
 * @returns {Object} { allowed: boolean, message?: string }
 */
export function canAccessAnalytics(user) {
  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  const isFreeUser = user.plan === "free" || !user.plan;

  if (isFreeUser) {
    return {
      allowed: false,
      isFreeUser: true,
      message: "Advanced analytics are available on higher-tier plans.",
      upgradeText: "View Available Plans",
    };
  }

  return {
    allowed: true,
    isFreeUser: false,
    message: "Analytics access available",
  };
}

/**
 * Get all feature access for a user
 * @param {Object} user - User object with subscription plan info
 * @returns {Object} Feature access map
 */
export function getFeatureAccess(user) {
  if (!user) {
    return {
      habits: { allowed: false, limit: 0 },
      goals: { allowed: false, limit: 0 },
      history: { allowed: false, maxDaysBack: 0 },
      analytics: { allowed: false },
      themes: { allowed: true, limit: 1 }, // At least 1 theme for free
      export: { allowed: false },
      aiSuggestions: { allowed: false },
      cloudSync: { allowed: false },
      reminders: { allowed: false },
    };
  }

  const isFreeUser = user.plan === "free" || !user.plan;

  return {
    habits: {
      allowed: true,
      limit: isFreeUser ? 3 : null,
      isFreeUser,
    },
    goals: {
      allowed: true,
      limit: isFreeUser ? 3 : null,
      isFreeUser,
    },
    history: {
      allowed: true,
      maxDaysBack: isFreeUser ? 7 : null,
      isFreeUser,
    },
    analytics: {
      allowed: !isFreeUser,
      isFreeUser,
    },
    themes: {
      allowed: true,
      limit: isFreeUser ? 1 : null, // Basic theme only for free
      isFreeUser,
    },
    export: {
      allowed: !isFreeUser,
      isFreeUser,
    },
    aiSuggestions: {
      allowed: !isFreeUser,
      isFreeUser,
    },
    cloudSync: {
      allowed: !isFreeUser,
      isFreeUser,
    },
    reminders: {
      allowed: !isFreeUser,
      isFreeUser,
    },
  };
}

/**
 * Check if user has active subscription (not expired trial)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function hasActiveSubscription(user) {
  if (!user) return false;

  // Free plan is always "active"
  if (user.plan === "free" || !user.plan) return true;

  // Testing plan never expires
  if (user.plan === "testing_plan") return true;

  const now = new Date();

  // Check subscription is active AND not expired
  if (user.subscriptionStatus === "active") {
    if (user.subscriptionEndDate) {
      return new Date(user.subscriptionEndDate) > now;
    }
    return true; // active with no end date = valid
  }

  // Check if trial is still valid
  if (user.trialEndDate) {
    return new Date(user.trialEndDate) > now;
  }

  return false;
}

/**
 * Get subscription status display text
 * @param {Object} user - User object
 * @returns {string}
 */
export function getSubscriptionStatus(user) {
  if (!user || user.plan === "free" || !user.plan) {
    return "Free Plan";
  }

  if (user.plan === "pro_monthly") {
    return "Pro (Monthly)";
  }

  if (user.plan === "pro_yearly") {
    return "Pro (Yearly)";
  }

  if (user.plan === "testing_plan") {
    return "Testing Plan";
  }

  return "Free Plan";
}

/**
 * Get days remaining in trial
 * @param {Object} user - User object
 * @returns {number|null} Days remaining, or null if no trial
 */
export function getTrialDaysRemaining(user) {
  if (!user || !user.trialEndDate) return null;

  const today = new Date();
  const trialEnd = new Date(user.trialEndDate);
  const daysRemaining = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));

  return daysRemaining > 0 ? daysRemaining : 0;
}

/**
 * Get subscription renewal date
 * @param {Object} user - User object
 * @returns {Date|null}
 */
export function getSubscriptionRenewalDate(user) {
  if (!user) return null;

  if (user.subscriptionEndDate) {
    return new Date(user.subscriptionEndDate);
  }

  if (user.trialEndDate) {
    return new Date(user.trialEndDate);
  }

  return null;
}

/**
 * Format feature limit message
 * @param {string} feature - Feature name (habits, goals, etc.)
 * @param {number} current - Current count
 * @param {number} limit - Limit
 * @returns {string}
 */
export function formatLimitMessage(feature, current, limit) {
  const remaining = limit - current;

  if (remaining <= 0) {
    return `You've reached the limit of ${limit} ${feature} on your current plan.`;
  }

  if (remaining === 1) {
    return `You have 1 ${feature.slice(0, -1)} slot remaining on your current plan.`;
  }

  return `You have ${remaining} ${feature} slots remaining.`;
}

/**
 * Get upgrade recommendation based on usage
 * @param {Object} user - User object with usage stats
 * @returns {Object} { type: string, message: string, urgency: 'low'|'medium'|'high' }
 */
export function getUpgradeRecommendation(user) {
  if (!user || user.plan !== "free") {
    return null;
  }

  // This would be called with additional usage data
  // For now, return null - implement based on actual usage patterns
  return null;
}

/**
 * Get platform-appropriate upgrade URL
 * Re-exported from platform-utils for convenience
 */
export { getUpgradeUrl, openUpgradePage };

export default {
  canAddHabit,
  canAddGoal,
  canViewHistory,
  canAccessAnalytics,
  getFeatureAccess,
  hasActiveSubscription,
  getSubscriptionStatus,
  getTrialDaysRemaining,
  getSubscriptionRenewalDate,
  formatLimitMessage,
  getUpgradeRecommendation,
  getUpgradeUrl,
  openUpgradePage,
};
