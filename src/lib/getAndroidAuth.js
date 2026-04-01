/**
 * getAndroidAuth - Native Android Authentication Helper
 *
 * Allows Android WebView users to authenticate via their `publicToken`
 * stored in a cookie. This completely avoids requiring a NextAuth session
 * so that server-side crashes from malformed JWT cookies don't happen.
 */

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';

// Cache the publicToken → user lookup for 60 seconds.
// Without this, EVERY API call (habits, goals, streaks, settings, wallpaper-data)
// does a full DB round-trip just to identify the user — at 1000 users with 5+ API
// calls per dashboard load, that's 5000+ uncached DB queries per refresh cycle.
const getCachedUserByToken = (publicToken) =>
    unstable_cache(
        async () =>
            prisma.user.findFirst({
                where: { publicToken },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    publicToken: true,
                    onboarded: true,
                },
            }),
        ['universal-session-user', publicToken],
        { revalidate: 60, tags: ['user-profile'] }
    )();

/**
 * Get session for request — supports both NextAuth web sessions and
 * native Android publicToken cookie authentication.
 *
 * @returns {{ user: { id, email, name, publicToken, onboarded } } | null}
 */
export async function getUniversalSession() {
    // 1. First check: read the publicToken cookie that Android sets
    const cookieStore = await cookies();
    const publicToken = cookieStore.get('publicToken')?.value;

    if (publicToken) {
        // Look up user by this token (cached for 60s — avoids a DB hit on every API call)
        const user = await getCachedUserByToken(publicToken);

        if (user) {
            return { user };
        }
    }

    // 2. Fallback: NextAuth session for standard web users
    try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('@/app/api/auth/authOptions');
        const session = await getServerSession(authOptions);
        return session;
    } catch (e) {
        console.error('[getUniversalSession] getServerSession failed:', e.message);
        return null;
    }
}

