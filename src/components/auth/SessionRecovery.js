'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Session Recovery Component
 * Automatically restores user session using stored publicToken if cookies are lost
 * 
 * Flow:
 * 1. Check if user is authenticated via NextAuth session
 * 2. If not authenticated, check localStorage for stored token
 * 3. If token exists, attempt auto-login using token-login provider
 * 4. If successful, redirect to dashboard
 * 5. If failed, clear invalid token
 * 
 * Security:
 * - Only runs when user is unauthenticated
 * - Token is validated server-side via existing token-login provider
 * - Invalid tokens are immediately cleared
 * - Runs only once per session to prevent loops
 */
export default function SessionRecovery({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveryAttempted, setRecoveryAttempted] = useState(false);

    useEffect(() => {
        async function attemptRecovery() {
            // Skip recovery if:
            // - Already authenticated
            // - Currently loading session
            // - Already attempted recovery
            // - Currently recovering
            // - On login/signup pages (user explicitly navigating to auth)
            if (
                status === 'authenticated' ||
                status === 'loading' ||
                recoveryAttempted ||
                isRecovering ||
                pathname === '/login' ||
                pathname === '/signup'
            ) {
                return;
            }

            // Only attempt recovery if unauthenticated
            if (status === 'unauthenticated') {
                const storedToken = localStorage.getItem('cg_auth_token');

                if (storedToken) {
                    setIsRecovering(true);
                    setRecoveryAttempted(true);

                    try {
                        // Attempt auto-login with stored token
                        const result = await signIn('token-login', {
                            token: storedToken,
                            redirect: false,
                        });

                        if (result?.ok) {
                            // Recovery successful - redirect to dashboard
                            router.push('/dashboard');
                        } else {
                            // Token invalid or expired - clear it
                            console.warn('Session recovery failed: Invalid token');
                            localStorage.removeItem('cg_auth_token');
                        }
                    } catch (error) {
                        console.error('Session recovery error:', error);
                        // Clear invalid token
                        localStorage.removeItem('cg_auth_token');
                    } finally {
                        setIsRecovering(false);
                    }
                } else {
                    // No token to recover from
                    setRecoveryAttempted(true);
                }
            }
        }

        attemptRecovery();
    }, [status, router, pathname, isRecovering, recoveryAttempted]);

    // Show loading state during recovery
    if (isRecovering) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fffaf1]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Restoring your session...</p>
                </div>
            </div>
        );
    }

    return children;
}
