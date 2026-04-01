import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

/**
 * ============================================================================
 * DASHBOARD DATA CACHE LAYER
 * ============================================================================
 * 
 * Server-side caching for dashboard read operations using Next.js built-in
 * unstable_cache. All functions use userId in cache key to prevent data leaks.
 * 
 * Cache Duration: 60 seconds (default)
 * Cache Strategy: Per-user isolation
 * Revalidation: Automatic after 60s or manual invalidation
 * 
 * ============================================================================
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get today's date at midnight (local timezone)
 */
function getTodayDateOnly() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Get yesterday's date at midnight (local timezone)
 */
function getYesterdayDateOnly() {
    const today = getTodayDateOnly();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

/**
 * Convert date object to local date string (YYYY-MM-DD)
 * Handles both Date objects and ISO strings
 */
function getLocalDateString(date) {
    // Handle string dates (ISO format)
    if (typeof date === 'string') {
        return date.split('T')[0]; // Extract YYYY-MM-DD from ISO string
    }

    // Handle Date objects
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ============================================================================
// CACHED DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch user profile with settings
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object with settings
 */
/**
 * Cache a user lookup by email (eliminates repeated `findUnique` in every API route)
 * Cached 5 minutes — revalidated on settings save / auth events
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object with essential fields
 */
export const getCachedUserByEmail = (email) =>
    unstable_cache(
        async () => {
            return prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    publicToken: true,
                    plan: true,
                    subscriptionStatus: true,
                    subscriptionEndDate: true,
                    trialEndDate: true,
                    onboarded: true,
                    createdAt: true,
                },
            });
        },
        // Include email in key so each user gets their own cache entry
        ["user-by-email", email],
        { revalidate: 300, tags: ["user-profile"] }
    )();

/**
 * Cache full user profile + settings for the /api/settings/me endpoint
 * @param {string} email - User email
 */
export const getCachedSettingsMe = (email) =>
    unstable_cache(
        async () => {
            return prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    publicToken: true,
                    plan: true,
                    subscriptionStatus: true,
                    subscriptionEndDate: true,
                    trialEndDate: true,
                    createdAt: true,
                    settings: true,
                },
            });
        },
        // Include email in key so each user gets their own cache entry
        ["settings-me", email],
        { revalidate: 300, tags: ["user-profile", "wallpaper-settings"] }
    )();

/**
 * Fetch user profile with settings (isolated per-user cache key)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object with settings
 */
const getCachedUserProfile = (userId) =>
    unstable_cache(
        async () => {
            return prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    publicToken: true,
                    plan: true,
                    subscriptionStatus: true,
                    subscriptionEndDate: true,
                    trialEndDate: true,
                    onboarded: true,
                    createdAt: true,
                    settings: true,
                },
            });
        },
        // Include userId in key so Next.js creates a per-user cache entry
        ["user-profile", userId],
        { revalidate: 300, tags: ["user-profile"] }
    )();

/**
 * Fetch all active habits for a user (only needed columns)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of habits with logs
 */
const getCachedHabits = (userId) =>
    unstable_cache(
        async () => {
            return prisma.habit.findMany({
                where: { userId, isActive: true },
                select: {
                    id: true,
                    title: true,
                    scheduledTime: true,
                    isActive: true,
                    createdAt: true,
                    logs: {
                        select: {
                            id: true,
                            date: true,
                            done: true,
                            habitId: true,
                        },
                    },
                },
                orderBy: { createdAt: "asc" },
            });
        },
        // Include userId in key so each user gets their own cache entry
        ["habits", userId],
        { revalidate: 300, tags: ["habits"] }
    )();

/**
 * Fetch all goals for a user with sub-goals
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of goals with sub-goals
 */
