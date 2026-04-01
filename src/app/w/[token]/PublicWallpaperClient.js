"use client";

import { useState, useEffect } from "react";
import CopyLinkButton from "@/components/common/CopyLinkButton";
import { RefreshCw } from "lucide-react";

export default function PublicWallpaperClient({ token, settings: s, ageYears, lifeProgress }) {
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [imageLoading, setImageLoading] = useState(true);

  // Auto-refresh wallpaper every 10 seconds to show latest data
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setImageLoading(true);
    setRefreshKey(Date.now());
  };

  const wallpaperUrl = `/w/${token}/image.png?t=${refreshKey}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] backdrop-blur-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                ConsistencyGrid
              </h1>
              <p className="mt-1 text-xs text-gray-400">
                Live Wallpaper Preview
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-400">Live</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Wallpaper Preview with Refresh */}
          <div className="relative group">
            <img
              key={refreshKey}
              src={wallpaperUrl}
              alt="Wallpaper Preview"
              className="w-full rounded-2xl border border-white/20 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onLoad={() => setImageLoading(false)}
            />

            {/* Overlay with Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center gap-3">
              <button
                onClick={handleManualRefresh}
                className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <a
                href={wallpaperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
              >
                Open
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-6 space-y-4">

            {/* Life Progress Card */}
            <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-4 border border-orange-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-orange-400">Life Progress</span>
                <span className="text-lg font-bold text-orange-400">{lifeProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000"
                  style={{ width: `${lifeProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {ageYears} of {s.lifeExpectancyYears} years
              </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400">Birth Date</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {new Date(s.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-400">Age</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {ageYears} years
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="text-xs text-gray-400">Life Grid</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {s.showLifeGrid ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs text-gray-400">Year Grid</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {s.showYearGrid ? "✓ Enabled" : "✗ Disabled"}
                </p>
              </div>

            </div>

            {/* Goal Section */}
            {s.goalEnabled && (
              <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-xs font-medium text-blue-400">Active Goal</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {s.goalTitle || "My Goal"}
                </p>
              </div>
            )}

          </div>

          {/* Info Card */}
          <div className="mt-6 rounded-xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-2">
                  Your wallpaper is live and accessible via:
                </p>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-white/10">
                  <code className="text-xs text-orange-400 font-mono flex-1 truncate">
                    /w/{token}/image.png
                  </code>
                  <CopyLinkButton token={token} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
          <p className="text-xs text-center text-gray-500">
            🔄 Auto-refreshes every 10 seconds • Last updated: {new Date(refreshKey).toLocaleTimeString()}
          </p>
        </div>

      </div>
    </main>
  );
}
