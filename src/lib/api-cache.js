/**
 * Caching Middleware for API Routes
 * Implements HTTP caching headers and response caching
 */

/**
 * Set cache headers for responses
 */
export function setCacheHeaders(response, cacheType = 'short') {
  const cacheConfigs = {
    // 1 hour (user data, preferences)
    short: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'CDN-Cache-Control': 'max-age=3600',
    },
    // 1 day (static data, lists)
    medium: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'CDN-Cache-Control': 'max-age=86400',
    },
    // 1 week (very static data)
    long: {
      'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      'CDN-Cache-Control': 'max-age=604800',
    },
    // No cache (sensitive data)
    none: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // Immutable (hashed assets)
    immutable: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  };

  const config = cacheConfigs[cacheType] || cacheConfigs.short;

  Object.entries(config).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Create cached API response
 */
export async function getCachedResponse(
  cacheKey,
  fetchFn,
  cacheType = 'short',
  cacheDuration = 3600
) {
  // Try to get from cache
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  await storeInCache(cacheKey, data, cacheDuration);

  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });

  return setCacheHeaders(response, cacheType);
}

/**
 * In-memory cache store (simple implementation)
 */
const memoryCache = new Map();

async function getFromCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiration) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data;
}

async function storeInCache(key, data, duration) {
  memoryCache.set(key, {
    data,
    expiration: Date.now() + duration * 1000,
  });

  // Cleanup old entries (optional)
  if (memoryCache.size > 1000) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
}

/**
 * Clear cache
 */
export function clearCache(pattern) {
  if (pattern) {
    // Clear entries matching pattern
    Array.from(memoryCache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => memoryCache.delete(key));
  } else {
    // Clear all cache
    memoryCache.clear();
  }
}

/**
 * Cache invalidation helper
 */
export function invalidateCache(userId, dataType) {
  const patterns = {
    user: `user:${userId}`,
    goals: `goals:${userId}`,
    habits: `habits:${userId}`,
    dashboard: `dashboard:${userId}`,
    settings: `settings:${userId}`,
  };

  const pattern = patterns[dataType];
  if (pattern) {
    clearCache(pattern);
  }
}

/**
 * Response compression helper
 */
export function compressResponse(response, threshold = 1024) {
  const contentLength = response.headers.get('content-length');

  if (contentLength && parseInt(contentLength) > threshold) {
    response.headers.set('Content-Encoding', 'gzip');
  }

  return response;
}

/**
 * ETag generation for cache validation
 */
import crypto from 'crypto';

export function generateETag(data) {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Check If-None-Match header
 */
export function isETagValid(request, currentETag) {
  const clientETag = request.headers.get('if-none-match');
  return clientETag === currentETag;
}

/**
 * Return 304 Not Modified
 */
export function notModifiedResponse(etag) {
  return new Response(null, {
    status: 304,
    headers: {
      'ETag': etag,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

/**
 * API Cache Manager
 */
export class APICacheManager {
  static caches = {};

  static registerCache(name, duration = 3600) {
    this.caches[name] = { duration, entries: new Map() };
  }

  static async get(cacheName, key, fetchFn) {
    const cache = this.caches[cacheName];
    if (!cache) throw new Error(`Cache "${cacheName}" not registered`);

    const cached = cache.entries.get(key);
    if (cached && Date.now() < cached.expiration) {
      return cached.data;
    }

    const data = await fetchFn();
    cache.entries.set(key, {
      data,
      expiration: Date.now() + cache.duration * 1000,
    });

    return data;
  }

  static invalidate(cacheName, keyPattern) {
    const cache = this.caches[cacheName];
    if (!cache) return;

    Array.from(cache.entries.keys())
      .filter(key => key.includes(keyPattern))
      .forEach(key => cache.entries.delete(key));
  }

  static clear(cacheName) {
    if (this.caches[cacheName]) {
      this.caches[cacheName].entries.clear();
    }
  }
}

// Initialize common API caches
export function initializeAPICaches() {
  APICacheManager.registerCache('user-data', 1800); // 30 minutes
  APICacheManager.registerCache('dashboard', 300); // 5 minutes
  APICacheManager.registerCache('goals', 600); // 10 minutes
  APICacheManager.registerCache('habits', 600); // 10 minutes
  APICacheManager.registerCache('settings', 1800); // 30 minutes
}

export default {
  setCacheHeaders,
  getCachedResponse,
  clearCache,
  invalidateCache,
  compressResponse,
  generateETag,
  isETagValid,
  notModifiedResponse,
  APICacheManager,
  initializeAPICaches,
};
