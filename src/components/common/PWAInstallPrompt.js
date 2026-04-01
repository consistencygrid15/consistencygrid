'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

/**
 * APK Install Prompt Component
 * Shows install prompt strictly for Android devices
 * Downloads the native Android App directly over APK
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if device is Android
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);

    // Check if they already dismissed it today
    const dismissedStore = localStorage.getItem('apk_prompt_dismissed_date');
    const today = new Date().toDateString();

    // Check if already in standalone/installed mode (webview/PWA)
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isAndroidDevice && dismissedStore !== today && !isStandalone) {
      setIsAndroid(true);
      // Small delay so it's not jarring
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleInstall = () => {
    // Direct link to the hosted APK file
    // Assumes we will serve this from the public folder
    const apkUrl = "/ConsistencyGrid.apk";

    // Trigger download
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = "ConsistencyGrid.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Hide prompt
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for today
    localStorage.setItem('apk_prompt_dismissed_date', new Date().toDateString());
  };

  if (!showPrompt || !isAndroid) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Download size={18} />
            Install Native Android App
          </h3>
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 rounded p-1 transition"
            aria-label="Dismiss install prompt"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-gray-700 text-sm mb-3">
            Get the full Consistency Grid experience. Install our native Android app to set your goals as your actual phone wallpaper!
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
            >
              Not Now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded font-medium transition shadow-sm"
            >
              Download APK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
