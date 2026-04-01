import { drawRoundedRect, drawSafeText, drawFrostedCard } from "./utils";

export function drawBottomSection(
    context,
    {
        xCoordinate,
        yCoordinate,
        width,
        height,
        theme,
        habits,
        goals = [],
        settings,
        reminders = [],
        nowDay,
        now,
        streak,
        isStacked = false,
        hasCustomBg,
    }
) {
    const cardPadding = 24;
    const maxHabits = 10;
    const habitSpacing = 52;
    const columnGap = 20; // Gap between separate cards

    // Determine what to show
    const showHabits = habits && habits.length > 0 && settings.showHabitLayer !== false;
    const showGoals = goals && goals.length > 0;

    // Calculate required heights
    let habitsHeight = 0;
    if (showHabits) {
        const activeHabitsNum = Math.min(habits.length, maxHabits);
        habitsHeight = cardPadding + 40 + (activeHabitsNum * habitSpacing) + 20; // Added 10 more padding at bottom
    }

    let goalsHeight = 0;
    if (showGoals) {
        const goal = goals[0];
        const hasSubgoals = goal.subGoals && goal.subGoals.length > 0;
        goalsHeight = cardPadding + 40 + 45 + 30 + (hasSubgoals ? 60 : 0) + 20; // Consistent padding
    }

    context.save();

    const getDayString = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const drawCardBg = (x, y, w, h) => {
        if (hasCustomBg) {
            drawFrostedCard(context, x, y, w, h, { radius: 36 });
        } else {
            drawRoundedRect(context, x, y, w, h, 36, "rgba(255, 255, 255, 0.02)", "rgba(255, 255, 255, 0.05)");
        }
    };

    // Calculate columns layout
    let leftCardX, leftCardY, leftCardWidth;
    let rightCardX, rightCardY, rightCardWidth;

    if (isStacked) {
        // Stacked vertically (for Life Grid mode sidebar)
        leftCardX = xCoordinate;
        leftCardY = yCoordinate;
        leftCardWidth = width;

        rightCardX = xCoordinate;
        rightCardY = showHabits ? yCoordinate + habitsHeight + columnGap : yCoordinate;
        rightCardWidth = width;
    } else {
        // Side-by-side horizontally
        const availableWidth = showHabits && showGoals ? (width - columnGap) / 2 : width;

        leftCardX = xCoordinate;
        leftCardY = yCoordinate;
        leftCardWidth = availableWidth;

        rightCardX = showHabits ? xCoordinate + availableWidth + columnGap : xCoordinate;
        rightCardY = yCoordinate;
        rightCardWidth = availableWidth;
    }

    /* ---------------- HABITS CARD ---------------- */

    if (showHabits) {
        drawCardBg(leftCardX, leftCardY, leftCardWidth, habitsHeight);

        let currentY = leftCardY + cardPadding;
        const leftColumnX = leftCardX + cardPadding;

        // Label
        context.fillStyle = theme.ACCENT || "#ffffff";
        drawRoundedRect(context, leftColumnX, currentY, 3, 16, 1.5, theme.ACCENT || "#ffffff");

        drawSafeText(context, "DAILY HABITS", leftColumnX + 12, currentY + 12, {
            font: "900 12px Inter, sans-serif",
            color: theme.TEXT_SUB || "rgba(255,255,255,0.4)",
            letterSpacing: 2
        });

        currentY += 40;

        const habitColors = ["#34d399", "#fbbf24", "#22d3ee", "#a78bfa", "#f472b6", "#818cf8"];

        habits.slice(0, maxHabits).forEach((habit, index) => {
            const habitColor = habitColors[index % habitColors.length];
            const logs = habit.logs || [];
            const isDone = logs.some((log) => getDayString(new Date(log.date)) === nowDay);

            const dotSize = 10;
            const itemX = leftColumnX;
            const itemY = currentY;

            // Status Circle
            context.beginPath();
            context.arc(itemX + dotSize, itemY + 10, dotSize, 0, Math.PI * 2);
            if (isDone) {
                context.fillStyle = habitColor;
                context.fill();
                context.shadowColor = habitColor;
                context.shadowBlur = 10;
                context.stroke();
                context.shadowBlur = 0;
            } else {
                context.strokeStyle = "rgba(255,255,255,0.1)";
                context.lineWidth = 2;
                context.stroke();
            }

            // Habit Title
            const title = habit.title || "Untitled";
            // Dynamically truncate based on available card width
            const maxChars = Math.floor((leftCardWidth - 80) / 8);
            const truncatedTitle = title.length > maxChars ? title.slice(0, maxChars) + "…" : title;

            drawSafeText(context, truncatedTitle.toUpperCase(), itemX + 32, itemY + 14, {
                font: "800 15px Inter, sans-serif",
                color: isDone ? "#ffffff" : "rgba(255,255,255,0.7)",
                letterSpacing: 0.5
            });

            currentY += habitSpacing;
        });
    }

    /* ---------------- GOALS CARD ---------------- */

    if (showGoals) {
        drawCardBg(rightCardX, rightCardY, rightCardWidth, goalsHeight);

        let focusY = rightCardY + cardPadding;
        const rightColumnX = rightCardX + cardPadding;
        const goal = goals[0];

        // Label
        context.fillStyle = theme.ACCENT || "#ffffff";
        drawRoundedRect(context, rightColumnX, focusY, 3, 16, 1.5, theme.ACCENT || "#ffffff");

        drawSafeText(context, "ACTIVE FOCUS", rightColumnX + 12, focusY + 12, {
            font: "900 12px Inter, sans-serif",
            color: theme.TEXT_SUB || "rgba(255,255,255,0.4)",
            letterSpacing: 2
        });

        focusY += 40;

        // Goal Title
        const gTitle = goal.title || "Goal";
        const maxChars = Math.floor((rightCardWidth - 48) / 9);
        const truncatedGTitle = gTitle.length > maxChars ? gTitle.slice(0, maxChars) + "…" : gTitle;

        drawSafeText(context, truncatedGTitle.toUpperCase(), rightColumnX, focusY + 15, {
            font: "900 18px Inter, sans-serif",
            color: theme.TEXT_MAIN,
            letterSpacing: 0.5
        });

        focusY += 45;

        // Progress Bar Track
        const barWidth = rightCardWidth - (cardPadding * 2);
        const barHeight = 8;
        drawRoundedRect(context, rightColumnX, focusY, barWidth, barHeight, 4, "rgba(255,255,255,0.05)");

        let progress = goal.progress || 0;
        if (goal.subGoals && goal.subGoals.length > 0) {
            const done = goal.subGoals.filter((g) => g.isCompleted).length;
            progress = Math.round((done / goal.subGoals.length) * 100);
        }

        if (progress > 0) {
            const grad = context.createLinearGradient(rightColumnX, 0, rightColumnX + barWidth, 0);
            grad.addColorStop(0, theme.ACCENT);
            grad.addColorStop(1, "#ffffff");

            drawRoundedRect(context, rightColumnX, focusY, (barWidth * progress) / 100, barHeight, 4, grad);
        }

        drawSafeText(context, `${progress}% COMPLETE`, rightColumnX + barWidth, focusY + 30, {
            font: "900 11px Inter, sans-serif",
            color: theme.ACCENT,
            align: "right",
            shadow: false,
        });

        // Subgoal preview
        if (goal.subGoals && goal.subGoals.length > 0) {
            focusY += 60;
            const nextSubgoal = goal.subGoals.find(s => !s.isCompleted);
            if (nextSubgoal) {
                drawSafeText(context, "NEXT STEP:", rightColumnX, focusY, {
                    font: "700 10px Inter, sans-serif",
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: 1
                });

                const maxSubChars = Math.floor((rightCardWidth - 48) / 7);
                const subTitle = nextSubgoal.title;
                const truncSubTitle = subTitle.length > maxSubChars ? subTitle.slice(0, maxSubChars) + "…" : subTitle;

                drawSafeText(context, truncSubTitle.toUpperCase(), rightColumnX, focusY + 20, {
                    font: "800 13px Inter, sans-serif",
                    color: "rgba(255,255,255,0.6)",
                });
            }
        }
    }

    context.restore();
}
