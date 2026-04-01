import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';
import { getProviderInstance, getPlan, getPlanAmount, canUpgradeToPlan } from '@/lib/payment/payment-config';

/**
 * Create Payment Order
 * POST /api/payment/create-order
 * 
 * Creates a payment order with the configured payment provider.
 * Validates user authentication, plan validity, and eligibility.
 */
export async function POST(req) {
    try {
        // 1. Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3. Parse request body
        const body = await req.json();
        const { planId, useLaunchPrice = true } = body;

        // 4. Validate plan
        const plan = getPlan(planId);
        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // 5. Check if user can upgrade to this plan
        const currentPlan = user.plan || 'free';
        if (!canUpgradeToPlan(currentPlan, planId)) {
            return NextResponse.json(
                { error: 'Cannot downgrade or purchase same plan' },
                { status: 400 }
            );
        }

        // 6. Calculate amount
        const amount = getPlanAmount(planId, useLaunchPrice);
        if (amount === 0) {
            return NextResponse.json(
                { error: 'Free plan does not require payment' },
                { status: 400 }
            );
        }

        // 7. Create order with payment provider
        const provider = getProviderInstance();
        const order = await provider.createOrder({
            amount,
            currency: plan.currency,
            metadata: {
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                planId,
                planName: plan.name,
            },
        });

        // 8. Store order in database for tracking
        await prisma.paymentTransaction.create({
            data: {
                userId: user.id,
                provider: provider.getProviderName(),
                providerOrderId: order.orderId,
                amount,
                currency: plan.currency,
                plan: planId,
                status: 'created',
                metadata: {
                    planName: plan.name,
                    useLaunchPrice,
                },
            },
        });

        // 9. Return order details
        return NextResponse.json({
            success: true,
            order: {
                orderId: order.orderId,
                amount: order.amount,
                currency: order.currency,
                provider: provider.getProviderName(),
                providerKey: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            },
            user: {
                name: user.name,
                email: user.email,
            },
            plan: {
                id: planId,
                name: plan.name,
            },
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create order',
                message: error.message
            },
            { status: 500 }
        );
    }
}
