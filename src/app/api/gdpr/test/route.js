import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/authOptions';

/**
 * GET /api/gdpr/test
 * Debug endpoint to check if user data exists
 */
export async function GET(req) {
  try {
    console.log('[GDPR TEST] Getting session...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({
        success: false,
        error: 'Not authenticated',
        session: { hasSession: false },
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('[GDPR TEST] Testing user:', userId);

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Count records for this user
    const [goalsCount, habitsCount, logsCount, remindersCount, milestonesCount, settingsExists] = await Promise.all([
      prisma.goal.count({ where: { userId } }),
      prisma.habit.count({ where: { userId } }),
      prisma.habitLog.count({ where: { userId } }),
      prisma.reminder.count({ where: { userId } }),
      prisma.milestone.count({ where: { userId } }),
      prisma.wallpaperSettings.findUnique({ where: { userId } }),
    ]);

    return Response.json({
      success: true,
      session: {
        userId,
        email: session.user?.email,
      },
      data: {
        userExists: !!userExists,
        goalsCount,
        habitsCount,
        habitLogsCount: logsCount,
        remindersCount,
        milestonesCount,
        wallpaperSettingsExists: !!settingsExists,
      },
    });
  } catch (error) {
    console.error('[GDPR TEST] Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
