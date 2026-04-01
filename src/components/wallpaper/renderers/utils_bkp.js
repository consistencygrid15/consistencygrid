/**
 * Draws a rounded rectangle on the canvas
 */
export function drawRoundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius = 8,
    fillColor = "#000",
    strokeColor = null
) {
    ctx.save();
    ctx.beginPath();

    const r = Math.min(radius, width / 2, height / 2);

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }

    ctx.restore();
}

// Cross-platform font stack (Inter is registered on server and client)
export const FONT_STACK = "'Inter', -apple-system, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

/**
 * SAFE TEXT DRAW
 */
export function drawSafeText(
    ctx,
    text,
    x,
    y,
    {
        font = `16px ${FONT_STACK}`,
        color = "#ffffff",
        align = "left",
        baseline = "alphabetic",
        shadow = false,
    } = {}
) {
    if (!text) return;

    ctx.save();

    // Auto-append stack if it's a simple shorthand without commas
    ctx.font = font.includes(",") ? font : `${font}, ${FONT_STACK}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
    } else {
        ctx.shadowBlur = 0;
    }

    const safeX = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : 0;

    ctx.fillText(String(text), safeX, safeY);
    ctx.restore();
}
