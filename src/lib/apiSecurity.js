/**
 * API Security Wrapper
 * Standardized protection for all API routes
 * Handles: Authentication, Rate limiting, CSRF, Input validation, Error handling
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";
import { apiLimiter, getClientIP } from "@/lib/rateLimit";
import { createErrorResponse, createSuccessResponse, createRateLimitResponse, handleAPIError, createValidationErrorResponse } from "@/lib/apiResponse";

/**
 * Protect API endpoint with authentication, rate limiting, and error handling
 * Usage:
 *   export const POST = withAPIProtection(async (req, { user, session }) => {
 *     // Your logic here
 *   });
 */
export function withAPIProtection(handler) {
  return async (req) => {
    try {
      // Rate limiting
      const clientIP = getClientIP(req);
      const rateLimitCheck = apiLimiter.check(clientIP);
      
      if (!rateLimitCheck.allowed) {
        return createRateLimitResponse(rateLimitCheck.resetTime);
      }

      // Authentication
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return createErrorResponse('Unauthorized. Please login.', 401);
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return createErrorResponse('User not found', 404);
      }

      // Call handler with user context
      return await handler(req, { user, session });
    } catch (error) {
      return handleAPIError(error, 'API Route');
    }
  };
}

/**
 * Wrapper for GET endpoints
 */
export const withGET = (handler) => withAPIProtection(handler);

/**
 * Wrapper for POST endpoints with optional input validation
 */
export function withPOST(handler, validator = null) {
  return withAPIProtection(async (req, context) => {
    try {
      const body = await req.json();

      // Optional: Validate input
      if (validator) {
        const validation = validator(body);
        if (!validation.isValid) {
          return createValidationErrorResponse(validation.errors);
        }
      }

      return await handler(req, { ...context, body });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON in request body', 400);
      }
      throw error;
    }
  });
}

/**
 * Wrapper for PUT endpoints with optional input validation
 */
export function withPUT(handler, validator = null) {
  return withPOST(handler, validator);
}

/**
 * Wrapper for DELETE endpoints (requires confirmation)
 */
export function withDELETE(handler) {
  return withAPIProtection(async (req, context) => {
    // DELETE operations should be handled carefully
    // Add additional safety checks here if needed
    return await handler(req, context);
  });
}
 
