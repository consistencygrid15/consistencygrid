import { redirect } from "next/navigation";
import { getUniversalSession } from "@/lib/getAndroidAuth";

import DashboardLayout from "@/components/layout/DashboardLayout";
import HabitHeader from "@/components/habits/HabitHeader";
import TodayProgressCard from "@/components/habits/TodayProgressCard";
import HabitCard from "@/components/habits/HabitCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Habits",
  description: "Track your daily habits and build consistency with streak tracking.",
};

export default async function HabitsPage() {
  let session = null;
  try {
    session = await getUniversalSession();
  } catch (e) {
    console.error('[Habits] getUniversalSession failed:', e.message);
  }

  if (!session?.user?.email) redirect("/login");

  return (
    <DashboardLayout active="Habits">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <HabitHeader />

        {/* Today Progress */}
        <TodayProgressCard />

        {/* Habit List */}
        <HabitCard />
      </div>
    </DashboardLayout>
  );
}
