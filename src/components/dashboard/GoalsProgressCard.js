"use client";

import Card from "@/components/ui/Card";
import Link from "next/link";
import { Target, ChevronRight } from "lucide-react";
import { GoalsProgressSkeleton } from "@/components/skeletons/DashboardSkeletons";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function GoalsProgressCard() {
  const { data, error } = useSWR("/api/goals", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60000
  });

  const loading = !data && !error;

  const allGoals = Array.isArray(data) ? data : data?.goals || [];
  const goals = allGoals
    .filter((g) => !g.isCompleted && g.isCompleted !== true) // Only incomplete goals
    .slice(0, 4);

  if (loading) {
    return <GoalsProgressSkeleton />;
  }

  if (goals.length === 0) {
    return (
      <Card className="p-6 border border-gray-100/50">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-bold text-gray-900">Active Goals</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-4">No goals yet</p>
          <Link href="/goals">
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors font-medium">
              Create Your First Goal
            </button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 border border-gray-100/50 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-bold text-gray-900">Active Goals</h2>
        </div>
        <Link href="/goals" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = goal.progress || 0;
          let progressPercent = 0;

          if (goal.target && Number(goal.target) > 0) {
            progressPercent = (progress / Number(goal.target)) * 100;
          } else {
            progressPercent = progress;
          }

          return (
            <Link key={goal.id} href={`/goals/${goal.id}`}>
              <div className="p-3 sm:p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 transition-colors truncate min-w-0 flex-1">
                    {goal.title}
                  </h3>
                  <span className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full flex-shrink-0">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {goal.target ? (
                    <>{progress} of {goal.target} {goal.unit || ""}</>
                  ) : (
                    <> {progress}% Completed</>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
