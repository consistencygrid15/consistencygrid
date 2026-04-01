"use client";

import { useEffect, useState } from "react";

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TodayProgressCard() {
  const [data, setData] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Load data and setup real-time updates
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/habits/today", { cache: "no-store" });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (error) {
        console.error("Failed to load today's progress:", error);
      } finally {
        setLoading(false);
      }
    }

    load();

    // Reload on page focus (removed 20s polling to save network quota)
    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const percent = data.total === 0 ? 0 : Math.round((data.completed / data.total) * 100);
  const today = getLocalDateString(new Date());

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
        </div>
        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-orange-50/30 p-5 sm:p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">Today's Progress</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
            {data.completed}/{data.total}
          </h2>
        </div>

        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 ring-2 ring-orange-200 text-2xl">
          {percent === 100 && data.total > 0 ? "🔥" : "✅"}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 flex-1 rounded-full bg-gray-200 overflow-hidden">
            <div
              style={{ width: `${percent}%` }}
              className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            />
          </div>
          <span className="ml-3 text-sm font-semibold text-gray-700">{percent}%</span>
        </div>
        <p className="text-xs text-gray-500">
          {percent === 100 && data.total > 0
            ? "🎉 All habits completed today!"
            : `${data.total - data.completed} habit${data.total - data.completed !== 1 ? 's' : ''} remaining`}
        </p>
      </div>
    </div>
  );
}
