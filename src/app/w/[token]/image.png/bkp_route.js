import prisma from "@/lib/prisma";
import { createCanvas, registerFont } from "canvas";
import {
    drawBackground,
    drawDashboardHeader,
    drawStreakWidget,
    drawGrid,
    drawBottomSection,
    drawQuote,
    drawLifeHeader
} from "@/lib/wallpaper/components";
import path from "path";
import fs from "fs";

// 🔥 REGISTER FONTS FOR CANVAS - Critical for text rendering on Vercel
// Canvas library requires explicit font registration in Node.js environment
let fontRegistered = false;

try {
    // Path to the bundled font file
    // We explicitly trace this file in next.config.mjs
    const fontPath = path.join(process.cwd(), 'src', 'fonts', 'Inter-Regular.ttf');

    if (fs.existsSync(fontPath)) {
        // Register font for all common font families with proper weights
        // TRICK: Map Inter.ttf to 'Arial' so even if utils.js forces Arial, we get Inter!
        registerFont(fontPath, { family: 'Inter', weight: '400', style: 'normal' });
        registerFont(fontPath, { family: 'Inter', weight: '600', style: 'normal' });
        registerFont(fontPath, { family: 'Arial', weight: '400', style: 'normal' });
        registerFont(fontPath, { family: 'sans-serif', weight: '400', style: 'normal' });
        fontRegistered = true;
        console.log('✅ Font registered successfully from:', fontPath);
    } else {
        console.warn('⚠️ Font file missing at:', fontPath);
        // Fallback: Try to find any TTF file in current directory recursively (debug mostly)
        console.log('CWD contents:', fs.readdirSync(process.cwd()));
    }
} catch (error) {
    console.error('❌ Font registration failed:', error.message);
    console.error('Stack:', error.stack);
}

// 🔥 FORCE DYNAMIC RENDERING - Prevent static generation on Vercel
// This ensures wallpaper always shows real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function calculateWeeksBetween(startDate, endDate) {
    const millisecondsDiff = endDate.getTime() - startDate.getTime();
    return Math.floor(millisecondsDiff / (1000 * 60 * 60 * 24 * 7));
}

