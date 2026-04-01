import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMulticastWallpaperUpdatePush } from '@/lib/fcm';

/**
 * GET /api/cron/midnight-update
 *
 * Runs on a schedule to send midnight wallpaper refresh pushes.
 * (See /api/cron/midnight-push for the Vercel-cron-scheduled version.)
 *
 * Design:
 *   - Cron runs every 15 minutes (configured in vercel.json via midnight-push).
 *   - This route checks which IANA timezones are currently in the midnight hour
 *     (local hour === 0 → 00:00–00:59 local time).
 *   - Because the DB has @@index([timezone]) on DeviceToken, the final
 *     findMany query is index-scanned even at 100k+ rows.
 *   - Batching (500 tokens/batch) + parallel Promise.all in fcm.js ensures
 *     we never bottleneck on Firebase rate limits.
 */
export async function GET(req) {
  try {
    // ── 1. Verify CRON_SECRET to block unauthorized requests ──
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUTC = new Date();

    // ── 2. Find which distinct timezones are currently at midnight hour ──
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
          return localHour === 0;
        } catch {
          return false;
        }
      });

    if (targetTimezones.length === 0) {
      return NextResponse.json(
        { status: 'No timezones at midnight right now.', utcTime: currentUTC.toISOString() },
        { status: 200 }
      );
    }

    // ── 3. Fetch tokens for those timezones (indexed query) ──
    const devices = await prisma.deviceToken.findMany({
      where: {
        timezone: { in: targetTimezones },
        deviceType: 'android',
      },
      select: { token: true },
    });

    const tokens = devices.map((d) => d.token);

    if (tokens.length === 0) {
      return NextResponse.json(
        { status: 'No devices found for midnight timezones.', timezones: targetTimezones },
        { status: 200 }
      );
    }

    // ── 4. Send batched parallel FCM pushes ──
    const result = await sendMulticastWallpaperUpdatePush(tokens);

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
    console.error('[Cron midnight-update] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
