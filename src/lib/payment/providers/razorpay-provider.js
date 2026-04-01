import crypto from 'crypto';
import { PaymentProvider } from '../payment-provider';

/**
 * Razorpay Payment Provider Implementation
 * 
 * Implements the PaymentProvider interface for Razorpay.
 * Handles order creation, payment verification, webhooks, and subscriptions.
 */
export class RazorpayProvider extends PaymentProvider {
    constructor() {
        super();

        // Validate required environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
        }

        this.keyId = process.env.RAZORPAY_KEY_ID;
        this.keySecret = process.env.RAZORPAY_KEY_SECRET;
        this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Lazy load Razorpay SDK
        this.razorpay = null;
    }

    /**
     * Get or initialize Razorpay instance
     */
    async getRazorpay() {
        if (!this.razorpay) {
            const Razorpay = (await import('razorpay')).default;
            this.razorpay = new Razorpay({
                key_id: this.keyId,
                key_secret: this.keySecret,
            });
        }
        return this.razorpay;
    }

    /**
     * Create a payment order
     */
    async createOrder({ amount, currency = 'INR', metadata = {} }) {
        try {
            const razorpay = await this.getRazorpay();

            // Generate unique receipt ID (Must be <= 40 chars)
            // Format: rcpt_timestamp_shortUid
            // timestamp: 13 chars
            // rcpt_: 5 chars
            // remaining: 22 chars
            const uid = (metadata.userId || 'guest').toString();
            // Take last 10 chars of UID to ensure uniqueness but keep it short
            const shortUid = uid.length > 10 ? uid.slice(-10) : uid;

            const receipt = `rcpt_${Date.now()}_${shortUid}`;

            const order = await razorpay.orders.create({
                amount: Math.round(amount), // Amount in paise (already converted)
                currency: currency.toUpperCase(),
                receipt,
                notes: {
                    ...metadata,
                    provider: 'razorpay',
                },
            });

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
                createdAt: order.created_at,
            };
        } catch (error) {
            console.error('Razorpay order creation failed. Full Error:', JSON.stringify(error, null, 2));

            // Extract meaningful error message
            let message = error.message;
            if (error.error && error.error.description) {
                message = error.error.description;
            } else if (error.description) {
                message = error.description;
            }

            throw new Error(message || 'Failed to create Razorpay order');
        }
    }

    /**
     * Verify payment signature
     * This is CRITICAL for security - always verify payments server-side
     */
    async verifyPayment(paymentData) {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            } = paymentData;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw new Error('Missing required payment verification data');
            }

            // Generate expected signature
            const body = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto
                .createHmac('sha256', this.keySecret)
                .update(body)
                .digest('hex');

            // Constant-time comparison to prevent timing attacks
            const isValid = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'hex'),
                Buffer.from(razorpay_signature, 'hex')
            );

            if (!isValid) {
                console.error('Payment signature verification failed');
                return false;
            }

            // Additional verification: fetch payment details from Razorpay
            const paymentDetails = await this.getPaymentDetails(razorpay_payment_id);

            // Verify payment status
            if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
                console.error('Payment not captured:', paymentDetails.status);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Payment verification error:', error);
            return false;
        }
    }

    /**
     * Verify webhook signature
     */
    async verifyWebhook(body, signature) {
        try {
            if (!this.webhookSecret) {
                console.warn('Razorpay webhook secret not configured');
                return false;
            }

            if (!signature) {
                console.error('No webhook signature provided');
                return false;
            }

            // Generate expected signature
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(body)
                .digest('hex');

            // Constant-time comparison
            const isValid = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'hex'),
                Buffer.from(signature, 'hex')
            );

            return isValid;
        } catch (error) {
            console.error('Webhook verification error:', error);
            return false;
        }
    }

    /**
     * Get payment details from Razorpay
     */
    async getPaymentDetails(paymentId) {
        try {
            const razorpay = await this.getRazorpay();
            const payment = await razorpay.payments.fetch(paymentId);

            return {
                id: payment.id,
                orderId: payment.order_id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                createdAt: payment.created_at,
                metadata: payment.notes,
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
            const razorpay = await this.getRazorpay();

            const subscription = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: 12, // 12 billing cycles for yearly
                notes: {
                    ...metadata,
                    provider: 'razorpay',
                },
            });

            return {
                subscriptionId: subscription.id,
                planId: subscription.plan_id,
                status: subscription.status,
                currentStart: subscription.current_start,
                currentEnd: subscription.current_end,
                chargeAt: subscription.charge_at,
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
            const razorpay = await this.getRazorpay();

            const subscription = await razorpay.subscriptions.cancel(subscriptionId);

            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                cancelledAt: subscription.cancelled_at,
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
            const razorpay = await this.getRazorpay();
            const subscription = await razorpay.subscriptions.fetch(subscriptionId);

            return {
                subscriptionId: subscription.id,
                planId: subscription.plan_id,
                status: subscription.status,
                currentStart: subscription.current_start,
                currentEnd: subscription.current_end,
                chargeAt: subscription.charge_at,
                totalCount: subscription.total_count,
                paidCount: subscription.paid_count,
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
            const razorpay = await this.getRazorpay();

            const refundData = { payment_id: paymentId };
            if (amount) {
                refundData.amount = Math.round(amount);
            }

            const refund = await razorpay.payments.refund(paymentId, refundData);

            return {
                refundId: refund.id,
                paymentId: refund.payment_id,
                amount: refund.amount,
                currency: refund.currency,
                status: refund.status,
                createdAt: refund.created_at,
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
        return 'razorpay';
    }
}
