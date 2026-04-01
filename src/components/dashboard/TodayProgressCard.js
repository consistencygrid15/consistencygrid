"use client";

import Card from "@/components/ui/Card";
import { CheckCircle2, Circle } from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

// Helper function to get date string in local timezone (YYYY-MM-DD)
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TodayProgressCard() {
  const { data: rawHabits, error, mutate } = useSWR("/api/habits", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const loading = !rawHabits && !error;

  // Use local date, not UTC
  const today = getLocalDateString(new Date());

  // Add today's completion status to each habit
  const safeHabits = Array.isArray(rawHabits) ? rawHabits : rawHabits?.habits || [];

  const habits = safeHabits
    .filter((h) => h.isActive !== false) // Include habits that are active
    .slice(0, 6)
    .map((habit) => {
      // Properly parse log dates
      const todayLog = habit.logs?.find((log) => {
        const logDate = getLocalDateString(new Date(log.date));
        return logDate === today && log.done === true;
      });

      return {
        ...habit,
        done: !!todayLog, // Evaluates to true if a done log exists for today
      };
    });

  const doneCount = habits.filter((h) => h.done).length;
  const progressPercent = habits.length > 0 ? (doneCount / habits.length) * 100 : 0;

  const toggleHabit = async (habitId) => {
    // Store original state for rollback
    const originalHabits = rawHabits;

    // Find the current status in derived habits
    const currentHabit = habits.find((h) => h.id === habitId);
    if (!currentHabit) return;

    const isCurrentlyDone = currentHabit.done;

    // Create optimistic data matching the raw /api/habits shape
    const optimisticHabitsArray = safeHabits.map((h) => {
      if (h.id === habitId) {
        let newLogs = h.logs ? [...h.logs] : [];
        if (isCurrentlyDone) {
          // Optimistically remove today's log or mark it not done
          newLogs = newLogs.filter(log => getLocalDateString(new Date(log.date)) !== today);
        } else {
          // Optimistically add today's log
          newLogs.push({ date: new Date().toISOString(), done: true });
        }
        return { ...h, logs: newLogs };
      }
      return h;
    });

    const optimisticData = Array.isArray(rawHabits)
      ? optimisticHabitsArray
      : { ...rawHabits, habits: optimisticHabitsArray };

    // Optimistically update UI immediately (without revalidating yet)
    mutate(optimisticData, false);

    try {
      // Send to backend
      const res = await fetch("/api/habits/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId,
          date: today,
        }),
      });

      // If request failed, rollback the optimistic update
      if (!res.ok) {
        console.error("Failed to update habit, status:", res.status);
        mutate(originalHabits, false); // Rollback
        return;
      }

      // Revalidate in background to guarantee perfectly synced data
      mutate();
    } catch (err) {
      console.error("Failed to update habit:", err);
      mutate(originalHabits, false); // Rollback on error
    }
  };

  return (
    <Card className="p-6 border border-gray-200/50">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Today's Progress</h2>
      <p className="text-sm text-gray-600 mb-4">
        {doneCount}/{habits.length} habits completed
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-3">No habits yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-orange-50/30 border border-gray-100 transition-all group"
            >
              {habit.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 group-hover:text-orange-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm flex-1 text-left ${habit.done ? "text-gray-500 line-through" : "text-gray-800"
                  }`}
              >
                {habit.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
