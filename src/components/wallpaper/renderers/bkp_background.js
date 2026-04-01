/**
 * Draws the wallpaper background with a subtle radial gradient
 * 
 * Creates visual depth by applying a radial gradient from the center-top of the canvas.
 * For dark themes, it creates a subtle fade from the base color to pure black.
 * For light themes, it maintains the same color throughout.
 * 
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 * @param {Object} theme - Theme object containing color definitions
 * @param {string} theme.BG - Background color (hex string)
 */
export function drawBackground(context, canvasWidth, canvasHeight, theme) {
    // Create a radial gradient starting from center-top (upper third of canvas)
    // This creates a subtle "spotlight" effect that adds depth to the wallpaper
    const gradient = context.createRadialGradient(
        canvasWidth / 2,      // X center of gradient
        canvasHeight / 3,     // Y position (upper third for natural lighting)
        0,                    // Inner radius (starts at center point)
        canvasWidth / 2,      // X center of outer circle
        canvasHeight / 3,     // Y center of outer circle
        canvasHeight          // Outer radius (extends to full height)
    );

    // Add color stops: start with theme background color
    gradient.addColorStop(0, theme.BG);

    // For dark themes, fade to pure black for depth effect
    // For light themes, maintain same color (no fade needed)
    gradient.addColorStop(1, theme.BG === '#09090b' ? '#000000' : theme.BG);

    // Apply the gradient as the fill style
    context.fillStyle = gradient;

    // Fill the entire canvas with the gradient background
    context.fillRect(0, 0, canvasWidth, canvasHeight);
}
