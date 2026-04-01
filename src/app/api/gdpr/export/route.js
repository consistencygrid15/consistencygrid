import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/authOptions';

/**
 * GET /api/gdpr/export
 * Export all user data as JSON
 */
export async function GET(req) {
  console.log('[GDPR EXPORT] Starting export request...');
  
  try {
    console.log('[GDPR EXPORT] Getting session...');
    const session = await getServerSession(authOptions);
    console.log('[GDPR EXPORT] Session found:', session ? `User ${session.user?.email}` : 'No session');

    if (!session?.user?.id) {
      console.log('[GDPR EXPORT] Error: Not authenticated');
      return Response.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[GDPR EXPORT] User ID:', userId);

    // Fetch all user data
    console.log('[GDPR EXPORT] Fetching user from database...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('[GDPR EXPORT] User found:', user ? user.email : 'NOT FOUND');

    if (!user) {
      console.log('[GDPR EXPORT] Error: User not found in database');
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const [goals, habits, habitLogs, reminders, milestones, settings] = await Promise.all([
      prisma.goal.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          progress: true,
          targetDeadline: true,
          isCompleted: true,
          createdAt: true,
          updatedAt: true,
        },
      }).catch(err => {
        console.error('Error fetching goals:', err);
        return [];
      }),
      prisma.habit.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          scheduledTime: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }).catch(err => {
        console.error('Error fetching habits:', err);
        return [];
      }),
      prisma.habitLog.findMany({
        where: { userId },
        select: {
          id: true,
          habitId: true,
          date: true,
          done: true,
          createdAt: true,
        },
      }).catch(err => {
        console.error('Error fetching habitLogs:', err);
        return [];
      }),
      prisma.reminder.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          priority: true,
          isImportant: true,
          createdAt: true,
          updatedAt: true,
        },
      }).catch(err => {
        console.error('Error fetching reminders:', err);
        return [];
      }),
      prisma.milestone.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          age: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      }).catch(err => {
        console.error('Error fetching milestones:', err);
        return [];
      }),
      prisma.wallpaperSettings.findUnique({
        where: { userId },
        select: {
          id: true,
          theme: true,
          width: true,
          height: true,
          dob: true,
          createdAt: true,
          updatedAt: true,
        },
      }).catch(err => {
        console.error('Error fetching wallpaperSettings:', err);
        return null;
      }),
    ]);

    console.log('[GDPR EXPORT] Data fetched successfully');
    console.log(`[GDPR EXPORT] Goals: ${goals?.length || 0}, Habits: ${habits?.length || 0}, Reminders: ${reminders?.length || 0}`);

    // Log GDPR operation
    try {
      console.log(`[GDPR AUDIT] User: ${userId}, Operation: DATA_EXPORT`);
    } catch (err) {
      console.error('Error logging GDPR operation:', err);
    }

    console.log('[GDPR EXPORT] Returning success response');
    return Response.json({
      success: true,
      data: {
        user,
        goals,
        habits,
        habitLogs,
        reminders,
        milestones,
        settings,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error.message, error.stack);
    console.error('[GDPR EXPORT] Full error object:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to log GDPR audit trail
 */
async function logGDPRAudit(userId, operationType, details) {
  // In production, store this in a separate GDPR audit log table
  // For now, log to console/server logs
  console.log(`[GDPR AUDIT] User: ${userId}, Operation: ${operationType}`, details);
}
