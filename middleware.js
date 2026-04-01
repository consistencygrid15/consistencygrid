import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/generator",
  "/habits",
  "/goals",
  "/reminders",
  "/streaks",
  "/calendar",
  "/settings",
  "/analytics",
];

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

/**
 * Web platform CSP — allows payment provider SDKs (Razorpay, Stripe)
 * for users making purchases through the website.
 */
const WEB_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.razorpay.com https://*.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https://*.razorpay.com https://*.stripe.com https://accounts.google.com;";

/**
 * Android app CSP — payment provider SDKs are NOT permitted.
 * This prevents Razorpay / Stripe scripts and iframes from loading
 * inside the Android WebView, ensuring compliance with Play Store policies.
 */
const ANDROID_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self';";

const isDev = process.env.NODE_ENV === "development";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 0. Provide CORS headers for API routes (critical for Mobile WebViews)
  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin') || '*';
    
    // Quick exit for preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
        },
      });
    }
  }

  // Detect Android Native App by the app-specific User-Agent identifier
  const userAgent = req.headers.get("user-agent") || "";
  const isNativeAndroid =
    userAgent.includes("ConsistencyGridApp") || req.cookies.has("native_auth");

  // Development-only logging (never leaks sensitive data in production)
  if (isDev) {
    console.log("[Middleware] Path:", pathname, "| Android:", isNativeAndroid);
  }

  // Securely get the NextAuth token — wrapped in try/catch
  // because a malformed cookie can cause getToken() to throw
  let token = null;

  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (isDev) {
      console.log(
        "[Middleware] JWT:",
        token ? "Valid Token" : "No Token Found"
      );
    }
  } catch (e) {
    if (isDev) {
      console.error("[Middleware] JWT Error:", e.message);
    }
    token = null;
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Android native app users: allow through to protected routes
  if (isNativeAndroid && isProtectedRoute) {
    return NextResponse.next();
  }

  // 2. Unauthenticated access to protected route → redirect to login
  if (!token && !isNativeAndroid && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Already logged in → redirect away from auth routes
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 4. Onboarding redirection if not completed
  if (
    token &&
    !token.onboarded &&
    isProtectedRoute &&
    pathname !== "/onboarding"
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 5. Security and CORS headers
  const response = NextResponse.next();

  // Attach CORS headers to API responses
  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin') || '*';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    return response; // Skip HTML security headers for API responses
  }

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Platform-aware CSP: Android gets a restricted policy that blocks
  // all payment provider scripts and iframes
  response.headers.set(
    "Content-Security-Policy",
    isNativeAndroid ? ANDROID_CSP : WEB_CSP
  );

  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(self), microphone=(), camera=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/generator/:path*",
    "/habits/:path*",
    "/goals/:path*",
    "/reminders/:path*",
    "/streaks/:path*",
    "/calendar/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/pricing/:path*",
    "/payment/:path*",
    "/login",
    "/onboarding",
  ],
};
