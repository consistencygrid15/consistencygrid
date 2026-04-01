/**
 * Performance Optimization Utilities
 * Monitors, tracks, and optimizes app performance
 */

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals metrics for performance analysis
 */
export class WebVitalsMonitor {
  constructor() {
    this.metrics = {
      lcp: null,    // Largest Contentful Paint
      fid: null,    // First Input Delay
      cls: null,    // Cumulative Layout Shift
      fcp: null,    // First Contentful Paint
      ttfb: null,   // Time to First Byte
    };
  }

  /**
   * Initialize Web Vitals monitoring
   */
  async init() {
    if (typeof window === 'undefined') return;

    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

      // Largest Contentful Paint
      getLCP(metric => {
        this.metrics.lcp = metric.value;
        this.reportMetric('LCP', metric);
      });

      // First Input Delay
      getFID(metric => {
        this.metrics.fid = metric.value;
        this.reportMetric('FID', metric);
      });

      // Cumulative Layout Shift
      getCLS(metric => {
        this.metrics.cls = metric.value;
        this.reportMetric('CLS', metric);
      });

      // First Contentful Paint
      getFCP(metric => {
        this.metrics.fcp = metric.value;
        this.reportMetric('FCP', metric);
      });

      // Time to First Byte
      getTTFB(metric => {
        this.metrics.ttfb = metric.value;
        this.reportMetric('TTFB', metric);
      });
    } catch (error) {
      console.error('Error initializing Web Vitals:', error);
    }
  }

  /**
   * Report metric to analytics
   */
  reportMetric(name, metric) {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        performance_metric: name,
        value: metric.value,
        rating: metric.rating,
      });
    }

    console.log(`[Performance] ${name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Check if metrics meet good thresholds
   */
  isOptimal() {
    return (
      this.metrics.lcp <= 2500 &&
      this.metrics.fid <= 100 &&
      this.metrics.cls <= 0.1 &&
      this.metrics.fcp <= 1800 &&
      this.metrics.ttfb <= 600
    );
  }
}

/**
 * Performance Timing Utility
 * Measures operation duration
 */
export class PerformanceTimer {
  constructor(name) {
    this.name = name;
    this.startTime = performance.now();
  }

  /**
   * End timer and log duration
   */
  end() {
    const duration = performance.now() - this.startTime;
    console.log(`[Timer] ${this.name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * End timer and return duration
   */
  getDuration() {
    return performance.now() - this.startTime;
  }
}

/**
 * Request Debounce Helper
 * Prevents excessive API calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Request Throttle Helper
 * Limits API calls to once per interval
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memory Usage Monitor
 */
export class MemoryMonitor {
  static getMemoryUsage() {
    if (typeof window === 'undefined' || !performance.memory) {
      return null;
    }

    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2),
    };
  }

  static logMemoryUsage() {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log(`[Memory] Usage: ${memory.usage}% (${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB / ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB)`);
    }
  }
}

/**
 * Network Information Monitor
 */
export class NetworkMonitor {
  static getNetworkType() {
    if (typeof navigator === 'undefined') return null;

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      return {
        type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }

    return null;
  }

  static isSlow() {
    const network = this.getNetworkType();
    if (!network) return false;
    return network.type === '4g' ? network.downlink < 1 : network.type !== '4g';
  }
}

/**
 * Resource Loading Optimizer
 */
export class ResourceOptimizer {
  /**
   * Preload critical resources
   */
  static preloadResource(href, as = 'script', crossorigin = false) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Prefetch resources
   */
  static prefetchResource(href) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * DNS Prefetch
   */
  static dnsPrefetch(domain) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  }

  /**
   * Preconnect to domain
   */
  static preconnect(domain) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  }
}

/**
 * Local Storage Cache
 */
export class LocalCache {
  /**
   * Set cached value with expiration
   */
  static set(key, value, expirationMinutes = 60) {
    if (typeof localStorage === 'undefined') return;

    const expiration = Date.now() + expirationMinutes * 60 * 1000;
    localStorage.setItem(key, JSON.stringify({
      value,
      expiration,
    }));
  }

  /**
   * Get cached value if not expired
   */
  static get(key) {
    if (typeof localStorage === 'undefined') return null;

    const item = localStorage.getItem(key);
    if (!item) return null;

    const { value, expiration } = JSON.parse(item);

    if (Date.now() > expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return value;
  }

  /**
   * Remove cached value
   */
  static remove(key) {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  }

  /**
   * Clear all cache
   */
  static clear() {
    if (typeof localStorage === 'undefined') return;
    localStorage.clear();
  }
}

/**
 * IndexedDB Cache for larger data
 */
export class IndexedDBCache {
  static dbName = 'PerformanceCache';
  static storeName = 'cache';
  static db = null;

  /**
   * Initialize IndexedDB
   */
  static async init() {
    if (typeof indexedDB === 'undefined') return false;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Set value in IndexedDB
   */
  static async set(key, value, expirationHours = 24) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const data = {
        key,
        value,
        expiration: Date.now() + expirationHours * 60 * 60 * 1000,
      };

      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  /**
   * Get value from IndexedDB
   */
  static async get(key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          resolve(null);
          return;
        }

        if (Date.now() > result.expiration) {
          this.remove(key);
          resolve(null);
          return;
        }

        resolve(result.value);
      };
    });
  }

  /**
   * Remove value from IndexedDB
   */
  static async remove(key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }
}

/**
 * Image Lazy Loading Helper
 */
export class LazyImageLoader {
  static observer = null;

  /**
   * Initialize Intersection Observer for lazy loading
   */
  static init() {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            this.observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  /**
   * Observe image for lazy loading
   */
  static observe(element) {
    if (!this.observer) this.init();
    this.observer?.observe(element);
  }

  /**
   * Stop observing element
   */
  static unobserve(element) {
    this.observer?.unobserve(element);
  }

  /**
   * Disconnect observer
   */
  static disconnect() {
    this.observer?.disconnect();
    this.observer = null;
  }
}

/**
 * Component Render Counter
 * Helps identify unnecessary re-renders
 */
export function useRenderCount(componentName) {
  // Hook intentionally left empty to avoid React Compiler errors on ref access.
  // Add React import and use local variables if actual tracking needed.
}

/**
 * Request Batching Utility
 * Combines multiple requests into one
 */
export class RequestBatcher {
  constructor(batchFn, batchDelay = 100) {
    this.batchFn = batchFn;
    this.batchDelay = batchDelay;
    this.queue = [];
    this.timeoutId = null;
  }

  add(item) {
    this.queue.push(item);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue;
    this.queue = [];
    this.timeoutId = null;

    try {
      await this.batchFn(batch);
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }
}

const performanceUtils = {
  WebVitalsMonitor,
  PerformanceTimer,
  debounce,
  throttle,
  MemoryMonitor,
  NetworkMonitor,
  ResourceOptimizer,
  LocalCache,
  IndexedDBCache,
  LazyImageLoader,
  RequestBatcher,
};

export default performanceUtils;
