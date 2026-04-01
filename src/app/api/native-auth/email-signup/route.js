import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generatePublicToken } from '@/lib/token';

/**
 * POST /api/native-auth/email-signup
 * 
 * Register new user with email and password
 * 
 * Request Body:
 * {
 *   "email": "string (required, email format)",
 *   "password": "string (required, min 8 chars)",
 *   "name": "string (required, min 2 chars)"
 * }
 * 
 * Response (Success - 201):
 * {
 *   "success": true,
 *   "token": "string (publicToken)",
 *   "onboarded": false,
 *   "user": { id, email, name }
 * }
 * 
 * Response (Error - 400/422/500):
 * {
 *   "success": false,
 *   "error": "string (error message)"
 * }
 */
export async function POST(request) {
    try {
        // 1. Parse and validate request
        const { email, password, name } = await request.json();

        // Check all fields present
        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 422 }
            );
        }

        // Password strength validation
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 422 }
            );
        }

        // Name validation
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return NextResponse.json(
                { success: false, error: 'Name must be at least 2 characters' },
                { status: 422 }
            );
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 2. Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // 3. Hash password (never store plain text)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: trimmedName,
                password: hashedPassword,
                publicToken: generatePublicToken(),
                onboarded: false,
                // Create default settings immediately
                settings: {
                    create: {
                        theme: "dark-minimal",
                        canvasWidth: 1080,
                        canvasHeight: 2340
                    }
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                publicToken: true,
                onboarded: true,
            },
        });

        // 5. Log success (no sensitive data)
        console.log('[Email Signup] New user created:', user.id);

        // 6. Return success response with publicToken cookie
        const response = NextResponse.json(
            {
                success: true,
                token: user.publicToken,
                onboarded: user.onboarded,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        );

        // 7. Set publicToken cookie for subsequent requests (for Android WebView)
        const isProduction = process.env.NODE_ENV === "production";
        const THIRTY_DAYS = 30 * 24 * 60 * 60;
        response.cookies.set('publicToken', user.publicToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: THIRTY_DAYS,
        });

        return response;

    } catch (error) {
        // Log error server-side (no sensitive data)
        console.error('[Email Signup] Error:', error.message);

        // Return generic error to client
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
