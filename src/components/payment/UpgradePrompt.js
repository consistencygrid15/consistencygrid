/**
 * Upgrade Prompt Component
 * 
 * Shows when user hits free plan limits or needs to upgrade
 * Platform-aware: Shows different UI for web vs Android
 */

"use client";

import { useState, useEffect } from 'react';
import { shouldShowPaymentUI, getPlatformMessages, getUpgradeUrl } from '@/lib/platform-utils';
import { Crown, ExternalLink, X, Zap, Check } from 'lucide-react';

export default function UpgradePrompt({
    isOpen = false,
    onClose,
    title = "Upgrade to Pro",
    message = "Unlock unlimited features with Pro",
    feature = null, // "habits", "goals", "analytics", etc.
    currentCount = 0,
    limit = 3
}) {
    const [showPaymentUI, setShowPaymentUI] = useState(true);

    useEffect(() => {
        setShowPaymentUI(shouldShowPaymentUI());
    }, []);

    if (!isOpen) return null;

    const messages = getPlatformMessages();
    const upgradeUrl = getUpgradeUrl();

    const proFeatures = [
        "Unlimited habits & goals",
        "Full history access",
        "Advanced analytics",
        "All premium themes",
        "Priority support"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Crown className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                    </div>
                    <p className="text-orange-50">{message}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Limit info */}
                    {feature && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Current Plan: Free</span>
                                <span className="text-sm font-bold text-orange-600">{currentCount}/{limit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min((currentCount / limit) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                You've reached the limit for {feature} on the Free plan
                            </p>
                        </div>
                    )}

                    {/* Pro features */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                            Pro Features Include:
                        </h3>
                        <ul className="space-y-2">
                            {proFeatures.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700">{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Upgrade button */}
                    {showPaymentUI ? (
                        // Web: Navigate to pricing page
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    try {
                                        window.location.href = '/pricing';
                                    } catch (error) {
                                        console.error('[UpgradePrompt] Navigation error:', error);
                                    }
                                }
                            }}
                            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <Crown className="w-5 h-5" />
                            Upgrade to Pro
                        </button>
                    ) : (
                        // Android: Open website
                        <div>
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        try {
                                            window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
                                        } catch (error) {
                                            console.error('[UpgradePrompt] Navigation error:', error);
                                        }
                                    }
                                }}
                                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                {messages.upgradeButton}
                                <ExternalLink className="w-5 h-5" />
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                {messages.upgradeDescription}
                            </p>
                        </div>
                    )}

                    {/* Continue with free */}
                    <button
                        onClick={onClose}
                        className="w-full mt-3 px-6 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Continue with Free
                    </button>
                </div>
            </div>
        </div>
    );
}
