'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X, ChevronRight } from 'lucide-react';
import { isAndroidApp } from '@/lib/platform-utils';
import Link from 'next/link';

export default function AppDownloadBanner() {
  const [shouldShow, setShouldShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already inside the Android app
    if (isAndroidApp()) return;

    // Check if user dismissed the banner this session
    const wasDismissed = sessionStorage.getItem('apk-banner-dismissed');
    if (!wasDismissed) {
      setShouldShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('apk-banner-dismissed', '1');
    // Animate out
    setTimeout(() => setShouldShow(false), 300);
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        dismissed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)',
        borderColor: 'rgba(249,115,22,0.3)',
        boxShadow: '0 0 40px rgba(249,115,22,0.08)',
      }}
    >
      {/* Glow accent top-right */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
      >
        <X size={14} />
      </button>

      <div className="flex flex-col sm:flex-row items-center gap-4 px-5 py-4 relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/50 shrink-0">
          <Smartphone size={22} className="text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-white text-sm leading-tight">
            Get the ConsistencyGrid Android App
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Track habits &amp; update your wallpaper from your home screen — no Play Store needed.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Direct download */}
          <a
            href="/api/download/app"
            id="apk-direct-download-btn"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Download size={14} />
            Download
          </a>

          {/* Learn more */}
          <Link
            href="/download"
            id="apk-learn-more-btn"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
          >
            How to install
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
