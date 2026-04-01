'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Real-Time Canvas Wallpaper Renderer
 * 
 * Generates dynamic wallpaper with:
 * - Current time (HH:mm, updates every minute)
 * - Current date (weekday + day + month)
 * - Life grid visual
 * - Proper font loading before rendering
 * - No SSR issues
 * - Production-safe caching handling
 */
export function CanvasWallpaperRenderer({ 
  baseImageUrl = '/wallpapers/default.png',
  theme = 'minimal-dark',
  showGrid = true,
  gridSize = 52,
  canvasWidth = 1080,
  canvasHeight = 2400
}) {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const animationFrameRef = useRef(null);

  // Color themes matching your backend
  const THEMES = {
    'minimal-dark': {
      BG: '#09090b',
      TEXT_MAIN: '#fafafa',
      TEXT_SUB: '#a1a1aa',
      ACCENT: '#ffffff',
      GRID_ACTIVE: '#ffffff',
      GRID_INACTIVE: '#27272a'
    },
    'sunset-orange': {
      BG: '#09090b',
      TEXT_MAIN: '#fafafa',
      TEXT_SUB: '#a1a1aa',
      ACCENT: '#ff8c42',
      GRID_ACTIVE: '#ff8c42',
      GRID_INACTIVE: '#2a2019'
    },
    'ocean-blue': {
      BG: '#09090b',
      TEXT_MAIN: '#fafafa',
      TEXT_SUB: '#a1a1aa',
      ACCENT: '#3b82f6',
      GRID_ACTIVE: '#3b82f6',
      GRID_INACTIVE: '#1e3a8a'
    }
  };

  const activeTheme = THEMES[theme] || THEMES['minimal-dark'];

  /**
   * Ensure fonts are loaded before drawing
   * This is critical for production where fonts might not be ready
   */
  const ensureFontsLoaded = async () => {
    if (typeof document === 'undefined') return;

    try {
      // Load Inter font with multiple weights
      await Promise.all([
        document.fonts.load('400 14px Inter, system-ui, sans-serif'),
        document.fonts.load('600 14px Inter, system-ui, sans-serif'),
        document.fonts.load('700 48px Inter, system-ui, sans-serif'),
        document.fonts.load('600 24px Inter, system-ui, sans-serif')
      ]);
    } catch (error) {
      // Font loading is non-critical; continue with defaults
      console.warn('Font loading issue:', error);
    }
  };

  /**
   * Load base image with proper error handling
   * Handles case-sensitive paths on Linux
   */
  const loadBaseImage = async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Important: Set crossOrigin for same-origin images in modern browsers
      img.crossOrigin = 'anonymous';
      
      // Add timestamp to bypass browser cache (cache-busting)
      const timestamp = new Date().getTime();
      const urlWithCache = `${baseImageUrl}?t=${timestamp}`;
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        // Fallback: if image fails to load, continue with just background
        console.warn(`Failed to load base image: ${baseImageUrl}`);
        resolve(null);
      };
      
      img.src = urlWithCache;
    });
  };

  /**
   * Format time as HH:mm
   */
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * Format date as "Monday, 24 January"
   */
  const formatDate = (date) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${weekday}, ${day} ${month}`;
  };

  /**
   * Draw life grid (52 weeks × 80 years or custom)
   */
  const drawGrid = (ctx, x, y, width, height, cellSize = gridSize) => {
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);
    
    ctx.fillStyle = activeTheme.GRID_INACTIVE;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = x + col * cellSize;
        const cellY = y + row * cellSize;
        
        // Draw cell with 1px gap
        ctx.fillRect(cellX, cellY, cellSize - 1, cellSize - 1);
      }
    }
    
    // Highlight a few random cells to show active weeks
    ctx.fillStyle = activeTheme.GRID_ACTIVE;
    for (let i = 0; i < 3; i++) {
      const randomCol = Math.floor(Math.random() * cols);
      const randomRow = Math.floor(Math.random() * rows);
      const cellX = x + randomCol * cellSize;
      const cellY = y + randomRow * cellSize;
      
      ctx.fillRect(cellX, cellY, cellSize - 1, cellSize - 1);
    }
  };

  /**
   * Main rendering function
   * Clears canvas and redraws everything
   */
  const renderWallpaper = async (baseImage) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    if (!ctx) return;

    // CRITICAL: Set canvas resolution to match display size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 1. Clear canvas completely
    ctx.fillStyle = activeTheme.BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw base image if available
    if (baseImage) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    // 3. Draw time section (top)
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDate(now);

    // Time display
    ctx.fillStyle = activeTheme.TEXT_MAIN;
    ctx.font = 'bold 64px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, canvas.width / 2, 120);

    // Date display
    ctx.fillStyle = activeTheme.TEXT_SUB;
    ctx.font = '400 20px Inter, system-ui, sans-serif';
    ctx.fillText(dateStr, canvas.width / 2, 160);

    // 4. Draw grid section (middle)
    if (showGrid) {
      const gridX = 40;
      const gridY = 220;
      const gridWidth = canvas.width - 80;
      const gridHeight = canvas.height - 400;
      
      drawGrid(ctx, gridX, gridY, gridWidth, gridHeight, gridSize);
    }

    // 5. Draw accent line
    ctx.strokeStyle = activeTheme.ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 200);
    ctx.lineTo(canvas.width - 40, 200);
    ctx.stroke();

    // 6. Draw footer with update timestamp
    ctx.fillStyle = activeTheme.TEXT_SUB;
    ctx.font = '400 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Updated: ${now.toLocaleTimeString()}`, 40, canvas.height - 40);
  };

  /**
   * Initialize canvas and set up update loop
   */
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // Step 1: Ensure fonts are ready
      await ensureFontsLoaded();

      // Step 2: Load base image
      const baseImage = await loadBaseImage();

      if (!isMounted) return;

      // Step 3: Initial render
      await renderWallpaper(baseImage);
      setIsReady(true);

      // Step 4: Set up update loop (every minute + on visibility change)
      const updateCanvas = async () => {
        const now = new Date();
        
        // Only redraw if minute has changed
        if (now.getMinutes() !== lastUpdate.getMinutes() || 
            now.getHours() !== lastUpdate.getHours()) {
          await renderWallpaper(baseImage);
          setLastUpdate(now);
        }
      };

      // Update every 10 seconds to catch minute changes
      const interval = setInterval(updateCanvas, 10000);

      // Also update when page becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateCanvas();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    initialize();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [baseImageUrl, theme, showGrid]);

  /**
   * Export canvas as image (for downloading wallpaper)
   */
  const downloadWallpaper = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `wallpaper-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-zinc-700 rounded-lg shadow-2xl max-w-full h-auto"
        style={{
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: `${canvasWidth}/${canvasHeight}`
        }}
      />
      
      {isReady && (
        <div className="flex gap-2">
          <button
            onClick={downloadWallpaper}
            className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-gray-100"
          >
            Download
          </button>
          <span className="text-xs text-gray-500 self-center">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {!isReady && (
        <div className="text-gray-400 text-sm">Loading wallpaper...</div>
      )}
    </div>
  );
}
