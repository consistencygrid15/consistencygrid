# API Routes

This directory contains all API endpoints for the ConsistencyGrid application.

## Authentication
**`/api/auth/*`** - NextAuth.js authentication endpoints
- `[...nextauth]/route.js` - NextAuth handler
- `signup/route.js` - User registration
- `authOptions.js` - NextAuth configuration

## Core Resources

### Habits
**`/api/habits`**
- `GET` - List all user habits
- `POST` - Create new habit

**`/api/habits/[id]`**
- `GET` - Get habit by ID
- `PATCH` - Update habit
- `DELETE` - Delete habit

**`/api/habits/complete`**
- `POST` - Mark habit as complete for a date

**`/api/habits/stats`**
- `GET` - Get habit statistics

### Goals
**`/api/goals`**
- `GET` - List all user goals
- `POST` - Create new goal

**`/api/goals/[id]`**
- `GET` - Get goal by ID
- `PATCH` - Update goal
- `DELETE` - Delete goal

### Subgoals
**`/api/subgoals/[id]`**
- `PATCH` - Update subgoal
- `DELETE` - Delete subgoal

### Reminders
**`/api/reminders`**
- `GET` - List all user reminders
- `POST` - Create new reminder

**`/api/reminders/[id]`**
- `GET` - Get reminder by ID
- `PATCH` - Update reminder
- `DELETE` - Delete reminder

### Streaks
**`/api/streaks`**
- `GET` - Get user streak data

### Milestones
**`/api/milestones`**
- `GET` - Get user milestones

## Dashboard
**`/api/dashboard/stats`**
- `GET` - Get dashboard statistics (habits, goals, streaks)

## Analytics
**`/api/analytics/track`**
- `POST` - Track analytics event

## Settings
**`/api/settings`**
- `GET` - Get user settings
- `PATCH` - Update user settings

**`/api/settings/theme`**
- `PATCH` - Update theme preferences

## Data Management
**`/api/export-data`**
- `GET` - Export all user data as JSON

**`/api/gdpr/*`** - GDPR compliance endpoints
- `export/route.js` - Export user data
- `delete/route.js` - Delete user account
- `data-access/route.js` - Access user data
- `consent/route.js` - Manage consent
- `portability/route.js` - Data portability

## Wallpaper
**`/api/wallpaper-data`**
- `GET` - Get wallpaper generation data

## Onboarding
**`/api/onboarding/complete`**
- `POST` - Mark onboarding as complete

**`/api/onboarding/skip`**
- `POST` - Skip onboarding

## API Standards

### Request Format
All requests should include:
- `Content-Type: application/json` header
- Valid session cookie (for protected routes)
- Request body as JSON (for POST/PATCH)

### Response Format
All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": 400,
    "details": { /* optional error details */ }
  }
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### Authentication
Protected routes require a valid NextAuth session. Use `getServerSession()` to verify authentication:

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

const session = await getServerSession(authOptions);
if (!session) {
  return createErrorResponse('Unauthorized', 401);
}
```

### Error Handling
Use standardized error responses:

```javascript
import { createErrorResponse, handleAPIError } from '@/lib/apiResponse';

try {
  // API logic
} catch (error) {
  return handleAPIError(error, 'POST /api/habits');
}
```

### Validation
Validate all inputs before processing:

```javascript
import { validateHabitData } from '@/lib/validation';

const validation = validateHabitData(data);
if (!validation.isValid) {
  return createValidationErrorResponse(validation.errors);
}
```

### Rate Limiting
Apply rate limiting to prevent abuse:

```javascript
import { checkRateLimit } from '@/lib/rate-limit';

const rateLimit = await checkRateLimit(request, 'create-habit');
if (!rateLimit.allowed) {
  return createRateLimitResponse(rateLimit.resetTime);
}
```

## Adding New Endpoints

When creating new API routes:

1. Create route file in appropriate directory
2. Export HTTP method handlers (GET, POST, PATCH, DELETE)
3. Add authentication check for protected routes
4. Validate all inputs
5. Apply rate limiting if needed
6. Use standardized response format
7. Add error handling
8. Document the endpoint in this README
