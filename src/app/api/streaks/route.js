import { getUniversalSession } from "@/lib/getAndroidAuth";
import { getCachedUserByEmail, getStreakData, getCachedHabits, getCachedHabitLogs, getCachedMilestones } from "@/lib/dashboard-cache";

/**
 * GET /api/streaks
 *
 * Fetch streak data (current and best streaks) and raw data for heatmap visualization.
 * All data sourced from server-side cache — avoids raw DB queries on every call.
 *
 * Cache duration: 5 minutes (see dashboard-cache.js)
 */
export async function GET() {
    const session = await getUniversalSession();

    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Cached user lookup — no raw DB call
    const user = await getCachedUserByEmail(session.user.email);

    if (!user) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    try {
        // All calls are cached via unstable_cache — will hit DB only every 5 minutes
        const [streaks, habits, logs, milestones] = await Promise.all([
            getStreakData(user.id),
            getCachedHabits(user.id),
            getCachedHabitLogs(user.id),
            getCachedMilestones(user.id),
        ]);

        // Ensure dates are properly formatted for frontend
        const formattedLogs = logs.map(log => ({
            ...log,
            date: log.date instanceof Date ? log.date.toISOString() : log.date,
        }));

        return Response.json(
            {
                currentStreak: streaks.currentStreak || 0,
                bestStreak: streaks.bestStreak || 0,
                totalCompletedDays: formattedLogs.filter(l => l.done).length || 0,
                habits: habits || [],
                logs: formattedLogs || [],
                milestones: (milestones || []).map(m => ({
                    title: m.title,
                    days: m.age || 0,
                    unlocked: m.age <= (streaks.currentStreak || 0),
                })),
            },
            {
                headers: {
                    // Browser: cache 60s, CDN: allow stale for 5 min
                    "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
                },
            }
        );
    } catch (error) {
        console.error("Error fetching streaks:", error);
        return Response.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
