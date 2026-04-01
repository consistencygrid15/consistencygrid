import crypto from 'crypto';
import { PaymentProvider } from '../payment-provider';

/**
 * Stripe Payment Provider Implementation
 * 
 * Implements the PaymentProvider interface for Stripe.
 * This is future-ready and can be activated by changing environment variables.
 */
export class StripeProvider extends PaymentProvider {
    constructor() {
        super();

        // Validate required environment variables
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Stripe credentials not configured. Please set STRIPE_SECRET_KEY');
        }

        this.secretKey = process.env.STRIPE_SECRET_KEY;
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // Lazy load Stripe SDK
        this.stripe = null;
    }

    /**
     * Get or initialize Stripe instance
     */
    async getStripe() {
        if (!this.stripe) {
            const Stripe = (await import('stripe')).default;
            this.stripe = new Stripe(this.secretKey, {
                apiVersion: '2023-10-16',
            });
        }
        return this.stripe;
    }

    /**
     * Create a payment intent (Stripe's equivalent of order)
     */
    async createOrder({ amount, currency = 'INR', metadata = {} }) {
        try {
            const stripe = await this.getStripe();

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount), // Amount in smallest currency unit
                currency: currency.toLowerCase(),
                metadata: {
                    ...metadata,
                    provider: 'stripe',
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                orderId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                createdAt: paymentIntent.created,
            };
        } catch (error) {
            console.error('Stripe payment intent creation failed:', error);
            throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
        }
    }

    /**
     * Verify payment
     * For Stripe, we retrieve the payment intent to verify its status
     */
    async verifyPayment(paymentData) {
        try {
            const { payment_intent_id } = paymentData;

            if (!payment_intent_id) {
                throw new Error('Missing payment intent ID');
            }

            const stripe = await this.getStripe();
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

            // Verify payment status
            if (paymentIntent.status === 'succeeded') {
                return true;
            }

            console.error('Payment not succeeded:', paymentIntent.status);
            return false;
        } catch (error) {
            console.error('Payment verification error:', error);
            return false;
        }
    }

    /**
     * Verify webhook signature using Stripe's built-in verification
     */
    async verifyWebhook(body, signature) {
        try {
            if (!this.webhookSecret) {
                console.warn('Stripe webhook secret not configured');
                return false;
            }

            if (!signature) {
                console.error('No webhook signature provided');
                return false;
            }

            const stripe = await this.getStripe();

            // Stripe SDK handles signature verification
            const event = stripe.webhooks.constructEvent(
                body,
                signature,
                this.webhookSecret
            );

            // If we get here, signature is valid
            return true;
        } catch (error) {
            console.error('Webhook verification error:', error);
            return false;
        }
    }

    /**
     * Get payment details from Stripe
     */
    async getPaymentDetails(paymentId) {
        try {
            const stripe = await this.getStripe();
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

            return {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                method: paymentIntent.payment_method,
                email: paymentIntent.receipt_email,
                createdAt: paymentIntent.created,
                metadata: paymentIntent.metadata,
            };
        } catch (error) {
            console.error('Failed to fetch payment details:', error);
            throw new Error(`Failed to fetch payment details: ${error.message}`);
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription({ customerId, planId, metadata = {} }) {
        try {
            const stripe = await this.getStripe();

            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: planId }],
                metadata: {
                    ...metadata,
                    provider: 'stripe',
                },
            });

            return {
                subscriptionId: subscription.id,
                planId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentStart: subscription.current_period_start,
                currentEnd: subscription.current_period_end,
            };
        } catch (error) {
            console.error('Subscription creation failed:', error);
            throw new Error(`Failed to create subscription: ${error.message}`);
        }
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId) {
        try {
            const stripe = await this.getStripe();

            const subscription = await stripe.subscriptions.cancel(subscriptionId);

            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                cancelledAt: subscription.canceled_at,
                endedAt: subscription.ended_at,
            };
        } catch (error) {
            console.error('Subscription cancellation failed:', error);
            throw new Error(`Failed to cancel subscription: ${error.message}`);
        }
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId) {
        try {
            const stripe = await this.getStripe();
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            return {
                subscriptionId: subscription.id,
                planId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentStart: subscription.current_period_start,
                currentEnd: subscription.current_period_end,
            };
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            throw new Error(`Failed to fetch subscription: ${error.message}`);
        }
    }

    /**
     * Create a refund
     */
    async createRefund({ paymentId, amount }) {
        try {
            const stripe = await this.getStripe();

            const refundData = { payment_intent: paymentId };
            if (amount) {
                refundData.amount = Math.round(amount);
            }

            const refund = await stripe.refunds.create(refundData);

            return {
                refundId: refund.id,
                paymentId: refund.payment_intent,
                amount: refund.amount,
                currency: refund.currency,
                status: refund.status,
                createdAt: refund.created,
            };
        } catch (error) {
            console.error('Refund creation failed:', error);
            throw new Error(`Failed to create refund: ${error.message}`);
        }
    }

    /**
     * Get provider name
     */
    getProviderName() {
        return 'stripe';
    }
}
