/**
 * API Response Utility
 * Standardized error and success responses
 */

export const createSuccessResponse = (data, statusCode = 200) => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
};

export const createErrorResponse = (message, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code: statusCode,
    },
  };

  // Include details if it's a validation error (422) even in production,
  // or if we are in development mode.
  if (details && (process.env.NODE_ENV === 'development' || statusCode === 422)) {
    response.error.details = details;
  }

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

export const API_ERRORS = {
  INVALID_INPUT: { code: 400, message: 'Invalid input provided' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized. Please login' },
  FORBIDDEN: { code: 403, message: 'Access denied' },
  NOT_FOUND: { code: 404, message: 'Resource not found' },
  CONFLICT: { code: 409, message: 'Resource already exists' },
  RATE_LIMITED: { code: 429, message: 'Too many requests. Please try again later' },
  INTERNAL_ERROR: { code: 500, message: 'Internal server error' },
  VALIDATION_ERROR: { code: 422, message: 'Validation failed' },
};

export const createValidationErrorResponse = (errors) => {
  return createErrorResponse(
    'Validation failed',
    422,
    { errors }
  );
};

export const createRateLimitResponse = (resetTime) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message: 'Too many requests. Please try again later',
        code: 429,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000),
      },
    }
  );
};

export const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error?.message || 'Unknown error',
    stack: error?.stack || null,
  };

  console.error(`[ERROR ${timestamp}] ${context}:`, errorInfo);

  // TODO: Send to error logging service (Sentry, etc)
};

export const handleAPIError = (error, context = 'API Error') => {
  logError(error, context);

  // Don't expose internal error details to client
  return createErrorResponse(
    'An error occurred processing your request',
    500
  );
};
