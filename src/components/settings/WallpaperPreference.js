"use client";

import { useState, useEffect } from "react";

/**
 * Wallpaper Preference Component
 * 
 * Mobile/Tablet Only: Shows where to apply wallpaper (Home, Lock, Both)
 * Sends preference to Android app via bridge
 * Hidden on desktop screens (> 1024px)
 */
export default function WallpaperPreference() {
  const [target, setTarget] = useState("BOTH");
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasAndroidBridge, setHasAndroidBridge] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Detect mobile/tablet on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      // Check viewport width
      const isMobileWidth = window.innerWidth <= 1024;

      // Check user agent for Android WebView
      const isAndroidWebView = /webview|android/i.test(navigator.userAgent);

      // Show on mobile width OR Android WebView
      const isMobileScreen = isMobileWidth || isAndroidWebView;
      setIsMobile(isMobileScreen);

      // Check for Android bridge
      setHasAndroidBridge(!!(window.Android && window.Android.setWallpaperTarget));
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    // Load local backup if storage is available
    const localTarget = localStorage.getItem("wallpaper_target_backup");
    if (localTarget) setTarget(localTarget);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Fetch initial state and verify bridge
  useEffect(() => {
    if (hasAndroidBridge) {
      try {
        if (window.Android.getWallpaperTarget) {
          const savedTarget = window.Android.getWallpaperTarget();
          setTarget(savedTarget);
        }
        if (window.Android.isAutoUpdateEnabled) {
          const savedAutoUpdate = window.Android.isAutoUpdateEnabled();
          setAutoUpdate(savedAutoUpdate);
        }
      } catch (error) {
        console.error("[WallpaperPreference] Error fetching initial state:", error);
      }
    }
  }, [hasAndroidBridge]);

  // Send preference to Android app
  const handleTargetChange = async (newTarget) => {
    // Optimistic UI update
    setTarget(newTarget);
    localStorage.setItem("wallpaper_target_backup", newTarget);

    if (hasAndroidBridge && window.Android.setWallpaperTarget) {
      try {
        setIsSyncing(true);
        window.Android.setWallpaperTarget(newTarget);

        // Immediately trigger a sync to show the user it works
        const res = await fetch("/api/settings/me");
        const data = await res.json();
        const token = data.user?.publicToken;

        if (token && window.Android.saveWallpaperUrl) {
          const url = `${window.location.origin}/w/${token}/image.png`;
          window.Android.saveWallpaperUrl(url);
        }
      } catch (error) {
        console.error("[WallpaperPreference] Failed to update target:", error);
      } finally {
        setTimeout(() => setIsSyncing(false), 2000);
      }
    }
  };

  // Handle Auto-Update change
  const handleAutoUpdateChange = (enabled) => {
    setAutoUpdate(enabled);

    if (hasAndroidBridge && window.Android.setAutoUpdateEnabled) {
      try {
        window.Android.setAutoUpdateEnabled(enabled);
      } catch (error) {
        console.error("[WallpaperPreference] Failed to set auto-update:", error);
      }
    }
  };

  // Only render on mobile/tablet
  if (!isMobile) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Wallpaper Preference</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select which screen to update
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Home Screen Option */}
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
          style={{
            borderColor: target === "HOME" ? "#fb923c" : "#f3f4f6",
            backgroundColor: target === "HOME" ? "#fffaf1" : "transparent"
          }}>
          <input
            type="radio"
            name="wallpaper-target"
            value="HOME"
            checked={target === "HOME"}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-900">Home Screen Only</p>
            <p className="text-xs text-gray-500 mt-0.5">Your main desktop background</p>
          </div>
          {target === "HOME" && <span className="text-orange-500">🏠</span>}
        </label>

        {/* Lock Screen Option */}
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
          style={{
            borderColor: target === "LOCK" ? "#fb923c" : "#f3f4f6",
            backgroundColor: target === "LOCK" ? "#fffaf1" : "transparent"
          }}>
          <input
            type="radio"
            name="wallpaper-target"
            value="LOCK"
            checked={target === "LOCK"}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-900">Lock Screen Only</p>
            <p className="text-xs text-gray-500 mt-0.5">The screen shown before unlocking</p>
          </div>
          {target === "LOCK" && <span className="text-orange-500">🔒</span>}
        </label>

        {/* Both Screens Option */}
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
          style={{
            borderColor: target === "BOTH" ? "#fb923c" : "#f3f4f6",
            backgroundColor: target === "BOTH" ? "#fffaf1" : "transparent"
          }}>
          <input
            type="radio"
            name="wallpaper-target"
            value="BOTH"
            checked={target === "BOTH"}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-900">Both Screens</p>
            <p className="text-xs text-gray-500 mt-0.5">Unified experience for both</p>
          </div>
          {target === "BOTH" && <span className="text-orange-500">✨</span>}
        </label>
      </div>

      {isSyncing && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-orange-600 animate-pulse bg-orange-50 py-3 rounded-xl border border-orange-100">
          <span className="h-2 w-2 rounded-full bg-orange-600"></span>
          Applying to {target === "BOTH" ? "Both Screens" : target === "HOME" ? "Home Screen" : "Lock Screen"}...
        </div>
      )}

      {/* Auto Update Section */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>⏰</span>
          Daily Auto Update
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Automatically update your wallpaper every day at 12 AM
        </p>

        <label className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-200 bg-gray-50/30 cursor-pointer transition-all">
          <div>
            <p className="font-bold text-gray-900">Background Updates</p>
            <p className="text-xs text-gray-500">Updates even when the app is closed</p>
          </div>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent">
            <input
              type="checkbox"
              className="sr-only"
              checked={autoUpdate}
              onChange={(e) => handleAutoUpdateChange(e.target.checked)}
            />
            <span
              className={`${autoUpdate ? 'bg-orange-500' : 'bg-gray-200'
                } relative inline-block h-6 w-11 rounded-full transition-colors duration-200 ease-in-out`}
            >
              <span
                className={`${autoUpdate ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out mt-1`}
              />
            </span>
          </div>
        </label>
      </div>

      {/* Bridge Status */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <div className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${hasAndroidBridge ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          Device Connection: {hasAndroidBridge ? "ACTIVE" : "DESKTOP"}
        </div>
        <div className="uppercase tracking-wider">
          Mode: {target}
        </div>
      </div>
    </div>
  );
}
