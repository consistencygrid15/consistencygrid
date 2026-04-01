/**
 * Service Worker Kill Switch
 *
 * This SW immediately unregisters itself and clears all caches.
 * It exists purely to clean up the previously registered SW that was
 * caching stale JS chunks and causing ChunkLoadError after Netlify deploys.
 *
 * Once this runs on a user's device, no SW will be active ever again.
 */

self.addEventListener('install', () => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  console.log('[SW Kill Switch] Activated — clearing all caches and unregistering...');

  try {
    // 1. Delete ALL cache storage entries
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map(key => {
      console.log('[SW Kill Switch] Deleting cache:', key);
      return caches.delete(key);
    }));

    // 2. Unregister this service worker itself
    await self.registration.unregister();

    console.log('[SW Kill Switch] Done. All caches cleared, SW unregistered.');

    // 3. Tell all open browser tabs to reload with fresh content from network
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      console.log('[SW Kill Switch] Reloading client:', client.url);
      client.navigate(client.url);
    });
  } catch (err) {
    console.error('[SW Kill Switch] Error during cleanup:', err);
  }
});
