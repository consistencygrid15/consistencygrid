import { getServerSession } from 'next-auth/next';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/authOptions';

/**
 * POST /api/gdpr/delete-account
 * Request permanent account deletion after password verification
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { password } = await req.json();

    if (!password) {
      return Response.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Fetch user with security data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true }
    });

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify authentication
    if (user.password) {
      // Credentials user - must verify password
      const passwordValid = await compare(password, user.password);

      if (!passwordValid) {
        return Response.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        );
      }
    } else {
      // OAuth user - must verify by typing their email
      if (password.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        return Response.json(
          { success: false, error: 'Email confirmation does not match' },
          { status: 400 }
        );
      }
    }

    // Start transaction to delete all user data
    const deleteResult = await prisma.$transaction(async tx => {
      // Delete all user-related data in correct order
      await Promise.all([
        tx.habitLog.deleteMany({ where: { userId } }),
        tx.habit.deleteMany({ where: { userId } }),
        tx.subGoal.deleteMany({
          where: { goal: { userId } }
        }),
        tx.goal.deleteMany({ where: { userId } }),
        tx.reminder.deleteMany({ where: { userId } }),
        tx.milestone.deleteMany({ where: { userId } }),
        tx.wallpaperSettings.deleteMany({ where: { userId } }),
        tx.consentPreference.deleteMany({ where: { userId } }),
      ]);

      // Delete user account
      const deletedUser = await tx.user.delete({
        where: { id: userId },
      });

      return deletedUser;
    });

    // Log GDPR operation
    console.log(`[GDPR AUDIT] Account Deleted: ${userId}`, {
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Account successfully deleted',
    });
  } catch (error) {
    console.error('Error deleting account:', error);

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
