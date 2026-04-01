import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Generate Session Token for Browser Handoff
 * 
 * WHY: When Android app redirects to browser for payment, we need a way to
 * maintain the user's login session. This generates a short-lived token that
 * can be used for auto-login in the external browser.
 * 
 * FLOW:
 * 1. Android app user clicks "Unlock Features"
 * 2. App calls this endpoint to get a session token
 * 3. App opens browser with URL containing token
 * 4. Browser auto-logs in using token
 * 5. User completes payment
 * 6. Redirects back to app via deep link
 * 
 * POST /api/auth/session-token
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Generate secure random token (32 bytes = 64 hex characters)
        const token = crypto.randomBytes(32).toString('hex');

        // Token expires in 15 minutes (enough time for payment flow)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store token in user's publicToken field
        // NOTE: publicToken is already in schema and used for token-login provider
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                publicToken: token,
            },
        });

        // Build upgrade URL with token for auto-login
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://consistencygrid.com';
        const upgradeUrl = `${siteUrl}/pricing?token=${token}&platform=android`;

        return NextResponse.json({
            success: true,
            token,
            expiresAt,
            upgradeUrl,
        });

    } catch (error) {
        console.error('[Session Token] Generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate session token' },
            { status: 500 }
        );
    }
}
