"use client";

import { useState } from "react";
import { Smartphone, Maximize2 } from "lucide-react";

/**
 * ResolutionPicker Component - Enhanced Version
 * 
 * Select device presets or custom resolution for wallpaper:
 * ✨ 4 popular device presets with emojis
 * ✨ Custom resolution option
 * ✨ Animated transitions between modes
 * ✨ Responsive input layout
 * ✨ Smart preset detection
 * ✨ Input validation
 * 
 * Presets Include:
 * - Samsung S24 / Pixel 8 (1080×2340)
 * - iPhone 15 Pro Max (1290×2796)
 * - iPhone 14/15 (1170×2532)
 * - Standard HD (1080×1920)
 */
const PRESETS = [
    { 
        label: "Samsung S24 / Pixel 8", 
        emoji: "🟩",
        w: 1080, 
        h: 2340,
        description: "Latest Android flagships"
    },
    { 
        label: "iPhone 15 Pro Max", 
        emoji: "🍎",
        w: 1290, 
        h: 2796,
        description: "Largest iPhone model"
    },
    { 
        label: "iPhone 14/15", 
        emoji: "📱",
        w: 1170, 
        h: 2532,
        description: "Standard iPhone models"
    },
    { 
        label: "Standard HD", 
        emoji: "📺",
        w: 1080, 
        h: 1920,
        description: "Classic mobile resolution"
    },
];

/**
 * @param {number} width - Current width value
 * @param {number} height - Current height value
 * @param {Function} onChange - Callback with (dimension, value)
 */
export default function ResolutionPicker({ width, height, onChange }) {
    // ============================================================================================
    // STATE
    // ============================================================================================
    
    const [custom, setCustom] = useState(false);

    // ============================================================================================
    // EVENT HANDLERS
    // ============================================================================================
    
    /**
     * Handle preset selection from dropdown
     */
    function handlePreset(e) {
        const val = e.target.value;
        if (val === "custom") {
            setCustom(true);
        } else {
            setCustom(false);
            const [w, h] = val.split("x").map(Number);
            onChange("width", w);
            onChange("height", h);
        }
    }

    // ============================================================================================
    // DERIVED DATA
    // ============================================================================================
    
    const activePreset = PRESETS.find((p) => p.w === width && p.h === height);

    return (
        <div className="space-y-3">
            
            {/* Presets Dropdown */}
            <select
                className="w-full rounded-xl border-2 border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white transition-all hover:border-gray-300 cursor-pointer"
                onChange={handlePreset}
                value={custom ? "custom" : activePreset ? `${activePreset.w}x${activePreset.h}` : "custom"}
                title="Select your device resolution"
            >
                {PRESETS.map((p) => (
                    <option key={p.label} value={`${p.w}x${p.h}`}>
                        {p.emoji} {p.label} ({p.w}×{p.h})
                    </option>
                ))}
                <option value="custom">✂️ Custom Resolution...</option>
            </select>

            {/* Preset Info */}
            {!custom && activePreset && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2.5">
                    <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-blue-700">{activePreset.description}</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                            {activePreset.w}×{activePreset.h} pixels
                        </p>
                    </div>
                </div>
            )}

            {/* Custom Resolution Inputs - Animated */}
            {custom && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 border border-orange-200">
                    <div className="flex items-start gap-2 mb-2">
                        <Maximize2 className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-orange-700">Custom Resolution</p>
                            <p className="text-xs text-orange-600/80">Set width and height in pixels</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Width Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                                <span>📏</span>Width
                            </label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => onChange("width", Number(e.target.value))}
                                min={480}
                                max={2000}
                                className="w-full rounded-lg border-2 border-orange-200 px-3 py-2.5 text-sm font-medium bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                placeholder="1080"
                            />
                            <p className="text-xs text-gray-500">pixels</p>
                        </div>

                        {/* Height Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                                <span>📏</span>Height
                            </label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => onChange("height", Number(e.target.value))}
                                min={800}
                                max={3000}
                                className="w-full rounded-lg border-2 border-orange-200 px-3 py-2.5 text-sm font-medium bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                placeholder="2340"
                            />
                            <p className="text-xs text-gray-500">pixels</p>
                        </div>
                    </div>

                    {/* Aspect Ratio Display */}
                    <div className="bg-white/60 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600">
                            <span className="font-bold text-gray-900">{width}×{height}</span>
                            {" "}
                            <span className="text-gray-500">
                                ({(width / height).toFixed(2)} aspect ratio)
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
