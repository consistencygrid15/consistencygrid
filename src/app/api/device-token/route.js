import { NextResponse } from 'next/server';
import { getUniversalSession } from '@/lib/getAndroidAuth';
import prisma from '@/lib/prisma';

// IANA timezone list — used to validate timezone strings before saving to DB
const VALID_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'));

export async function GET(req) {
  try {
    const session = await getUniversalSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await prisma.deviceToken.findMany({
      where: { userId: session.user.id, deviceType: 'android' },
      select: { token: true, timezone: true, updatedAt: true },
    });

    return NextResponse.json({
      registered: tokens.length > 0,
      count: tokens.length,
      tokens: tokens.map(t => ({
        // Mask the token for security — show first 20 chars only
        token: t.token.substring(0, 20) + '...',
        timezone: t.timezone,
        lastSeen: t.updatedAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // ✅ CRITICAL FIX: Use getUniversalSession instead of getServerSession.
    // Android apps authenticate via publicToken cookie, NOT NextAuth JWT.
    // getServerSession() always returned null for Android requests, meaning
    // FCM tokens were NEVER saved to DB — so midnight-push cron had no targets.
    const session = await getUniversalSession();

    if (!session?.user?.id) {
      console.warn('[DeviceToken] Unauthorized request — no valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { token, timezone, deviceType = 'android' } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    // Validate timezone is a real IANA timezone string
    let resolvedTimezone = timezone || 'UTC';
    
    // Android sometimes sends legacy timezone IDs not present in Intl.supportedValuesOf
    const legacyTimezoneMap = {
      'Asia/Calcutta': 'Asia/Kolkata',
      'Asia/Saigon': 'Asia/Ho_Chi_Minh',
      'Asia/Katmandu': 'Asia/Kathmandu',
      'Asia/Rangoon': 'Asia/Yangon',
      'IST': 'Asia/Kolkata', // Sometimes Android returns shorthand
    };
    
    if (legacyTimezoneMap[resolvedTimezone]) {
      resolvedTimezone = legacyTimezoneMap[resolvedTimezone];
    }

    const validatedTimezone = VALID_TIMEZONES.has(resolvedTimezone) ? resolvedTimezone : 'UTC';

    if (!VALID_TIMEZONES.has(resolvedTimezone)) {
      console.warn(`[DeviceToken] Invalid timezone "${resolvedTimezone}" — falling back to UTC`);
    }

    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId: session.user.id,
        timezone: validatedTimezone,
        deviceType,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        token,
        timezone: validatedTimezone,
        deviceType,
      },
    });

    console.log(`[DeviceToken] ✅ Saved FCM token for user ${session.user.id} (tz: ${validatedTimezone})`);
    return NextResponse.json({ success: true, id: deviceToken.id });
  } catch (error) {
    console.error('[DeviceToken] Error saving device token:', error.message);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}
