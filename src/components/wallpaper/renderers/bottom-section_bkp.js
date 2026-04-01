import { drawRoundedRect, drawSafeText } from "./utils";

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
    }
) {
    const contentWidth = width;
    const columnGap = 40;
    // Simplified for mobile view (single column if needed, but keeping two for now)
    const columnWidth = (contentWidth - columnGap) / 2;

    const leftColumnX = xCoordinate;
    const rightColumnX = xCoordinate + columnWidth + columnGap;

    const getDayString = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    /* ---------------- LEFT COLUMN : HABITS ---------------- */

    let leftY = yCoordinate;

    if (habits && habits.length > 0 && settings.showHabitLayer !== false) {
        drawSafeText(context, "HABITS", leftColumnX, leftY, {
            font: "bold 24px Inter, sans-serif",
            color: theme.TEXT_SUB,
        });
        leftY += 40;

        const maxHabits = Math.min(habits.length, 6);
        const habitSpacing = 85;
        const habitColors = [
            "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899", "#6366f1",
        ];

        habits.slice(0, maxHabits).forEach((habit, index) => {
            const habitColor = habitColors[index % habitColors.length];
            // simplified log check
            const logs = habit.logs || [];
            const isDone = logs.some(
                (log) => getDayString(new Date(log.date)) === nowDay
            );

            const checkboxSize = 28;
            const checkboxX = leftColumnX;
            const checkboxY = leftY - 3;

            // Checkbox
            context.beginPath();
            context.arc(
                checkboxX + checkboxSize / 2,
                checkboxY + checkboxSize / 2,
                checkboxSize / 2,
                0,
                Math.PI * 2
            );
            context.strokeStyle = isDone ? habitColor : "#3f3f46";
            context.lineWidth = 2.5;
            context.stroke();

            if (isDone) {
                context.fillStyle = habitColor;
                context.fill();
                // Checkmark
                /*
                context.beginPath();
                context.moveTo(checkboxX + 8, checkboxY + 14);
                context.lineTo(checkboxX + 12, checkboxY + 20);
                context.lineTo(checkboxX + 22, checkboxY + 8);
                context.strokeStyle = "#fff";
                context.lineWidth = 3;
                context.stroke();
                */
            }

            const titleX = checkboxX + checkboxSize + 18;

            // Habit Title
            const title =
                habit.title && habit.title.length > 14
                    ? habit.title.slice(0, 14) + "…"
                    : habit.title || "Untitled";

            drawSafeText(context, title, titleX, leftY + 20, {
                font: "20px Inter, sans-serif",
                color: theme.TEXT_MAIN,
            });

            // Scheduled time
            if (habit.scheduledTime) {
                drawSafeText(context, habit.scheduledTime, titleX + 160, leftY + 20, {
                    font: "14px Inter, sans-serif",
                    color: habitColor,
                    shadow: false,
                });
            }

            leftY += habitSpacing;
        });
    }

    /* ---------------- RIGHT COLUMN : GOALS ---------------- */

    let rightY = yCoordinate;

    if (goals && goals.length > 0) {
        const goal = goals[0];

        drawSafeText(context, "FOCUS", rightColumnX, rightY, {
            font: "bold 20px Inter, sans-serif",
            color: theme.TEXT_SUB,
        });

        drawSafeText(context, goal.title || "Goal", rightColumnX, rightY + 40, {
            font: "bold 24px Inter, sans-serif",
            color: theme.TEXT_MAIN,
        });

        const barY = rightY + 60;
        const barHeight = 10;

        drawRoundedRect(
            context,
            rightColumnX,
            barY,
            columnWidth,
            barHeight,
            5,
            "rgba(255,255,255,0.1)"
        );

        let progress = goal.progress || 0;

        if (goal.subGoals && goal.subGoals.length > 0) {
            const done = goal.subGoals.filter((g) => g.isCompleted).length;
            progress = Math.round((done / goal.subGoals.length) * 100);
        }

        if (progress > 0) {
            drawRoundedRect(
                context,
                rightColumnX,
                barY,
                (columnWidth * progress) / 100,
                barHeight,
                5,
                theme.ACCENT
            );
        }

        drawSafeText(context, `${progress}% complete`, rightColumnX + columnWidth, barY + 30, {
            font: "16px Inter, sans-serif",
            color: theme.TEXT_SUB,
            align: "right",
            shadow: false,
        });
    }
}
