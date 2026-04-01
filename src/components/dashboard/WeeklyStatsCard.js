"use client";

import Card from "@/components/ui/Card";
import { Calendar } from "lucide-react";
import { WeeklyStatsSkeleton } from "@/components/skeletons/DashboardSkeletons";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function WeeklyStatsCard() {
  const { data: habits, error } = useSWR("/api/habits", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const loading = !habits && !error;
  let weekData = [];

  if (!loading) {
    // Filter only active habits
    const habitsArray = Array.isArray(habits) ? habits : habits?.habits || [];
    const activeHabits = habitsArray.filter((h) => h.isActive !== false);

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateString(date);

      let completed = 0;
      activeHabits.forEach((habit) => {
        const log = habit.logs?.find((l) => {
          const logDate = getLocalDateString(new Date(l.date));
          return logDate === dateStr && l.done === true;
        });
        if (log) completed++;
      });

      weekData.push({
        date: dateStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed,
        total: activeHabits.length,
      });
    }
  }

  const maxCompleted = Math.max(...weekData.map((d) => d.completed), 1);

  return (
    <Card className="p-6 border border-gray-100/50">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-bold text-gray-900">This Week</h2>
      </div>

      {loading ? (
        <WeeklyStatsSkeleton />
      ) : (
        <div className="space-y-2">
          {weekData.map((day, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 w-8">
                {day.dayName}
              </span>
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300 rounded-lg flex items-center justify-end pr-2"
                  style={{
                    width: `${(day.completed / (day.total || 1)) * 100}%`,
                  }}
                >
                  {day.completed > 0 && (
                    <span className="text-xs font-bold text-white">
                      {day.completed}/{day.total}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Avg per day</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading
                ? "..."
                : (weekData.reduce((a, d) => a + d.completed, 0) / 7).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Best day</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {loading
                ? "..."
                : Math.max(...weekData.map((d) => d.completed))}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
