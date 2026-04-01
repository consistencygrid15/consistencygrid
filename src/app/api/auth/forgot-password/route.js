import { Resend } from 'resend';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/forgot-password-new
 * 
 * Request password reset email
 * - Generates secure 32-byte token (256 bits)
 * - Sets 15-minute expiry
 * - Sends reset link via Resend
 * - Always returns success (prevents user enumeration)
 */
export async function POST(req) {
  try {
    const { email } = await req.json();

    console.log('[Password Reset] Request received:', {
      email: email ? email.substring(0, 3) + '***' : 'none',
      apiKeySet: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    // Validate email input
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('[Password Reset] Invalid email format');
      return Response.json(
        { message: 'Valid email required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Try to find user (silently fail if not found)
    try {
      const user = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      // If user exists, generate token and send email
      if (user) {
        // Generate secure random token
        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save token to database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken,
            resetTokenExpiry,
          },
        });

        // Build reset link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send email via Resend
        try {
          const emailResponse = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: emailLower,
            subject: 'Reset your password',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                  We received a request to reset your password. Click the button below to set a new password.
                </p>

                <div style="margin: 30px 0; text-align: center;">
                  <a href="${resetLink}" style="background-color: #f97316; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                    Reset Password
                  </a>
                </div>

                <p style="color: #999; font-size: 12px; margin: 20px 0;">
                  Or copy and paste this link in your browser:<br/>
                  <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 3px; word-break: break-all;">${resetLink}</code>
                </p>

                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
                  <p style="color: #856404; font-size: 13px; margin: 0;">
                    ⏰ <strong>This link expires in 15 minutes.</strong>
                  </p>
                </div>

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

                <p style="color: #999; font-size: 11px; text-align: center;">
                  © 2026 ConsistencyGrid. All rights reserved.
                </p>
              </div>
            `,
          });
          
          // Check for Resend error response
          if (emailResponse.error) {
            console.error('[Password Reset] Resend API Error:', {
              error: emailResponse.error,
              to: emailLower,
              statusCode: emailResponse.error?.statusCode,
              message: emailResponse.error?.message,
            });
            throw new Error(`Resend error: ${emailResponse.error?.message || 'Unknown error'}`);
          }
          
          console.log('[Password Reset] Email sent successfully:', {
            to: emailLower,
            messageId: emailResponse.id,
            timestamp: new Date().toISOString(),
          });
        } catch (emailError) {
          console.error('[Password Reset] Email send failed:', {
            error: emailError.message,
            to: emailLower,
            timestamp: new Date().toISOString(),
          });
          throw emailError;
        }
      }
    } catch (dbError) {
      console.error('Database error in forgot-password:', dbError);
      // Don't expose DB errors
    }

    // Always return success (prevent user enumeration)
    return Response.json(
      {
        message:
          'If an account exists with this email, you will receive a password reset link.',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    // Return generic success message even on error
    return Response.json(
      {
        message:
          'If an account exists with this email, you will receive a password reset link.',
        success: true,
      },
      { status: 200 }
    );
  }
}
