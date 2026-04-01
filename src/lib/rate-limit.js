/**
 * ============================================================================
 * RATE LIMITING UTILITY
 * ============================================================================
 * 
 * Simple in-memory rate limiting for API endpoints
 * Prevents abuse at scale by limiting requests per user
 * 
 * Used for all mutation endpoints (POST, PUT, DELETE, PATCH)
 * 
 * ============================================================================
 */

// Store: Map<userId-action, [timestamp, timestamp, ...]>
const requestHistory = new Map();

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requestHistory.entries()) {
        // Keep only recent timestamps (last 1 hour)
        const recent = timestamps.filter(t => now - t < 3600000);
        if (recent.length === 0) {
            requestHistory.delete(key);
        } else {
            requestHistory.set(key, recent);
        }
    }
}, 5 * 60 * 1000);

/**
 * Check if a user has exceeded rate limit for an action
 * @param {string} userId - User ID from session
 * @param {string} action - Action type (create, update, delete, toggle, etc.)
 * @param {Object} options - Rate limit options
 * @param {number} options.maxRequests - Max requests allowed (default: 100)
 * @param {number} options.windowMs - Time window in ms (default: 60000 = 1 minute)
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(userId, action, options = {}) {
    const {
        maxRequests = 100,
        windowMs = 60000, // 1 minute default
    } = options;

    if (!userId) {
        return { allowed: false, remaining: 0, resetAt: new Date() };
    }

    const key = `${userId}:${action}`;
    const now = Date.now();

    // Get request history for this user-action combo
    let timestamps = requestHistory.get(key) || [];

    // Filter to only recent requests (within the window)
    timestamps = timestamps.filter(timestamp => now - timestamp < windowMs);

    // Check if limit exceeded
    const allowed = timestamps.length < maxRequests;

    if (allowed) {
        // Add current request timestamp
        timestamps.push(now);
        requestHistory.set(key, timestamps);
    }

    // Calculate when oldest request expires (reset time)
    const oldestTimestamp = timestamps[0];
    const resetAt = new Date(oldestTimestamp + windowMs);

    return {
        allowed,
        remaining: Math.max(0, maxRequests - timestamps.length),
        resetAt,
        retryAfter: !allowed ? Math.ceil((resetAt.getTime() - now) / 1000) : 0,
    };
}

/**
 * Middleware helper to check rate limit and return response if exceeded
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @param {Object} options - Rate limit options
 * @returns {Response|null} Response if rate limited, null if allowed
 */
export function getRateLimitErrorResponse(userId, action, options = {}) {
    const { allowed, remaining, retryAfter } = checkRateLimit(userId, action, options);

    if (!allowed) {
        return Response.json(
            {
                message: "Too many requests. Please try again later.",
                retryAfter,
                remaining,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": retryAfter.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                },
            }
        );
    }

    return null;
}

/**
 * Standard rate limits for different operations
 */
export const RATE_LIMITS = {
    // Habits: 100 per minute
    habitCreate: { maxRequests: 100, windowMs: 60000 },
    habitUpdate: { maxRequests: 100, windowMs: 60000 },
    habitDelete: { maxRequests: 50, windowMs: 60000 },
    habitToggle: { maxRequests: 200, windowMs: 60000 }, // More frequent for daily checking
    
    // Goals: 50 per minute
    goalCreate: { maxRequests: 50, windowMs: 60000 },
    goalUpdate: { maxRequests: 50, windowMs: 60000 },
    goalDelete: { maxRequests: 25, windowMs: 60000 },
    goalPin: { maxRequests: 100, windowMs: 60000 },
    
    // SubGoals: 100 per minute
    subgoalUpdate: { maxRequests: 100, windowMs: 60000 },
    
    // Milestones: 50 per minute
    milestoneCreate: { maxRequests: 50, windowMs: 60000 },
    milestoneUpdate: { maxRequests: 50, windowMs: 60000 },
    
    // Reminders: 50 per minute
    reminderCreate: { maxRequests: 50, windowMs: 60000 },
    reminderUpdate: { maxRequests: 50, windowMs: 60000 },
    reminderDelete: { maxRequests: 50, windowMs: 60000 },
    
    // Settings: 20 per minute (infrequent)
    settingsSave: { maxRequests: 20, windowMs: 60000 },
};
