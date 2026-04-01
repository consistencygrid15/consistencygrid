import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/auth/webview-login?token=<publicToken>
 *
 * Android WebView entry point. The native app loads this URL immediately
 * after native Google Sign-In returns a publicToken.
 *
 * How auth works after this:
 *  - We set a `publicToken` cookie (httpOnly) → read by getUniversalSession()
 *    on every API route (habits, goals, streaks, settings/me, etc.)
 *  - We set a `native_auth=true` cookie (readable by JS) → read by middleware
 *    to bypass the NextAuth session check on protected routes
 *  - We do NOT create a synthetic NextAuth JWT — that was causing React to
 *    crash because SessionProvider tried to verify it and the salt mismatched.
 *
 * Flow:
 *  New user  (onboarded=false) → redirect /onboarding
 *  Returning user (onboarded) → redirect /dashboard (or explicit callbackUrl)
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        // callbackUrl lets the onboarding page re-run this route after completion
        // to refresh cookies, then land directly on /dashboard.
        const callbackUrl = searchParams.get('callbackUrl');

        if (!token) {
            return NextResponse.redirect(new URL('/login?error=MissingToken', request.url));
        }

        // 1. Validate the token against the database
        const user = await prisma.user.findFirst({
            where: { publicToken: token },
            select: {
                id: true,
                onboarded: true,
                publicToken: true,
            },
        });

        if (!user) {
            return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
        }

        // 2. Decide where to send the user
        const destination = callbackUrl
            ? callbackUrl
            : user.onboarded
                ? '/dashboard'
                : '/onboarding';

        // Fix for Android WebView cookie race condition:
        // HTTP 302 redirects drop Set-Cookie headers on Android WebView.
        // Meta-refresh (immediate) fires before CookieManager persists cookies.
        //
        // Solution: Return HTTP 200 with JS that waits 800ms before navigating.
        // This gives Android's CookieManager time to flush cookies to disk.
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Logging in...</title>
    <meta charset="utf-8">
    <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center;
               min-height: 100vh; background: #fffaf1; font-family: sans-serif; }
        .msg { text-align: center; color: #666; }
        .spinner { width: 36px; height: 36px; border: 4px solid #fde68a;
                   border-top-color: #f97316; border-radius: 50%;
                   animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="msg">
        <div class="spinner"></div>
        <p>Signing you in…</p>
    </div>
    <script>
        // Wait 800ms so Android CookieManager can flush the Set-Cookie headers
        // from this response before we navigate away. Without this delay the
        // publicToken / native_auth cookies are dropped and the dashboard
        // falls through to /onboarding or /login.
        setTimeout(function() {
            window.location.replace(${JSON.stringify(destination)});
        }, 800);
    </script>
</body>
</html>`;

        const response = new NextResponse(htmlContent, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });

        const isProduction = process.env.NODE_ENV === 'production';
        const THIRTY_DAYS = 30 * 24 * 60 * 60;

        // 3. publicToken cookie — read by getUniversalSession() on every API route.
        //    httpOnly keeps it out of JS but still sent with every same-origin request.
        response.cookies.set('publicToken', token, {
            httpOnly: true,
            secure: true, // Must be true for SameSite='none' (Required for WebView cross-origin requests)
            sameSite: 'none', 
            path: '/',
            maxAge: THIRTY_DAYS,
        });

        // 4. native_auth cookie — non-httpOnly so the Android bridge can read it,
        //    and the middleware uses it to bypass the NextAuth session requirement.
        response.cookies.set('native_auth', 'true', {
            httpOnly: false,
            secure: true, // Must be true for SameSite='none'
            sameSite: 'none',
            path: '/',
            maxAge: THIRTY_DAYS,
        });

        return response;

    } catch (error) {
        console.error('[WebView Login] Error:', error);
        return NextResponse.redirect(new URL('/login?error=ServerError', request.url));
    }
}
