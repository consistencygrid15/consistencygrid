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
 *     currently in the midnight hour (local time = 00:xx).
 *   - It fetches all Android device tokens for those timezones and
 *     sends a silent FCM push to trigger a wallpaper refresh.
 *   - Because this runs every 15 minutes, any timezone window of
 *     midnight will be caught within a 15-minute window.
 *   - Batching (500 tokens/batch) + parallel execution in fcm.js
 *     ensures this scales to 100k+ users without bottleneck.
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
    // We get all distinct timezones stored in DeviceToken (indexed), then
    // check each one using Intl.DateTimeFormat which uses IANA timezone names.
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
          // Match hour 0 = midnight (00:00–00:59)
          return localHour === 0;
        } catch {
          return false; // Skip invalid timezone strings
        }
      });

    if (targetTimezones.length === 0) {
      return NextResponse.json(
        {
          status: 'No timezones at midnight right now.',
          utcTime: currentUTC.toISOString(),
        },
        { status: 200 }
      );
    }

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
      return NextResponse.json(
        {
          status: 'No devices found for midnight timezones.',
          timezones: targetTimezones,
        },
        { status: 200 }
      );
    }

    // ── 4. Send batched parallel FCM pushes (handled in fcm.js) ──
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
    console.error('[Cron midnight-push] Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
