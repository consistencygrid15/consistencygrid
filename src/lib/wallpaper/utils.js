/**
 * Draws a rounded rectangle on the canvas
 * 
 * This utility function handles both modern browsers with native roundRect support
 * and fallback to regular rectangles for older canvas implementations.
 * 
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {number} xCoordinate - X position of the top-left corner
 * @param {number} yCoordinate - Y position of the top-left corner
 * @param {number} width - Width of the rectangle
 * @param {number} height - Height of the rectangle
 * @param {number} borderRadius - Radius for rounded corners (ignored if roundRect not supported)
 * @param {string} [fillColor] - Optional fill color (CSS color string or gradient)
 * @param {string} [strokeColor] - Optional stroke color (CSS color string)
 * 
 * @example
 * // Draw a filled blue rounded rectangle
 * drawRoundedRect(ctx, 10, 10, 100, 50, 8, '#3b82f6');
 * 
 * @example
 * // Draw a rounded rectangle with border
 * drawRoundedRect(ctx, 10, 10, 100, 50, 8, '#ffffff', '#000000');
 *//**
 * Draw a rounded rectangle
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
 * SAFE TEXT DRAW
 */
export function drawSafeText(
  ctx,
  text,
  x,
  y,
  {
    font = "16px Inter, sans-serif",
    color = "#ffffff",
    align = "left",
    baseline = "alphabetic",
    shadow = false,
  } = {}
) {
  if (!text) return;

  ctx.save();
  ctx.font = font;
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
