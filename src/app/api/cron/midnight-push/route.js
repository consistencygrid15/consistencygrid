import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTopicWallpaperUpdatePush } from '@/lib/fcm';

/**
 * GET /api/cron/midnight-push
 *
 * Vercel Cron: runs every 15 minutes (see vercel.json)
 *
 * Design (TOPIC BASED WITH RANDOM JITTER):
 *   - Checks which IANA timezones hit the midnight window.
 *   - Sends ONE push notification to the topic: "daily_update_{timezone}".
 *   - Devices receive the payload locally, decode the "jitter_max_minutes"
 *     and wait randomly between 0-60 min before firing the WebView worker.
 *   - This requires ONLY 1 Firebase API call per timezone, 
 *     solving Vercel 10s Serverless maxDuration timeouts forever.
 */
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[Cron midnight-push] Unauthorized request blocked');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUTC = new Date();
    console.log(`[Cron midnight-push] ⏰ Triggered at ${currentUTC.toISOString()}`);

    // 1. Get Distinct Timezones with active users
    const distinctRows = await prisma.deviceToken.findMany({
      select: { timezone: true },
      distinct: ['timezone'],
    });

    const targetTimezones = distinctRows
      .map((r) => r.timezone)
      .filter((tz) => {
        try {
          const localHour = parseInt(
            new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              hourCycle: 'h23',
              timeZone: tz,
            }).format(currentUTC),
            10
          );
          const localMinute = parseInt(
            new Intl.DateTimeFormat('en-US', {
              minute: 'numeric',
              timeZone: tz,
            }).format(currentUTC),
            10
          );

          // Midnight Window: 23:30 to 00:30
          const isLateNight = localHour === 23 && localMinute >= 30;
          const isEarlyMorning = localHour === 0 && localMinute <= 30;
          return isLateNight || isEarlyMorning;
        } catch {
          return false;
        }
      });

    if (targetTimezones.length === 0) {
      console.log(`[Cron midnight-push] No timezones in midnight window.`);
      return NextResponse.json({ status: 'Empty window' }, { status: 200 });
    }

    console.log(`[Cron midnight-push] 🌏 Target Timezones: ${targetTimezones.join(', ')}`);

    // 2. Broadcast to FCM Topics!
    const results = [];
    for (const tz of targetTimezones) {
      // Create FCM compatible string (avoids slashes)
      const safeTimezone = tz.replace(/\//g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
      const topicName = `daily_update_${safeTimezone}`;
      
      console.log(`[Cron midnight-push] 📡 Broadcasting to topic: ${topicName}`);
      
      // Pass jitterMaxMinutes = 60 to prevent server thundering herd
      const success = await sendTopicWallpaperUpdatePush(topicName, 60);
      results.push({ topic: topicName, success });
    }

    return NextResponse.json(
      {
        success: true,
        utcTime: currentUTC.toISOString(),
        topicsFired: results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron midnight-push] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

