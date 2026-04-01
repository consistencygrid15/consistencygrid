import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getProviderInstance } from '@/lib/payment/payment-config';
import { sendPaymentConfirmationEmail } from '@/lib/mail';

/**
 * Payment Webhook Handler
 * POST /api/payment/webhook
 * 
 * Handles webhooks from payment providers (Razorpay, Stripe).
 * Verifies webhook signatures and processes payment events.
 * 
 * IMPORTANT: This endpoint must be publicly accessible (no auth required)
 * as it's called by the payment provider's servers.
 */
export async function POST(req) {
    try {
        // 1. Get raw body and signature
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature') ||
            req.headers.get('stripe-signature');

        if (!signature) {
            console.error('No webhook signature provided');
            return NextResponse.json(
                { error: 'No signature provided' },
                { status: 400 }
            );
        }

        // 2. Get payment provider
        const provider = getProviderInstance();

        // 3. Verify webhook signature (CRITICAL SECURITY STEP)
        const isValid = await provider.verifyWebhook(body, signature);

        if (!isValid) {
            console.error('Webhook signature verification failed');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // 4. Parse webhook event
        const event = JSON.parse(body);

        console.log(`Webhook received: ${event.event || event.type}`);

        // 5. Handle different event types based on provider
        if (provider.getProviderName() === 'razorpay') {
            await handleRazorpayWebhook(event);
        } else if (provider.getProviderName() === 'stripe') {
            await handleStripeWebhook(event);
        }

        // 6. Return success (important for provider to know we received it)
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle Razorpay webhook events
 */
async function handleRazorpayWebhook(event) {
    const eventType = event.event;
    const payload = event.payload.payment?.entity || event.payload.subscription?.entity || {};

    switch (eventType) {
        case 'payment.captured':
            await handlePaymentCaptured(payload, 'razorpay');
            break;

        case 'payment.failed':
            await handlePaymentFailed(payload, 'razorpay');
            break;

        case 'subscription.charged':
            await handleSubscriptionCharged(payload, 'razorpay');
            break;

        case 'subscription.cancelled':
            await handleSubscriptionCancelled(payload, 'razorpay');
            break;

        case 'refund.processed':
            await handleRefundProcessed(payload, 'razorpay');
            break;

        default:
            console.log(`Unhandled Razorpay event: ${eventType}`);
    }
}

/**
 * Handle Stripe webhook events
 */
async function handleStripeWebhook(event) {
    const eventType = event.type;
    const payload = event.data.object;

    switch (eventType) {
        case 'payment_intent.succeeded':
            await handlePaymentCaptured(payload, 'stripe');
            break;

        case 'payment_intent.payment_failed':
            await handlePaymentFailed(payload, 'stripe');
            break;

        case 'invoice.paid':
            await handleSubscriptionCharged(payload, 'stripe');
            break;

        case 'customer.subscription.deleted':
            await handleSubscriptionCancelled(payload, 'stripe');
            break;

        case 'charge.refunded':
            await handleRefundProcessed(payload, 'stripe');
            break;

        default:
            console.log(`Unhandled Stripe event: ${eventType}`);
    }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payload, provider) {
    try {
        const orderId = provider === 'razorpay' ? payload.order_id : payload.id;
        const paymentId = payload.id;

        // Find transaction
        const transaction = await prisma.paymentTransaction.findUnique({
            where: { providerOrderId: orderId },
            include: { user: true },
        });

        if (!transaction) {
            console.error(`Transaction not found for order: ${orderId}`);
            return;
        }

        // Skip if already processed
        if (transaction.status === 'success') {
            console.log(`Payment already processed: ${orderId}`);
            return;
        }

        // Update transaction
        await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
                providerPaymentId: paymentId,
                status: 'success',
            },
        });

        // Calculate subscription dates
        const now = new Date();
        let subscriptionEndDate;

        if (transaction.plan === 'testing_plan') {
            subscriptionEndDate = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
        } else if (transaction.plan === 'pro_yearly') {
            subscriptionEndDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        } else if (transaction.plan === 'pro_monthly') {
            subscriptionEndDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }

        // Update user subscription
        await prisma.user.update({
            where: { id: transaction.userId },
            data: {
                plan: transaction.plan,
                subscriptionStatus: 'active',
                subscriptionStartDate: now,
                subscriptionEndDate,
            },
        });

        // Invalidate cache so premium features unlock immediately
        const { invalidateSettingsCache } = await import('@/lib/cache-invalidation');
        await invalidateSettingsCache(transaction.userId);

        console.log(`Payment captured for user ${transaction.userId}, plan: ${transaction.plan}`);
    } catch (error) {
        console.error('Error handling payment captured:', error);
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload, provider) {
    try {
        const orderId = provider === 'razorpay' ? payload.order_id : payload.id;

        await prisma.paymentTransaction.updateMany({
            where: { providerOrderId: orderId },
            data: { status: 'failed' },
        });

        console.log(`Payment failed for order: ${orderId}`);
    } catch (error) {
        console.error('Error handling payment failed:', error);
    }
}

/**
 * Handle subscription charged (recurring payment)
 */
async function handleSubscriptionCharged(payload, provider) {
    try {
        console.log(`Subscription charged: ${payload.id}`);
        // Different providers have different structures for subscription ID
        let subscriptionId;
        let amount;

        if (provider === 'razorpay') {
            subscriptionId = payload.subscription_id;
            amount = payload.amount / 100;
        } else {
            subscriptionId = payload.subscription; // Stripe invoice object
            amount = payload.amount_paid / 100;
        }

        if (!subscriptionId) {
            console.error('No subscription ID in charged webhook payload');
            return;
        }

        // Find the user with this subscription ID
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { stripeSubscriptionId: subscriptionId },
                    // Assuming you have razorpaySubscriptionId on User or metadata
                    { paymentProvider: 'razorpay' } // Fallback logic would need to be tighter here based on full DB schema, but standard practice matches by ID:
                ]
            }
        });

        // Better search by user
        let targetUser = user;
        if (!targetUser && provider === 'razorpay') {
            // For razorpay we might need to find by email if it's stored in the payload
            const payment = payload;
            if (payment && payment.email) {
                targetUser = await prisma.user.findUnique({
                    where: { email: payment.email }
                });
            }
        } else if (!targetUser && provider === 'stripe') {
            const customerId = payload.customer;
            if (customerId) {
                targetUser = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId }
                });
            }
        }

        if (!targetUser) {
            console.error(`Could not find user for subscription payment: ${subscriptionId}`);
            return;
        }

        // Extend subscription end date based on their plan
        const now = new Date();
        let newEndDate = new Date(targetUser.subscriptionEndDate || now);

        // If the subscription has already lapsed, start from today
        if (newEndDate < now) {
            newEndDate = new Date(now);
        }

        if (targetUser.plan === 'pro_yearly') {
            newEndDate = new Date(newEndDate.getFullYear() + 1, newEndDate.getMonth(), newEndDate.getDate());
        } else if (targetUser.plan === 'pro_monthly') {
            newEndDate = new Date(newEndDate.getFullYear(), newEndDate.getMonth() + 1, newEndDate.getDate());
        } else {
            console.log(`Warning: Subscription charged for non-recurring plan: ${targetUser.plan}`);
            // Default 1 month safety
            newEndDate = new Date(newEndDate.getFullYear(), newEndDate.getMonth() + 1, newEndDate.getDate());
        }

        // Update User
        await prisma.user.update({
            where: { id: targetUser.id },
            data: {
                subscriptionStatus: 'active',
                subscriptionEndDate: newEndDate
            }
        });

        // Invalidate cache so premium features unlock immediately
        const { invalidateSettingsCache } = await import('@/lib/cache-invalidation');
        await invalidateSettingsCache(targetUser.id);

        // Log the transaction
        await prisma.paymentTransaction.create({
            data: {
                userId: targetUser.id,
                amount: amount || 0,
                currency: 'USD', // Modify if supporting INR or others
                providerPaymentId: payload.id,
                providerOrderId: subscriptionId,
                status: 'success',
                plan: targetUser.plan,
                type: 'SUBSCRIPTION_RENEWAL'
            }
        });

        // Send a receipt for the renewal
        await sendPaymentConfirmationEmail(
            targetUser.email,
            `${targetUser.plan} (Renewal)`,
            amount
        );

        console.log(`Successfully extended subscription for user ${targetUser.id} until ${newEndDate.toISOString()}`);

    } catch (error) {
        console.error('Error handling subscription charged:', error);
    }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(payload, provider) {
    try {
        const subscriptionId = payload.id;

        // Find user with this subscription
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { stripeSubscriptionId: subscriptionId },
                    // Add Razorpay subscription ID field if needed
                ],
            },
        });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    subscriptionStatus: 'cancelled',
                },
            });
            
            // Invalidate cache
            const { invalidateSettingsCache } = await import('@/lib/cache-invalidation');
            await invalidateSettingsCache(user.id);

            console.log(`Subscription cancelled for user: ${user.id}`);
        }
    } catch (error) {
        console.error('Error handling subscription cancelled:', error);
    }
}

/**
 * Handle refund processed
 */
async function handleRefundProcessed(payload, provider) {
    try {
        const paymentId = provider === 'razorpay' ? payload.payment_id : payload.payment_intent;

        // Find transaction
        const transaction = await prisma.paymentTransaction.findFirst({
            where: { providerPaymentId: paymentId },
        });

        if (transaction) {
            await prisma.paymentTransaction.update({
                where: { id: transaction.id },
                data: { status: 'refunded' },
            });

            // Downgrade user to free plan
            await prisma.user.update({
                where: { id: transaction.userId },
                data: {
                    plan: 'free',
                    subscriptionStatus: 'cancelled',
                },
            });
            
            // Invalidate cache
            const { invalidateSettingsCache } = await import('@/lib/cache-invalidation');
            await invalidateSettingsCache(transaction.userId);

            console.log(`Refund processed for user: ${transaction.userId}`);
        }
    } catch (error) {
        console.error('Error handling refund processed:', error);
    }
}
