'use client';

import { useEffect } from 'react';
import { initializePWA } from '@/lib/pwa';

/**
 * PWA Initializer Component
 * Registers service worker and initializes PWA features
 * Should be included in the root layout
 */
export default function PWAInitializer() {
  useEffect(() => {
    // Initialize PWA on mount
    initializePWA().catch(error => {
      console.error('Failed to initialize PWA:', error);
    });
  }, []);

  return null;
}
