/**
 * CalendarGrid Component
 * 
 * A beautiful month/year calendar grid that displays reminders
 * as visual markers. This is where reminders "live on the timeline"
 * instead of just being notifications.
 */

"use client";

import { useState, useEffect } from "react";
import {
    Star,
    Target,
    PartyPopper,
    Calendar,
    Flame,
    Briefcase,
    GraduationCap,
    Plane,
    Gift,
    Lightbulb
} from "lucide-react";

const ICON_MAP = {
    "target": Target,
    "party": PartyPopper,
    "calendar": Calendar,
    "star": Star,
    "flame": Flame,
    "briefcase": Briefcase,
    "grad": GraduationCap,
    "plane": Plane,
    "gift": Gift,
    "bulb": Lightbulb
};

export default function CalendarGrid({ year, month, reminders = [], onDateClick }) {
    const [hoveredDate, setHoveredDate] = useState(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Generate calendar days
    const calendarDays = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const getRemindersForDate = (day) => {
        if (!day) return [];

        const cellDate = new Date(year, month, day);
        const cellDateStr = cellDate.toLocaleDateString("en-CA");
        const todayStr = now.toLocaleDateString("en-CA");

        return reminders.filter(r => {
            const start = r.startDate.split("T")[0];
            const end = r.endDate.split("T")[0];

            // Check if this specific day falls within the reminder's range
            const isInRange = cellDateStr >= start && cellDateStr <= end;
            if (!isInRange) return false;

            // Optional: For the Web UI, we allow seeing time-based reminders 
            // even if it's not the exact minute yet, so users can see their schedule.
            return true;
        });
    };

    // Check if date is today
    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    // Check if date is in the past
    const isPast = (day) => {
        if (!day) return false;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const today = new Date().toISOString().split("T")[0];
        return dateStr < today;
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Month/Year Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {monthNames[month]} {year}
                </h2>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-500 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                    const dayReminders = getRemindersForDate(day);
                    const isImportantDay = dayReminders.some((r) => r.isImportant);
                    const highestPriority = Math.max(...dayReminders.map((r) => r.priority), 0);

                    return (
                        <div
                            key={index}
                            className={`relative aspect-square rounded-lg border-2 transition-all ${!day
                                ? "border-transparent"
                                : isToday(day)
                                    ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100/50 scale-[1.02] z-10 ring-2 ring-orange-200"
                                    : isPast(day)
                                        ? "border-gray-100 bg-gray-50 opacity-70"
                                        : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md cursor-pointer"
                                }`}
                            onClick={() => day && onDateClick?.(year, month, day)}
                            onMouseEnter={() => day && setHoveredDate(`${year}-${month}-${day}`)}
                            onMouseLeave={() => setHoveredDate(null)}
                        >
                            {day && (
                                <>
                                    {/* Day Number */}
                                    <div className={`absolute top-1 left-1 leading-none ${isToday(day) ? "mt-0.5 ml-0.5" : ""}`}>
                                        <span className={`text-sm font-semibold ${isToday(day)
                                            ? "text-orange-600"
                                            : isPast(day)
                                                ? "text-gray-400"
                                                : "text-gray-700"
                                            }`}>
                                            {day}
                                        </span>

                                        {/* Psychological Anchor */}
                                        {isToday(day) && (
                                            <div className="text-[9px] font-extrabold uppercase tracking-tight text-orange-500 mt-1 animate-pulse leading-tight">
                                                This day matters
                                            </div>
                                        )}
                                    </div>

                                    {/* Important Star */}
                                    {isImportantDay && (
                                        <div className="absolute top-1 right-1 text-amber-500 text-sm">
                                            <Star className="w-3.5 h-3.5" fill="currentColor" />
                                        </div>
                                    )}

                                    {/* Reminder Markers */}
                                    {dayReminders.length > 0 && (
                                        <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1 justify-center">
                                            {dayReminders.slice(0, 3).map((reminder, idx) => {
                                                const MarkerComponent = ICON_MAP[reminder.markerIcon];
                                                const markerIcons = {
                                                    dot: "●",
                                                    border: "○",
                                                    fill: "■",
                                                    badge: "◆",
                                                };

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="text-xs"
                                                        style={{ color: reminder.markerColor }}
                                                        title={reminder.title}
                                                    >
                                                        {MarkerComponent ? (
                                                            <MarkerComponent className="w-3 h-3" />
                                                        ) : (
                                                            reminder.markerIcon || markerIcons[reminder.markerType] || "●"
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {dayReminders.length > 3 && (
                                                <div className="text-xs text-gray-400">
                                                    +{dayReminders.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Hover Tooltip */}
                                    {hoveredDate === `${year}-${month}-${day}` && dayReminders.length > 0 && (
                                        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-950 border border-gray-800 text-white text-xs rounded-xl p-4 shadow-2xl pointer-events-none">
                                            <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                                Reminders
                                            </div>
                                            <div className="space-y-2">
                                                {dayReminders.map((reminder, idx) => {
                                                    const MarkerIcon = ICON_MAP[reminder.markerIcon];
                                                    return (
                                                        <div key={idx} className="flex items-start gap-3">
                                                            <div
                                                                className="mt-0.5"
                                                                style={{ color: reminder.markerColor }}
                                                            >
                                                                {MarkerIcon ? (
                                                                    <MarkerIcon className="w-3 h-3" />
                                                                ) : (
                                                                    reminder.markerIcon || "●"
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">{reminder.title}</div>
                                                                {reminder.description && (
                                                                    <div className="text-gray-400 text-[10px] mt-0.5 line-clamp-2">
                                                                        {reminder.description}
                                                                    </div>
                                                                )}
                                                                <div className="text-gray-500 text-[10px] mt-0.5 flex justify-between">
                                                                    <span>
                                                                        {!reminder.isFullDay && reminder.startTime ? (
                                                                            <>
                                                                                {reminder.startTime}
                                                                                {reminder.endTime && ` - ${reminder.endTime}`}
                                                                            </>
                                                                        ) : "All Day"}
                                                                    </span>
                                                                    {isToday(day) && (
                                                                        <span className="text-orange-500 font-medium">Today</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                                <div className="border-4 border-transparent border-t-gray-950" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border-2 border-orange-500 bg-orange-50" />
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border-2 border-gray-200 bg-white" />
                        <span>Future</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border-2 border-gray-100 bg-gray-50" />
                        <span>Past</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-amber-500">⭐</span>
                        <span>Important Day</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
