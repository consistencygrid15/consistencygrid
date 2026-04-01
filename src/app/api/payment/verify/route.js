import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import prisma from '@/lib/prisma';
import { getProviderInstance } from '@/lib/payment/payment-config';
import { sendPaymentConfirmationEmail } from '@/lib/mail';

/**
 * Verify Payment
 * POST /api/payment/verify
 * 
 * Verifies payment signature and updates user subscription.
 * This is CRITICAL for security - always verify server-side.
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
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3. Parse payment data
        const paymentData = await req.json();

        // 4. Get payment provider
        const provider = getProviderInstance();

        // 5. Verify payment signature (CRITICAL SECURITY STEP)
        const isValid = await provider.verifyPayment(paymentData);

        if (!isValid) {
            console.error('Payment verification failed for user:', user.id);
            return NextResponse.json(
                { error: 'Payment verification failed' },
                { status: 400 }
            );
        }

        // 6. Extract order/payment IDs based on provider
        let orderId, paymentId;
        if (provider.getProviderName() === 'razorpay') {
            orderId = paymentData.razorpay_order_id;
            paymentId = paymentData.razorpay_payment_id;
        } else if (provider.getProviderName() === 'stripe') {
            orderId = paymentData.payment_intent_id;
            paymentId = paymentData.payment_intent_id;
        }

        // 7. Find transaction in database
        const transaction = await prisma.paymentTransaction.findUnique({
            where: { providerOrderId: orderId },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // 8. Check if already processed (idempotency)
        if (transaction.status === 'success') {
            return NextResponse.json({
                success: true,
                message: 'Payment already processed',
                alreadyProcessed: true,
            });
        }

        // 9. Update transaction status
        await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
                providerPaymentId: paymentId,
                status: 'success',
                metadata: {
                    ...transaction.metadata,
                    verifiedAt: new Date().toISOString(),
                },
            },
        });

        // 10. Calculate subscription dates
        const now = new Date();
        let subscriptionEndDate;

        if (transaction.plan === 'testing_plan') {
            // Testing plan - set to 100 years from now
            subscriptionEndDate = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
        } else if (transaction.plan === 'pro_yearly') {
            // Yearly plan - 1 year from now
            subscriptionEndDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        } else if (transaction.plan === 'pro_monthly') {
            // Monthly plan - 1 month from now
            subscriptionEndDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }

        // 11. Update user subscription
        await prisma.user.update({
            where: { id: user.id },
            data: {
                plan: transaction.plan,
                subscriptionStatus: 'active',
                subscriptionStartDate: now,
                subscriptionEndDate,
                paymentProvider: provider.getProviderName(),
            },
        });
        
        // Invalidate cache so premium features unlock immediately
        const { invalidateSettingsCache } = await import('@/lib/cache-invalidation');
        await invalidateSettingsCache(user.id);

        // 12. Send confirmation email via Resend
        if (!transaction.metadata?.emailSent) {
            const emailResult = await sendPaymentConfirmationEmail(
                user.email,
                transaction.plan,
                transaction.amount
            );

            if (emailResult.success) {
                // Mark as sent so we don't spam them on repeated retries
                await prisma.paymentTransaction.update({
                    where: { id: transaction.id },
                    data: {
                        metadata: {
                            ...transaction.metadata,
                            emailSent: true
                        }
                    }
                });
            }
        }

        console.log(`Payment verified successfully for user ${user.id}, plan: ${transaction.plan}`);

        // 13. Return success response
        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            subscription: {
                plan: transaction.plan,
                status: 'active',
                startDate: now,
                endDate: subscriptionEndDate,
            },
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            {
                error: 'Payment verification failed',
                message: error.message
            },
            { status: 500 }
        );
    }
}
