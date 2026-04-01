"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AppLoginContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        // Detect Android
        const ua = navigator.userAgent.toLowerCase();
        setIsAndroid(ua.indexOf("android") > -1);

        // Auto-redirect via Intent if on Android
        if (token && ua.indexOf("android") > -1) {
            // Use Intent URI to force open app
            // Format: intent://<host>/<path>#Intent;scheme=<scheme>;package=<package>;end
            // Here we stick to the https scheme that the app handles
            const intentUrl = `intent://consistencygrid.com/app-login?token=${token}#Intent;scheme=https;package=com.consistencygridwallpaper;end`;
            window.location.href = intentUrl;
        }
    }, [token]);

    return (
        <div style={styles.container}>
            <h1>Opening Consistency Grid...</h1>
            <p>If the app doesn't open automatically, tap the button below.</p>

            {token && (
                <a
                    href={`intent://consistencygrid.com/app-login?token=${token}#Intent;scheme=https;package=com.consistencygridwallpaper;end`}
                    style={styles.button}
                >
                    Open App
                </a>
            )}

            {!token && (
                <p style={{ color: 'red' }}>Error: No login token found.</p>
            )}
        </div>
    );
}

export default function AppLoginPage() {
    return (
        <Suspense fallback={<div style={styles.container}>Loading...</div>}>
            <AppLoginContent />
        </Suspense>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center',
        background: '#fff',
    },
    button: {
        marginTop: '20px',
        padding: '12px 24px',
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
    }
};
