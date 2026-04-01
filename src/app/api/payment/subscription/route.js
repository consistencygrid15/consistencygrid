import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';
import { getProviderInstance } from '@/lib/payment/payment-config';

/**
 * Get Current Subscription
 * GET /api/payment/subscription
 */
export async function GET(req) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user with subscription details
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                plan: true,
                subscriptionStatus: true,
                subscriptionStartDate: true,
                subscriptionEndDate: true,
                paymentProvider: true,
                stripeSubscriptionId: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate days remaining
        let daysRemaining = null;
        if (user.subscriptionEndDate) {
            const now = new Date();
            const endDate = new Date(user.subscriptionEndDate);
            daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        }

        return NextResponse.json({
            subscription: {
                plan: user.plan || 'free',
                status: user.subscriptionStatus || 'inactive',
                startDate: user.subscriptionStartDate,
                endDate: user.subscriptionEndDate,
                daysRemaining,
                provider: user.paymentProvider,
            },
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to get subscription' },
            { status: 500 }
        );
    }
}

/**
 * Cancel Subscription
 * DELETE /api/payment/subscription
 */
export async function DELETE(req) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user has an active subscription
        if (!user.subscriptionStatus || user.subscriptionStatus === 'cancelled') {
            return NextResponse.json(
                { error: 'No active subscription to cancel' },
                { status: 400 }
            );
        }

        // For one-time payments (testing_plan), just mark as cancelled
        // For recurring subscriptions, cancel with provider
        if (user.plan === 'testing_plan' || user.plan === 'pro_yearly') {
            // One-time payment - just update status
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: 'cancelled',
                },
            });
        } else if (user.stripeSubscriptionId) {
            // Recurring subscription - cancel with provider
            const provider = getProviderInstance();
            await provider.cancelSubscription(user.stripeSubscriptionId);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: 'cancelled',
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully',
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
