// Entry point for Android Native local wallpaper renderer

import { 
    drawBackground, 
    loadBackgroundImage, 
    drawDashboardHeader, 
    drawGrid, 
    drawQuote, 
    drawStreakWidget, 
    drawLifeHeader,
    drawBottomSection 
} from './src/components/wallpaper/ClientCanvas.js';

window.renderOfflineData = async (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        await performRender(data);
    } catch (err) {
        console.error('Render failed:', err);
        if (window.Android && window.Android.saveWallpaper) {
            window.Android.saveWallpaper('');
        }
    }
};

window.forceWallpaperRender = async () => {
    // Fallback: If Android doesn't inject payload, Android can also call window.Android.getOfflinePayload();
    if (window.Android && window.Android.getOfflinePayload) {
        const payload = window.Android.getOfflinePayload();
        await window.renderOfflineData(payload);
    }
};

// Expose onPageReady ping since Android waits for it
window.onload = () => {
    if (window.Android && window.Android.onPageReady) {
        window.Android.onPageReady();
    }
};

function getThemeColors(themeName) {
    const themes = {
        "minimal-dark": { BG: "#09090b", CARD: "#18181b", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#ffffff", GRID_ACTIVE: "#ffffff", GRID_INACTIVE: "#27272a" },
        "dark-minimal": { BG: "#09090b", CARD: "#18181b", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#ffffff", GRID_ACTIVE: "#ffffff", GRID_INACTIVE: "#27272a" },
        "sunset-orange": { BG: "#09090b", CARD: "#1a0f0a", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#ff8c42", GRID_ACTIVE: "#ff8c42", GRID_INACTIVE: "#2a2019" },
        "ocean-blue": { BG: "#09090b", CARD: "#0f172a", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#3b82f6", GRID_ACTIVE: "#3b82f6", GRID_INACTIVE: "#1e293b" },
        "forest-green": { BG: "#09090b", CARD: "#064e3b", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#10b981", GRID_ACTIVE: "#10b981", GRID_INACTIVE: "#065f46" },
        "purple-haze": { BG: "#09090b", CARD: "#2e1065", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#8b5cf6", GRID_ACTIVE: "#8b5cf6", GRID_INACTIVE: "#4c1d95" },
        "orange-glow": { BG: "#09090b", CARD: "#1a0f0a", TEXT_MAIN: "#fafafa", TEXT_SUB: "#a1a1aa", ACCENT: "#ff8c42", GRID_ACTIVE: "#ff8c42", GRID_INACTIVE: "#2a2019" },
        "monochrome": { BG: "#ffffff", CARD: "#f4f4f5", TEXT_MAIN: "#09090b", TEXT_SUB: "#71717a", ACCENT: "#09090b", GRID_ACTIVE: "#09090b", GRID_INACTIVE: "#e4e4e7" },
        "white-clean": { BG: "#ffffff", CARD: "#f4f4f5", TEXT_MAIN: "#09090b", TEXT_SUB: "#71717a", ACCENT: "#09090b", GRID_ACTIVE: "#09090b", GRID_INACTIVE: "#e4e4e7" },
    };
    return themes[themeName] || themes["dark-minimal"];
}

async function performRender(data) {
    const canvas = document.getElementById('wallpaperCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const { settings = {} } = data.user || data;
    
    // Set initial canvas size from data
    canvas.width = settings.canvasWidth || settings.width || 1080;
    canvas.height = settings.canvasHeight || settings.height || 2340;

    const ctx = canvas.getContext('2d');

    // Wait for fonts if any are loaded remotely
    if (document.fonts) {
        await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 2000))
        ]);
    }

    const theme = getThemeColors(settings.theme || 'dark-minimal');
    const cWidth = canvas.width;
    const cHeight = canvas.height;

    // 1. Background
    const bgImage = await loadBackgroundImage(settings.customBackgroundUrl);
    drawBackground(ctx, cWidth, cHeight, theme, bgImage);

    // Remove redundant drawLifeHeader call because grid.js already draws the Life Grid unified header!

    // 3. Dashboard Header & Streak
    // The clock takes up about 35% of the total space, start Dashboard exactly below it
    let startY = settings.wallpaperType === "lockscreen" ? cHeight * 0.35 : cHeight * 0.12;

    const stats = data.stats || { streak: 0, streakActiveToday: false, growthHistory: [], todayCompletionPercentage: 0, totalHabits: 0 };
    const dataObj = data.data || { activityMap: {}, reminders: [] };

    if (settings.showAgeStats && settings.yearGridMode !== "life") {
        drawDashboardHeader(ctx, {
            xCoordinate: cWidth * 0.08, 
            yCoordinate: startY,
            width: cWidth * 0.84, 
            theme,
            history: stats.growthHistory,
            todayPercent: stats.todayCompletionPercentage,
            hasCustomBg: !!settings.customBackgroundUrl
        });

        // The streak widget shouldn't overlap the clock nor the dashboard ring
        // We float it on the top right, vertically parallel with the clock area!
        let streakY = settings.wallpaperType === "lockscreen" ? cHeight * 0.30 : startY;

        drawStreakWidget(ctx, {
            x: cWidth * 0.92, 
            y: streakY, 
            theme,
            streak: stats.streak,
            streakActiveToday: stats.streakActiveToday,
            hasCustomBg: !!settings.customBackgroundUrl
        });

        // Dashboard is 220px tall. We removed the grid frosted card, so we only need a normal 20px gap
        startY += 240;
    } else if (settings.yearGridMode === "life") {
        startY += 40; 
    }

    // 4. Grid
    drawGrid(ctx, {
        xCoordinate: cWidth * 0.10,
        yCoordinate: startY,
        width: cWidth * 0.80,
        height: cHeight,
        theme,
        themeName: settings.theme,
        mode: settings.yearGridMode,
        dob: settings.dateOfBirth,
        lifeExpectancy: settings.lifeExpectancyYears,
        activityMap: dataObj.activityMap,
        totalHabits: stats.totalHabits,
        reminders: dataObj.reminders,
        now: new Date(),
        hasCustomBg: !!settings.customBackgroundUrl
    });

    // 4.5 Bottom Section (Habits and Goals Progress at the Bottom)
    const bottomSectionHeight = 250;
    const bottomSectionY = settings.showQuote ? cHeight - 120 - bottomSectionHeight - 40 : cHeight - bottomSectionHeight - 80;
    
    drawBottomSection(ctx, {
        xCoordinate: cWidth * 0.08,
        yCoordinate: bottomSectionY,
        width: cWidth * 0.84,
        height: bottomSectionHeight,
        theme,
        habits: dataObj.habits,
        goals: dataObj.goals,
        settings,
        reminders: dataObj.reminders,
        nowDay: new Date().toISOString().split('T')[0],
        now: new Date(),
        streak: stats.streak,
        hasCustomBg: !!settings.customBackgroundUrl
    });

    // 5. Quote
    if (settings.showQuote) {
        drawQuote(ctx, {
            xCoordinate: cWidth * 0.08,
            yCoordinate: cHeight - 120,
            width: cWidth * 0.84,
            height: 100,
            theme,
            quote: settings.quoteText || "Make every week count."
        });
    }

    // Signal Android
    if (window.Android) {
        const base64 = canvas.toDataURL("image/png");
        const cleanBase64 = base64.split(',')[1];
        window.Android.saveWallpaper(cleanBase64);

        if (window.Android.updateAppTheme) {
            const isDark = !settings.theme?.includes('white');
            window.Android.updateAppTheme(theme.BG, isDark);
        }
    }
}
