import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

/**
 * POST /api/native-auth/refresh
 *
 * Silent JWT refresh for native Android clients.
 * Accepts a publicToken, looks up the user, and issues a fresh NextAuth JWT.
 *
 * Request Body:
 * { "publicToken": "string" }
 *
 * Response (200):
 * { "success": true, "sessionToken": "...", "expiresAt": 1234567890000 }
 *
 * Response (401/500):
 * { "success": false, "error": "..." }
 */
export async function POST(request) {
    // Temporarily disable refresh for debugging Next.js server crash
    return NextResponse.json(
        { success: false, error: 'Refresh disabled for debugging' },
        { status: 503 }
    );
}
