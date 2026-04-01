'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * SessionPersistence Component
 * 
 * Handles client-side session recovery and persistence flags.
 * This is crucial for Android WebViews where cookies might not be
 * as reliable as standard browsers.
 */
export default function SessionPersistence() {
    const { status, data: session } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Logic for logged-in users: Save the recovery data
        if (status === 'authenticated' && session?.user) {
            if (localStorage.getItem('cg_session_active') !== 'true') {
                console.log('🛡️ Session authenticated, setting persistence flags');
                localStorage.setItem('cg_session_active', 'true');
            }

            // Sync publicToken from API if not already stored
            const syncToken = async () => {
                if (!localStorage.getItem('cg_auth_token')) {
                    try {
                        const res = await fetch('/api/auth/get-token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                        });

                        if (res.ok) {
                            const data = await res.json();
                            if (data.success && data.data?.publicToken) {
                                localStorage.setItem('cg_auth_token', data.data.publicToken);
                            }
                        }
                    } catch (e) {
                        console.error('Token sync error:', e);
                    }
                }
            };
            syncToken();
        }

        // 2. When user is unauthenticated: Attempt recovery
        const isLandingOrLogin = pathname === '/' || pathname === '/login';
        const hasActiveFlag = localStorage.getItem('cg_session_active') === 'true';
        const recoveryToken = localStorage.getItem('cg_auth_token');

        if (isLandingOrLogin && hasActiveFlag && status === 'unauthenticated' && recoveryToken) {
            // Prevent infinite loops - only try once per minute
            const now = Date.now();
            const lastAttempt = parseInt(localStorage.getItem('cg_last_recovery_attempt') || '0');

            if (now - lastAttempt > 60000) {
                localStorage.setItem('cg_last_recovery_attempt', now.toString());

                // Attempt auto-login with stored token
                signIn('token-login', {
                    token: recoveryToken,
                    callbackUrl: '/dashboard',
                    redirect: true
                }).then(result => {
                    if (result?.error) {
                        console.error('Auto-recovery failed:', result.error);
                        // Clear invalid token and session flag
                        localStorage.removeItem('cg_auth_token');
                        localStorage.removeItem('cg_session_active');
                    }
                });
            }
        }
    }, [status, session, pathname]);

    return null;
}
