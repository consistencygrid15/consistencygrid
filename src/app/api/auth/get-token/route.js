import { getUniversalSession } from '@/lib/getAndroidAuth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/apiResponse';

/**
 * Get Public Token API
 * Returns the user's publicToken for client-side storage
 * Used for session recovery in WebView when cookies are cleared
 * 
 * Security: Only returns token for authenticated users
 */
export async function POST(req) {
    try {
        console.log('[Get Token] Fetching public token for user');
        const session = await getUniversalSession();

        if (!session?.user?.email) {
            console.warn('[Get Token] Unauthorized - no valid session');
            return createErrorResponse('Unauthorized', 401);
        }

        console.log('[Get Token] Session found for email:', session.user.email);

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { publicToken: true },
        });

        if (!user) {
            console.error('[Get Token] User not found in database:', session.user.email);
            return createErrorResponse('User not found', 404);
        }

        console.log('[Get Token] Successfully returning publicToken for user:', session.user.email);
        return createSuccessResponse({ publicToken: user.publicToken });
    } catch (error) {
        console.error('[Get Token] Error fetching public token:', error.message);
        return createErrorResponse('Failed to retrieve token', 500);
    }
}
