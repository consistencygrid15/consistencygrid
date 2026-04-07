import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

// ─── Timezone helper ────────────────────────────────────────────────────────
// Default fallback (only used when the device doesn't send its timezone)
const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Format a Date object to a YYYY-MM-DD string in the given IANA timezone.
 * e.g. formatDateToDayString(new Date(), 'Asia/Kolkata') → '2026-03-27'
 */
function formatDateToDayString(date, timezone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone || DEFAULT_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return formatter.format(date);
}

function calculateWeeksBetween(startDate, endDate) {
    const millisecondsDiff = endDate.getTime() - startDate.getTime();
    return Math.floor(millisecondsDiff / (1000 * 60 * 60 * 24 * 7));
}

// ─── Cached data fetchers (per-token, 60s TTL) ──────────────────────────────

const getCachedWallpaperUser = async (token) =>
    prisma.user.findUnique({
        where: { publicToken: token },
        select: {
            id: true,
            name: true,
            plan: true,
            settings: true,
        },
    });

const getCachedWallpaperHabits = async (userId) =>
    prisma.habit.findMany({
        where: { userId, isActive: true },
        select: {
            id: true,
            title: true,
            scheduledTime: true,
            logs: {
                where: { done: true },
                select: { date: true },
            },
        },
    });

const getCachedWallpaperGoal = async (userId) => {
    // Try pinned goal first
    const pinned = await prisma.goal.findFirst({
        where: {
            userId,
            isCompleted: false,
            isPinned: true,
            category: { not: "LifeMilestone" },
        },
        select: {
            id: true,
            title: true,
            progress: true,
            isPinned: true,
            category: true,
            subGoals: {
                select: { id: true, isCompleted: true },
            },
        },
    });
    if (pinned) return [pinned];

    return prisma.goal.findMany({
        where: {
            userId,
            isCompleted: false,
            category: { not: "LifeMilestone" },
        },
        select: {
            id: true,
            title: true,
            progress: true,
            isPinned: true,
            category: true,
            subGoals: {
                select: { id: true, isCompleted: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
    });
};

const getCachedWallpaperReminders = async (userId) =>
    prisma.reminder.findMany({
        where: { userId, isActive: true },
        select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
            isFullDay: true,
            markerType: true,
            markerColor: true,
            markerIcon: true,
            priority: true,
            isImportant: true,
            isRecurring: true,
            recurrenceRule: true,
        },
        orderBy: [{ priority: "desc" }, { startDate: "asc" }],
    });

// ─── Route handler ──────────────────────────────────────────────────────────

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return new Response(JSON.stringify({ error: "Token required" }), { status: 400 });
        }

        // 1. Fetch cached user + settings
        const currentUser = await getCachedWallpaperUser(token);

        if (!currentUser) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const databaseSettings = currentUser.settings || {};

        // Helper to get setting value (query param overrides DB, useful for live preview)
        const getSettingValue = (key, defaultValue, type = "string") => {
            const queryParam = searchParams.get(key);
            if (queryParam !== null) {
                if (type === "boolean") return queryParam === "true";
                if (type === "number") return Number(queryParam);
                return queryParam;
            }
            return databaseSettings[key] !== undefined ? databaseSettings[key] : defaultValue;
        };

        const settings = {
            theme: getSettingValue("theme", "dark-minimal"),
            canvasWidth: getSettingValue("canvasWidth", 1080, "number"),
            canvasHeight: getSettingValue("canvasHeight", 2340, "number"),
            dateOfBirth: getSettingValue("dob", "2000-01-01"),
            lifeExpectancyYears: getSettingValue("lifeExpectancyYears", 80, "number"),
            yearGridMode: getSettingValue("yearGridMode", "weeks"),
            wallpaperType: getSettingValue("wallpaperType", "lockscreen"),
            showLifeGrid: getSettingValue("showLifeGrid", true, "boolean"),
            showYearGrid: getSettingValue("showYearGrid", true, "boolean"),
            showAgeStats: getSettingValue("showAgeStats", true, "boolean"),
            showQuote: getSettingValue("showQuote", true, "boolean"),
            quoteText: getSettingValue("quote", "Consistency is the only way"),
            goalEnabled: getSettingValue("goalEnabled", false, "boolean"),
            goalTitle: getSettingValue("goalTitle", ""),
            showHabitLayer: getSettingValue("showHabitLayer", true, "boolean"),
            customBackgroundUrl:
                currentUser.plan && currentUser.plan !== "free"
                    ? databaseSettings.customBackgroundUrl || null
                    : null,
        };

        // 2. Fetch habits, goal, reminders from cache (parallel)
        const [activeHabits, activeGoals, activeReminders] = await Promise.all([
            getCachedWallpaperHabits(currentUser.id),
            getCachedWallpaperGoal(currentUser.id),
            getCachedWallpaperReminders(currentUser.id),
        ]);

        // ─── Determine the device's current date ────────────────────────────────
        // Priority: 1) deviceDate sent from Android (most accurate, already in device local time)
        //           2) tz sent from Android → compute "now" in device timezone on server
        //           3) Default fallback timezone (web users, old app versions)
        const rawTz = searchParams.get("tz");
        const deviceDate = searchParams.get("deviceDate"); // YYYY-MM-DD in device local time

        // Validate the incoming timezone — fall back to default on invalid values
        let activeTimezone = DEFAULT_TIMEZONE;
        if (rawTz) {
            try {
                Intl.DateTimeFormat(undefined, { timeZone: rawTz }); // will throw if invalid
                activeTimezone = rawTz;
            } catch {
                console.warn(`[wallpaper-data] Invalid tz param: ${rawTz} — falling back to ${DEFAULT_TIMEZONE}`);
            }
        }

        const currentDate = new Date();
        // If the device sent its local date string, parse it to midnight UTC so it
        // stays aligned with the device's calendar even if the server is in a different TZ.
        const currentDayKey = deviceDate || formatDateToDayString(currentDate, activeTimezone);

        console.log(`[wallpaper-data] tz=${activeTimezone}, deviceDate=${deviceDate}, currentDayKey=${currentDayKey}`);


        // 3. Calculate stats (pure computation, no extra DB)
        const activityMap = {};
        activeHabits.forEach((habit) => {
            habit.logs.forEach((log) => {
                const dayKey = formatDateToDayString(log.date, activeTimezone);
                activityMap[dayKey] = (activityMap[dayKey] || 0) + 1;
            });
        });

        // Growth History (Last 7 days in device local time)
        const growthHistory = [];
        for (let offset = 6; offset >= 0; offset--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - offset);
            growthHistory.push(activityMap[formatDateToDayString(date, activeTimezone)] || 0);
        }

        // Today's Completion Percentage
        const todayCompletionPercentage =
            activeHabits.length > 0
                ? Math.round(((activityMap[currentDayKey] || 0) / activeHabits.length) * 100)
                : 0;

        // Calculate Streak (no DB — fully derived from cached activityMap)
        let currentStreak = 0;
        const todayLogged = (activityMap[currentDayKey] || 0) > 0;

        if (todayLogged) currentStreak++;

        let tempDate = new Date(currentDate);
        tempDate.setDate(tempDate.getDate() - 1);

        while (currentStreak <= 365) {
            const dayStr = formatDateToDayString(tempDate, activeTimezone);
            if ((activityMap[dayStr] || 0) > 0) {
                currentStreak++;
                tempDate.setDate(tempDate.getDate() - 1);
            } else {
                break;
            }
        }

        return new Response(
            JSON.stringify({
                meta: {
                    generatedAt: new Date().toISOString(),
                    timezone: activeTimezone,
                    version: "1.0.2",
                },
                user: {
                    name: currentUser.name,
                    settings,
                },
                stats: {
                    streak: currentStreak,
                    streakActiveToday: todayLogged,
                    todayCompletionPercentage,
                    growthHistory,
                    totalHabits: activeHabits.length,
                },
                data: {
                    activityMap,
                    habits: activeHabits,
                    goals: activeGoals,
                    reminders: activeReminders,
                },
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            }
        );
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
