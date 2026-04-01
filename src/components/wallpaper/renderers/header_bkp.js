import { drawRoundedRect, drawSafeText } from "./utils";

/**
 * DASHBOARD HEADER
 * -------------------------------------------------
 * Top section containing:
 * - Growth graph
 * - Circular daily goal progress
 */
export function drawDashboardHeader(
    context,
    { xCoordinate, yCoordinate, width, theme, history, todayPercent }
) {
    const contentWidth = width;
    const statsHeight = 380;

    /* ---------------- LEFT COLUMN ---------------- */

    drawSafeText(context, "GOALS", xCoordinate, yCoordinate, {
        font: "bold 40px Inter, sans-serif",
        color: theme.TEXT_SUB,
    });

    drawSafeText(context, "GROWTH", xCoordinate, yCoordinate + 50, {
        font: "bold 40px Inter, sans-serif",
        color: theme.TEXT_MAIN,
    });

    // Chart area
    const chartX = xCoordinate;
    const chartY = yCoordinate + 80;
    const chartWidth = contentWidth * 0.5;
    const chartHeight = 120;

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
    const ringY = yCoordinate + 100;
    const radius = 90;

    // Track
    context.beginPath();
    context.arc(ringX, ringY, radius, 0, 2 * Math.PI);
    context.strokeStyle = "#27272a";
    context.lineWidth = 16;
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
        context.lineWidth = 16;
        context.lineCap = "round";
        context.stroke();
        context.shadowBlur = 0;
    }

    drawSafeText(context, `${percent}%`, ringX, ringY + 18, {
        font: "bold 52px Inter, sans-serif",
        color: theme.TEXT_MAIN,
        align: "center",
    });

    drawSafeText(context, "DAILY GOAL", ringX, ringY + 135, {
        font: "bold 16px Inter, sans-serif",
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
 * Flame Icon (Lucide Style) - 100% Robust Drawing
 * Increased size and stroke for better visibility
 */
function drawFlameIcon(ctx, x, y, size, color) {
    ctx.save();

    // Position adjustments - Center the icon better
    const ox = x - size - 10;
    const oy = y - size / 2 - 10;
    const s = size / 24;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * s; // Thicker stroke
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const sx = (v) => ox + v * s;
    const sy = (v) => oy + v * s;

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

    // Gradient fill for "fire" effect
    const gradient = ctx.createLinearGradient(ox, oy, ox, oy + size);
    gradient.addColorStop(0, color + "44"); // 25% opacity
    gradient.addColorStop(1, color + "11"); // 7% opacity
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
}

export function drawStreakWidget(context, { x, y, theme, streak, streakActiveToday }) {
    if (!streak || streak <= 0) return;

    // Vibrant Orange for active
    const iconColor = streakActiveToday ? "#f97316" : "#71717a";

    // 1. Draw Streak Number (Huge Impact)
    // Align it to the right, slightly offset for the icon
    drawSafeText(context, `${streak}`, x - 95, y + 45, {
        font: "bold 180px 'Inter'",
        color: theme.TEXT_MAIN,
        align: "right",
        baseline: "middle"
    });

    // 2. Draw Flame Icon
    // Centered vertically with the number
    drawFlameIcon(context, x, y + 15, 80, iconColor);

    // 3. Status Text
    const statusText = streakActiveToday ? "DONE TODAY" : "NOT LOGGED";
    const statusColor = streakActiveToday ? "#22c55e" : "#ef4444";

    drawSafeText(context, statusText, x, y + 115, {
        font: "bold 22px 'Inter'",
        color: statusColor,
        align: "right",
        shadow: false,
    });
}

/**
 * LIFE HEADER
 * -------------------------------------------------
 */
export function drawLifeHeader(context, { canvasWidth, theme, progress }) {
    if (progress === undefined || progress === null) return;

    const x = canvasWidth / 2;
    const y = 200;

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
