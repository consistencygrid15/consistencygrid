import { drawSafeText } from "./utils";

/**
 * Draws the motivational quote footer at the bottom of the wallpaper
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} params
 * @param {number} params.width
 * @param {number} params.height
 * @param {string} params.quote
 * @param {Object} params.theme
 */
export function drawQuote(context, { width, height, quote, theme }) {
    if (!quote) return;

    // Simplified for client side
    const quoteY = height - 120; // Adjusted for padding

    // MAIN QUOTE
    drawSafeText(context, quote.toUpperCase(), width / 2, quoteY, {
        font: "500 18px Inter, sans-serif",
        color: "#525252",
        align: "center",
        shadow: true,
        shadowColor: "rgba(0,0,0,0.35)",
        shadowBlur: 6,
        shadowOffsetY: 2,
    });

    // BRANDING
    drawSafeText(context, "CONSISTENCY GRID", width / 2, quoteY + 30, {
        font: "14px Inter, sans-serif",
        color: "#333",
        align: "center",
        shadow: false,
    });
}
