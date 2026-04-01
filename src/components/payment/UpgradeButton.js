/**
 * Platform-Aware Upgrade Button Component
 * 
 * A reusable button component that adapts based on platform:
 * - Web: Shows standard upgrade button
 * - Android: Shows "Upgrade via Website" with external link
 * 
 * Usage:
 * <UpgradeButton planName="Pro" className="custom-class" />
 */

"use client";

import { useState, useEffect } from 'react';
import { shouldShowPaymentUI, getPlatformMessages, getUpgradeUrl } from '@/lib/platform-utils';
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function UpgradeButton({
    planName = "Pro",
    className = "",
    variant = "primary", // "primary" | "secondary"
    size = "md", // "sm" | "md" | "lg"
    onClick,
    children
}) {
    const [showPaymentUI, setShowPaymentUI] = useState(true);

    useEffect(() => {
        setShowPaymentUI(shouldShowPaymentUI());
    }, []);

    const messages = getPlatformMessages();
    const upgradeUrl = getUpgradeUrl();

    // Size classes
    const sizeClasses = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base"
    };

    // Variant classes
    const variantClasses = {
        primary: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl",
        secondary: "border-2 border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-orange-300"
    };

    const baseClasses = "rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95";
    const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    // Android app: Open website
    if (!showPaymentUI) {
        const handleClick = () => {
            if (typeof window === 'undefined') return;
            try {
                window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
            } catch (error) {
                console.error('[UpgradeButton] Navigation error:', error);
            }
        };
        return (
            <button
                onClick={handleClick}
                className={combinedClasses}
            >
                {children || messages.upgradeButton}
                <ExternalLink className="w-4 h-4" />
            </button>
        );
    }

    // Web: Standard button
    return (
        <button
            onClick={onClick}
            className={combinedClasses}
        >
            {children || `Upgrade to ${planName}`}
            <ArrowRight className="w-4 h-4" />
        </button>
    );
}
