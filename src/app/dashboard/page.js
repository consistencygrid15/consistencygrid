import DashboardLayout from "@/components/layout/DashboardLayout";
import TopHeader from "@/components/dashboard/TopHeader";
import StatsRow from "@/components/dashboard/StatsRow";
import WallpaperCard from "@/components/dashboard/WallpaperCard";
import TodayProgressCard from "@/components/dashboard/TodayProgressCard";
import QuickTips from "@/components/dashboard/QuickTips";
import UpcomingReminders from "@/components/dashboard/UpcomingReminders";
import WeeklyStatsCard from "@/components/dashboard/WeeklyStatsCard";
import GoalsProgressCard from "@/components/dashboard/GoalsProgressCard";
import UpgradeBanner from "@/components/payment/UpgradeBanner";
import { getUniversalSession } from "@/lib/getAndroidAuth";
import { getCachedUserByEmail } from "@/lib/dashboard-cache";
import { redirect } from "next/navigation";
import AndroidOAuthRedirect from "@/components/auth/AndroidOAuthRedirect";
import AppDownloadBanner from "@/components/dashboard/AppDownloadBanner";
import RunTrackerBanner from "@/components/dashboard/RunTrackerBanner";

export const metadata = {
  title: "Dashboard - Consistency Grid",
  description: "View your life calendar wallpaper, track habits, and monitor your progress.",
};

export default async function DashboardPage() {
  // Get session for both web users (NextAuth) and Android app users (publicToken)
  let session = null;
  try {
    session = await getUniversalSession();
  } catch (e) {
    console.error('[Dashboard] getUniversalSession failed:', e.message);
    session = null;
  }

  // If no session at all, redirect appropriately
  if (!session) {
    // Check if this might be an Android user whose publicToken cookie didn't persist
    // In that case, redirect to login so they can re-authenticate
    redirect("/login");
  }

  // Redirect to onboarding if user hasn't completed it
  if (!session.user?.onboarded) {
    redirect("/onboarding");
  }

  // Fetch user plan and check if premium is still active
  let isFreeUser = true;
  if (session?.user?.email) {
    const user = await getCachedUserByEmail(session.user.email);

    if (user && user.plan && user.plan !== "free") {
      const now = new Date();
      const isLifetime = user.plan === "testing_plan";
      const isSubActive = user.subscriptionStatus === "active" &&
        (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > now);
      const isTrialActive = user.trialEndDate && new Date(user.trialEndDate) > now;

      // Only treat as premium if plan is paid AND subscription/trial is still valid
      isFreeUser = !(isLifetime || isSubActive || isTrialActive);
    }
  }

  return (
    <DashboardLayout active="Dashboard">
      <AndroidOAuthRedirect />
      <TopHeader />

      {/* Stats Row - 4 columns */}
      <StatsRow />

      {/* App Download Banner */}
      <div className="mt-6 flex flex-col gap-6">
        <AppDownloadBanner />
        <RunTrackerBanner />
      </div>

      {/* Upgrade Banner for Free Users */}
      {isFreeUser && (
        <div className="mt-6">
          <UpgradeBanner variant="compact" showFeatures={false} />
        </div>
      )}

      {/* Main Content Grid: Wallpaper (left) + Today's Progress (right) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WallpaperCard />
        </div>
        <div>
          <TodayProgressCard />
        </div>
      </div>

      {/* Additional Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyStatsCard />
        <GoalsProgressCard />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UpcomingReminders />
        <QuickTips />
      </div>
    </DashboardLayout>
  );
}
