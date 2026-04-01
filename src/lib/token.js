import crypto from 'crypto';

/**
 * Generate a unique public token for mobile authentication
 * 
 * @returns {string} A unique token prefixed with 'pub_'
 * 
 * Security:
 * - Uses crypto.randomBytes() for cryptographically secure random generation
 * - 32 bytes = 256 bits of entropy
 * - Collision probability: negligible (2^256 possibilities)
 */
export function generatePublicToken() {
  const randomBytes = crypto.randomBytes(32);
  const token = `pub_${randomBytes.toString('hex')}`;
  return token;
}