function formatDateToDayString(date) {
    // Convert to local date (not UTC) to match how logs are stored
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function GET(request, { params }) {
    const { token } = await params;

    // 1. Fetch User
    const currentUser = await prisma.user.findUnique({
        where: { publicToken: token },
        include: { settings: true },
    });

    if (!currentUser || !currentUser.settings) {
        return new Response("Wallpaper not found", { status: 404 });
    }

    // 2. Fetch Settings or Defaults
    const databaseSettings = currentUser.settings || {};
    const { searchParams } = new URL(request.url);

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
        canvasWidth: getSettingValue("width", 1080, "number"),
        canvasHeight: getSettingValue("height", 2340, "number"),
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
        goalStartDate: getSettingValue("goalStartDate", ""),
        goalDurationDays: getSettingValue("goalDurationDays", 30, "number"),

        showHabitLayer: getSettingValue("showHabitLayer", true, "boolean"),
    };

    const { canvasWidth, canvasHeight } = settings;

    // 3. Fetch Habits for Calculations
    const activeHabits = await prisma.habit.findMany({
        where: { userId: currentUser.id, isActive: true },
        include: { logs: true },
    });

    // 3.5. Fetch Pinned Active Goals (not completed and not life milestones)
    const pinnedGoals = await prisma.goal.findMany({
        where: {
            userId: currentUser.id,
            isCompleted: false,
            isPinned: true,
            category: { not: "LifeMilestone" }
        },
        include: { subGoals: true },
        take: 1
    });

    // If no pinned goals, fetch recent active goals as fallback
    const activeGoals = pinnedGoals.length > 0
        ? pinnedGoals
        : await prisma.goal.findMany({
            where: {
                userId: currentUser.id,
                isCompleted: false,
                category: { not: "LifeMilestone" }
            },
            include: { subGoals: true },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

    const activityMap = {};
    activeHabits.forEach(habit => {
        habit.logs.forEach(log => {
            // Only count logs marked as done
            if (log.done) {
                const dayKey = formatDateToDayString(log.date);
                activityMap[dayKey] = (activityMap[dayKey] || 0) + 1;
            }
        });
    });

    // Total habits for percentage calculation (needed for heatmap)
    const totalHabits = activeHabits.length || 1;

    const currentDate = new Date();
    const currentDayKey = formatDateToDayString(currentDate);

    // 4. Fetch Active Reminders
    const activeReminders = await prisma.reminder.findMany({
        where: {
            userId: currentUser.id,
            isActive: true
        },
        orderBy: [
            { priority: 'desc' },
            { startDate: 'asc' }
        ]
    });

    // Growth History (Last 7 days)
    const growthHistory = [];
    for (let offset = 6; offset >= 0; offset--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - offset);
        growthHistory.push(activityMap[formatDateToDayString(date)] || 0);
    }

    // Today's Completion Percentage
    const todayCompletionPercentage = activeHabits.length > 0
        ? Math.round(((activityMap[currentDayKey] || 0) / activeHabits.length) * 100)
        : 0;

    // --- DRAWING ---
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const canvasContext = canvas.getContext("2d");

    // 🔥 CRITICAL: Initialize canvas context for text rendering
    // Must set these BEFORE any drawing operations
    canvasContext.textBaseline = "top";
    canvasContext.textAlign = "left";
    canvasContext.direction = "ltr";

    // 🔥 CRITICAL: Set default font explicitly
    // This ensures text renders even if registerFont failed
    canvasContext.font = "16px Arial, Helvetica, sans-serif";
    canvasContext.fillStyle = "#ffffff";

    // Test if text rendering works
    try {
        const testMetrics = canvasContext.measureText("Test");
        if (testMetrics.width === 0) {
            console.error('❌ Text rendering not working - measureText returns 0');
        } else {
            console.log('✅ Text rendering working - test width:', testMetrics.width);
        }
    } catch (e) {
        console.error('❌ measureText failed:', e.message);
    }




    // ENHANCED THEMES - Optimized color palettes for better visual hierarchy and contrast
    const COLOR_THEMES = {
        "minimal-dark": {
            BG: "#09090b",              // Deep black for OLED optimization
            CARD: "#18181b",            // CHANGED: Slightly lighter for better card separation
            TEXT_MAIN: "#fafafa",       // CHANGED: Softer white to reduce eye strain
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast for readability
            ACCENT: "#ffffff",
            GRID_ACTIVE: "#ffffff",
            GRID_INACTIVE: "#27272a"
        },
        "sunset-orange": {
            BG: "#09090b",
            CARD: "#1a0f0a",            // CHANGED: Warm undertone for theme consistency
            TEXT_MAIN: "#fafafa",       // CHANGED: Better readability
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast
            ACCENT: "#ff8c42",          // CHANGED: Warmer, more vibrant orange
            GRID_ACTIVE: "#ff8c42",     // CHANGED: Matches accent
            GRID_INACTIVE: "#2a2019"    // CHANGED: Warm-tinted inactive state
        },
        "ocean-blue": {
            BG: "#09090b",
            CARD: "#0a1420",            // CHANGED: Cool blue undertone
            TEXT_MAIN: "#fafafa",       // CHANGED: Better readability
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast
            ACCENT: "#3b82f6",          // CHANGED: More vibrant, modern blue
            GRID_ACTIVE: "#3b82f6",     // CHANGED: Matches accent
            GRID_INACTIVE: "#1e293b"    // CHANGED: Blue-tinted inactive state
        },
        "forest-green": {
            BG: "#09090b",
            CARD: "#0a1410",            // CHANGED: Green undertone for cohesion
            TEXT_MAIN: "#fafafa",       // CHANGED: Better readability
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast
            ACCENT: "#10b981",          // CHANGED: Modern emerald green
            GRID_ACTIVE: "#10b981",     // CHANGED: Matches accent
            GRID_INACTIVE: "#1e2e25"    // CHANGED: Green-tinted inactive state
        },
        "purple-haze": {
            BG: "#09090b",
            CARD: "#150a1f",            // CHANGED: Purple undertone
            TEXT_MAIN: "#fafafa",       // CHANGED: Better readability
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast
            ACCENT: "#a855f7",
            GRID_ACTIVE: "#a855f7",
            GRID_INACTIVE: "#2a1f3d"    // CHANGED: Purple-tinted inactive state
        },
        "monochrome": {
            BG: "#ffffff",
            CARD: "#f8f9fa",            // CHANGED: Cleaner white with subtle warmth
            TEXT_MAIN: "#0a0a0a",       // CHANGED: True black for maximum contrast
            TEXT_SUB: "#6b7280",        // CHANGED: Better mid-tone gray
            ACCENT: "#0a0a0a",          // CHANGED: Matches text main
            GRID_ACTIVE: "#0a0a0a",     // CHANGED: Matches accent
            GRID_INACTIVE: "#e5e7eb"    // CHANGED: Softer inactive state
        },
        "dark-minimal": {
            BG: "#09090b",
            CARD: "#18181b",            // CHANGED: Better card separation
            TEXT_MAIN: "#fafafa",       // CHANGED: Softer white
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast
            ACCENT: "#ffffff",
            GRID_ACTIVE: "#ffffff",
            GRID_INACTIVE: "#27272a"
        },
        "orange-glow": {
            BG: "#09090b",
            CARD: "#1a0f0a",            // CHANGED: Warm undertone
            TEXT_MAIN: "#fafafa",       // CHANGED: Better readability
            TEXT_SUB: "#a1a1aa",        // CHANGED: Improved contrast
            ACCENT: "#fb923c",          // CHANGED: Softer, glowing orange
            GRID_ACTIVE: "#fb923c",     // CHANGED: Matches accent
            GRID_INACTIVE: "#2a2019"    // CHANGED: Warm-tinted inactive
        },
    };
    const activeTheme = COLOR_THEMES[settings.theme] || COLOR_THEMES["minimal-dark"];

    // ENHANCED LAYOUT - Improved spacing and proportions for better visual balance
    const horizontalMargin = canvasWidth * 0.08;
    const contentWidth = canvasWidth - (horizontalMargin * 2);

    // CHANGED: Dynamic vertical start based on wallpaper type for optimal spacing
    let verticalCursorY = settings.wallpaperType === "lockscreen"
        ? canvasHeight * 0.35  // More space for lock screen clock
        : canvasHeight * 0.12; // Less space for home screen

    // Calculate Life Progress
    const birthDate = new Date(settings.dateOfBirth);
    const lifeExpectancyMs = settings.lifeExpectancyYears * 365.25 * 24 * 60 * 60 * 1000;
    const ageMs = currentDate - birthDate;
    const lifeProgressPercent = Math.min(100, Math.max(0, (ageMs / lifeExpectancyMs) * 100));

    // 1. Background - Draw first for proper layering
    drawBackground(canvasContext, canvasWidth, canvasHeight, activeTheme);

    // Life Header (In the notch area above the clock)
    drawLifeHeader(canvasContext, {
        canvasWidth,
        theme: activeTheme,
        progress: lifeProgressPercent
    });

    // Calculate Streak
    let currentStreak = 0;
    let tempDate = new Date(currentDate);
    // If today has activity, start counting
    const todayLogged = (activityMap[formatDateToDayString(tempDate)] || 0) > 0;

    if (todayLogged) {
        currentStreak++;
    }

    // Reset tempDate to scan backwards from yesterday
    tempDate = new Date(currentDate);
    tempDate.setDate(tempDate.getDate() - 1);

    while ((activityMap[formatDateToDayString(tempDate)] || 0) > 0) {
        currentStreak++;
        tempDate.setDate(tempDate.getDate() - 1);
    }

    // 2. Dashboard Header - Conditional rendering with proper spacing
    if (settings.showAgeStats) {
        // Draw Streak Widget (Top Right) - Independent of Header Layout
        drawStreakWidget(canvasContext, {
            x: horizontalMargin + contentWidth,
            y: verticalCursorY - 60, // Moved up to separate from header
            theme: activeTheme,
            streak: currentStreak,
            streakActiveToday: todayLogged
        });

        const headerHeight = drawDashboardHeader(canvasContext, {
            xCoordinate: horizontalMargin,
            yCoordinate: verticalCursorY,
            width: contentWidth,
            theme: activeTheme,
            history: growthHistory,
            todayPercent: todayCompletionPercentage,
            streak: currentStreak,
            streakActiveToday: todayLogged // Pass streak status
        });
        verticalCursorY += headerHeight + 40; // CHANGED: Added consistent spacing after header
    } else {
        verticalCursorY += 80; // CHANGED: Reduced spacing when header is hidden
    }

    // 3. Main Grid & Bottom Section Logic
    // CHANGED: Implementing conditional layout based on grid mode
    let gridHeight = 0;

    if (settings.yearGridMode === "life") {
        // --- SIDE-BY-SIDE LAYOUT FOR LIFE GRID ---
        // Life grid uses 60% width on the left, Habits/Goals stacked on the right

        const gridWidth = contentWidth * 0.60;
        const sideGap = contentWidth * 0.05;
        const sidebarWidth = contentWidth - gridWidth - sideGap;
        const sidebarX = horizontalMargin + gridWidth + sideGap;
        const sectionStartY = verticalCursorY;

        // Draw Life Grid (Left Column)
        gridHeight = drawGrid(canvasContext, {
            xCoordinate: horizontalMargin,
            yCoordinate: verticalCursorY,
            width: gridWidth,
            height: canvasHeight,
            theme: activeTheme,
            themeName: settings.theme,
            mode: settings.yearGridMode,
            dob: settings.dateOfBirth,
            lifeExpectancy: settings.lifeExpectancyYears,
            activityMap: activityMap,
            totalHabits: totalHabits,
            reminders: activeReminders,
            now: currentDate
        });

        // Draw Habits & Goals (Right Column - Stacked)
        const sidebarHeight = canvasHeight - verticalCursorY - 120; // Space for quote

        drawBottomSection(canvasContext, {
            xCoordinate: sidebarX,
            yCoordinate: sectionStartY, // Align with top of grid
            width: sidebarWidth,
            height: sidebarHeight,
            theme: activeTheme,
            habits: activeHabits,
            goals: activeGoals,
            settings: settings,
            reminders: activeReminders,
            nowDay: currentDayKey,
            now: currentDate,
            isStacked: true,
            streak: currentStreak
        });

        // Update cursor for consistent flow (though Quote is fixed bottom)
        verticalCursorY += gridHeight + 40;

    } else {
        // --- STANDARD VERTICAL STACK FOR OTHER MODES ---

        // 3. Main Grid
        gridHeight = drawGrid(canvasContext, {
            xCoordinate: horizontalMargin,
            yCoordinate: verticalCursorY,
            width: contentWidth,
            height: canvasHeight,
            theme: activeTheme,
            themeName: settings.theme,
            mode: settings.yearGridMode,
            dob: settings.dateOfBirth,
            lifeExpectancy: settings.lifeExpectancyYears,
            activityMap: settings.showHabitLayer ? activityMap : {},
            totalHabits: totalHabits,
            reminders: activeReminders,
            now: currentDate
        });
        verticalCursorY += gridHeight + 40;

        // 4. Bottom Section
        const remainingHeight = canvasHeight - verticalCursorY - 120; // Leave space for quote

        // (Use pre-calculated streak)

        drawBottomSection(canvasContext, {
            xCoordinate: horizontalMargin,
            yCoordinate: verticalCursorY,
            width: contentWidth,
            height: remainingHeight,
            theme: activeTheme,
            habits: settings.showHabitLayer ? activeHabits : [],
            goals: activeGoals,
            settings: settings,
            reminders: activeReminders,
            nowDay: currentDayKey,
            now: currentDate,
            streak: currentStreak, // Pass calculated streak
            isStacked: false
        });
    }

    // 5. Quote - Positioned at bottom with optimal spacing
    if (settings.showQuote) {
        drawQuote(canvasContext, {
            xCoordinate: horizontalMargin,
            yCoordinate: canvasHeight - 120, // CHANGED: Fixed bottom position
            width: contentWidth,              // CHANGED: Use content width for proper margins
            height: 100,                      // CHANGED: Fixed height for quote section
            theme: activeTheme,
            quote: settings.quoteText
        });
    }

    // 6. AD Placeholder (Optional - Commented out)
    // DESIGN NOTE: If enabled, position above quote section
    // drawAdPlaceholder(canvasContext, {
    //     xCoordinate: horizontalMargin,
    //     yCoordinate: canvasHeight - 200,  // CHANGED: Fixed position above quote
    //     width: contentWidth,               // CHANGED: Full content width
    //     height: 60,
    //     theme: activeTheme
    // });

    // OPTIMIZATION: Enable smoothing for better image quality
    canvasContext.imageSmoothingEnabled = true;
    canvasContext.imageSmoothingQuality = 'high';

    return new Response(canvas.toBuffer("image/png"), {
        headers: {
            "Content-Type": "image/png",
            // NO CACHE: Wallpaper must always show current data
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    });
}