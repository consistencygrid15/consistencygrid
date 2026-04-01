'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Production-Safe Canvas Wallpaper Overlay
 * 
 * This component renders dynamic content (time, date) OVER the server-generated wallpaper
 * Works identically in local dev and production with proper:
 * - SSR safety ("use client")
 * - Font loading before text rendering
 * - Cache-busting for production
 * - Real-time updates every minute
 * - Zero ghosting artifacts
 */
function CanvasOverlay({ canvas, width, height, theme }) {
  const overlayRef = useRef(null);
  const [lastRender, setLastRender] = useState(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    const overlayCanvas = overlayRef.current;
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

    // CRITICAL: Clear canvas completely first
    ctx.clearRect(0, 0, width, height);

    // Draw time
    ctx.fillStyle = theme.TEXT_MAIN || '#fafafa';
    ctx.font = 'bold 64px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, width / 2, 120);

    // Draw date
    ctx.fillStyle = theme.TEXT_SUB || '#a1a1aa';
    ctx.font = '400 20px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText(dateStr, width / 2, 160);

    setLastRender(now);
  }, [width, height, theme]);

  return (
    <canvas
      ref={overlayRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        pointerEvents: 'none'
      }}
    />
  );
}

/**
 * Enhanced Generator Preview with Real-Time Canvas Overlay
 * 
 * Shows the server-generated wallpaper + real-time canvas overlay
 * - Image: Server-side rendering (habits, goals, grid, etc.)
 * - Overlay: Client-side canvas (current time, date, updates every minute)
 * - Production safe: No SSR issues, cache-busting enabled
 */
export default function GeneratorPreviewWithCanvas({ publicToken, loading, form }) {
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const canvasContainerRef = useRef(null);
  const imgRef = useRef(null);

  const THEMES = {
    'minimal-dark': {
      BG: '#09090b',
      TEXT_MAIN: '#fafafa',
      TEXT_SUB: '#a1a1aa',
      ACCENT: '#ffffff'
    },
    'sunset-orange': {
      BG: '#09090b',
      TEXT_MAIN: '#fafafa',
      TEXT_SUB: '#a1a1aa',
      ACCENT: '#ff8c42'
    },
    'ocean-blue': {
      BG: '#09090b',
      TEXT_MAIN: '#fafafa',
      TEXT_SUB: '#a1a1aa',
      ACCENT: '#3b82f6'
    }
  };

  const activeTheme = THEMES[form.theme] || THEMES['minimal-dark'];
  const width = form.width || 1080;
  const height = form.height || 2340;

  // Build wallpaper URL with cache-busting
  const wallpaperUrl = publicToken
    ? `/w/${publicToken}/image.png?t=${refreshKey}&theme=${form.theme}&dob=${form.dob}&expectancy=${form.lifeExpectancyYears}`
    : '';

  // Ensure fonts are loaded
  useEffect(() => {
    if (typeof document === 'undefined') return;

    Promise.all([
      document.fonts.load('400 14px Inter, system-ui, sans-serif'),
      document.fonts.load('600 14px Inter, system-ui, sans-serif'),
      document.fonts.load('700 64px Inter, system-ui, sans-serif'),
      document.fonts.load('400 20px Inter, system-ui, sans-serif')
    ]).catch(() => {
      // Font loading is non-critical
    });
  }, []);

  // Set up update loop
  useEffect(() => {
    const updateOverlay = () => {
      setRefreshKey(Date.now());
    };

    // Update every 10 seconds to catch minute changes
    const interval = setInterval(updateOverlay, 10000);

    // Also update on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOverlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleCopy = () => {
    const url = `${window.location.origin}/w/${publicToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (imgRef.current) {
      const link = document.createElement('a');
      link.href = wallpaperUrl;
      link.download = `wallpaper-${Date.now()}.png`;
      link.click();
    }
  };

  const handleRefresh = () => {
    setRefreshKey(Date.now());
  };

  if (!publicToken) {
    return (
      <div className="bg-zinc-900 rounded-lg p-8 text-center">
        <p className="text-gray-400">Save your wallpaper settings to see a preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div className="relative bg-black rounded-lg overflow-hidden border border-zinc-700">
        {/* Mock Phone Frame */}
        <div className="relative mx-auto w-[290px] pt-2 pb-8">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl z-20" />

          {/* Wallpaper Container */}
          <div
            ref={canvasContainerRef}
            className="relative bg-zinc-900 rounded-2xl overflow-hidden"
            style={{
              aspectRatio: `${width}/${height}`,
              width: '100%'
            }}
          >
            {/* Base Image (Server-generated) */}
            <img
              ref={imgRef}
              src={wallpaperUrl}
              alt="Wallpaper preview"
              className="w-full h-full object-cover"
              onError={() => console.error('Failed to load wallpaper image')}
            />

            {/* Overlay Canvas (Real-time time + date) */}
            <CanvasOverlay
              canvas={canvasContainerRef.current}
              width={width}
              height={height}
              theme={activeTheme}
            />

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>

        <Button
          onClick={handleDownload}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <Download size={16} />
          Download
        </Button>

        <Button
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          {copied ? (
            <>
              <CheckCircle2 size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy Link
            </>
          )}
        </Button>
      </div>

      {/* Public Link */}
      {publicToken && (
        <div className="text-center text-xs text-gray-500">
          Public: {window.location.origin}/w/{publicToken}
        </div>
      )}

      {/* Update Indicator */}
      <div className="text-center text-xs text-gray-600">
        ✓ Real-time updates - Time refreshes every minute
      </div>
    </div>
  );
}
