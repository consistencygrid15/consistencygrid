"use client";

import { Calendar, Grid3x3, Clock, BarChart3 } from "lucide-react";

/**
 * GridModeSelector Component - Enhanced Version
 * 
 * Select how to visualize your life/year progress:
 * ✨ 4 different grid visualization modes
 * ✨ Emoji icons for quick identification
 * ✨ Detailed descriptions for each mode
 * ✨ Responsive 2-column grid
 * ✨ Active state with orange highlight
 * ✨ Hover effects and smooth transitions
 * 
 * Grid Modes:
 * 1. Year Weeks - 52 weeks in a year
 * 2. Year Days - 365 days in a year
 * 3. Life Grid - All weeks you'll live
 * 4. Month - Current month calendar
 */
const GRID_MODES = [
    {
        id: "weeks",
        emoji: "📅",
        name: "Year Weeks",
        description: "52 weeks grid",
        details: "View your year in weeks for weekly planning",
        icon: Calendar,
    },
    {
        id: "days",
        emoji: "🗓️",
        name: "Year Days",
        description: "365 days grid",
        details: "Daily visualization for habit tracking",
        icon: Grid3x3,
    },
    {
        id: "life",
        emoji: "⏳",
        name: "Life Grid",
        description: "Weeks lived grid",
        details: "See your entire life in one view",
        icon: Clock,
    },
    {
        id: "week_strip",
        emoji: "⚡",
        name: "Week Grid (Tactical)",
        description: "7 days strip",
        details: "Tactical view of your current week",
        icon: Calendar,
    },
    {
        id: "month",
        emoji: "📆",
        name: "Month",
        description: "Current month calendar",
        details: "Focus on this month's progress",
        icon: BarChart3,
    },
];

/**
 * @param {string} mode - Currently selected grid mode
 * @param {Function} onChange - Callback when mode is selected
 */
export default function GridModeSelector({ mode, onChange }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {GRID_MODES.map((gridMode) => {
                    const isActive = mode === gridMode.id;
                    return (
                        <button
                            key={gridMode.id}
                            onClick={() => onChange(gridMode.id)}
                            title={`Select ${gridMode.name}: ${gridMode.details}`}
                            className={`group relative flex items-center gap-3 sm:gap-4 rounded-xl border-2 p-3 sm:p-4 text-left transition-all duration-200 ${isActive
                                ? "border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-md"
                                : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                                }`}
                        >
                            {/* Icon Container */}
                            <div className={`flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg flex-shrink-0 transition-all ${isActive
                                ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 shadow-md"
                                : "bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                                }`}>
                                <span className="text-lg sm:text-xl">{gridMode.emoji}</span>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-bold truncate transition-colors ${isActive ? "text-orange-700" : "text-gray-900 group-hover:text-orange-700"
                                    }`}>
                                    {gridMode.name}
                                </h4>
                                <p className={`text-xs truncate transition-colors ${isActive ? "text-orange-600/80" : "text-gray-500"
                                    }`}>
                                    {gridMode.description}
                                </p>
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    ✓
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
