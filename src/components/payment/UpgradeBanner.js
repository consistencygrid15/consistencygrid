/**
 * Upgrade Banner Component
 * 
 * Compact banner for dashboard and other pages
 * Platform-aware upgrade call-to-action
 */

"use client";

import { useState, useEffect } from 'react';
import { shouldShowPaymentUI, getPlatformMessages, getUpgradeUrl } from '@/lib/platform-utils';
import { Crown, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

export default function UpgradeBanner({
    variant = "default", // "default" | "compact" | "floating"
    showFeatures = true,
    className = ""
}) {
    const [showPaymentUI, setShowPaymentUI] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setShowPaymentUI(shouldShowPaymentUI());
    }, []);

    if (!isVisible) return null;

    const messages = getPlatformMessages();
    const upgradeUrl = getUpgradeUrl();

    const handleUpgrade = () => {
        if (typeof window === 'undefined') return;
        try {
            if (showPaymentUI) {
                window.location.href = '/pricing';
            } else {
                window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('[UpgradeBanner] Navigation error:', error);
        }
    };

    // Compact variant
    if (variant === "compact") {
        return (
            <div className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg ${className}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">
                                {showPaymentUI ? "Access Pro Features" : "Members Area"}
                            </h3>
                            <p className="text-orange-50 text-xs">Unlock unlimited features</p>
                        </div>
                    </div>
                    <button
                        onClick={handleUpgrade}
                        className="px-4 py-2 bg-white text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        {showPaymentUI ? "View Plans" : "Continue"}
                        {showPaymentUI ? (
                            <ArrowRight className="w-4 h-4" />
                        ) : (
                            <ExternalLink className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Floating variant (bottom of screen)
    if (variant === "floating") {
        return (
            <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 ${className}`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-400 text-xs">✕</span>
                    </button>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">
                                {showPaymentUI ? "Unlock Pro Features" : "Members Area"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Get unlimited habits, goals, and advanced analytics
                            </p>
                            <button
                                onClick={handleUpgrade}
                                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {showPaymentUI ? "View Plans" : "Continue"}
                                {showPaymentUI ? (
                                    <ArrowRight className="w-4 h-4" />
                                ) : (
                                    <ExternalLink className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border-2 border-orange-200 rounded-2xl p-6 shadow-lg ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-6 h-6 text-orange-500" />
                        <h3 className="text-xl font-bold text-gray-900">Upgrade to Pro</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Unlock unlimited habits, goals, advanced analytics, and premium themes
                    </p>

                    {showFeatures && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {[
                                "Unlimited habits",
                                "Full history",
                                "Advanced analytics",
                                "Premium themes"
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                    <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleUpgrade}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        {showPaymentUI ? "View Pricing" : messages.upgradeButton}
                        {showPaymentUI ? (
                            <ArrowRight className="w-5 h-5" />
                        ) : (
                            <ExternalLink className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
