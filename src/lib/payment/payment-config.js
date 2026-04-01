import { RazorpayProvider } from './providers/razorpay-provider';
import { StripeProvider } from './providers/stripe-provider';

/**
 * Payment Configuration and Provider Management
 * 
 * This module manages payment provider selection and pricing configuration.
 * Switch providers by changing NEXT_PUBLIC_PAYMENT_PROVIDER environment variable.
 */

// Pricing Plans Configuration
export const PRICING_PLANS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'INR',
        interval: 'forever',
        features: {
            habits: 3,
            goals: 3,
            historyDays: 7,
            analytics: 'basic',
            themes: 'basic',
            aiSuggestions: false,
            reminders: false,
            export: false,
            prioritySupport: false,
        },
    },
    pro_monthly: {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        price: 99,
        currency: 'INR',
        interval: 'month',
        trialDays: 14,
        features: {
            habits: -1, // unlimited
            goals: -1,
            historyDays: -1,
            analytics: 'advanced',
            themes: 'all',
            aiSuggestions: true,
            reminders: true,
            export: true,
            prioritySupport: true,
        },
    },
    pro_yearly: {
        id: 'pro_yearly',
        name: 'Pro Yearly',
        price: 499,
        launchPrice: 299, // Special launch offer
        currency: 'INR',
        interval: 'year',
        trialDays: 14,
        savings: '59% off monthly',
        features: {
            habits: -1,
            goals: -1,
            historyDays: -1,
            analytics: 'advanced',
            themes: 'all',
            aiSuggestions: true,
            reminders: true,
            export: true,
            prioritySupport: true,
            lifetimeAccess: true,
        },
    },
    testing_plan: {
        id: 'testing_plan',
        name: 'Testing Plan',
        price: 1,
        currency: 'INR',
        interval: 'one-time',
        features: {
            habits: -1,
            goals: -1,
            historyDays: -1,
            analytics: 'advanced',
            themes: 'all',
            aiSuggestions: true,
            reminders: true,
            export: true,
            prioritySupport: true,
            lifetimeAccess: true,
        },
    },
};

/**
 * Get pricing plan details
 */
export function getPlan(planId) {
    return PRICING_PLANS[planId] || null;
}

/**
 * Get plan price in smallest currency unit (paise for INR)
 */
export function getPlanAmount(planId, useLaunchPrice = true) {
    const plan = getPlan(planId);
    if (!plan) return 0;

    // Use launch price if available and enabled
    const price = useLaunchPrice && plan.launchPrice ? plan.launchPrice : plan.price;

    // Convert to smallest currency unit (paise for INR, cents for USD)
    return price * 100;
}

/**
 * Check if user can upgrade to a plan
 */
export function canUpgradeToPlan(currentPlan, targetPlan) {
    const planHierarchy = ['free', 'testing_plan', 'pro_monthly', 'pro_yearly'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const targetIndex = planHierarchy.indexOf(targetPlan);

    return targetIndex > currentIndex;
}

/**
 * Get active payment provider based on environment configuration
 */
export function getPaymentProvider() {
    const providerName = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'razorpay';

    try {
        switch (providerName.toLowerCase()) {
            case 'razorpay':
                return new RazorpayProvider();

            case 'stripe':
                return new StripeProvider();

            default:
                console.warn(`Unknown payment provider: ${providerName}, falling back to Razorpay`);
                return new RazorpayProvider();
        }
    } catch (error) {
        console.error(`Failed to initialize payment provider ${providerName}:`, error);
        throw error;
    }
}

/**
 * Get provider-specific checkout configuration
 */
export function getCheckoutConfig() {
    const providerName = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'razorpay';

    switch (providerName.toLowerCase()) {
        case 'razorpay':
            return {
                provider: 'razorpay',
                publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                scriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
                currency: 'INR',
            };

        case 'stripe':
            return {
                provider: 'stripe',
                publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
                scriptUrl: 'https://js.stripe.com/v3/',
                currency: 'INR',
            };

        default:
            throw new Error(`Unknown payment provider: ${providerName}`);
    }
}

/**
 * Validate payment provider configuration
 */
export function validatePaymentConfig() {
    const providerName = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'razorpay';
    const errors = [];

    if (providerName === 'razorpay') {
        if (!process.env.RAZORPAY_KEY_ID) {
            errors.push('RAZORPAY_KEY_ID is not configured');
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            errors.push('RAZORPAY_KEY_SECRET is not configured');
        }
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            errors.push('NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured');
        }
    } else if (providerName === 'stripe') {
        if (!process.env.STRIPE_SECRET_KEY) {
            errors.push('STRIPE_SECRET_KEY is not configured');
        }
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        provider: providerName,
    };
}

// Singleton provider instance (server-side only)
let providerInstance = null;

/**
 * Get singleton payment provider instance
 * Use this in API routes to avoid creating multiple instances
 */
export function getProviderInstance() {
    if (!providerInstance) {
        providerInstance = getPaymentProvider();
    }
    return providerInstance;
}
