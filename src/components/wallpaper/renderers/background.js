/**
 * Draws the wallpaper background.
 * 
 * Supports two modes:
 *  1. Custom photo background: draws the user's uploaded image stretched to fill the canvas,
 *     then overlays a semi-transparent dark layer so text stays readable.
 *  2. Default gradient: a subtle radial gradient using the theme's BG color.
 * 
 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 * @param {Object} theme - Theme object containing color definitions
 * @param {string} theme.BG - Background color (hex string)
 * @param {HTMLImageElement|null} [bgImage] - Pre-loaded Image element for custom background (optional)
 */
export function drawBackground(context, canvasWidth, canvasHeight, theme, bgImage = null) {
    if (bgImage) {
        // ── Custom photo background ──────────────────────────────────────────
        // Draw the image to fill the entire canvas (cover-fit)
        const imgAspect = bgImage.width / bgImage.height;
        const canvasAspect = canvasWidth / canvasHeight;

        let sx = 0, sy = 0, sw = bgImage.width, sh = bgImage.height;

        if (imgAspect > canvasAspect) {
            // Image is wider than canvas – crop sides
            sw = bgImage.height * canvasAspect;
            sx = (bgImage.width - sw) / 2;
        } else {
            // Image is taller than canvas – crop top/bottom
            sh = bgImage.width / canvasAspect;
            sy = (bgImage.height - sh) / 2;
        }

        context.drawImage(bgImage, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);

        // Dark overlay so text/grid elements remain readable
        context.fillStyle = "rgba(0, 0, 0, 0.55)";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
        // ── Default gradient background ──────────────────────────────────────
        // Create a radial gradient starting from center-top (upper third of canvas)
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
        gradient.addColorStop(1, theme.BG === '#09090b' ? '#000000' : theme.BG);

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }
}

/**
 * Loads a custom background image from a URL or base64 data URL.
 * Returns a Promise that resolves to an HTMLImageElement, or null on failure.
 * 
 * @param {string} url - Image URL or base64 data URL
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadBackgroundImage(url) {
    return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.warn('[loadBackgroundImage] Failed to load custom background');
            resolve(null);
        };
        img.src = url;
    });
}
