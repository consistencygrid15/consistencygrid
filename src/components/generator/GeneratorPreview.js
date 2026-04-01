"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Copy, CheckCircle2, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * GeneratorPreview Component - Enhanced Version
 * 
 * Real-time live preview of the wallpaper with:
 * ✨ Dynamic image generation with live updates
 * ✨ Clock overlay showing current time (demo)
 * ✨ Download and copy functionality
 * ✨ Responsive preview sizing
 * ✨ Loading state feedback
 * ✨ Debounced updates for performance
 * 
 * @param {string} publicToken - User's public wallpaper token
 * @param {boolean} loading - Loading state indicator
 * @param {Object} form - Current form settings
 */
export default function GeneratorPreview({ publicToken, loading, form, onReset, previewKey }) {
    const router = useRouter(); // Initialize router
    // ============================================================================================
    // STATE MANAGEMENT
    // ============================================================================================

    const [copied, setCopied] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [time, setTime] = useState(new Date());
    const [debugMode] = useState(false); // Toggle for debugging
    const [forceRefreshKey, setForceRefreshKey] = useState(0);

    // ============================================================================================
    // EFFECTS: CLOCK & TIMER
    // ============================================================================================

    /**
     * Update clock display every second
     * Shows real-time preview of what the wallpaper will look like
     */
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ============================================================================================
    // EFFECTS: LIVE PREVIEW GENERATOR
    // ============================================================================================

    /**
     * Generate live preview URL with current form settings
     * Debounced to avoid excessive API calls during rapid form changes
     * Updates every 600ms when form changes
     */
    useEffect(() => {
        if (!publicToken) return;

        // Set initial URL if empty
        if (!previewUrl) {
            setPreviewUrl(`/w/${publicToken}/image.png?t=${Date.now()}`);
        }

        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            params.set("t", Date.now());

            // Add settings from form (live overrides)
            if (form) {
                Object.entries(form).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== "") {
                        // Only send simple types
                        // Skip customBackgroundUrl - it's stored in DB and
                        // read server-side directly (safe from URL length limits too)
                        if (typeof v !== 'object' && k !== 'customBackgroundUrl') {
                            params.set(k, v.toString());
                        }
                    }
                });
            }

            setPreviewUrl(`/w/${publicToken}/image.png?${params.toString()}`);
        }, 600);

        return () => {
            clearTimeout(timer);
        };
    }, [form, publicToken]);

    // ── Force immediate preview reload when previewKey changes (e.g. after bg upload) ──
    useEffect(() => {
        if (!publicToken || !previewKey) return;
        // Skip debounce - reload immediately on key change
        setPreviewUrl(`/w/${publicToken}/image.png?t=${Date.now()}`);
    }, [previewKey, publicToken]);

    // ============================================================================================
    // EVENT HANDLERS: DOWNLOAD & COPY
    // ============================================================================================

    /**
     * Download the current wallpaper as PNG
     * Uses the current preview URL with all active settings
     */
    async function handleDownload() {
        if (!publicToken) return;
        const url = previewUrl || `/w/${publicToken}/image.png`;

        // ✅ Android App Bridge Support
        if (typeof window !== 'undefined' && window.Android && window.Android.downloadFile) {
            try {
                // For images, we can fetch it and convert to base64, 
                // or just try to trigger the native download listener.
                // Triggering native download listener is easier for direct URLs.
                // But for perfect reliability with auth/sessions, we can fetch it here.
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    window.Android.downloadFile(base64data, "consistency-grid.png", "image/png");
                };
                reader.readAsDataURL(blob);
                return;
            } catch (err) {
                console.error('Android image download failed', err);
            }
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = "consistency-grid.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Copy the wallpaper sharing URL to clipboard
     * Shows success feedback for 2 seconds
     */
    async function handleCopy() {
        if (!publicToken) return;
        const url = `${window.location.origin}/w/${publicToken}/image.png`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // ============================================================================================
    // RENDER
    // ============================================================================================

    return (
        <div className="sticky top-6 space-y-4">

            {/* ┌─────────────────────────────────────────────────────────────────────────────────┐ */}
            {/* │ ACTION BUTTONS BAR - Download, Copy, Reset                                      │ */}
            {/* │ - Responsive spacing and sizing                                                 │ */}
            {/* │ - Feedback states (success, disabled, hover)                                    │ */}
            {/* └─────────────────────────────────────────────────────────────────────────────────┘ */}

            <div className="space-y-2 mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        onClick={onReset}
                        title="Reload to reset all settings"
                        className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                    >
                        ↻ Reset
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={!publicToken || loading}
                        title={copied ? "Copied!" : "Copy sharing URL to clipboard"}
                        className="rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 active:scale-95"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Copy URL</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!publicToken || loading}
                        title="Download wallpaper as PNG image"
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95 shadow-md"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                    </button>
                </div>
                {loading && (
                    <p className="text-xs text-gray-500 text-center">
                        ⏳ Generating preview...
                    </p>
                )}
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────────────────────┐ */}
            {/* │ PHONE MOCKUP - Responsive Container                                            │ */}
            {/* │ - Realistic iPhone-style design                                                │ */}
            {/* │ - Dynamic Island notch simulation                                              │ */}
            {/* │ - Live preview of wallpaper                                                    │ */}
            {/* │ - Real-time clock display                                                      │ */}
            {/* └─────────────────────────────────────────────────────────────────────────────────┘ */}

            <div className="relative mx-auto h-[580px] sm:h-[600px] w-[290px] sm:w-[300px] overflow-hidden rounded-[38px] sm:rounded-[40px] border-8 border-gray-900 bg-black shadow-2xl hover:shadow-3xl transition-shadow">

                {/* Dynamic Island / Notch - iPhone Style */}
                <div className="absolute top-0 left-1/2 h-6 sm:h-7 w-32 sm:w-40 -translate-x-1/2 rounded-b-3xl bg-black z-20 shadow-lg" />

                {/* Screen Content Container */}
                <div className="h-full w-full bg-gray-900 text-white flex items-center justify-center relative overflow-hidden">

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin text-4xl mb-2">⏳</div>
                                <p className="text-xs text-white/80">Generating...</p>
                            </div>
                        </div>
                    )}

                    {/* Lock Screen Clock Simulation */}
                    <div className="absolute top-[12%] left-0 right-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white/95 drop-shadow-lg font-mono">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </h1>
                        <p className="text-sm sm:text-base font-medium text-white/75 mt-2 drop-shadow-md">
                            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center p-4">
                            <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Updating preview...</p>
                        </div>
                    ) : publicToken ? (
                        <img
                            src={previewUrl || `/w/${publicToken}/image.png?t=${Date.now()}`}
                            alt="Wallpaper Preview"
                            className="w-full h-full object-cover transition-opacity duration-300"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 text-center px-4">
                            Save settings to generate preview
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 text-center">
                {publicToken && (
                    <a
                        href={`/w/${publicToken}`}
                        target="_blank"
                        className="text-xs text-orange-600 hover:underline font-medium"
                    >
                        Open Public Link ↗
                    </a>
                )}
            </div>
        </div>
    );
}
