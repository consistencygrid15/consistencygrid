"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { shouldShowPaymentUI, getPlatformMessages, getUpgradeUrl } from '@/lib/platform-utils';
import { ExternalLink } from 'lucide-react';

/**
 * Payment Checkout Component
 * 
 * Handles payment flow for both Razorpay and Stripe.
 * Automatically detects provider and loads appropriate SDK.
 * 
 * Platform-aware: Hides payment UI in Android app, shows "Upgrade via Website" instead.
 */
export default function PaymentCheckout({ planId, planName, amount, onSuccess, onError }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPaymentUI, setShowPaymentUI] = useState(true); // Default to true for SSR

    // Detect platform on client side
    useEffect(() => {
        setShowPaymentUI(shouldShowPaymentUI());
    }, []);

    /**
     * Load payment provider SDK dynamically
     */
    const loadPaymentSDK = (scriptUrl) => {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.Razorpay || window.Stripe) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load payment SDK'));
            document.body.appendChild(script);
        });
    };

    /**
     * Handle Razorpay checkout
     */
    const handleRazorpayCheckout = async (orderData) => {
        try {
            // Load Razorpay SDK
            await loadPaymentSDK('https://checkout.razorpay.com/v1/checkout.js');

            const options = {
                key: orderData.order.providerKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'ConsistencyGrid',
                description: `${planName} Subscription`,
                order_id: orderData.order.orderId,
                prefill: {
                    name: orderData.user.name,
                    email: orderData.user.email,
                },
                theme: {
                    color: '#f97316', // Orange color matching your brand
                },
                handler: async (response) => {
                    // Payment successful - verify on backend
                    await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setError('Payment cancelled');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Razorpay checkout error:', err);
            throw err;
        }
    };

    /**
     * Handle Stripe checkout
     */
    const handleStripeCheckout = async (orderData) => {
        try {
            // Load Stripe SDK
            await loadPaymentSDK('https://js.stripe.com/v3/');

            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

            // Redirect to Stripe checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId: orderData.order.orderId,
            });

            if (error) {
                throw error;
            }
        } catch (err) {
            console.error('Stripe checkout error:', err);
            throw err;
        }
    };

    /**
     * Verify payment on backend
     */
    const verifyPayment = async (paymentData) => {
        try {
            const response = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment verification failed');
            }

            setLoading(false);

            // Call success callback
            if (onSuccess) {
                onSuccess(data);
            } else {
                // Default: redirect to success page
                router.push('/payment/success');
            }
        } catch (err) {
            console.error('Payment verification error:', err);
            setLoading(false);
            setError(err.message);

            if (onError) {
                onError(err);
            }
        }
    };

    /**
     * Initiate payment flow
     */
    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check authentication
            if (!session) {
                router.push('/login?redirect=/pricing');
                return;
            }

            // Create order on backend
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    useLaunchPrice: true,
                }),
            });

            const orderData = await response.json();

            if (!response.ok) {
                // Use the specific message if available, otherwise fallback
                const errorMessage = orderData.message || orderData.error || 'Failed to create order';
                throw new Error(errorMessage);
            }

            // Handle checkout based on provider
            if (orderData.order.provider === 'razorpay') {
                await handleRazorpayCheckout(orderData);
            } else if (orderData.order.provider === 'stripe') {
                await handleStripeCheckout(orderData);
            } else {
                throw new Error('Unknown payment provider');
            }

        } catch (err) {
            console.error('Payment error:', err);
            setLoading(false);
            setError(err.message);

            if (onError) {
                onError(err);
            }
        }
    };

    // Platform-specific UI: Android app shows "Upgrade via Website"
    if (!showPaymentUI) {
        const messages = getPlatformMessages();
        const upgradeUrl = getUpgradeUrl();

        return (
            <div className="payment-checkout">
                <button
                    onClick={() => window.open(upgradeUrl, '_blank', 'noopener,noreferrer')}
                    className="w-full rounded-xl px-6 py-4 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                    {messages.upgradeButton}
                    <ExternalLink className="w-5 h-5" />
                </button>

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                        {messages.upgradeDescription}
                    </p>
                </div>

                {messages.alreadySubscribed && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                        {messages.alreadySubscribed}
                    </p>
                )}
            </div>
        );
    }

    // Web platform: Full payment functionality
    return (
        <div className="payment-checkout">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-xl px-6 py-4 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        Upgrade to {planName}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </>
                )}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
}
