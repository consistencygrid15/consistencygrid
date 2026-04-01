"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import { isAndroidApp } from "@/lib/platform-utils";

/**
 * LoginForm
 * --------------------------------------------------
 * SAFE responsibilities:
 * - Credentials login
 * - Google OAuth trigger
 * - UI + UX
 *
 * NOT handled here:
 * - Token auto-login
 * - Deep links
 * - Android return logic
 *
 * Those are handled ONLY in /mobile-auth-callback
 */
export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const tokenLoginAttempted = useRef(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    /* --------------------------------------------
     * Token Auto-Login (Android Deep Link Handoff)
     * ------------------------------------------ */
    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) return;

        // Wait for NextAuth to resolve session first
        if (status === "loading") return;

        // If user is already logged in, just go to dashboard
        if (status === "authenticated") {
            router.replace("/dashboard");
            return;
        }

        if (tokenLoginAttempted.current) return;
        tokenLoginAttempted.current = true;

        setLoading(true);

        signIn("token-login", { token, redirect: false })
            .then((result) => {
                if (result?.error) {
                    console.error("[token-login] Failed:", result.error);
                    toast.error("Auto login failed. Please log in again.");
                    router.replace("/login");
                    return;
                }

                toast.success("Welcome back!");
                router.replace("/dashboard");
            })
            .catch((err) => {
                console.error("[token-login] Error:", err);
                toast.error("Auto login failed. Please log in again.");
                router.replace("/login");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [searchParams, router, status]);

    /* --------------------------------------------
     * Credentials Login
     * ------------------------------------------ */
    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Invalid email or password");
            }

            // Store public token for WebView recovery (SAFE)
            await storeAuthToken();

            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (err) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    /* --------------------------------------------
     * Google OAuth Trigger
     * ------------------------------------------ */
    function handleGoogleSignIn() {
        const isAndroid = isAndroidApp();

        signIn("google", {
            callbackUrl: isAndroid
                ? "/mobile-auth-callback?source=app"
                : "/dashboard",
        });
    }

    /* --------------------------------------------
     * Token storage (used ONLY after credentials login)
     * ------------------------------------------ */
    async function storeAuthToken() {
        try {
            const res = await fetch("/api/auth/get-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) return;

            const data = await res.json();
            if (data?.success && data?.data?.publicToken) {
                localStorage.setItem("cg_auth_token", data.data.publicToken);
            }
        } catch (err) {
            // Silent fail – optional enhancement
            console.error("Token storage failed:", err);
        }
    }

    /* --------------------------------------------
     * UI
     * ------------------------------------------ */
    return (
        <main className="min-h-screen bg-[#fffaf1] px-4 sm:px-6">
            <Toaster position="bottom-right" />
            <Navbar rightLinkText="Sign up" rightLinkHref="/signup" />

            <section className="mx-auto mt-8 sm:mt-10 max-w-md w-full">
                <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-100">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Your grid is saved. Your progress is waiting.
                    </p>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-60"
                    >
                        <span className="text-lg">G</span>
                        Continue with Google
                    </button>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-500">or</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Credentials Login */}
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>

                        <Link
                            href="/forgot-password"
                            className="block text-center text-sm font-medium text-orange-500 hover:underline"
                        >
                            Forgot your password?
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {loading ? "Logging in…" : "Log in →"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold text-orange-500 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
