/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  reactCompiler: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false,
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Enable XSS protection
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // HSTS - Force HTTPS
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Referrer Policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions Policy
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://accounts.google.com https://www.google-analytics.com https://browser.sentry-cdn.com https://checkout.razorpay.com https://api.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://lh3.googleusercontent.com https://www.google-analytics.com https://cdn.razorpay.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://accounts.google.com https://www.google-analytics.com https://fonts.googleapis.com https://fonts.gstatic.com *.sentry.io https://lumberjack.razorpay.com https://lumberjack-cx.razorpay.com; frame-src 'self' https://accounts.google.com https://api.razorpay.com; object-src 'none'; worker-src 'self' blob:;"
          },
        ],
      },
      // ❌ DO NOT cache HTML pages — always revalidate to get fresh chunk URLs after redeploy
      // This is the fix for ChunkLoadError: old HTML cached with deleted chunk filenames
      // NOTE: /api/ routes are explicitly excluded so per-route Cache-Control headers are respected
      {
        source: "/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|w/|api/).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      // ✅ Cache Next.js static ASSETS (JS/CSS chunks) aggressively — they have content hashes
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // NO CACHE for wallpaper images - Always serve fresh data
      {
        source: "/w/:token/image.png",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },

  // CORS Configuration
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Performance Optimizations
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // 🔥 CRITICAL: Ensure font files are included in the serverless function bundle
  outputFileTracingIncludes: {
    '/w/[token]/image.png': ['./src/fonts/**/*'],
  },

  // Turbopack Configuration (Next.js 16 default bundler)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
};

// Wrap with Sentry
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "",
  project: process.env.SENTRY_PROJECT || "",
  authToken: process.env.SENTRY_AUTH_TOKEN || "",

  // An auth token is required for uploading source maps.
  silent: true,
});
