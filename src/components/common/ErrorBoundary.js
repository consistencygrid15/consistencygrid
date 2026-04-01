"use client";

/**
 * ErrorBoundary — Shows the ACTUAL error so we can debug it.
 * This makes it easy to see exactly what is crashing.
 */
import { Component } from "react";
import Link from "next/link";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // ChunkLoadError = stale service worker cache — nuke and reload
    if (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to load chunk')
    ) {
      const nukeSwAndReload = async () => {
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
        } catch (e) { /* silent */ }
        window.location.reload(true);
      };
      nukeSwAndReload();
      return;
    }

    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.setState({ errorId });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      return (
        <div className="min-h-screen bg-[#fffaf1] flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We encountered an unexpected error. Our team has been notified.</p>

            {/* Error ID */}
            {errorId && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
                <p className="text-xs text-gray-500 font-mono">Error ID: {errorId}</p>
              </div>
            )}

            {/* ⚠️ ALWAYS show the real error message — helps debugging */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-700 mb-1">⚠️ Error: {error.message}</p>
                <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap break-all max-h-48">
                  {error.stack}
                </pre>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
              >
                Refresh Page
              </button>
              <Link
                href="/dashboard"
                className="block w-full rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
