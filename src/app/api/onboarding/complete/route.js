import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { cookies } from 'next/headers';

function asDateOrNull(input) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req) {
  try {
    // Read the body once at the beginning
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('[Onboarding Complete] Failed to parse request body:', e.message);
      return Response.json(
        { message: "Invalid request format" },
        { status: 400 }
      );
    }

    const {
      name,
      dob,
      lifeExpectancyYears,
      habits = [],
      theme,
      publicToken,
    } = body || {};

    let session = await getUniversalSession();

    // Fallback: Check if publicToken was sent in the request body (for Android WebView)
    // This is the primary method for Android users since cookies might not persist
    if (!session?.user?.email && publicToken) {
      try {
        console.log('[Onboarding Complete] Attempting to authenticate with publicToken from body');
        const user = await prisma.user.findFirst({
          where: { publicToken },
          select: {
            id: true,
            email: true,
            name: true,
            publicToken: true,
            onboarded: true,
          },
        });
        if (user) {
          console.log('[Onboarding Complete] Found user via publicToken:', user.email);
          session = { user };
        } else {
          console.warn('[Onboarding Complete] publicToken not found in database:', publicToken);
        }
      } catch (e) {
        console.error('[Onboarding Complete] Failed to authenticate with publicToken:', e.message);
      }
    }

    if (!session?.user?.email) {
      console.error('[Onboarding Complete] Unauthorized - no valid session found');
      console.log('[Onboarding Complete] Debug: publicToken provided:', !!publicToken);
      console.log('[Onboarding Complete] Debug: cookie-based session found:', !!session?.user?.email);
      return Response.json(
        { message: "Unauthorized - please sign in again", error: "NO_SESSION" },
        { status: 401 }
      );
    }

    console.log('[Onboarding Complete] User authenticated:', session.user.email);

    const dobDate = asDateOrNull(dob);
    const lifeExp = Number(lifeExpectancyYears || 80);

    if (!name || String(name).trim().length < 2) {
      return Response.json({ message: "Full name is required" }, { status: 400 });
    }
    if (!dobDate) {
      return Response.json({ message: "Birth date is required" }, { status: 400 });
    }
    if (!Number.isFinite(lifeExp) || lifeExp < 40 || lifeExp > 120) {
      return Response.json(
        { message: "Life expectancy must be between 40 and 120" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, onboarded: true },
    });

    if (!user) {
      console.error('[Onboarding Complete] User not found:', session.user.email);
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    console.log('[Onboarding Complete] Starting onboarding for user:', user.id);

    // Normalize habits
    const habitTitles = Array.isArray(habits)
      ? habits
        .map((h) => String(h || "").trim())
        .filter((t) => t.length >= 2)
        .slice(0, 20)
      : [];

    const chosenTheme = theme || "dark-minimal";

    await prisma.$transaction(async (tx) => {
      // Update profile
      await tx.user.update({
        where: { id: user.id },
        data: { name: String(name).trim() },
      });

      // Save wallpaper settings (minimal defaults)
      await tx.wallpaperSettings.upsert({
        where: { userId: user.id },
        update: {
          dob: dobDate,
          lifeExpectancyYears: lifeExp,
          theme: chosenTheme,
          showLifeGrid: true,
          showYearGrid: true,
          showAgeStats: true,
          showQuote: true,
        },
        create: {
          userId: user.id,
          dob: dobDate,
          lifeExpectancyYears: lifeExp,
          theme: chosenTheme,
          width: 1080,
          height: 2400,
          showLifeGrid: true,
          showYearGrid: true,
          showAgeStats: true,
          showQuote: true,
          quote: "Make every week count.",
        },
      });

      // Create habits (skip if user already has some)
      if (habitTitles.length > 0) {
        const existingCount = await tx.habit.count({
          where: { userId: user.id, isActive: true },
        });

        if (existingCount === 0) {
          await tx.habit.createMany({
            data: habitTitles.map((title) => ({ userId: user.id, title })),
          });
        }
      }

      // Mark onboarded
      await tx.user.update({
        where: { id: user.id },
        data: { onboarded: true },
      });
    });

    console.log('[Onboarding Complete] Successfully completed onboarding for user:', user.id);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[Onboarding Complete] Unexpected error:', error.message, error.stack);
    return Response.json(
      { message: "Failed to complete onboarding", error: error.message },
      { status: 500 }
    );
  }
}

