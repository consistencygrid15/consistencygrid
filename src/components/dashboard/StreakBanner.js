"use client";

import { Flame, Award, Zap } from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function StreakBanner() {
  // SWR deduplicates this request — /api/streaks is already fetched by StatsRow
  // so this will share the cached result at zero extra cost.
  const { data, isLoading } = useSWR("/api/streaks", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  if (isLoading || !data) return null;

  const currentStreak = data.currentStreak || 0;
  const bestStreak = data.bestStreak || 0;

  if (currentStreak === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-xl mb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6" />
            <h2 className="text-2xl font-bold">You're On Fire! 🔥</h2>
          </div>
          <p className="text-orange-100 text-sm">Keep your momentum going</p>
        </div>

        <div className="flex gap-4">
          <div className="text-center bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-3xl font-bold text-white">
              {currentStreak}
            </div>
            <div className="text-xs text-orange-100 mt-1">Day Streak</div>
          </div>

          <div className="text-center bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-3xl font-bold text-white">
              {bestStreak}
            </div>
            <div className="text-xs text-orange-100 mt-1">Best Ever</div>
          </div>
        </div>
      </div>
    </div>
  );
}
