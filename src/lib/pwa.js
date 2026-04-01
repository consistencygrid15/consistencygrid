/**
 * PWA Utilities
 * Handles service worker registration, sync, and PWA features
 */

let serviceWorkerRegistration = null;

/**
 * Register service worker for offline support
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // Always check for updates
    });

    serviceWorkerRegistration = registration;
    console.log('✓ Service worker registered successfully');

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every 60 seconds

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New service worker available - app update ready');
          // Notify user about update (optional)
          notifyUpdate();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker (for cleanup)
 */
export async function unregisterServiceWorker() {
  if (!serviceWorkerRegistration) return;

  try {
    await serviceWorkerRegistration.unregister();
    console.log('Service worker unregistered');
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
  }
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag) {
  if (!serviceWorkerRegistration?.sync) {
    console.log('Background sync not supported');
    return false;
  }

  try {
    await serviceWorkerRegistration.sync.register(tag);
    console.log(`Background sync registered for: ${tag}`);
    return true;
  } catch (error) {
    console.error(`Failed to register background sync for ${tag}:`, error);
    return false;
  }
}

/**
 * Get sync tags
 */
export async function getSyncTags() {
  if (!serviceWorkerRegistration?.sync) return [];

  try {
    return await serviceWorkerRegistration.sync.getTags();
  } catch (error) {
    console.error('Failed to get sync tags:', error);
    return [];
  }
}

/**
 * Request periodic background sync (if supported)
 */
export async function requestPeriodicSync(tag, minInterval = 24 * 60 * 60 * 1000) {
  if (!serviceWorkerRegistration?.periodicSync) {
    console.log('Periodic sync not supported');
    return false;
  }

  try {
    await serviceWorkerRegistration.periodicSync.register(tag, {
      minInterval,
    });
    console.log(`Periodic sync registered for: ${tag}`);
    return true;
  } catch (error) {
    console.error(`Failed to register periodic sync for ${tag}:`, error);
    return false;
  }
}

/**
 * Check if PWA is installed
 */
export function isPWAInstalled() {
  // Check if running as standalone PWA
  if (typeof window !== 'undefined') {
    return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  }
  return false;
}

/**
 * Check if online
 */
export function isOnline() {
  if (typeof window !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Listen for online/offline events
 */
export function onConnectionChange(callback) {
  if (typeof window === 'undefined') return () => { };

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Get available disk space (if supported)
 */
export async function getStorageSpace() {
  if (!navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage,
      total: estimate.quota,
      percentage: (estimate.usage / estimate.quota) * 100,
    };
  } catch (error) {
    console.error('Failed to get storage estimate:', error);
    return null;
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) {
    console.log('Persistent storage not supported');
    return false;
  }

  try {
    const persisted = await navigator.storage.persist();
    console.log(`Persistent storage ${persisted ? 'granted' : 'denied'}`);
    return persisted;
  } catch (error) {
    console.error('Failed to request persistent storage:', error);
    return false;
  }
}

/**
 * Clear app cache
 */
export async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('Cache cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

/**
 * Notify user about update
 */
function notifyUpdate() {
  if ('Notification' in window) {
    // Request permission if needed
    if (Notification.permission === 'granted') {
      new Notification('Consistency Grid Updated', {
        body: 'A new version is available. Please refresh to update.',
        icon: '/images/icon-192.png',
        tag: 'consistency-grid-update',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Consistency Grid Updated', {
            body: 'A new version is available. Please refresh to update.',
            icon: '/images/icon-192.png',
            tag: 'consistency-grid-update',
          });
        }
      });
    }
  }
}

/**
 * Initialize PWA on app load
 * 
 * NOTE: The service worker has been replaced with a kill-switch that
 * unregisters itself and clears all caches. This prevents ChunkLoadError
 * caused by stale cached JS chunks after Netlify redeployments.
 */
export async function initializePWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    // Register the kill-switch SW — it will immediately unregister itself
    // and clear all caches, then reload the page with fresh content.
    await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    console.log('✓ Kill-switch SW registered — old caches will be cleared');
  } catch (err) {
    console.warn('SW registration failed (non-critical):', err);
  }
}

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  requestBackgroundSync,
  getSyncTags,
  requestPeriodicSync,
  isPWAInstalled,
  isOnline,
  onConnectionChange,
  getStorageSpace,
  requestPersistentStorage,
  clearCache,
  initializePWA,
};
