import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';

// IANA timezone list — used to validate timezone strings before saving to DB
const VALID_TIMEZONES = new Set(Intl.supportedValuesOf('timeZone'));

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { token, timezone, deviceType = 'android' } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    // Validate timezone is a real IANA timezone string
    const resolvedTimezone = timezone || 'UTC';
    if (!VALID_TIMEZONES.has(resolvedTimezone)) {
      return NextResponse.json(
        { error: `Invalid timezone: "${resolvedTimezone}". Must be a valid IANA timezone (e.g. "Asia/Kolkata").` },
        { status: 400 }
      );
    }

    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId: session.user.id,
        timezone: resolvedTimezone,
        deviceType,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        token,
        timezone: resolvedTimezone,
        deviceType,
      },
    });

    return NextResponse.json({ success: true, id: deviceToken.id });
  } catch (error) {
    console.error('[DeviceToken] Error saving device token:', error.message);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }
}
