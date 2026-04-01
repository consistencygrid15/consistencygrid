"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { sendWallpaperToAndroid } from "@/utils/sendWallpaperToAndroid";
import HabitSkeleton from "@/components/skeletons/HabitSkeleton";

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const HABIT_COLORS = ["#10b981", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899", "#ef4444"];

export default function HabitCard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());
  const [publicToken, setPublicToken] = useState("");

  // Load habits
  const loadHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits/today", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setHabits(json.habits || []);

      // Get public token for wallpaper updates
      const settingsRes = await fetch("/api/settings/me");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData?.user?.publicToken) {
          setPublicToken(settingsData.user.publicToken);
        }
      }
    } catch (error) {
      console.error("Failed to load habits:", error);
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();

    // Only refresh on page focus to save network quota
    const handleFocus = () => loadHabits();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadHabits]);

  const toggleHabit = useCallback(async (habitId, date) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const targetDate = date || getLocalDateString(new Date());
    const log = habit.logs?.find(l => getLocalDateString(new Date(l.date)) === targetDate);
    const currentStatus = log?.done || false;

    // Optimistic update
    const prevHabits = habits;
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const newLogs = (h.logs || []).map(l => {
            const logDate = getLocalDateString(new Date(l.date));
            if (logDate === targetDate) {
              return { ...l, done: !l.done };
            }
            return l;
          });

          // If no log exists, create one
          if (!newLogs.find(l => getLocalDateString(new Date(l.date)) === targetDate)) {
            newLogs.push({ date: new Date(targetDate), done: true });
          }

          return { ...h, logs: newLogs };
        }
        return h;
      })
    );

    // Save to backend
    setSavingIds(prev => new Set([...prev, habitId]));
    try {
      const res = await fetch("/api/habits/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: targetDate }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      const data = await res.json();
      if (!data?.log) throw new Error("Invalid response");

      toast.success("✓ Updated");

      // Android Bridge: Auto-update wallpaper on habit toggle
      if (publicToken) {
        const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
        sendWallpaperToAndroid(wallpaperUrl);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update");
      setHabits(prevHabits); // Rollback
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  }, [habits]);

  const deleteHabit = useCallback(async (habitId) => {
    if (!window.confirm("Delete this habit?")) return;

    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setHabits(prev => prev.filter(h => h.id !== habitId));
      toast.success("Habit deleted");

      // Android Bridge: Auto-update wallpaper on habit deletion
      if (publicToken) {
        const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
        sendWallpaperToAndroid(wallpaperUrl);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete habit");
    }
  }, []);

  if (loading) {
    return <HabitSkeleton count={3} />;
  }

  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 sm:p-12 text-center">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="text-lg font-semibold text-gray-900">No habits yet</h3>
        <p className="text-sm text-gray-600 mt-1">Click "Add Habit" to start tracking</p>
      </div>
    );
  }

  const today = getLocalDateString(new Date());

  return (
    <div className="space-y-3 sm:space-y-4">
      {habits.map((habit, idx) => {
        const color = HABIT_COLORS[idx % HABIT_COLORS.length];
        const todayLog = habit.logs?.find(l => getLocalDateString(new Date(l.date)) === today);
        const isDone = todayLog?.done || false;
        const isExpanded = expandedId === habit.id;

        // Get current week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const weekDays = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const dateStr = getLocalDateString(d);
          return {
            date: dateStr,
            label: d.toLocaleDateString("en", { weekday: "narrow" }),
            isToday: dateStr === today,
          };
        });

        return (
          <div
            key={habit.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleHabit(habit.id, today)}
                  disabled={savingIds.has(habit.id)}
                  className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 hover:scale-105 disabled:opacity-50 touch-manipulation"
                  style={{
                    borderColor: isDone ? color : "#d1d5db",
                    backgroundColor: isDone ? color : "transparent",
                  }}
                  aria-label={isDone ? "Mark habit as incomplete" : "Mark habit as complete"}
                >
                  {isDone && (
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Title & Time */}
                <div className="flex-1 min-w-0 px-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate leading-tight">
                    {habit.title}
                  </h3>
                  {habit.scheduledTime && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <span>🕐</span> {habit.scheduledTime}
                    </p>
                  )}
                </div>

                {/* Status Badge (Hidden on very small screens to save space) */}
                <div className="hidden xs:block flex-shrink-0">
                  <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {isDone ? "Done" : "Pending"}
                  </span>
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-1">
                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : habit.id)}
                    className="flex-shrink-0 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors touch-manipulation"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors touch-manipulation"
                    aria-label="Delete habit"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Week View - Collapsed */}
              {!isExpanded && (
                <div className="flex gap-1.5 mt-3 sm:mt-4 overflow-x-auto pb-1 scrollbar-hide mask-fade-right">
                  {weekDays.map(day => {
                    const log = habit.logs?.find(l => getLocalDateString(new Date(l.date)) === day.date);
                    const completed = log?.done;
                    const isClickable = day.isToday;

                    return (
                      <button
                        key={day.date}
                        onClick={() => isClickable && toggleHabit(habit.id, day.date)}
                        disabled={savingIds.has(habit.id) || !isClickable}
                        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg font-bold text-[10px] sm:text-xs transition-all flex-shrink-0 flex items-center justify-center ${isClickable
                          ? 'hover:scale-105 cursor-pointer shadow-sm'
                          : 'cursor-not-allowed opacity-40'
                          }`}
                        style={{
                          backgroundColor: completed ? color : "#f3f4f6",
                          color: completed ? "white" : "#9ca3af",
                        }}
                        title={isClickable ? `${day.label} - Today` : `${day.label} - ${day.date} (cannot edit)`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Expanded View - Week Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4 animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Past 7 Days
                  </p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Edit Today Only
                  </span>
                </div>
                <div className="space-y-2">
                  {weekDays.map(day => {
                    const log = habit.logs?.find(l => getLocalDateString(new Date(l.date)) === day.date);
                    const completed = log?.done;
                    const isClickable = day.isToday;

                    return (
                      <button
                        key={day.date}
                        onClick={() => isClickable && toggleHabit(habit.id, day.date)}
                        disabled={savingIds.has(habit.id) || !isClickable}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border ${isClickable
                          ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer active:scale-[0.99]'
                          : 'bg-transparent border-transparent cursor-not-allowed opacity-60'
                          }`}
                      >
                        <div
                          className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            backgroundColor: completed ? color : "#e5e7eb",
                            color: completed ? "white" : "#9ca3af",
                          }}
                        >
                          {completed && (
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-medium truncate ${isClickable ? 'text-gray-900' : 'text-gray-500'}`}>
                            {day.label}, {new Date(day.date).getDate()}
                          </p>
                        </div>
                        {day.isToday && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm ring-2 ring-blue-100"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
