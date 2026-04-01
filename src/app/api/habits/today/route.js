export const dynamic = 'force-dynamic';

import { getUniversalSession } from "@/lib/getAndroidAuth";
import { getCachedUserByEmail, getCachedHabits, getCachedHabitLogs } from "@/lib/dashboard-cache";

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(req) {
  const session = await getUniversalSession();

  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Cached user lookup — avoids a raw DB hit on every request
  const user = await getCachedUserByEmail(session.user.email);

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  // Both calls are served from the 5-minute unstable_cache layer
  const [habits, allLogs] = await Promise.all([
    getCachedHabits(user.id),
    getCachedHabitLogs(user.id),
  ]);

  const todayDate = getLocalDateString(new Date());

  // Filter logs to last 7 days for consistency with old behaviour
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLogs = allLogs.filter((l) => new Date(l.date) >= sevenDaysAgo);

  const todayHabits = habits.map((h) => {
    const habitLogs = recentLogs.filter((l) => l.habitId === h.id);
    const todayLog = habitLogs.find(
      (l) => getLocalDateString(new Date(l.date)) === todayDate
    );

    return {
      id: h.id,
      title: h.title,
      scheduledTime: h.scheduledTime,
      done: todayLog ? todayLog.done : false,
      logs: habitLogs,
      isActive: h.isActive,
    };
  });

  const completed = todayHabits.filter((h) => h.done).length;

  return Response.json(
    {
      total: todayHabits.length,
      completed,
      habits: todayHabits,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
