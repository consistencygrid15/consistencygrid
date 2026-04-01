'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import {
  WebVitalsMonitor,
  MemoryMonitor,
  NetworkMonitor,
} from '@/lib/performance';

/**
 * Performance Monitoring Component
 * Displays real-time performance metrics
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [memory, setMemory] = useState(null);
  const [network, setNetwork] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    const monitor = new WebVitalsMonitor();
    monitor.init();

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
      setMemory(MemoryMonitor.getMemoryUsage());
      setNetwork(NetworkMonitor.getNetworkType());
    }, 5000);

    // Initial update
    setMetrics(monitor.getMetrics());
    setMemory(MemoryMonitor.getMemoryUsage());
    setNetwork(NetworkMonitor.getNetworkType());

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  // Check if performance is good
  const isOptimal =
    metrics.lcp <= 2500 &&
    metrics.fid <= 100 &&
    metrics.cls <= 0.1 &&
    metrics.fcp <= 1800 &&
    metrics.ttfb <= 600;

  const formatMetric = (value) => {
    if (!value) return 'N/A';
    return typeof value === 'number' ? `${value.toFixed(0)}ms` : value;
  };

  const getRating = (metric, thresholds) => {
    if (metric <= thresholds.good) return 'Good';
    if (metric <= thresholds.moderate) return 'Moderate';
    return 'Poor';
  };

  return (
    <>
      {/* Floating Performance Badge */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`fixed bottom-4 right-4 rounded-lg p-3 shadow-lg z-50 transition-all ${
            isOptimal
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
        >
          <Activity className="w-5 h-5" />
        </button>
      )}

      {/* Performance Panel */}
      {expanded && (
        <Card className="fixed bottom-20 right-4 w-96 max-h-96 overflow-y-auto z-50 bg-gray-900 text-white border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance Metrics
              </h3>
              <button
                onClick={() => setExpanded(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold text-gray-300">Core Web Vitals</h4>

              {/* LCP */}
              <div className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>Largest Contentful Paint (LCP)</span>
                  <span
                    className={
                      metrics.lcp && metrics.lcp <= 2500
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {formatMetric(metrics.lcp)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      metrics.lcp && metrics.lcp <= 2500
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metrics.lcp / 4000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-gray-400 mt-1">Target: ≤ 2500ms</div>
              </div>

              {/* FID */}
              <div className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>First Input Delay (FID)</span>
                  <span
                    className={
                      metrics.fid && metrics.fid <= 100
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {formatMetric(metrics.fid)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      metrics.fid && metrics.fid <= 100
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metrics.fid / 300) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-gray-400 mt-1">Target: ≤ 100ms</div>
              </div>

              {/* CLS */}
              <div className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>Cumulative Layout Shift (CLS)</span>
                  <span
                    className={
                      metrics.cls && metrics.cls <= 0.1
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      metrics.cls && metrics.cls <= 0.1
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metrics.cls / 0.25) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-gray-400 mt-1">Target: ≤ 0.1</div>
              </div>

              {/* FCP */}
              <div className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>First Contentful Paint (FCP)</span>
                  <span
                    className={
                      metrics.fcp && metrics.fcp <= 1800
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {formatMetric(metrics.fcp)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      metrics.fcp && metrics.fcp <= 1800
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metrics.fcp / 3000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-gray-400 mt-1">Target: ≤ 1800ms</div>
              </div>

              {/* TTFB */}
              <div className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>Time to First Byte (TTFB)</span>
                  <span
                    className={
                      metrics.ttfb && metrics.ttfb <= 600
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {formatMetric(metrics.ttfb)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      metrics.ttfb && metrics.ttfb <= 600
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metrics.ttfb / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-gray-400 mt-1">Target: ≤ 600ms</div>
              </div>
            </div>

            {/* Memory Usage */}
            {memory && (
              <div className="space-y-2 mb-4 pb-4 border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300">Memory</h4>
                <div className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Heap Usage</span>
                    <span>{memory.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        memory.usage > 80 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${memory.usage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Network */}
            {network && (
              <div className="space-y-2 pb-4 border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300">Network</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-gray-400">{network.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downlink:</span>
                    <span className="text-gray-400">
                      {network.downlink ? `${network.downlink} Mbps` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span className="text-gray-400">
                      {network.rtt ? `${network.rtt}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="text-xs flex items-center gap-2 pt-4 border-t border-gray-700">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOptimal ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span>
                {isOptimal ? 'Performance looks good!' : 'Some metrics need improvement'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