const getCachedGoals = (userId) =>
    unstable_cache(
        async () => {
            return prisma.goal.findMany({
                where: { userId },
                select: {
                    id: true,
                    title: true,
                    category: true,
                    description: true,
                    progress: true,
                    isCompleted: true,
                    targetDeadline: true,
                    createdAt: true,
                    subGoals: {
                        select: {
                            id: true,
                            title: true,
                            isCompleted: true,
                            createdAt: true,
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        },
        // Include userId in key so each user gets their own cache entry
        ["goals", userId],
        { revalidate: 300, tags: ["goals"] }
    )();

/**
 * Fetch all habit logs for a user (only needed columns)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of habit logs
 */
const getCachedHabitLogs = (userId) =>
    unstable_cache(
        async () => {
            return prisma.habitLog.findMany({
                where: { userId },
                select: {
                    id: true,
                    habitId: true,
                    date: true,
                    done: true,
                },
                orderBy: { date: "asc" },
            });
        },
        // Include userId in key so each user gets their own cache entry
        ["habit-logs", userId],
        { revalidate: 300, tags: ["habits", "habit-logs"] }
    )();

/**
 * Fetch all milestones for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of milestones
 */
const getCachedMilestones = (userId) =>
    unstable_cache(
        async () => {
            return prisma.milestone.findMany({
                where: { userId },
                select: {
                    id: true,
                    title: true,
                    age: true,
                    date: true,
                },
                orderBy: { date: "asc" },
            });
        },
        // Include userId in key so each user gets their own cache entry
        ["milestones", userId],
        { revalidate: 300, tags: ["milestones"] }
    )();

/**
 * Fetch wallpaper settings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Wallpaper settings
 */
const getCachedWallpaperSettings = (userId) =>
    unstable_cache(
        async () => {
            return prisma.wallpaperSettings.findFirst({
                where: { userId },
            });
        },
        // Include userId in key so each user gets their own cache entry
        ["wallpaper-settings", userId],
        { revalidate: 300, tags: ["wallpaper-settings"] }
    )();

// ============================================================================
// AGGREGATION & COMPUTATION FUNCTIONS (Non-cached helpers)
// ============================================================================

/**
 * Calculate streak metrics from habits and logs
 * @param {Array} habits - Active habits
 * @param {Array} logs - All habit logs
 * @returns {Object} Streak data { currentStreak, bestStreak }
 */
function calculateStreakMetrics(habits, logs) {
    const dateMap = new Map();
    const today = getTodayDateOnly();
    const yesterday = getYesterdayDateOnly();
    const todayStr = getLocalDateString(today);

    // Build dateMap from logs
    logs.forEach((log) => {
        const dateKey = getLocalDateString(log.date);
        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, []);
        }
        dateMap.get(dateKey).push(log);
    });

    if (habits.length === 0) {
        return { currentStreak: 0, bestStreak: 0 };
    }

    // Check if today is already fully complete (all habits done today)
    const todayLogs = dateMap.get(todayStr) || [];
    const todayCompleted = todayLogs.filter((log) => log.done).length;
    const todayFull = todayCompleted === habits.length;

    // Calculate current streak:
    // If today is fully complete, count back from today; otherwise count back from yesterday
    let currentStreak = 0;
    let checkDate = todayFull ? new Date(today) : new Date(yesterday);
    if (todayFull) currentStreak = 1; // today counts

    // Walk backwards from the day before start date
    let walkDate = new Date(checkDate);
    if (todayFull) walkDate.setDate(walkDate.getDate() - 1); // start checking from yesterday

    while (true) {
        const checkDateStr = getLocalDateString(walkDate);
        const logsForDate = dateMap.get(checkDateStr) || [];
        const completedForDate = logsForDate.filter((log) => log.done).length;

        if (completedForDate === habits.length) {
            currentStreak++;
            walkDate.setDate(walkDate.getDate() - 1);
        } else {
            break;
        }

        if (currentStreak > 365) break; // Safety
    }

    // Calculate best streak — must check date CONTINUITY (gaps break the streak)
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDateStr = null;

    const sortedDates = Array.from(dateMap.keys()).sort();

    sortedDates.forEach((dateKey) => {
        const logsForDate = dateMap.get(dateKey);
        const completedCount = logsForDate.filter((log) => log.done).length;

        if (completedCount === habits.length) {
            // Check if this date is exactly 1 day after the previous streak date
            if (prevDateStr !== null) {
                const prev = new Date(prevDateStr);
                const curr = new Date(dateKey);
                const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                if (diffDays !== 1) {
                    // Gap in dates — reset streak
                    tempStreak = 0;
                }
            }
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
            prevDateStr = dateKey;
        } else {
            tempStreak = 0;
            prevDateStr = null;
        }
    });

    return {
        currentStreak,
        bestStreak,
    };
}

/**
 * Calculate today's progress
 * @param {Array} logs - All habit logs
 * @param {Array} habits - Active habits
 * @returns {Object} Today's progress { todayCompleted, totalHabits, progressPercentage }
 */
function calculateTodayProgress(logs, habits) {
    const todayStr = getLocalDateString(getTodayDateOnly());
    // Use string comparison (safe for both ISO strings and Date objects)
    const todayLogs = logs.filter(
        (log) => getLocalDateString(log.date) === todayStr
    );
    const todayCompleted = todayLogs.filter((log) => log.done).length;
    const totalHabits = habits.length;
    const progressPercentage =
        totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

    return {
        todayCompleted,
        totalHabits,
        progressPercentage,
    };
}

/**
 * Calculate goal progress
 * @param {Array} goals - Goals with subGoals
 * @returns {Array} Goals with progress calculated
 */
function calculateGoalProgress(goals) {
    return goals.map((goal) => {
        const completed = goal.subGoals.filter((sg) => sg.isCompleted).length;
        const total = goal.subGoals.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            ...goal,
            progress,
            completedSubGoals: completed,
            totalSubGoals: total,
        };
    });
}

// ============================================================================
// MAIN DASHBOARD DATA FUNCTION
// ============================================================================

/**
 * Get complete dashboard data for a user (cached)
 * Combines habits, goals, logs, and computed metrics
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Complete dashboard data
 * 
 * PERFORMANCE NOTE:
 * - First call: Fetches from database (multiple queries)
 * - Subsequent calls within 60s: Returns cached result
 * - After 60s: Automatic revalidation on next request
 */
async function getDashboardData(userId) {
    try {
        // Fetch all data in parallel (these calls use cache internally)
        const [userProfile, habits, goals, logs, milestones, wallpaperSettings] =
            await Promise.all([
                getCachedUserProfile(userId),
                getCachedHabits(userId),
                getCachedGoals(userId),
                getCachedHabitLogs(userId),
                getCachedMilestones(userId),
                getCachedWallpaperSettings(userId),
            ]);

        // Calculate metrics (these are not cached, only database reads are)
        const streakMetrics = calculateStreakMetrics(habits, logs);
        const todayProgress = calculateTodayProgress(logs, habits);
        const goalsWithProgress = calculateGoalProgress(goals);

        return {
            user: userProfile,
            habits,
            goals: goalsWithProgress,
            logs,
            milestones,
            wallpaperSettings,
            streaks: streakMetrics,
            todayProgress,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`[Dashboard Cache] Error fetching data for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Get only habits list (cached)
 * Used by dedicated /api/habits endpoint
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Habits with logs
 */
async function getHabitsList(userId) {
    return getCachedHabits(userId);
}

/**
 * Get only goals list (cached)
 * Used by dedicated /api/goals endpoint
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Goals with sub-goals and calculated progress
 */
async function getGoalsList(userId) {
    const goals = await getCachedGoals(userId);
    return calculateGoalProgress(goals);
}

/**
 * Get only streak data (cached)
 * Used by dedicated /api/streaks endpoint
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Streak metrics
 */
async function getStreakData(userId) {
    const [habits, logs] = await Promise.all([
        getCachedHabits(userId),
        getCachedHabitLogs(userId),
    ]);

    return calculateStreakMetrics(habits, logs);
}

/**
 * Get only dashboard stats (cached)
 * Used by /api/dashboard/stats endpoint
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Today's progress and streak data
 */
async function getDashboardStats(userId) {
    const [habits, logs] = await Promise.all([
        getCachedHabits(userId),
        getCachedHabitLogs(userId),
    ]);

    const todayProgress = calculateTodayProgress(logs, habits);
    const streakMetrics = calculateStreakMetrics(habits, logs);

    return {
        todayProgress,
        streaks: streakMetrics,
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    getDashboardData,
    getHabitsList,
    getGoalsList,
    getStreakData,
    getDashboardStats,
    getCachedUserProfile,
    getCachedUserByEmail,
    getCachedSettingsMe,
    getCachedHabits,
    getCachedGoals,
    getCachedHabitLogs,
    getCachedMilestones,
    getCachedWallpaperSettings,
    calculateStreakMetrics,
    calculateTodayProgress,
    calculateGoalProgress,
};
