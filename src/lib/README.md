# Lib Directory

This directory contains utility libraries and helper functions used throughout the ConsistencyGrid application.

## Core Utilities

### Authentication & Security
- **`csrf.js`** - CSRF token generation and validation
- **`validation.js`** - Input validation and sanitization functions
- **`apiSecurity.js`** - API security utilities

### API & Responses
- **`apiResponse.js`** - Standardized API response helpers
- **`apiHelpers.js`** - Common API utility functions
- **`errorResponse.js`** - Error response formatting

### Caching
- **`api-cache.js`** - API response caching
- **`dashboard-cache.js`** - Dashboard data caching
- **`cache-invalidation.js`** - Cache invalidation strategies

### Database
- **`prisma.js`** - Prisma client singleton
- **`db-optimization.js`** - Database query optimization utilities

### Monitoring & Analytics
- **`sentry.js`** - Sentry error tracking configuration
- **`sentry-client.js`** - Client-side Sentry setup
- **`sentry-server.js`** - Server-side Sentry setup
- **`analytics.js`** - Analytics tracking utilities

### Performance
- **`performance.js`** - Performance monitoring and optimization
- **`rate-limit.js`** - Rate limiting for API endpoints

### Features
- **`mail.js`** - Email sending utilities (Resend integration)
- **`export-data.js`** - User data export functionality
- **`gdpr.js`** - GDPR compliance utilities
- **`pwa.js`** - Progressive Web App utilities
- **`seo.js`** - SEO metadata generation
- **`subscription-middleware.js`** - Subscription checking middleware
- **`subscription-utils.js`** - Subscription management utilities
- **`token.js`** - Token generation and validation

### Wallpaper
- **`wallpaper/`** - Wallpaper generation utilities

## Usage Examples

### API Response
```javascript
import { createSuccessResponse, createErrorResponse } from '@/lib/apiResponse';

// Success response
return createSuccessResponse({ user: userData }, 201);

// Error response
return createErrorResponse('User not found', 404);
```

### Validation
```javascript
import { validateEmail, validatePassword, sanitizeString } from '@/lib/validation';

const emailValidation = validateEmail(email);
if (!emailValidation.valid) {
  return { error: emailValidation.error };
}

const isValidPassword = validatePassword(password);
const safeName = sanitizeString(userName);
```

### Rate Limiting
```javascript
import { checkRateLimit } from '@/lib/rate-limit';

const rateLimitResult = await checkRateLimit(request, 'api-endpoint');
if (!rateLimitResult.allowed) {
  return createRateLimitResponse(rateLimitResult.resetTime);
}
```

### Caching
```javascript
import { getCachedData, setCachedData } from '@/lib/api-cache';

const cached = await getCachedData('dashboard-stats', userId);
if (cached) return cached;

const data = await fetchData();
await setCachedData('dashboard-stats', userId, data, 300); // 5 min TTL
```

## Best Practices

1. **Keep utilities pure** - Functions should be side-effect free when possible
2. **Add JSDoc comments** - Document all exported functions with parameters and return types
3. **Handle errors gracefully** - Always validate inputs and handle edge cases
4. **Use TypeScript-style JSDoc** - Add type information in comments for better IDE support
5. **Export named functions** - Prefer named exports over default exports for utilities
6. **Keep files focused** - Each file should have a single, clear purpose

## Adding New Utilities

When adding new utility functions:

1. Choose the appropriate file or create a new one if needed
2. Add comprehensive JSDoc comments
3. Include usage examples in comments
4. Add error handling
5. Update this README with the new utility
6. Write tests if applicable
