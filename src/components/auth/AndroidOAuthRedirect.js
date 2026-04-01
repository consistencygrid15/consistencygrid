"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * AndroidOAuthRedirect - Handles deep link redirect for Android app after Google OAuth
 * 
 * This component runs on the dashboard after a successful Google login.
 * If the user is coming from the Android app, it automatically redirects them
 * back to the app with their authentication token via deep link.
 */
export default function AndroidOAuthRedirect() {
    const { data: session, status } = useSession();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Only run once when authenticated
        if (status !== "authenticated" || hasRedirected.current) return;

        // Check if this is an Android app user
        const isAndroidApp =
            typeof window !== 'undefined' &&
            (window.consistencyGridPlatform === 'android' ||
                navigator.userAgent.includes('ConsistencyGridApp'));

        // Check if this is a fresh OAuth login (has the callback URL parameter)
        const urlParams = new URLSearchParams(window.location.search);
        const isOAuthCallback = urlParams.has('from_oauth') || document.referrer.includes('accounts.google.com');

        if (isAndroidApp && isOAuthCallback && session?.user?.publicToken) {
            hasRedirected.current = true;

            const token = session.user.publicToken;
            const deepLink = `consistencygrid://login-success?token=${token}`;

            console.log("🚀 Android OAuth detected - Redirecting to app:", deepLink);

            // Redirect to the app
            window.location.href = deepLink;
        }
    }, [session, status]);

    // This component doesn't render anything
    return null;
}
