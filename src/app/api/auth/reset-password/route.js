import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * POST /api/auth/reset-password-new
 * Resets user password with valid token
 * Body: { token, password }
 */
export async function POST(req) {
  try {
    const { token, password } = await req.json();

    // Validate inputs
    if (!token || !password) {
      return Response.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    // No user found (token invalid/expired)
    if (!user) {
      return Response.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update user: password + clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return Response.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
