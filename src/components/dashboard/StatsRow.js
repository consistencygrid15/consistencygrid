"use client";

import StatCard from "@/components/dashboard/StatCard";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * StatsRow — shows 4 stat cards.
 *
 * SWR KEY REUSE STRATEGY (saves DB hits):
 * - "/api/streaks" already returns { currentStreak, bestStreak, habits, logs }
 *   so we derive today's habit count from it — no separate /api/habits call here.
 * - "/api/goals" is shared with GoalsProgressCard (SWR deduplicates it).
 * - "/api/habits" is shared with TodayProgressCard & WeeklyStatsCard (SWR deduplicates it).
 *
 * Net result: StatsRow adds ZERO new DB queries when the rest of the dashboard is mounted.
 */
export default function StatsRow() {
  // These keys are intentionally shared across components — SWR deduplicates them
  const { data: streaksData, error: streaksError } = useSWR("/api/streaks", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const { data: goalsData, error: goalsError } = useSWR("/api/goals", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const loading =
    (!streaksData && !streaksError) ||
    (!goalsData && !goalsError);

  // Derive today's habit stats from the streaks response
  // (it already contains habits[] and logs[]) — avoids a 3rd SWR key
  let todayCompleted = 0;
  let todayTotal = 0;

  if (streaksData?.habits && streaksData?.logs) {
    const today = getLocalDateString(new Date());
    const activeHabits = streaksData.habits.filter((h) => h.isActive !== false);
    todayTotal = activeHabits.length;

    activeHabits.forEach((habit) => {
      const done = streaksData.logs.some(
        (l) =>
          l.habitId === habit.id &&
          l.done &&
          getLocalDateString(new Date(l.date)) === today
      );
      if (done) todayCompleted++;
    });
  }

  const goalsArray = Array.isArray(goalsData) ? goalsData : goalsData?.goals || [];
  const activeGoals = goalsArray.filter((g) => !g.isCompleted).length;

  const displayStats = [
    {
      title: "Current Streak",
      value: loading ? "..." : String(streaksData?.currentStreak || 0),
      sub:
        (streaksData?.currentStreak || 0) > 0
          ? "Skipping today breaks momentum"
          : "Start your streak today",
    },
    {
      title: "Best Streak",
      value: loading ? "..." : String(streaksData?.bestStreak || 0),
      sub: "days",
    },
    {
      title: "Today's Habits",
      value: loading ? "..." : `${todayCompleted}/${todayTotal}`,
      sub: "kept",
    },
    {
      title: "Active Goals",
      value: loading ? "..." : String(activeGoals),
      sub: "running",
    },
  ];

  return (
    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
      {displayStats.map((s, i) => (
        <StatCard key={i} title={s.title} value={s.value} sub={s.sub} loading={loading} />
      ))}
    </section>
  );
}
