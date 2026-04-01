/**
 * Middleware helper for subscription validation
 * 
 * All user-facing messages use neutral language that works across
 * both web and Android platforms without triggering policy concerns.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";

/**
 * Check user subscription and return feature access
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User with subscription details
 */
export async function getUserSubscription(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      subscriptionStatus: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      trialEndDate: true,
      _count: {
        select: {
          habits: true,
          goals: true,
        },
      },
    },
  });

  return user;
}

/**
 * Check if user can create more habits
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { canCreate: boolean, currentCount: number, limit: number|null, message: string }
 */
export async function checkHabitLimit(userId) {
  const user = await getUserSubscription(userId);

  if (!user) {
    return {
      canCreate: false,
      message: "User not found",
    };
  }

  const isFreeUser = user.plan === "free" || !user.plan;
  const habitLimit = 3;

  if (isFreeUser && user._count.habits >= habitLimit) {
    return {
      canCreate: false,
      currentCount: user._count.habits,
      limit: habitLimit,
      message: `You've reached the habit limit (${habitLimit}) on your current plan.`,
    };
  }

  return {
    canCreate: true,
    currentCount: user._count.habits,
    limit: isFreeUser ? habitLimit : null,
    message: isFreeUser
      ? `You have ${habitLimit - user._count.habits} habit slots remaining.`
      : "Unlimited habits available.",
  };
}

/**
 * Check if user can create more goals
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { canCreate: boolean, currentCount: number, limit: number|null, message: string }
 */
export async function checkGoalLimit(userId) {
  const user = await getUserSubscription(userId);

  if (!user) {
    return {
      canCreate: false,
      message: "User not found",
    };
  }

  const isFreeUser = user.plan === "free" || !user.plan;
  const goalLimit = 3;

  if (isFreeUser && user._count.goals >= goalLimit) {
    return {
      canCreate: false,
      currentCount: user._count.goals,
      limit: goalLimit,
      message: `You've reached the goal limit (${goalLimit}) on your current plan.`,
    };
  }

  return {
    canCreate: true,
    currentCount: user._count.goals,
    limit: isFreeUser ? goalLimit : null,
    message: isFreeUser
      ? `You have ${goalLimit - user._count.goals} goal slots remaining.`
      : "Unlimited goals available.",
  };
}

/**
 * Check if user can access feature (generic)
 * @param {string} userId - User ID
 * @param {string} feature - Feature name (analytics, export, etc.)
 * @returns {Promise<Object>} { allowed: boolean, reason?: string }
 */
export async function checkFeatureAccess(userId, feature) {
  const user = await getUserSubscription(userId);

  if (!user) {
    return {
      allowed: false,
      reason: "User not found",
    };
  }

  const isFreeUser = user.plan === "free" || !user.plan;

  // Features restricted to paid plans only
  const proOnlyFeatures = [
    "analytics",
    "ai_suggestions",
    "export",
    "cloud_sync",
    "reminders",
    "custom_background",
  ];

  if (isFreeUser && proOnlyFeatures.includes(feature)) {
    return {
      allowed: false,
      reason: `This feature is not available on your current plan.`,
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Validate subscription is still active
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function isSubscriptionActive(userId) {
  const user = await getUserSubscription(userId);

  if (!user) return false;

  // Free plan is always active
  if (user.plan === "free" || !user.plan) return true;

  // Check if subscription status is active
  if (user.subscriptionStatus === "active") {
    // Check if not expired
    if (user.subscriptionEndDate) {
      return new Date() < new Date(user.subscriptionEndDate);
    }
    return true;
  }

  // Check trial status
  if (user.trialEndDate) {
    return new Date() < new Date(user.trialEndDate);
  }

  return false;
}

/**
 * API response helpers for subscription errors
 * 
 * Messages use neutral, platform-safe language:
 * - No "Upgrade to Pro" or "Subscribe" wording
 * - No pricing information
 * - Focus on plan limits rather than upselling
 */
export const SubscriptionErrors = {
  HABIT_LIMIT_REACHED: {
    status: 403,
    code: "HABIT_LIMIT_REACHED",
    message: "You've reached the maximum habits for your current plan.",
  },
  GOAL_LIMIT_REACHED: {
    status: 403,
    code: "GOAL_LIMIT_REACHED",
    message: "You've reached the maximum goals for your current plan.",
  },
  FEATURE_LOCKED: {
    status: 403,
    code: "FEATURE_LOCKED",
    message: "This feature is not available on your current plan.",
  },
  SUBSCRIPTION_EXPIRED: {
    status: 403,
    code: "SUBSCRIPTION_EXPIRED",
    message: "Your current plan has expired. Please renew to continue using this feature.",
  },
};

export default {
  getUserSubscription,
  checkHabitLimit,
  checkGoalLimit,
  checkFeatureAccess,
  isSubscriptionActive,
  SubscriptionErrors,
};
