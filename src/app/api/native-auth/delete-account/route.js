import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/native-auth/delete-account
 * DELETE /api/native-auth/delete-account
 * 
 * Permanently deletes a user account and all associated database records for native mobile clients.
 * Supports identification by publicToken, email, or userId.
 */
export async function POST(request) {
    return handleDelete(request);
}

export async function DELETE(request) {
    return handleDelete(request);
}

async function handleDelete(request) {
    try {
        let publicToken = null;
        let email = null;
        let userId = null;

        // 1. Try Authorization header ("Bearer <token>")
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
            publicToken = authHeader.substring(7).trim();
        }

        // 2. Try JSON body
        try {
            const body = await request.json();
            if (!publicToken) {
                publicToken = body?.publicToken || body?.token || body?.public_token;
            }
            if (body?.email) email = body.email;
            if (body?.userId || body?.id) userId = body.userId || body.id;
        } catch (e) {
            // Body parsing optional
        }

        // 3. Try custom headers
        if (!publicToken) {
            publicToken = request.headers.get('publicToken') || request.headers.get('token');
        }
        if (!email) {
            email = request.headers.get('email');
        }

        let user = null;

        // 4. Find user by publicToken
        if (publicToken && publicToken.trim().length > 0) {
            const safeToken = publicToken.trim();
            user = await prisma.user.findFirst({
                where: { publicToken: safeToken },
                select: { id: true, email: true }
            });
        }

        // 5. Fallback find by email
        if (!user && email && email.trim().length > 0) {
            const safeEmail = email.toLowerCase().trim();
            user = await prisma.user.findUnique({
                where: { email: safeEmail },
                select: { id: true, email: true }
            });
        }

        // 6. Fallback find by userId
        if (!user && userId && userId.trim().length > 0) {
            user = await prisma.user.findUnique({
                where: { id: userId.trim() },
                select: { id: true, email: true }
            });
        }

        if (!user) {
            console.warn('[Native Delete Account] User not found for token/email:', { publicToken, email, userId });
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // 7. Delete user from database (Cascades to all habits, logs, goals, reminders, settings)
        await prisma.user.delete({
            where: { id: user.id }
        });

        console.log(`[Native Delete Account] ✅ User ${user.id} (${user.email}) permanently deleted from database`);

        return NextResponse.json({
            success: true,
            message: 'Account permanently deleted from database'
        });

    } catch (error) {
        console.error('[Native Delete Account] Error during account deletion:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete account' },
            { status: 500 }
        );
    }
}
