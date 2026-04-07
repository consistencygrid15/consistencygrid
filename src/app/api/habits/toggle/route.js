import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { getCachedUserByEmail } from "@/lib/dashboard-cache";
import { invalidateHabitsCache } from "@/lib/cache-invalidation";
import { sendInstantHabitPush } from "@/lib/fcm";

function getLocalDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateString(dateStr) {
  // Parse YYYY-MM-DD and return Date object at midnight in local timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function POST(req) {
  try {
    const session = await getUniversalSession();

    if (!session?.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date } = await req.json();

    if (!habitId) {
      return Response.json({ message: "habitId required" }, { status: 400 });
    }

    const user = await getCachedUserByEmail(session.user.email);

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Determine target date (default to today)
    let targetDate;
    if (date) {
      targetDate = parseDateString(date);
    } else {
      const now = new Date();
      targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Check if a log already exists for this habit + date
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        userId: user.id,
        date: targetDate,
      },
    });

    if (existingLog) {
      const updated = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { done: !existingLog.done },
      });

      await invalidateHabitsCache(user.id);

      // 🔥 Trigger real-time wallpaper update
      // Must await on Vercel otherwise serverless execution context dies before push is sent
      await sendInstantHabitPush(user.id).catch((e) =>
        console.error('[Toggle] FCM push error:', e.message)
      );

      return Response.json({ log: updated }, { status: 200 });
    }

    // Create new log
    const newLog = await prisma.habitLog.create({
      data: {
        habitId,
        userId: user.id,
        date: targetDate,
        done: true,
      },
    });

    await invalidateHabitsCache(user.id);

    // 🔥 Trigger real-time wallpaper update
    // Must await on Vercel otherwise serverless execution context dies before push is sent
    await sendInstantHabitPush(user.id).catch((e) =>
      console.error('[Toggle] FCM push error:', e.message)
    );

    return Response.json({ log: newLog }, { status: 201 });
  } catch (error) {
    console.error("Error toggling habit:", error);
    return Response.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
