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

/**
 * Draws a frosted glass card effect behind a content area.
 * 
 * This creates a premium semi-transparent rounded box with:
 * - A dark blurred fill (simulated frosted glass)
 * - Subtle white border
 * - Outer glow for depth
 * 
 * Use this when a custom photo background is active so text/grids are readable.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x        - Left edge
 * @param {number} y        - Top edge
 * @param {number} width
 * @param {number} height
 * @param {Object} [options]
 * @param {number} [options.radius=40]          - Corner radius
 * @param {string} [options.fillColor]          - Fill color (default: dark semi-transparent)
 * @param {string} [options.borderColor]        - Border color
 * @param {number} [options.padding=0]          - Extra padding around the box
 */
export function drawFrostedCard(ctx, x, y, width, height, {
    radius = 40,
    fillColor = "rgba(0, 0, 0, 0.42)",
    borderColor = "rgba(255, 255, 255, 0.10)",
    padding = 0,
} = {}) {
    const px = x - padding;
    const py = y - padding;
    const pw = width + padding * 2;
    const ph = height + padding * 2;
    const r = Math.min(radius, pw / 2, ph / 2);

    ctx.save();

    // ── Outer glow / shadow ───────────────────────────────────────
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;

    // ── Build path ────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(px + r, py);
    ctx.lineTo(px + pw - r, py);
    ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
    ctx.lineTo(px + r, py + ph);
    ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
    ctx.lineTo(px, py + r);
    ctx.quadraticCurveTo(px, py, px + r, py);
    ctx.closePath();

    // ── Fill ──────────────────────────────────────────────────────
    ctx.fillStyle = fillColor;
    ctx.fill();

    // ── Border ────────────────────────────────────────────────────
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

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
