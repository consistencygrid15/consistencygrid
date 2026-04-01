/**
 * Payment Provider Abstract Interface
 * 
 * This defines the contract that all payment providers (Razorpay, Stripe, etc.) must implement.
 * This abstraction allows easy switching between payment providers without changing business logic.
 */

export class PaymentProvider {
    /**
     * Create a payment order
     * @param {Object} params - Order parameters
     * @param {number} params.amount - Amount in smallest currency unit (paise for INR, cents for USD)
     * @param {string} params.currency - Currency code (INR, USD, etc.)
     * @param {Object} params.metadata - Additional metadata (userId, plan, etc.)
     * @returns {Promise<Object>} Order details with orderId
     */
    async createOrder({ amount, currency, metadata }) {
        throw new Error('createOrder must be implemented by payment provider');
    }

    /**
     * Verify payment signature/authenticity
     * @param {Object} paymentData - Payment data from provider
     * @returns {Promise<boolean>} True if payment is valid
     */
    async verifyPayment(paymentData) {
        throw new Error('verifyPayment must be implemented by payment provider');
    }

    /**
     * Verify webhook signature
     * @param {string} body - Raw webhook body
     * @param {string} signature - Webhook signature header
     * @returns {Promise<boolean>} True if webhook is authentic
     */
    async verifyWebhook(body, signature) {
        throw new Error('verifyWebhook must be implemented by payment provider');
    }

    /**
     * Get payment details from provider
     * @param {string} paymentId - Payment ID
     * @returns {Promise<Object>} Payment details
     */
    async getPaymentDetails(paymentId) {
        throw new Error('getPaymentDetails must be implemented by payment provider');
    }

    /**
     * Create a subscription
     * @param {Object} params - Subscription parameters
     * @param {string} params.customerId - Customer ID
     * @param {string} params.planId - Plan ID
     * @param {Object} params.metadata - Additional metadata
     * @returns {Promise<Object>} Subscription details
     */
    async createSubscription({ customerId, planId, metadata }) {
        throw new Error('createSubscription must be implemented by payment provider');
    }

    /**
     * Cancel a subscription
     * @param {string} subscriptionId - Subscription ID
     * @returns {Promise<Object>} Cancellation details
     */
    async cancelSubscription(subscriptionId) {
        throw new Error('cancelSubscription must be implemented by payment provider');
    }

    /**
     * Get subscription details
     * @param {string} subscriptionId - Subscription ID
     * @returns {Promise<Object>} Subscription details
     */
    async getSubscription(subscriptionId) {
        throw new Error('getSubscription must be implemented by payment provider');
    }

    /**
     * Create a refund
     * @param {Object} params - Refund parameters
     * @param {string} params.paymentId - Payment ID to refund
     * @param {number} params.amount - Amount to refund (optional, full refund if not specified)
     * @returns {Promise<Object>} Refund details
     */
    async createRefund({ paymentId, amount }) {
        throw new Error('createRefund must be implemented by payment provider');
    }

    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getProviderName() {
        throw new Error('getProviderName must be implemented by payment provider');
    }
}
