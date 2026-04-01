import { drawRoundedRect, drawSafeText } from "./utils";

export function drawGrid(
    context,
    {
        xCoordinate,
        yCoordinate,
        width,
        height,
        theme,
        themeName = "dark-minimal",
        mode,
        dob,
        lifeExpectancy,
        activityMap,
        totalHabits = 1,
        reminders = [],
        now,
    }
) {
    let currentY = yCoordinate;

    // Systematic UI Hierarchy
    let mainTitle = "";
    let systemLabel = ""; // e.g., "CALENDAR", "PRODUCTIVITY"
    let subtitleText = "";
    let progressMetric = "";

    if (mode === "days") {
        mainTitle = "365 DAYS";
        systemLabel = "ANNUAL VIEW";
        const year = now.getFullYear();
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        subtitleText = `${year} • ${isLeap ? '366' : '365'} days to make count`;
        const dayOfYear = getDayOfYear(now);
        const daysPercent = Math.round((dayOfYear / (isLeap ? 366 : 365)) * 100);
        progressMetric = `${daysPercent}% COMPLETE`;
    } else if (mode === "weeks") {
        mainTitle = now.getFullYear() + " PROGRESS";
        systemLabel = "WEEKLY METRICS";
        subtitleText = "52 weeks of opportunity";
        const weekNum = getWeekNumber(now);
        progressMetric = `WEEK ${weekNum}/52`;
    } else if (mode === "life") {
        mainTitle = "LIFE PROGRESS";
        systemLabel = "MEMENTO MORI";
        const birthDate = new Date(dob);
        const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        subtitleText = `${age} YEARS • ${lifeExpectancy}Y EXPECTANCY`;
        const weeksLived = weeksBetween(birthDate, now);
        const totalWeeks = lifeExpectancy * 52;
        const lifePercent = Math.round((weeksLived / totalWeeks) * 100);
        progressMetric = `${lifePercent}% LIVED`;
    } else {
        const monthName = now.toLocaleString("default", { month: "long" }).toUpperCase();
        mainTitle = monthName + " " + now.getFullYear();
        systemLabel = "MONTHLY VIEW";
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        subtitleText = `${daysInMonth} DAYS TOTAL`;
        progressMetric = `DAY ${dayOfMonth}/${daysInMonth}`;
    }

    // ============ PREMIUM HEADER SECTION ============
    context.save();

    // 1. SMALL CAPS SYSTEM LABEL
    drawSafeText(context, systemLabel, xCoordinate, currentY, {
        font: "700 12px Inter, sans-serif",
        color: theme.ACCENT || "rgba(255, 255, 255, 0.4)",
        shadow: false,
    });

    currentY += 32;

    // 2. MAIN TITLE WITH DYNAMIC DEPTH
    context.shadowColor = "rgba(0, 0, 0, 0.8)";
    context.shadowBlur = 24;
    context.shadowOffsetY = 8;

    const titleGradient = context.createLinearGradient(xCoordinate, currentY - 20, xCoordinate + 450, currentY + 20);
    titleGradient.addColorStop(0, theme.TEXT_PRIMARY || "#ffffff");
    titleGradient.addColorStop(0.6, theme.TEXT_PRIMARY || "#fafafa");
    titleGradient.addColorStop(1, "rgba(255,255,255,0.3)");

    drawSafeText(context, mainTitle, xCoordinate, currentY, {
        font: "800 64px Inter, sans-serif",
        color: titleGradient,
        shadow: false,
    });

    currentY += 68;

    // 3. SUBTITLE & PROGRESS BADGE ALIGNMENT
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    // Subtitle
    drawSafeText(context, subtitleText, xCoordinate, currentY + 12, {
        font: "600 14px Inter, sans-serif",
        color: "rgba(255, 255, 255, 0.3)",
        shadow: false,
    });

    // Progress Badge (Right Aligned or Offset)
    const badgeWidth = 110;
    const badgeX = xCoordinate + width - badgeWidth;
    const badgeY = currentY - 4;

    drawRoundedRect(context, badgeX, badgeY, badgeWidth, 30, 8, "rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.1)");

    drawSafeText(context, progressMetric, badgeX + badgeWidth / 2, badgeY + 19, {
        font: "800 11px Inter, sans-serif",
        color: theme.ACCENT || "#ffffff",
        align: "center",
        shadow: false,
    });

    currentY += 56;
    const contentWidth = width;

    // Helper functions
    const getDayString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getWeekNumber = (dateInstance) => {
        const date = new Date(
            Date.UTC(
                dateInstance.getFullYear(),
                dateInstance.getMonth(),
                dateInstance.getDate()
            )
        );
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    };

    const getDayOfYear = (dateInstance) => {
        const start = new Date(dateInstance.getFullYear(), 0, 0);
        const diff = dateInstance - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    const weeksBetween = (d1, d2) =>
        Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 7));

    // Reminder tracking
    let anchorPoint = null;
    let targetReminders = [];
    let reminderDate = null;

    if (reminders && reminders.length > 0) {
        const toLocalYMD = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
            ).padStart(2, "0")}`;

        let startDate, endDate;

        if (mode === "month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (mode === "days") {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        } else if (mode === "weeks") {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        // Only show reminders that are ACTIVE TODAY and visible in current grid
        const visibleReminders = reminders.filter((r) => {
            const reminderStart = new Date(r.startDate);
            const reminderEnd = new Date(r.endDate);

            // Normalize dates to midnight for accurate comparison
            reminderStart.setHours(0, 0, 0, 0);
            reminderEnd.setHours(23, 59, 59, 999);

            const nowDate = new Date(now);
            nowDate.setHours(0, 0, 0, 0);

            // Reminder must:
            // 1. Overlap with the visible calendar range
            const overlapsWithView = reminderStart <= endDate && reminderEnd >= startDate;

            // 2. Be active TODAY (current date is within reminder's date range)
            const isActiveToday = reminderStart <= nowDate && reminderEnd >= nowDate;

            return overlapsWithView && isActiveToday;
        });

        const remindersByDate = {};
        visibleReminders.forEach((r) => {
            const dateKey = toLocalYMD(new Date(r.startDate));
            if (!remindersByDate[dateKey]) {
                remindersByDate[dateKey] = [];
            }
            remindersByDate[dateKey].push(r);
        });

        const todayYMD = toLocalYMD(now);
        if (remindersByDate[todayYMD]) {
            reminderDate = todayYMD;
            targetReminders = remindersByDate[todayYMD];
        } else {
            const sortedDates = Object.keys(remindersByDate).sort();
            if (sortedDates.length > 0) {
                reminderDate = sortedDates[0];
                targetReminders = remindersByDate[reminderDate];
            }
        }

        targetReminders.sort((a, b) =>
            (a.startTime || "00:00").localeCompare(b.startTime || "00:00")
        );
        targetReminders = targetReminders.slice(0, 4);
    }

    // Enhanced heatmap palettes with better gradients
    const HEATMAP_PALETTES = {
        "dark-minimal": {
            light: "#52525b",
            medium: "#71717a",
            dark: "#a1a1aa",
            full: "#ffffff",
            glow: "rgba(255, 255, 255, 0.4)",
        },
        "sunset-orange": { light: "#fed7aa", medium: "#fb923c", dark: "#f97316", full: "#ea580c", glow: "rgba(234, 88, 12, 0.5)" },
        "ocean-blue": { light: "#bfdbfe", medium: "#60a5fa", dark: "#3b82f6", full: "#2563eb", glow: "rgba(37, 99, 235, 0.5)" },
        "forest-green": { light: "#bbf7d0", medium: "#4ade80", dark: "#22c55e", full: "#16a34a", glow: "rgba(22, 163, 74, 0.5)" },
        "purple-haze": { light: "#e9d5ff", medium: "#c084fc", dark: "#a855f7", full: "#9333ea", glow: "rgba(147, 51, 234, 0.5)" },
        "monochrome": { light: "#71717a", medium: "#52525b", dark: "#3f3f46", full: "#27272a", glow: "rgba(39, 39, 42, 0.5)" },
    };

    const getHeatmapColor = (completionPercentage) => {
        const palette =
            HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"];

        if (completionPercentage === 0) return theme.GRID_INACTIVE || "#27272a";
        if (completionPercentage <= 25) return palette.light;
        if (completionPercentage <= 50) return palette.medium;
        if (completionPercentage <= 75) return palette.dark;
        return palette.full;
    };

    // High-Fidelity Box Drawing
    const drawEnhancedBox = (x, y, size, fillColor, isHighlight, borderRadius = 4) => {
        context.save();

        if (isHighlight) {
            const palette = HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"];

            // Multi-layered light emission
            for (let i = 5; i > 0; i--) {
                context.globalAlpha = 0.25 / i;
                context.fillStyle = palette.full || palette.glow;
                const spread = i * 2.5;
                drawRoundedRect(context, x - spread, y - spread, size + spread * 2, size + spread * 2, borderRadius + 4);
            }
            context.globalAlpha = 1;
        }

        const isInactive = fillColor === (theme.GRID_INACTIVE || "#27272a") || fillColor === "#18181b";

        // Material depth
        if (!isInactive) {
            context.shadowColor = "rgba(0, 0, 0, 0.4)";
            context.shadowBlur = 12;
            context.shadowOffsetY = 4;
        }

        const borderColor = isHighlight
            ? (HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"]).full
            : isInactive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)";

        // 1. Base Tile
        drawRoundedRect(context, x, y, size, size, borderRadius, fillColor, borderColor);

        // 2. Rim Light (Retina detail)
        if (!isInactive) {
            context.shadowBlur = 0;
            context.shadowOffsetY = 0;
            context.lineWidth = 1;
            context.strokeStyle = "rgba(255, 255, 255, 0.15)";
            context.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
        }

        // 3. Inner Material Shine
        if (!isInactive) {
            const shine = context.createLinearGradient(x, y, x + size, y + size);
            shine.addColorStop(0, "rgba(255, 255, 255, 0.2)");
            shine.addColorStop(0.5, "rgba(255, 255, 255, 0)");
            shine.addColorStop(1, "rgba(0, 0, 0, 0.1)");
            context.fillStyle = shine;
            drawRoundedRect(context, x + 1, y + 1, size - 2, size - 2, borderRadius - 1);
        }

        context.restore();
    };

    let finalHeight = 0;

    // Days mode - 365 day grid
    if (mode === "days") {
        const gridCols = 25;
        const gap = 12;
        const boxSize = (contentWidth - gap * (gridCols - 1)) / gridCols;
        const year = now.getFullYear();
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        const totalDays = isLeap ? 366 : 365;
        const currentDayNum = getDayOfYear(now);
        const dayRows = Math.ceil(totalDays / gridCols);

        for (let rowIndex = 0; rowIndex < dayRows; rowIndex++) {
            for (let columnIndex = 0; columnIndex < gridCols; columnIndex++) {
                const dayNum = rowIndex * gridCols + columnIndex + 1;
                if (dayNum > totalDays) break;

                const dayDate = new Date(year, 0, dayNum);
                const dayDateStr = getDayString(dayDate);
                const boxX = xCoordinate + columnIndex * (boxSize + gap);
                const boxY = currentY + rowIndex * (boxSize + gap);

                if (targetReminders.length > 0 && reminderDate && dayDateStr === reminderDate) {
                    anchorPoint = { x: boxX, y: boxY, size: boxSize };
                }

                let fillColor;
                const isToday = dayNum === currentDayNum;

                if (isToday) {
                    const palette = HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"];
                    fillColor = palette.full;
                } else if (dayNum < currentDayNum) {
                    const logCount = activityMap[dayDateStr] || 0;
                    const completionPercentage = totalHabits > 0 ? (logCount / totalHabits) * 100 : 0;
                    fillColor = getHeatmapColor(completionPercentage);
                } else {
                    fillColor = theme.GRID_INACTIVE || "#27272a";
                }

                drawEnhancedBox(boxX, boxY, boxSize, fillColor, isToday, 6);
            }
        }
        finalHeight = dayRows * (boxSize + gap) + 150;
    }
    // Weeks mode - 52 week grid
    else if (mode === "weeks") {
        const columns = 13;
        const weekRows = 4;
        const gap = 16;
        const boxSize = (contentWidth - gap * (columns - 1)) / columns;
        const currentWeek = getWeekNumber(now);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const simpleWeekOneStart = new Date(startOfYear);
        simpleWeekOneStart.setDate(simpleWeekOneStart.getDate() - simpleWeekOneStart.getDay());

        for (let rowIndex = 0; rowIndex < weekRows; rowIndex++) {
            for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
                const index = rowIndex * columns + columnIndex;
                const weekNum = index + 1;
                const boxX = xCoordinate + columnIndex * (boxSize + gap);
                const boxY = currentY + rowIndex * (boxSize + gap);

                const weekDate = new Date(simpleWeekOneStart);
                weekDate.setDate(weekDate.getDate() + index * 7);

                let fillColor;
                const isCurrentWeek = weekNum === currentWeek;

                if (isCurrentWeek) {
                    const palette = HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"];
                    fillColor = palette.full;
                } else if (weekNum < currentWeek) {
                    let weekActivityCount = 0;
                    for (let i = 0; i < 7; i++) {
                        const dayDate = new Date(weekDate);
                        dayDate.setDate(dayDate.getDate() + i);
                        const dayStr = getDayString(dayDate);
                        weekActivityCount += activityMap[dayStr] || 0;
                    }
                    const completionPercentage = totalHabits > 0
                        ? Math.min(100, (weekActivityCount / (totalHabits * 7)) * 100)
                        : 0;
                    fillColor = getHeatmapColor(completionPercentage);
                } else {
                    fillColor = theme.GRID_INACTIVE || "#27272a";
                }

                drawEnhancedBox(boxX, boxY, boxSize, fillColor, isCurrentWeek, 9);
            }
        }
        finalHeight = weekRows * (boxSize + gap) + 200;
    }
    // Life mode - entire life grid
    else if (mode === "life") {
        const gridCols = 52;
        const gap = 5;
        const totalWeeks = Number(lifeExpectancy) * 52;
        const rowsNeeded = Math.ceil(totalWeeks / gridCols);
        const weeksLived = weeksBetween(new Date(dob), now);
        const availableHeight = Math.max(400, height - currentY - 150);
        const sizeByWidth = (contentWidth - gap * (gridCols - 1)) / gridCols;
        const sizeByHeight = (availableHeight - gap * (rowsNeeded - 1)) / rowsNeeded;
        const boxSize = Math.max(3.5, Math.min(sizeByWidth, sizeByHeight));

        const birthDate = new Date(dob);
        const birthWeekStart = new Date(birthDate);
        birthWeekStart.setDate(birthWeekStart.getDate() - birthWeekStart.getDay());

        for (let i = 0; i < totalWeeks; i++) {
            const columnIndex = i % gridCols;
            const rowIndex = Math.floor(i / gridCols);
            const boxX = xCoordinate + columnIndex * (boxSize + gap);
            const boxY = currentY + rowIndex * (boxSize + gap);

            const weekDate = new Date(birthWeekStart);
            weekDate.setDate(weekDate.getDate() + i * 7);

            let fillColor;
            const isCurrentWeek = i === weeksLived;

            if (isCurrentWeek) {
                const palette = HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"];
                fillColor = palette.full;
            } else if (i < weeksLived) {
                let weekActivityCount = 0;
                for (let j = 0; j < 7; j++) {
                    const dayDate = new Date(weekDate);
                    dayDate.setDate(dayDate.getDate() + j);
                    const dayStr = getDayString(dayDate);
                    weekActivityCount += activityMap[dayStr] || 0;
                }
                const completionPercentage = totalHabits > 0
                    ? Math.min(100, (weekActivityCount / (totalHabits * 7)) * 100)
                    : 0;
                fillColor = getHeatmapColor(completionPercentage);
            } else {
                fillColor = theme.GRID_INACTIVE || "#27272a";
            }

            drawEnhancedBox(boxX, boxY, boxSize, fillColor, isCurrentWeek, Math.max(2, boxSize / 3.5));
        }

        finalHeight = rowsNeeded * (boxSize + gap) + 120;
    }
    // Monthly calendar mode
    else {
        const columns = 7;
        let monthRows = 6;
        const gap = 20;
        const boxSize = (contentWidth - gap * (columns - 1)) / columns;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dayOffset = startOfMonth.getDay();

        // Day labels with enhanced styling
        const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const labelY = currentY + 4;

        for (let i = 0; i < 7; i++) {
            const labelX = xCoordinate + i * (boxSize + gap) + boxSize / 2;

            // Transparent badge for labels
            context.fillStyle = "rgba(255, 255, 255, 0.04)";
            drawRoundedRect(context, labelX - 25, labelY - 12, 50, 24, 6);

            context.textAlign = "center";
            drawSafeText(context, dayLabels[i], labelX, labelY + 6, {
                font: "800 10px Inter, sans-serif",
                color: "rgba(255, 255, 255, 0.2)",
                shadow: false,
            });
            context.textAlign = "left";
        }
        currentY += 40;

        for (let rowIndex = 0; rowIndex < monthRows; rowIndex++) {
            let rowHasDaysInMonth = false;

            // Check if this row has any days in the current month
            for (let col = 0; col < columns; col++) {
                const dIdx = rowIndex * 7 + col;
                const checkDate = new Date(startOfMonth);
                checkDate.setDate(1 + dIdx - dayOffset);
                if (checkDate.getMonth() === now.getMonth()) {
                    rowHasDaysInMonth = true;
                    break;
                }
            }

            if (!rowHasDaysInMonth) {
                monthRows = rowIndex; // Actual number of rows used
                break;
            }

            for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
                const dayIndex = rowIndex * 7 + columnIndex;
                const date = new Date(startOfMonth);
                date.setDate(1 + dayIndex - dayOffset);

                const isToday = getDayString(date) === getDayString(now);
                const isInMonth = date.getMonth() === now.getMonth();

                // SKIPPED: Removing extra grids from other months
                if (!isInMonth) continue;

                const boxX = xCoordinate + columnIndex * (boxSize + gap);
                const boxY = currentY + rowIndex * (boxSize + gap);

                if (targetReminders.length > 0 && reminderDate && getDayString(date) === reminderDate) {
                    anchorPoint = { x: boxX, y: boxY, size: boxSize };
                }

                const logCount = activityMap[getDayString(date)] || 0;

                let fillColor;
                if (isToday) {
                    const completionPercentage = totalHabits > 0 ? (logCount / totalHabits) * 100 : 0;
                    if (completionPercentage > 0) {
                        fillColor = getHeatmapColor(completionPercentage);
                    } else {
                        const palette = HEATMAP_PALETTES[themeName] || HEATMAP_PALETTES["dark-minimal"];
                        fillColor = palette.full;
                    }
                } else if (logCount > 0) {
                    const completionPercentage = totalHabits > 0 ? (logCount / totalHabits) * 100 : 0;
                    fillColor = getHeatmapColor(completionPercentage);
                } else {
                    fillColor = theme.GRID_INACTIVE || "#27272a";
                }

                drawEnhancedBox(boxX, boxY, boxSize, fillColor, isToday, 11);

                // Draw date number with enhanced styling
                context.textAlign = "center";
                const textColor = isToday ? "#000000" : logCount > 0 ? "#ffffff" : "rgba(255,255,255,0.2)";

                if (isToday) {
                    drawSafeText(
                        context,
                        date.getDate().toString(),
                        boxX + boxSize / 2,
                        boxY + boxSize / 2 + 8,
                        {
                            font: "800 20px Inter, sans-serif",
                            color: textColor,
                            shadow: false,
                        }
                    );
                } else {
                    drawSafeText(
                        context,
                        date.getDate().toString(),
                        boxX + boxSize / 2,
                        boxY + boxSize / 2 + 7,
                        {
                            font: logCount > 0 ? "800 16px Inter, sans-serif" : "600 15px Inter, sans-serif",
                            color: textColor,
                            shadow: false,
                        }
                    );
                }
                context.textAlign = "left";
            }
        }
        finalHeight = monthRows * (boxSize + gap) + 160;

        // Intensity Legend
        const legendX = xCoordinate;
        const legendY = currentY + monthRows * (boxSize + gap) + 20;
        const legendBoxSize = 12;
        const legendGap = 8;

        drawSafeText(context, "LESS", legendX, legendY + 10, { font: "700 10px Inter, sans-serif", color: "rgba(255,255,255,0.2)" });

        [0, 25, 50, 75, 100].forEach((p, i) => {
            const lx = legendX + 40 + i * (legendBoxSize + legendGap);
            drawEnhancedBox(lx, legendY, legendBoxSize, getHeatmapColor(p), false, 3);
        });

        drawSafeText(context, "MORE", legendX + 40 + 5 * (legendBoxSize + legendGap) + 4, legendY + 10, { font: "700 10px Inter, sans-serif", color: "rgba(255,255,255,0.2)" });
    }

    // ============ REMINDER CALLOUT (EXACT MATCH TO NEW DESIGN) ============
    if (anchorPoint && targetReminders.length > 0) {
        const boxWidth = 360;
        const itemHeight = 64;
        const headerHeight = 52;
        const padding = 20;
        const displayedReminders = targetReminders.slice(0, 4);
        const listHeight = displayedReminders.length * itemHeight;
        const boxHeight = headerHeight + listHeight + padding;

        let calloutX = anchorPoint.x - boxWidth / 2 + anchorPoint.size / 2;
        let calloutY = anchorPoint.y - boxHeight - 60;

        if (calloutX < xCoordinate) {
            calloutX = xCoordinate + 10;
        }
        if (calloutX + boxWidth > xCoordinate + width) {
            calloutX = xCoordinate + width - boxWidth - 10;
        }
        if (calloutY < yCoordinate) {
            calloutY = anchorPoint.y + anchorPoint.size + 20;
        }

        context.save();

        // 1. ANCHOR TERMINAL (Glow on the day itself)
        const ax = anchorPoint.x + anchorPoint.size / 2;
        const ay = anchorPoint.y + anchorPoint.size / 2;

        context.beginPath();
        context.arc(ax, ay, 4, 0, Math.PI * 2);
        context.fillStyle = "#ffffff";
        context.shadowBlur = 10;
        context.shadowColor = "#ffffff";
        context.fill();

        // 2. CONNECTION LINE
        const lineGradient = context.createLinearGradient(ax, ay, calloutX + boxWidth / 2, calloutY + boxHeight);
        lineGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        lineGradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");
        context.strokeStyle = lineGradient;
        context.lineWidth = 2.5;

        context.beginPath();
        context.moveTo(ax, ay);
        const cpY = (ay + calloutY + boxHeight) / 2;
        context.bezierCurveTo(ax, cpY, calloutX + boxWidth / 2, cpY, calloutX + boxWidth / 2, calloutY + boxHeight);
        context.stroke();

        // 3. CALLOUT TERMINAL
        context.beginPath();
        context.arc(calloutX + boxWidth / 2, calloutY + boxHeight, 3, 0, Math.PI * 2);
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.fill();

        context.restore();
        context.save();

        // Card background with enhanced styling
        context.shadowColor = "rgba(0, 0, 0, 0.8)";
        context.shadowBlur = 48;
        context.shadowOffsetY = 24;

        drawRoundedRect(
            context,
            calloutX,
            calloutY,
            boxWidth,
            boxHeight,
            18,
            "rgba(25, 25, 32, 0.99)",
            "rgba(255, 255, 255, 0.15)"
        );

        context.shadowBlur = 0;
        context.shadowOffsetY = 0;

        // Header with icon
        const iconX = calloutX + padding;
        const iconY = calloutY + padding - 2;
        const iconSize = 18;

        drawRoundedRect(
            context,
            iconX,
            iconY,
            iconSize,
            iconSize,
            4,
            "rgba(255, 255, 255, 0.12)"
        );

        context.strokeStyle = "rgba(255, 255, 255, 0.6)";
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(iconX + 3, iconY + 7);
        context.lineTo(iconX + iconSize - 3, iconY + 7);
        context.stroke();
        context.beginPath();
        context.moveTo(iconX + 9, iconY + 7);
        context.lineTo(iconX + 9, iconY + iconSize - 3);
        context.stroke();

        drawSafeText(context, "UPCOMING", iconX + iconSize + 10, calloutY + padding, {
            font: "700 12px Inter, sans-serif",
            color: "rgba(255, 255, 255, 0.7)",
            shadow: false
        });

        // Reminder items
        let itemY = calloutY + headerHeight;

        displayedReminders.forEach((reminder) => {
            const itemX = calloutX + padding;

            const priorityColors = {
                1: "#6b7280",
                2: "#7c3aed",
                3: "#f59e0b",
                4: "#ef4444"
            };
            const dotColor = priorityColors[reminder.priority] || "#7c3aed";

            // Large colored dot (6px radius)
            context.beginPath();
            context.arc(itemX + 8, itemY + 20, 6, 0, Math.PI * 2);
            context.fillStyle = dotColor;
            context.fill();

            // Reminder title with time (first line)
            const timeText = !reminder.isFullDay && reminder.startTime
                ? reminder.startTime.slice(0, 5)
                : "";
            const titleWithTime = timeText
                ? `${reminder.title || "Untitled"} ${timeText}`
                : (reminder.title || "Untitled");

            const maxTitleLength = 28;
            const displayTitle = titleWithTime.length > maxTitleLength
                ? titleWithTime.slice(0, maxTitleLength) + "…"
                : titleWithTime;

            drawSafeText(context, displayTitle, itemX + 24, itemY + 12, {
                font: "600 14px Inter, sans-serif",
                color: "rgba(255, 255, 255, 0.95)",
                shadow: false
            });

            // Second line - same text in accent color
            drawSafeText(context, displayTitle, itemX + 24, itemY + 32, {
                font: "500 13px Inter, sans-serif",
                color: dotColor,
                shadow: false
            });

            // "All Day" badge on the right
            const badgeText = reminder.isFullDay ? "All Day" : (reminder.startTime || "11:23");
            const badgeWidth = reminder.isFullDay ? 60 : 58;
            const badgeX = calloutX + boxWidth - padding - badgeWidth;
            const badgeY = itemY + 15;

            // Badge background
            drawRoundedRect(
                context,
                badgeX,
                badgeY,
                badgeWidth,
                26,
                13,
                reminder.isFullDay ? "rgba(124, 58, 237, 0.3)" : "rgba(255, 255, 255, 0.1)"
            );

            // Badge text
            drawSafeText(context, badgeText, badgeX + (reminder.isFullDay ? 10 : 8), badgeY + 8, {
                font: "600 11px Inter, sans-serif",
                color: reminder.isFullDay ? "rgba(124, 58, 237, 1)" : "rgba(255, 255, 255, 0.7)",
                shadow: false
            });

            itemY += itemHeight;
        });

        context.restore();
    }

    context.restore();
    return finalHeight;
}