import { getUniversalSession } from "@/lib/getAndroidAuth";
import { getCachedSettingsMe } from "@/lib/dashboard-cache";
import { invalidateSettingsCache } from "@/lib/cache-invalidation";

export const dynamic = "force-dynamic"; // always uses session cookie

export async function GET() {
  const session = await getUniversalSession();

  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Use the 5-minute server-side cache — avoids a DB hit on every component mount
  const dbUser = await getCachedSettingsMe(session.user.email);

  if (!dbUser) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  // Compute premium access (pure computation, no extra DB call)
  const now = new Date();
  const hasPaidPlan = dbUser.plan && dbUser.plan !== "free";
  const isSubscriptionActive = dbUser.subscriptionStatus === "active";
  const isNotExpired =
    !dbUser.subscriptionEndDate ||
    new Date(dbUser.subscriptionEndDate) > now;
  const isTrialActive =
    dbUser.trialEndDate && new Date(dbUser.trialEndDate) > now;

  const isPremium =
    dbUser.plan === "testing_plan" ||
    (hasPaidPlan && isSubscriptionActive && isNotExpired) ||
    (hasPaidPlan && isTrialActive);

  return Response.json(
    {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        publicToken: dbUser.publicToken,
        plan: dbUser.plan || "free",
        subscriptionStatus: dbUser.subscriptionStatus,
        subscriptionEndDate: dbUser.subscriptionEndDate,
        trialEndDate: dbUser.trialEndDate,
        createdAt: dbUser.createdAt,
        isPremium,
      },
      settings: dbUser.settings || null,
    },
    {
      status: 200,
      headers: {
        // Allow CDN/proxy caching for 60 seconds, private to the user
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
