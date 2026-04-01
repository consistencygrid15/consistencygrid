/**
 * ============================================================================
 * CACHE INVALIDATION UTILITIES
 * ============================================================================
 * 
 * Helper functions for manual cache invalidation when data changes
 * Use these in mutation endpoints (POST, PUT, DELETE) to ensure fresh data
 * 
 * Usage:
 * - In POST /api/habits: Call invalidateDashboardCache(userId)
 * - In PUT /api/goals: Call invalidateDashboardCache(userId)
 * - In DELETE /api/reminders: Call invalidateDashboardCache(userId)
 * 
 * ============================================================================
 */

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Invalidate all dashboard-related caches for a user
 * Call this whenever user data is modified (habits, goals, logs, etc.)
 * 
 * @param {string} userId - User ID whose cache should be invalidated
 * 
 * Example:
 * ```javascript
 * const habit = await prisma.habit.create({ ... });
 * await invalidateDashboardCache(user.id);
 * return Response.json(habit);
 * ```
 */
export async function invalidateDashboardCache(userId) {
    try {
        // Revalidate all dashboard-related tags
        revalidateTag("user-profile");
        revalidateTag("habits");
        revalidateTag("goals");
        revalidateTag("habit-logs");
        revalidateTag("milestones");
        revalidateTag("wallpaper-settings");
        revalidateTag("reminders");
        revalidateTag("wallpaper-user");

        // Revalidate dashboard routes
        revalidatePath("/dashboard");
        revalidatePath("/api/dashboard/stats");
        revalidatePath("/api/habits");
        revalidatePath("/api/goals");
        revalidatePath("/api/streaks");

        console.log(`[Cache] Invalidated dashboard cache for user ${userId}`);
    } catch (error) {
        console.error("[Cache Invalidation] Error:", error);
        // Don't throw - cache invalidation is non-critical
    }
}

/**
 * Invalidate only habit-related caches
 * Use when creating, updating, or deleting habits
 * 
 * @param {string} userId - User ID
 */
export async function invalidateHabitsCache(userId) {
    try {
        revalidateTag("habits");
        revalidateTag("habit-logs");
        revalidatePath("/api/habits");
        revalidatePath("/api/streaks");
        revalidatePath("/api/dashboard/stats");
        console.log(`[Cache] Invalidated habits cache for user ${userId}`);
    } catch (error) {
        console.error("[Cache Invalidation] Error invalidating habits:", error);
    }
}

/**
 * Invalidate only goal-related caches
 * Use when creating, updating, or deleting goals
 * 
 * @param {string} userId - User ID
 */
export async function invalidateGoalsCache(userId) {
    try {
        revalidateTag("goals");
        revalidatePath("/api/goals");
        revalidatePath("/api/dashboard/stats");
        console.log(`[Cache] Invalidated goals cache for user ${userId}`);
    } catch (error) {
        console.error("[Cache Invalidation] Error invalidating goals:", error);
    }
}

/**
 * Invalidate user settings cache
 * Use when updating wallpaper settings or user profile
 * 
 * @param {string} userId - User ID
 */
export async function invalidateSettingsCache(userId) {
    try {
        revalidateTag("user-profile");
        revalidateTag("wallpaper-settings");
        revalidatePath("/api/settings/me");
        revalidatePath("/api/settings/save");
        console.log(`[Cache] Invalidated settings cache for user ${userId}`);
    } catch (error) {
        console.error("[Cache Invalidation] Error invalidating settings:", error);
    }
}

/**
 * Invalidate all caches (nuclear option)
 * Only use this when you're unsure which cache to invalidate
 * 
 * @param {string} userId - User ID (optional, for logging)
 */
export async function invalidateAllCaches(userId = "unknown") {
    try {
        revalidateTag("user-profile");
        revalidateTag("habits");
        revalidateTag("goals");
        revalidateTag("habit-logs");
        revalidateTag("milestones");
        revalidateTag("wallpaper-settings");

        revalidatePath("/dashboard");
        revalidatePath("/api");

        console.log(`[Cache] Cleared all caches for user ${userId}`);
    } catch (error) {
        console.error("[Cache Invalidation] Error clearing all caches:", error);
    }
}

/**
 * Invalidate only reminder-related caches
 * Use when creating, updating, or deleting reminders
 *
 * @param {string} userId - User ID
 */
export async function invalidateRemindersCache(userId) {
    try {
        revalidateTag("reminders");
        revalidatePath("/api/reminders");
        console.log(`[Cache] Invalidated reminders cache for user ${userId}`);
    } catch (error) {
        console.error("[Cache Invalidation] Error invalidating reminders:", error);
    }
}

export default {
    invalidateDashboardCache,
    invalidateHabitsCache,
    invalidateGoalsCache,
    invalidateSettingsCache,
    invalidateRemindersCache,
    invalidateAllCaches,
};
