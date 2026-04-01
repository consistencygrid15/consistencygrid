import { drawRoundedRect, drawSafeText } from "./utils";

/**
 * ACTIVE WEEK STRIP RENDERER
 * -------------------------------------------------
 * Renders a 7-day tactical heatmap strip (Mon → Sun)
 */
export function drawWeekStrip(
  context,
  { xCoordinate, yCoordinate, width, theme, activityMap, totalHabits, now }
) {
  // ===== Layout =====
  const DAYS = 7;
  const GAP = 16;
  const BORDER_RADIUS = 12;

  const boxWidth = (width - GAP * (DAYS - 1)) / DAYS;
  const boxHeight = boxWidth * 1.2;

  let anchorPoint = null;

  context.save();

  // ===== Week Calculation (Monday start) =====
  const startOfWeek = new Date(now);
  const dayIndex = startOfWeek.getDay(); // 0 = Sun
  const diff = startOfWeek.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  // ===== Helpers =====
  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // ===== Render Days =====
  for (let i = 0; i < DAYS; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);

    const dateKey = formatDateKey(currentDate);
    const isToday = dateKey === formatDateKey(now);

    const logs = activityMap[dateKey] || 0;
    const completion =
      totalHabits > 0 ? (logs / totalHabits) * 100 : 0;

    const x = xCoordinate + i * (boxWidth + GAP);
    const y = yCoordinate;

    if (isToday) {
      anchorPoint = { x, y, size: boxWidth };
    }

    // ===== Heatmap Color =====
    let fillColor = theme.GRID_INACTIVE || "#27272a";

    if (isToday) {
      fillColor = theme.ACCENT || "#ffffff";
    } else if (logs > 0) {
      if (completion <= 30) fillColor = "rgba(255,255,255,0.2)";
      else if (completion <= 60) fillColor = "rgba(255,255,255,0.4)";
      else if (completion <= 90) fillColor = "rgba(255,255,255,0.7)";
      else fillColor = "#ffffff";
    }

    context.save();

    // ===== Depth / Elevation =====
    if (isToday || logs > 0) {
      context.shadowColor = "rgba(0,0,0,0.4)";
      context.shadowBlur = 10;
      context.shadowOffsetY = 4;
    }

    // ===== Box =====
    drawRoundedRect(
      context,
      x,
      y,
      boxWidth,
      boxHeight,
      BORDER_RADIUS,
      fillColor,
      isToday ? "#ffffff" : "rgba(255,255,255,0.05)"
    );

    // ===== Day Label =====
    drawSafeText(context, DAY_LABELS[i], x + boxWidth / 2, y + 16, {
      font: "800 10px Inter, sans-serif",
      color: isToday ? "#000000" : "rgba(255,255,255,0.45)",
      align: "center",
      baseline: "middle",
      letterSpacing: 1,
    });

    // ===== Date Number =====
    drawSafeText(
      context,
      String(currentDate.getDate()),
      x + boxWidth / 2,
      y + boxHeight * 0.6,
      {
        font: "800 24px Inter, sans-serif",
        color: isToday ? "#000000" : "#ffffff",
        align: "center",
        baseline: "middle",
      }
    );

    // ===== Activity Indicator =====
    if (!isToday && logs > 0) {
      const dotRadius = 3;
      context.beginPath();
      context.arc(
        x + boxWidth / 2,
        y + boxHeight - 10,
        dotRadius,
        0,
        Math.PI * 2
      );
      context.fillStyle = theme.ACCENT || "#ffffff";
      context.fill();
    }

    context.restore();
  }

  context.restore();

  return {
    height: boxHeight + 24,
    anchorPoint,
  };
}
