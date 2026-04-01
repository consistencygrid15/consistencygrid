/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and spam
 */

const rateLimit = {};

export function createRateLimiter(windowMs = 15 * 60 * 1000, maxRequests = 100) {
  return {
    check: (identifier) => {
      const now = Date.now();
      const key = `${identifier}`;

      if (!rateLimit[key]) {
        rateLimit[key] = {
          count: 1,
          resetTime: now + windowMs,
        };
        return { allowed: true, remaining: maxRequests - 1 };
      }

      const record = rateLimit[key];

      // Reset if window expired
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return { allowed: true, remaining: maxRequests - 1 };
      }

      record.count++;

      if (record.count > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime,
        };
      }

      return { allowed: true, remaining: maxRequests - record.count };
    },

    reset: (identifier) => {
      delete rateLimit[`${identifier}`];
    },

    cleanup: () => {
      const now = Date.now();
      Object.keys(rateLimit).forEach((key) => {
        if (now > rateLimit[key].resetTime) {
          delete rateLimit[key];
        }
      });
    },
  };
}

// Pre-configured limiters
export const loginLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 min
export const signupLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 attempts per hour
export const apiLimiter = createRateLimiter(60 * 1000, 100); // 100 requests per minute
export const passwordResetLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 attempts per hour

// Cleanup old entries every 10 minutes
setInterval(() => {
  loginLimiter.cleanup();
  signupLimiter.cleanup();
  apiLimiter.cleanup();
  passwordResetLimiter.cleanup();
}, 10 * 60 * 1000);

export function getClientIP(request) {
  // Check for IP in various header formats
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
