import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';
import { PRICING_PLANS, canUpgradeToPlan } from '@/lib/payment/payment-config';

/**
 * Get Available Pricing Plans
 * GET /api/payment/plans
 * 
 * Returns all pricing plans with user's eligibility status
 */
export async function GET(req) {
    try {
        // Get user session (optional - works for both authenticated and unauthenticated)
        const session = await getServerSession(authOptions);

        let currentPlan = 'free';
        let subscriptionStatus = null;

        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: {
                    plan: true,
                    subscriptionStatus: true,
                },
            });

            if (user) {
                currentPlan = user.plan || 'free';
                subscriptionStatus = user.subscriptionStatus;
            }
        }

        // Build response with eligibility
        const plans = Object.values(PRICING_PLANS).map(plan => ({
            ...plan,
            canUpgrade: canUpgradeToPlan(currentPlan, plan.id),
            isCurrent: currentPlan === plan.id,
        }));

        return NextResponse.json({
            plans,
            currentPlan,
            subscriptionStatus,
        });

    } catch (error) {
        console.error('Get plans error:', error);
        return NextResponse.json(
            { error: 'Failed to get plans' },
            { status: 500 }
        );
    }
}
