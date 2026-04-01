"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * GitHub-style Streak Heatmap Component
 * 
 * Displays habit activity over time in an interactive grid format
 * Colors indicate completion percentage:
 * - Gray: No habits completed
 * - Light Orange: 1-33% habits completed
 * - Medium Orange: 34-66% habits completed
 * - Dark Orange: 67-99% habits completed
 * - Full Orange: 100% habits completed
 * 
 * Shows last 52 weeks by default (can be adjusted)
 */
export default function StreakHeatmap({ habits = [], logs = [], timeframeWeeks = 52, title = "Streak Heatmap" }) {
    const [hoveredDate, setHoveredDate] = useState(null);
    const [tooltipPos, setTooltipPos] = useState(null);
    const [viewMode, setViewMode] = useState('year'); // 'year' (52 weeks) or '90days' (13 weeks)

    const weeks = viewMode === 'year' ? 52 : 13;

    // Helper to safely parse dates
    const parseDate = (dateValue) => {
        if (!dateValue) return null;
        
        let date;
        if (dateValue instanceof Date) {
            date = new Date(dateValue);
        } else if (typeof dateValue === 'string') {
            // Handle both ISO strings and date-only strings
            date = new Date(dateValue);
        } else {
            return null;
        }
        
        if (isNaN(date.getTime())) {
            return null;
        }
        
        // Reset to midnight in local timezone
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // Build heatmap data
    const heatmapData = useMemo(() => {
        if (!logs || logs.length === 0) {
            return [];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Build map of date -> completion percentage
        const dateMap = new Map();

        logs.forEach((log) => {
            const logDate = parseDate(log.date);
            if (!logDate) return; // Skip invalid dates
            
            const dateKey = logDate.toISOString().split('T')[0];

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { count: 0, completed: 0, date: logDate });
            }

            const entry = dateMap.get(dateKey);
            entry.count++;
            if (log.done) entry.completed++;
        });

        // Generate grid: weeks in reverse (recent on right)
        const weeksList = [];
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (weeks * 7));

        const totalHabits = habits.length || 0;
        const todayKey = today.toISOString().split('T')[0];

        for (let w = 0; w < weeks; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(cellDate.getDate() + w * 7 + d);

                const dateKey = cellDate.toISOString().split('T')[0];
                const data = dateMap.get(dateKey);
                const completedCount = data ? data.completed : 0;
                
                // Calculate completion percentage
                // If no habits exist, show 0%
                // Otherwise, percentage is completed/total
                const completionPercentage = totalHabits > 0 
                    ? (completedCount / totalHabits) * 100 
                    : 0;

                week.push({
                    date: new Date(cellDate),
                    dateKey,
                    completedCount,
                    totalHabits,
                    completionPercentage: Math.round(completionPercentage * 10) / 10, // Round to 1 decimal
                    isToday: dateKey === todayKey,
                    isFuture: cellDate > today,
                });
            }
            weeksList.push(week);
        }

        return weeksList;
    }, [logs, habits, weeks]);

    // Get color based on completion percentage
    const getColorClass = (completionPercentage, isFuture) => {
        if (isFuture) return "bg-gray-50 border-gray-200";
        if (completionPercentage === 0) return "bg-gray-100 border-gray-200";
        if (completionPercentage < 34) return "bg-orange-100 border-orange-200";
        if (completionPercentage < 67) return "bg-orange-300 border-orange-400";
        if (completionPercentage < 100) return "bg-orange-400 border-orange-500";
        return "bg-orange-500 border-orange-600";
    };

    // Get month labels for the top
    const getMonthLabels = () => {
        if (heatmapData.length === 0) return [];

        const labels = [];
        let lastMonth = null;

        heatmapData.forEach((week, index) => {
            const monthName = week[0].date.toLocaleDateString('en-US', { month: 'short' });
            if (monthName !== lastMonth) {
                labels.push({ month: monthName, weekIndex: index });
                lastMonth = monthName;
            }
        });

        return labels;
    };

    const monthLabels = useMemo(() => getMonthLabels(), [heatmapData]);

    if (!habits || habits.length === 0) {
        return (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-500">
                    No habits yet. Create a habit to start tracking your streak!
                </p>
            </div>
        );
    }

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setViewMode('90days')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                        viewMode === '90days'
                            ? 'bg-orange-100 text-orange-700 border border-orange-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Last 90 days
                </button>
                <button
                    onClick={() => setViewMode('year')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                        viewMode === 'year'
                            ? 'bg-orange-100 text-orange-700 border border-orange-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Last 52 weeks
                </button>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="inline-block">
                    {/* Month labels */}
                    <div className="ml-12 flex gap-1 text-xs font-semibold text-gray-600 mb-3">
                        {monthLabels.map((label, idx) => (
                            <div
                                key={idx}
                                className="text-left"
                                style={{
                                    width: `${label.weekIndex === 0 ? 0 : (heatmapData[label.weekIndex]?.length || 1) * 14}px`,
                                }}
                            >
                                {label.month}
                            </div>
                        ))}
                    </div>

                    {/* Grid with day labels and heatmap cells */}
                    <div className="flex gap-1">
                        {/* Day of week labels */}
                        <div className="flex flex-col gap-1">
                            {dayLabels.map((day, idx) => (
                                <div
                                    key={idx}
                                    className={`h-10 w-10 flex items-center justify-center text-xs font-medium text-gray-500`}
                                >
                                    {idx % 2 === 0 ? day.slice(0, 1) : ''}
                                </div>
                            ))}
                        </div>

                        {/* Week columns */}
                        {heatmapData.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((day, dayIdx) => (
                                    <div
                                        key={`${weekIdx}-${dayIdx}`}
                                        className="relative"
                                        onMouseEnter={(e) => {
                                            setHoveredDate(`${weekIdx}-${dayIdx}`);
                                            setTooltipPos(e.currentTarget.getBoundingClientRect());
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredDate(null);
                                            setTooltipPos(null);
                                        }}
                                    >
                                        <div
                                            className={`
                                                h-10 w-10 rounded border transition-all
                                                ${getColorClass(day.completionPercentage, day.isFuture)}
                                                ${day.isToday ? 'ring-2 ring-offset-1 ring-blue-500 shadow-md' : ''}
                                                ${!day.isFuture ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-50'}
                                            `}
                                            title={`${day.dateKey}: ${day.completedCount}/${day.totalHabits} habits (${Math.round(day.completionPercentage)}%)`}
                                        />

                                        {/* Tooltip */}
                                        {hoveredDate === `${weekIdx}-${dayIdx}` && !day.isFuture && (
                                            <div className="fixed z-50 pointer-events-none">
                                                <div 
                                                    className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-lg"
                                                    style={{
                                                        left: `${tooltipPos.left + tooltipPos.width / 2}px`,
                                                        top: `${tooltipPos.top - 50}px`,
                                                        transform: 'translate(-50%, 0)',
                                                    }}
                                                >
                                                    <div className="font-semibold">
                                                        {day.date.toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </div>
                                                    <div className="mt-1">
                                                        <div className="text-orange-300 font-semibold">
                                                            {day.completedCount}/{day.totalHabits} completed
                                                        </div>
                                                        <div className="text-gray-300 text-xs mt-1">
                                                            {Math.round(day.completionPercentage)}% complete
                                                        </div>
                                                    </div>
                                                    {/* Tooltip arrow */}
                                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3">Legend</p>
                <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-gray-200 bg-gray-100" />
                        <span>No activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-orange-200 bg-orange-100" />
                        <span>1-33%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-orange-400 bg-orange-300" />
                        <span>34-66%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-orange-500 bg-orange-400" />
                        <span>67-99%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-orange-600 bg-orange-500" />
                        <span>100%</span>
                    </div>

                    {/* Streak indicator */}
                    <div className="ml-auto flex items-center gap-2 border-l border-gray-200 pl-6">
                        <div className="h-4 w-4 rounded border-2 border-blue-500 bg-white" />
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Stats Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">💡 How to read this heatmap</p>
                <ul className="mt-2 space-y-1 text-xs">
                    <li>• Each square = one day of your habit tracking</li>
                    <li>• Color intensity = % of habits completed that day</li>
                    <li>• Darker shades = more habits completed</li>
                    <li>• Blue ring = today's date</li>
                    <li>• Hover to see exact completion count</li>
                </ul>
            </div>
        </div>
    );
}
