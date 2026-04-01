import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { invalidateSettingsCache } from "@/lib/cache-invalidation";
import { getRateLimitErrorResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req) {
    const session = await getUniversalSession();

    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!dbUser) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Check rate limit
    const rateLimitError = getRateLimitErrorResponse(dbUser.id, "settingsSave", RATE_LIMITS.settingsSave);
    if (rateLimitError) return rateLimitError;

    const body = await req.json();

    const {
        dob, lifeExpectancyYears, theme, width, height,
        showLifeGrid, showYearGrid, showAgeStats, showQuote, quote,
        goalEnabled, goalTitle, goalStartDate, goalDurationDays, goalUnit,
        yearGridMode, wallpaperType, showMissedDays, showHabitLayer, showLegend,
        customBackgroundUrl
    } = body;

    if (!dob) {
        return Response.json(
            { message: "Date of Birth is required" },
            { status: 400 }
        );
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
        return Response.json(
            { message: "Invalid Date of Birth" },
            { status: 400 }
        );
    }

    const saved = await prisma.wallpaperSettings.upsert({
        where: { userId: dbUser.id },
        update: {
            dob: new Date(dob),
            lifeExpectancyYears: Number(lifeExpectancyYears || 80),
            theme: theme || "dark-minimal",
            width: Number(width || 1080),
            height: Number(height || 2400),

            yearGridMode: yearGridMode || "weeks",
            wallpaperType: wallpaperType || "lockscreen",

            showLifeGrid: Boolean(showLifeGrid),
            showYearGrid: Boolean(showYearGrid),
            showAgeStats: Boolean(showAgeStats),

            showMissedDays: Boolean(showMissedDays),
            showHabitLayer: Boolean(showHabitLayer),
            showLegend: Boolean(showLegend),

            showQuote: Boolean(showQuote),
            quote: quote || null,

            goalEnabled: Boolean(goalEnabled),
            goalTitle: goalTitle || null,
            goalStartDate: goalStartDate ? new Date(goalStartDate) : null,
            goalDurationDays: goalDurationDays ? Number(goalDurationDays) : null,
            goalUnit: goalUnit || null,

            // Only update customBackgroundUrl if explicitly provided in request
            ...(customBackgroundUrl !== undefined && { customBackgroundUrl: customBackgroundUrl || null }),
        },
        create: {
            userId: dbUser.id,
            dob: new Date(dob),
            lifeExpectancyYears: Number(lifeExpectancyYears || 80),
            theme: theme || "dark-minimal",
            width: Number(width || 1080),
            height: Number(height || 2400),

            yearGridMode: yearGridMode || "weeks",
            wallpaperType: wallpaperType || "lockscreen",

            showLifeGrid: Boolean(showLifeGrid),
            showYearGrid: Boolean(showYearGrid),
            showAgeStats: Boolean(showAgeStats),

            showMissedDays: Boolean(showMissedDays),
            showHabitLayer: Boolean(showHabitLayer),
            showLegend: Boolean(showLegend),

            showQuote: Boolean(showQuote),
            quote: quote || null,

            goalEnabled: Boolean(goalEnabled),
            goalTitle: goalTitle || null,
            goalStartDate: goalStartDate ? new Date(goalStartDate) : null,
            goalDurationDays: goalDurationDays ? Number(goalDurationDays) : null,
            goalUnit: goalUnit || null,
        },
    });

    await invalidateSettingsCache(dbUser.id);
    return Response.json({ message: "Saved", settings: saved }, { status: 200 });
}
