/**
 * Limit Exceeded Hook
 * 
 * Custom hook to check if user has exceeded free plan limits
 * and show upgrade prompt
 */

import { useState, useEffect } from 'react';

export function useLimitCheck(feature, currentCount, limit = 3) {
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [isAtLimit, setIsAtLimit] = useState(false);

    useEffect(() => {
        setIsAtLimit(currentCount >= limit);
    }, [currentCount, limit]);

    const checkLimit = () => {
        if (currentCount >= limit) {
            setShowUpgradePrompt(true);
            return false; // Prevent action
        }
        return true; // Allow action
    };

    return {
        showUpgradePrompt,
        setShowUpgradePrompt,
        isAtLimit,
        checkLimit,
        currentCount,
        limit
    };
}

export default useLimitCheck;
