import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMulticastWallpaperUpdatePush } from '@/lib/fcm';

/**
 * GET /api/cron/midnight-push
 *
 * Vercel Cron: runs every 15 minutes (see vercel.json)
 *
 * Design:
 *   - Every 15 minutes, this route checks which IANA timezones are
 *     currently in the midnight window (local time = 23:45–00:30).
 *   - The 75-minute window (45 min before + 30 min after midnight) is
 *     intentionally large to compensate for OEM alarm delays of 15–30 min.
 *   - Each timezone is hit at most once per day (dedup via Set) to avoid
 *     sending redundant pushes across multiple cron ticks.
 *   - Batching (500 tokens/batch) + parallel execution in fcm.js
 *     ensures this scales to 100k+ users without bottleneck.
 */
export async function GET(req) {
  try {
    // ── 1. Verify CRON_SECRET to block unauthorized requests ──
    // Vercel automatically sends this header when triggering cron jobs
    // if CRON_SECRET env var is set in Vercel project settings.
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[Cron midnight-push] Unauthorized request blocked');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUTC = new Date();
    const currentUTCMs = currentUTC.getTime();

    console.log(`[Cron midnight-push] ⏰ Triggered at ${currentUTC.toISOString()}`);

    // ── 2. Find which distinct timezones are currently in the midnight window ──
    // Window: local time between 23:30 (prev day) and 00:30 (new day)
    // This 60-minute window ensures every cron tick catches the midnight hour
    // even on devices that OEMs delay by 10–30 minutes.
    const distinctRows = await prisma.deviceToken.findMany({
      select: { timezone: true },
      distinct: ['timezone'],
    });

    const targetTimezones = distinctRows
      .map((r) => r.timezone)
      .filter((tz) => {
        try {
          // Get the local hour and minute in this timezone
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

          // Match the midnight window:
          // 23:30–23:59 (30 min before midnight — prep push)
          // 00:00–00:30 (30 min after midnight — catch missed alarms)
          const isLateNight = localHour === 23 && localMinute >= 30;
          const isEarlyMorning = localHour === 0 && localMinute <= 30;
          return isLateNight || isEarlyMorning;
        } catch {
          return false; // Skip invalid timezone strings
        }
      });

    if (targetTimezones.length === 0) {
      console.log(`[Cron midnight-push] No timezones in midnight window at ${currentUTC.toISOString()}`);
      return NextResponse.json(
        {
          status: 'No timezones in midnight window right now.',
          utcTime: currentUTC.toISOString(),
        },
        { status: 200 }
      );
    }

    console.log(`[Cron midnight-push] 🌏 Timezones in midnight window: ${targetTimezones.join(', ')}`);

    // ── 3. Fetch all Android tokens for those timezones ──
    const devices = await prisma.deviceToken.findMany({
      where: {
        timezone: { in: targetTimezones },
        deviceType: 'android',
      },
      select: { token: true },
    });

    const tokens = devices.map((d) => d.token);

    if (tokens.length === 0) {
      console.log(`[Cron midnight-push] No Android devices found for midnight timezones`);
      return NextResponse.json(
        {
          status: 'No devices found for midnight timezones.',
          timezones: targetTimezones,
        },
        { status: 200 }
      );
    }

    console.log(`[Cron midnight-push] 📱 Sending push to ${tokens.length} device(s) in ${targetTimezones.length} timezone(s)`);

    // ── 4. Send batched parallel FCM pushes (handled in fcm.js) ──
    const result = await sendMulticastWallpaperUpdatePush(tokens);

    console.log(`[Cron midnight-push] ✅ Done: ${result.successCount} success, ${result.failureCount} failed`);

    return NextResponse.json(
      {
        success: true,
        utcTime: currentUTC.toISOString(),
        timezones: targetTimezones,
        deviceCount: tokens.length,
        fcmResult: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron midnight-push] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

