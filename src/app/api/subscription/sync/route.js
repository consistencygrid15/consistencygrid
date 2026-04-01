import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';

/**
 * Sync Subscription Status
 * 
 * WHY: After payment on website, Android app needs to fetch latest subscription
 * status to unlock premium features. This is the single source of truth.
 * 
 * FLOW:
 * 1. User pays on website
 * 2. Webhook updates subscription in database
 * 3. App calls this endpoint to get latest status
 * 4. App unlocks premium features based on response
 * 
 * GET /api/subscription/sync
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user's subscription details
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                plan: true,
                subscriptionStatus: true,
                subscriptionStartDate: true,
                subscriptionEndDate: true,
                trialEndDate: true,
                paymentProvider: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Determine if subscription is currently active
        const now = new Date();
        const isActive =
            user.subscriptionStatus === 'active' &&
            (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > now);

        // Check if user is on premium plan
        const isPremium =
            user.plan !== 'free' &&
            isActive;

        // Calculate days remaining
        let daysRemaining = null;
        if (user.subscriptionEndDate) {
            const endDate = new Date(user.subscriptionEndDate);
            daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        }

        return NextResponse.json({
            plan: user.plan,
            status: user.subscriptionStatus,
            isActive,
            isPremium,
            startDate: user.subscriptionStartDate,
            endDate: user.subscriptionEndDate,
            trialEndDate: user.trialEndDate,
            daysRemaining,
            provider: user.paymentProvider,
        });

    } catch (error) {
        console.error('[Subscription Sync] Error:', error);
        return NextResponse.json(
            { error: 'Failed to sync subscription' },
            { status: 500 }
        );
    }
}
