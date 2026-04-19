import { drawRoundedRect, drawSafeText, drawFrostedCard } from "./utils";

/**
 * DASHBOARD HEADER
 * -------------------------------------------------
 * Top section containing:
 * - Growth graph
 * - Circular daily goal progress
 */
export function drawDashboardHeader(
    context,
    { xCoordinate, yCoordinate, width, theme, history, todayPercent, hasCustomBg }
) {
    const contentWidth = width;
    const statsHeight = 220; // Original was 280, optimized dead space

    if (hasCustomBg) {
        drawFrostedCard(context, xCoordinate - 10, yCoordinate - 20, contentWidth + 20, statsHeight, { radius: 36, padding: 15 });
    }

    /* ---------------- LEFT COLUMN ---------------- */

    drawSafeText(context, "GOALS", xCoordinate, yCoordinate, {
        font: "bold 40px Inter, sans-serif",
        color: theme.TEXT_SUB,
    });

    drawSafeText(context, "GROWTH", xCoordinate, yCoordinate + 44, {
        font: "bold 40px Inter, sans-serif",
        color: theme.TEXT_MAIN,
    });

    // Chart area
    const chartX = xCoordinate;
    const chartY = yCoordinate + 70;
    const chartWidth = contentWidth * 0.5;
    const chartHeight = 110; // Original 120

    const dataPoints =
        history && history.length > 0 ? history : [2, 4, 3, 5, 4, 6, 5];
    const maxVal = Math.max(...dataPoints, 1);

    const points = dataPoints.map((val, index) => ({
        x: chartX + (index / (dataPoints.length - 1)) * chartWidth,
        y: chartY + chartHeight - (val / maxVal) * chartHeight,
    }));

    // Area fill
    context.save();
    context.beginPath();
    context.moveTo(chartX, chartY + chartHeight);
    context.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    context.lineTo(chartX + chartWidth, chartY + chartHeight);
    context.closePath();

    const gradient = context.createLinearGradient(0, chartY, 0, chartY + chartHeight);
    gradient.addColorStop(0, "rgba(255,255,255,0.2)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fill();

    // Line
    context.shadowColor = theme.ACCENT;
    context.shadowBlur = 20;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    context.strokeStyle = theme.ACCENT;
    context.lineWidth = 6;
    context.lineCap = "round";
    context.stroke();
    context.restore();

    // Points
    points.forEach((p) => {
        context.beginPath();
        context.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        context.fillStyle = theme.ACCENT;
        context.fill();
    });

    /* ---------------- RIGHT COLUMN ---------------- */

    const ringX = xCoordinate + contentWidth - 90;
    const ringY = yCoordinate + 90;
    const radius = 80;

    // Track
    context.beginPath();
    context.arc(ringX, ringY, radius, 0, 2 * Math.PI);
    context.strokeStyle = "#27272a";
    context.lineWidth = 14;
    context.stroke();

    // Progress
    const percent = todayPercent || 0;
    if (percent > 0) {
        context.shadowColor = theme.ACCENT;
        context.shadowBlur = 15;
        context.beginPath();
        context.arc(
            ringX,
            ringY,
            radius,
            -Math.PI / 2,
            -Math.PI / 2 + (percent / 100) * 2 * Math.PI
        );
        context.strokeStyle = theme.ACCENT;
        context.lineWidth = 14;
        context.lineCap = "round";
        context.stroke();
        context.shadowBlur = 0;
    }

    drawSafeText(context, `${percent}%`, ringX, ringY + 16, {
        font: "bold 48px Inter, sans-serif",
        color: theme.TEXT_MAIN,
        align: "center",
    });

    drawSafeText(context, "DAILY GOAL", ringX, ringY + 120, {
        font: "bold 15px Inter, sans-serif",
        color: theme.TEXT_SUB,
        align: "center",
        shadow: false,
    });

    return statsHeight;
}

/**
 * STREAK WIDGET
 * -------------------------------------------------
 */
/**
 * Flame Icon (Lucide Style) - Simplified and predictable
 */
function drawFlameIcon(ctx, x, y, size, color) {
    ctx.save();

    // x, y are the top-left of the icon box for simplicity
    const s = size / 24;
    const ox = x;
    const oy = y;

    const sx = (v) => ox + v * s;
    const sy = (v) => oy + v * s;

    // Glowing Core (from the earlier version)
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Standard Lucide Flame Path
    ctx.moveTo(sx(8.5), sy(14.5));
    ctx.bezierCurveTo(sx(8.5), sy(14.5), sx(11), sy(12), sx(11), sy(12));
    ctx.bezierCurveTo(sx(11), sy(10.62), sx(10.5), sy(10), sx(10), sy(9));
    ctx.bezierCurveTo(sx(8.928), sy(6.857), sx(9.776), sy(4.946), sx(12), sy(3));
    ctx.bezierCurveTo(sx(12.5), sy(5.5), sx(14), sy(7.9), sx(16), sy(9.5));
    ctx.bezierCurveTo(sx(18), sy(11.1), sx(19), sy(13), sx(19), sy(15));
    ctx.bezierCurveTo(sx(19), sy(18.866), sx(15.866), sy(22), sx(12), sy(22));
    ctx.bezierCurveTo(sx(8.134), sy(22), sx(5), sy(18.866), sx(5), sy(15));
    ctx.bezierCurveTo(sx(5), sy(13.847), sx(5.433), sy(12.706), sx(6), sy(12));
    ctx.bezierCurveTo(sx(6), sy(12), sx(8.5), sy(14.5), sx(8.5), sy(14.5));
    ctx.closePath();

    ctx.stroke();

    // Fill for visibility
    const gradient = ctx.createLinearGradient(ox, oy, ox, oy + size);
    gradient.addColorStop(0, color + "66");
    gradient.addColorStop(1, color + "22");
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
}

export function drawStreakWidget(
    context,
    { x, y, theme, streak, streakActiveToday, hasCustomBg }
) {
    if (!streak || streak <= 0) return;

    // ===== Colors =====
    const iconColor = streakActiveToday ? "#f97316" : "#71717a";
    const statusColor = streakActiveToday ? "#22c55e" : "#ef4444";
    const statusText = streakActiveToday ? "SYSTEM ACTIVE" : "SIGNAL LOST";

    // ===== Typography =====
    const streakFont = "bold 72px Inter, sans-serif";
    const statusFont = "bold 14px Inter, sans-serif";

    // ===== Layout constants =====
    const iconSize = 64;
    const gap = 12;
    const statusOffsetY = 48;

    // ===== Measure streak text =====
    context.font = streakFont;
    const streakText = String(streak);
    const textMetrics = context.measureText(streakText);
    const textWidth = textMetrics.width;

    // ===== Widget total width =====
    const widgetWidth = textWidth + gap + iconSize;

    // x = RIGHT edge of widget
    const startX = x - widgetWidth;

    // ===== Vertical centering =====
    const centerY = y;

    // ===== Draw Frosted Card Background =====
    if (hasCustomBg) {
        drawFrostedCard(
            context,
            startX - 15,
            centerY - iconSize / 2 - 15,
            widgetWidth + 30,
            iconSize + statusOffsetY + 10,
            { radius: 24, padding: 8 }
        );
    }

    // ===== 1. Draw Streak Number =====
    drawSafeText(context, streakText, startX, centerY, {
        font: streakFont,
        color: theme.TEXT_MAIN || "#ffffff",
        align: "left",
        baseline: "middle",
        shadow: true,
    });

    // ===== 2. Draw Flame Icon =====
    drawFlameIcon(
        context,
        startX + textWidth + gap,
        centerY - iconSize / 2,
        iconSize,
        iconColor
    );

    // ===== 3. Draw Status Label =====
    drawSafeText(context, statusText, x, centerY + statusOffsetY, {
        font: statusFont,
        color: statusColor,
        align: "right",
        baseline: "top",
        letterSpacing: 2,
    });
}

/**
 * LIFE HEADER
 * -------------------------------------------------
 */
export function drawLifeHeader(context, { canvasWidth, theme, progress, hasCustomBg }) {
    if (progress === undefined || progress === null) return;

    const x = canvasWidth / 2;
    const y = 200;

    if (hasCustomBg) {
        drawFrostedCard(context, x - 150, y - 30, 300, 140, { radius: 36, padding: 10 });
    }

    drawSafeText(context, "LIFE PROGRESS", x, y, {
        font: "bold 18px Inter, sans-serif",
        color: theme.TEXT_SUB,
        align: "center",
    });

    drawSafeText(context, `${progress.toFixed(1)}%`, x, y + 50, {
        font: "bold 36px Inter, sans-serif",
        color: theme.TEXT_MAIN,
        align: "center",
    });

    const barWidth = canvasWidth * 0.4;
    const barHeight = 6;
    const barX = x - barWidth / 2;
    const barY = y + 75;

    // Use the safe drawRoundedRect helper instead of ctx.roundRect
    drawRoundedRect(context, barX, barY, barWidth, barHeight, 3, "rgba(255,255,255,0.1)");

    if (progress > 0) {
        context.save();
        context.shadowColor = theme.ACCENT;
        context.shadowBlur = 10;
        drawRoundedRect(context, barX, barY, (progress / 100) * barWidth, barHeight, 3, theme.ACCENT);
        context.restore();
    }
}
