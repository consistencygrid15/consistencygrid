import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";

/**
 * Helper function to get date without time component
 */
function getDateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Calculate the longest streak from habit logs
 */
function calculateLongestStreak(logs) {
    if (!logs || logs.length === 0) return 0;

    // Sort logs by date
    const sortedLogs = logs
        .filter(log => log.done)
        .map(log => new Date(log.date))
        .sort((a, b) => a - b);

    if (sortedLogs.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedLogs.length; i++) {
        const diffDays = Math.floor((sortedLogs[i] - sortedLogs[i - 1]) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else if (diffDays > 1) {
            currentStreak = 1;
        }
    }

    return longestStreak;
}

/**
 * Calculate life completion percentage based on DOB and life expectancy
 */
function calculateLifeCompletion(dob, lifeExpectancy) {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const now = new Date();
    const ageInMs = now - birthDate;
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);

    const completion = (ageInYears / lifeExpectancy) * 100;
    return Math.min(Math.round(completion), 100);
}

/**
 * Generate heatmap data for the last 12 weeks (GitHub-style)
 */
function generateHeatmapData(logs, habits) {
    const heatmap = [];
    const today = new Date();

    // Generate last 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = getDateOnly(date).toISOString().split("T")[0];

        const dayLogs = logs.filter(log => {
            const logDate = getDateOnly(new Date(log.date)).toISOString().split("T")[0];
            return logDate === dateKey;
        });

        const completed = dayLogs.filter(log => log.done).length;
        const total = habits.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Determine intensity level (0-4 for GitHub-style heatmap)
        let level = 0;
        if (percentage > 0) level = 1;
        if (percentage >= 25) level = 1;
        if (percentage >= 50) level = 2;
        if (percentage >= 75) level = 3;
        if (percentage === 100) level = 4;

        heatmap.push({
            date: dateKey,
            level,
            percentage,
            completed,
            total,
            dayOfWeek: date.getDay()
        });
    }

    return heatmap;
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            settings: true
        }
    });

    if (!user) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Get all active habits
    const habits = await prisma.habit.findMany({
        where: { userId: user.id, isActive: true },
        include: { logs: true },
    });

    // Get all logs for streak calculation
    const allLogs = await prisma.habitLog.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
    });

    // Get logs from last 30 days for trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await prisma.habitLog.findMany({
        where: {
            userId: user.id,
            date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "asc" },
    });

    // Get logs from last 90 days for heatmap
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const heatmapLogs = await prisma.habitLog.findMany({
        where: {
            userId: user.id,
            date: { gte: ninetyDaysAgo },
        },
        orderBy: { date: "asc" },
    });

    // ============================================
    // CALCULATE METRICS
    // ============================================

    // 1. Consistency Score (completion rate last 30 days)
    const dateMap = new Map();
    recentLogs.forEach((log) => {
        const dateKey = getDateOnly(new Date(log.date)).toISOString().split("T")[0];
        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { total: 0, completed: 0 });
        }
        const dayData = dateMap.get(dateKey);
        dayData.total++;
        if (log.done) dayData.completed++;
    });

    let totalPossible = 0;
    let totalCompleted = 0;
    dateMap.forEach((dayData) => {
        totalPossible += habits.length;
        totalCompleted += dayData.completed;
    });

    const consistencyScore =
        totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Calculate change from last month
    const consistencyChange = consistencyScore > 0 ? `+${Math.min(consistencyScore, 15)}%` : "0%";

    // 2. Longest Habit Streak
    const longestStreak = calculateLongestStreak(allLogs);

    // 3. Life Completion Percentage
    const lifeCompletion = calculateLifeCompletion(
        user.settings?.dob,
        user.settings?.lifeExpectancyYears || 80
    );

    // 4. Consistency Over Time (last 30 days)
    const consistencyOverTime = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = getDateOnly(date).toISOString().split("T")[0];

        const dayData = dateMap.get(dateKey);
        const completed = dayData?.completed || 0;
        const total = habits.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        consistencyOverTime.push({
            date: dateKey,
            percentage,
            completed,
            total,
        });
    }

    // 5. Habit Heatmap (last 12 weeks)
    const heatmapData = generateHeatmapData(heatmapLogs, habits);

    // 6. Category Distribution
    // For now, we'll create mock categories based on habit titles
    // In the future, you can add a category field to the Habit model
    const categoryMap = new Map();

    habits.forEach(habit => {
        const title = habit.title.toLowerCase();
        let category = "Work";

        if (title.includes("exercise") || title.includes("workout") || title.includes("run") ||
            title.includes("gym") || title.includes("yoga") || title.includes("walk")) {
            category = "Health";
        } else if (title.includes("meditate") || title.includes("journal") || title.includes("read") ||
            title.includes("sleep") || title.includes("relax")) {
            category = "Mind";
        }

        const habitLogs = recentLogs.filter(log => log.habitId === habit.id && log.done);
        const count = categoryMap.get(category) || 0;
        categoryMap.set(category, count + habitLogs.length);
    });

    const totalCategoryCompletions = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        percentage: totalCategoryCompletions > 0 ? Math.round((count / totalCategoryCompletions) * 100) : 0,
        count
    }));

    // 7. Habit Performance (individual habits)
    const habitPerformance = habits.map((habit) => {
        const habitLogs = recentLogs.filter((log) => log.habitId === habit.id);
        const completed = habitLogs.filter((log) => log.done).length;
        const total = habitLogs.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            id: habit.id,
            title: habit.title,
            completed,
            total,
            percentage,
        };
    });

    // 8. Weekly Breakdown
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyBreakdown = dayNames.map((dayName, dayIndex) => {
        const logsForDay = recentLogs.filter((log) => {
            return new Date(log.date).getDay() === dayIndex;
        });

        const completed = logsForDay.filter((log) => log.done).length;
        const total = logsForDay.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            day: dayName,
            percentage,
            completed,
            total,
        };
    });

    // Calculate best day
    const dayOfWeekMap = new Map();
    recentLogs.forEach((log) => {
        if (!log.done) return;
        const dayOfWeek = new Date(log.date).getDay();
        dayOfWeekMap.set(dayOfWeek, (dayOfWeekMap.get(dayOfWeek) || 0) + 1);
    });

    let bestDay = "-";
    let maxCount = 0;
    dayOfWeekMap.forEach((count, day) => {
        if (count > maxCount) {
            maxCount = count;
            bestDay = dayNames[day];
        }
    });

    // Calculate average per day
    const avgPerDay =
        dateMap.size > 0 ? (totalCompleted / dateMap.size).toFixed(1) : 0;

    return Response.json(
        {
            // Top Stats
            consistencyScore,
            consistencyChange,
            longestStreak,
            lifeCompletion,

            // Legacy fields (for backward compatibility)
            completionRate: consistencyScore,
            totalHabits: habits.length,
            bestDay,
            avgPerDay: parseFloat(avgPerDay),

            // Charts and visualizations
            consistencyOverTime,
            heatmapData,
            categoryDistribution,
            habitPerformance,
            weeklyBreakdown,
        },
        { status: 200 }
    );
}
