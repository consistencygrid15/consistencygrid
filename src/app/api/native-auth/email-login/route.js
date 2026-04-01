 import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generatePublicToken } from '@/lib/token';

/**
 * POST /api/native-auth/email-login
 * 
 * Authenticate existing user with email and password
 * 
 * Request Body:
 * {
 *   "email": "string (required)",
 *   "password": "string (required)"
 * }
 * 
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "token": "string (publicToken)",
 *   "onboarded": boolean,
 *   "user": { id, email, name }
 * }
 * 
 * Response (Error - 401/400/500):
 * {
 *   "success": false,
 *   "error": "Invalid credentials"
 * }
 */
export async function POST(request) {
    try {
        // 1. Parse request
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 2. Find user by email
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                publicToken: true,
                onboarded: true,
            },
        });

        // 3. Check if user exists
        // Return same error for both invalid email and invalid password (timing attack prevention)
        if (!user || !user.password) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 4. Verify password (constant-time comparison via bcrypt)
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 5. Ensure publicToken exists (for existing users who might not have one)
        let token = user.publicToken;
        if (!token) {
            console.log('[Email Login] Generating publicToken for existing user:', user.id);

            token = generatePublicToken();
            await prisma.user.update({
                where: { id: user.id },
                data: { publicToken: token },
            });
        }

        // 6. Log success (no sensitive data)
        console.log('[Email Login] Authentication successful for user:', user.id);

        // 7. Return success response
        return NextResponse.json({
            success: true,
            token,
            onboarded: user.onboarded,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });

    } catch (error) {
        // Log error server-side (no sensitive data)
        console.error('[Email Login] Error:', error.message);

        // Return generic error to client
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
