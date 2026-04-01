"use client";

import { Check } from "lucide-react";

/**
 * ThemeSelector Component - Enhanced Version
 * 
 * Color theme selector with 6 predefined themes:
 * ✨ Visual color swatches for each theme
 * ✨ Hover and active states with smooth transitions
 * ✨ Responsive 2-column grid
 * ✨ Check indicator for selected theme
 * ✨ Emoji icons for theme identification
 * 
 * Themes:
 * - Minimal Dark: Pure black and white
 * - Sunset Orange: Warm orange tones
 * - Ocean Blue: Cool blue tones
 * - Forest Green: Natural green palette
 * - Purple Haze: Vibrant purple
 * - Monochrome: Inverted B&W
 */
const THEMES = [
    { 
        id: "minimal-dark", 
        name: "Minimal Dark", 
        emoji: "🌙",
        colors: ["#000000", "#ffffff", "#333333"],
        description: "Pure and minimal"
    },
    { 
        id: "sunset-orange", 
        name: "Sunset Orange", 
        emoji: "🌅",
        colors: ["#000000", "#ff7a00", "#333333"],
        description: "Warm energy"
    },
    { 
        id: "ocean-blue", 
        name: "Ocean Blue", 
        emoji: "🌊",
        colors: ["#000000", "#0088ff", "#333333"],
        description: "Cool waters"
    },
    { 
        id: "forest-green", 
        name: "Forest Green", 
        emoji: "🌲",
        colors: ["#000000", "#00cc66", "#333333"],
        description: "Natural growth"
    },
    { 
        id: "purple-haze", 
        name: "Purple Haze", 
        emoji: "🔮",
        colors: ["#000000", "#a855f7", "#333333"],
        description: "Mystical vibes"
    },
    { 
        id: "monochrome", 
        name: "Monochrome", 
        emoji: "⚫",
        colors: ["#ffffff", "#000000", "#e5e5e5"],
        description: "Inverted"
    },
];

/**
 * @param {string} activeTheme - Currently selected theme ID
 * @param {Function} onChange - Callback when theme is selected
 */
export default function ThemeSelector({ activeTheme, onChange }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {THEMES.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => onChange(theme.id)}
                        title={`Select ${theme.name}: ${theme.description}`}
                        className={`group relative flex items-center gap-3 rounded-xl border-2 p-3 sm:p-4 text-left transition-all duration-200 ${
                            activeTheme === theme.id
                                ? "border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-md"
                                : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                        }`}
                    >
                        {/* Theme Name & Emoji */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xl flex-shrink-0">{theme.emoji}</span>
                                <div className="min-w-0 flex-1">
                                    <h4 className={`text-sm font-bold truncate ${
                                        activeTheme === theme.id ? "text-orange-700" : "text-gray-900"
                                    }`}>
                                        {theme.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">
                                        {theme.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Color Swatches */}
                        <div className="flex -space-x-2 flex-shrink-0">
                            {theme.colors.map((color, idx) => (
                                <div
                                    key={idx}
                                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>

                        {/* Active Indicator */}
                        {activeTheme === theme.id && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-lg">
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
