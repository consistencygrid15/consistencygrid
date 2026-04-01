import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/lib/prisma';
import { generatePublicToken } from '@/lib/token';

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/native/google
 * 
 * Verify Google ID token from Android SDK and authenticate user
 * 
 * Request Body:
 * {
 *   "idToken": "string (required, JWT format)"
 * }
 * 
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "token": "string (publicToken)",
 *   "onboarded": boolean,
 *   "user": { id, email, name, image }
 * }
 * 
 * Response (Error - 400/401/500):
 * {
 *   "success": false,
 *   "error": "string (error message)"
 * }
 */
export async function POST(request) {
    try {
        // 1. Validate environment variables
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('[Google Auth] GOOGLE_CLIENT_ID not configured');
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // 2. Parse request body
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json(
                { success: false, error: 'ID token is required' },
                { status: 400 }
            );
        }

        // 3. Verify ID token with Google
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error('[Google Auth] Token verification failed:', verifyError.message);

            // Return generic error (don't expose verification details)
            if (verifyError.message.includes('Token used too late')) {
                return NextResponse.json(
                    { success: false, error: 'ID token expired' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { success: false, error: 'Invalid ID token' },
                { status: 401 }
            );
        }

        // 4. Extract user info from verified token
        const email = payload.email;
        const name = payload.name;
        const image = payload.picture;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email not found in token' },
                { status: 400 }
            );
        }

        // 5. Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                publicToken: true,
                onboarded: true,
            },
        });

        // 6. Create user if new
        if (!user) {
            console.log('[Google Auth] Creating new user:', email);

            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    image,
                    publicToken: generatePublicToken(),
                    emailVerified: new Date(),
                    onboarded: false,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    publicToken: true,
                    onboarded: true,
                },
            });
        }

        // 7. Ensure publicToken exists (for existing users who might not have one)
        if (!user.publicToken) {
            console.log('[Google Auth] Generating publicToken for existing user:', email);

            const newToken = generatePublicToken();
            await prisma.user.update({
                where: { id: user.id },
                data: { publicToken: newToken },
            });
            user.publicToken = newToken;
        }

        // 8. Log success (no sensitive data)
        console.log('[Google Auth] Authentication successful for user:', user.id);

        // 9. Return success response
        return NextResponse.json({
            success: true,
            token: user.publicToken,
            onboarded: user.onboarded,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
            },
        });

    } catch (error) {
        // Log error server-side (no sensitive data)
        console.error('[Google Auth] Unexpected error:', error.message);

        // Return generic error to client
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
