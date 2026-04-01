/**
 * CSRF Protection Utility
 * Prevent cross-site request forgery attacks
 */

import crypto from 'crypto';

const csrfTokens = new Map();
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function generateCSRFToken(sessionId) {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store with session ID and expiry
  csrfTokens.set(token, {
    sessionId,
    createdAt: Date.now(),
    used: false,
  });

  return token;
}

export function validateCSRFToken(token, sessionId) {
  const now = Date.now();
  
  // Check if token exists
  if (!csrfTokens.has(token)) {
    return { valid: false, reason: 'Invalid token' };
  }

  const tokenData = csrfTokens.get(token);

  // Check if token expired
  if (now - tokenData.createdAt > TOKEN_EXPIRY) {
    csrfTokens.delete(token);
    return { valid: false, reason: 'Token expired' };
  }

  // Check if token matches session
  if (tokenData.sessionId !== sessionId) {
    return { valid: false, reason: 'Session mismatch' };
  }

  // Check if token already used (optional, for strict mode)
  // if (tokenData.used) {
  //   return { valid: false, reason: 'Token already used' };
  // }

  return { valid: true };
}

export function revokeCSRFToken(token) {
  csrfTokens.delete(token);
}

export function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRY) {
      csrfTokens.delete(token);
    }
  }
}

// Cleanup expired tokens every hour
if (typeof global !== 'undefined') {
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
}

export function getCSRFTokenFromRequest(request) {
  // Check in headers first (recommended)
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) return headerToken;

  // Check in body for form submissions
  // Note: You need to parse the body separately
  return null;
}

export const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function shouldValidateCSRF(method) {
  return !SAFE_METHODS.includes(method?.toUpperCase());
}
