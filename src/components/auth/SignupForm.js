"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";

export default function SignupForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    async function handleSignup(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                // Backend returns { success: false, error: { message: "...", details: { errors: [] } } }
                if (data.error?.details?.errors && Array.isArray(data.error.details.errors)) {
                    data.error.details.errors.forEach(err => toast.error(err));
                    return; // Stop here as we've shown the specific errors
                }
                throw new Error(data.error?.message || data.message || "Signup failed");
            }



            toast.success("Account created! Starting onboarding...");

            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            router.push("/onboarding");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleSignUp = () => {
        // Detect if running in Android app
        const isAndroidApp =
            typeof window !== 'undefined' &&
            (window.consistencyGridPlatform === 'android' ||
                navigator.userAgent.includes('ConsistencyGridApp') ||
                window.location.search.includes('platform=android'));

        if (isAndroidApp) {
            console.log("🤖 Android detected: Using mobile OAuth flow");
            // callbackUrl must point to the mobile-auth-callback page handler
            signIn("google", { callbackUrl: "/mobile-auth-callback?source=app" });
        } else {
            console.log("🌐 Web detected: Using standard OAuth flow");
            // Standard web signup goes to onboarding
            signIn("google", { callbackUrl: "/onboarding" });
        }
    };

    return (
        <main className="min-h-screen bg-[#fffaf1] px-4 sm:px-6">
            <Toaster position="bottom-right" />
            <Navbar rightLinkText="Log in" rightLinkHref="/login" />

            <section className="mx-auto mt-8 sm:mt-10 max-w-md w-full">
                <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-100">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Create account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Start building your auto-updating wallpaper.
                    </p>

                    <button
                        onClick={handleGoogleSignUp}
                        type="button"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <span className="text-lg">G</span>
                        Sign up with Google
                    </button>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-500">or</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <form className="space-y-4" onSubmit={handleSignup}>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                placeholder="Your name"
                                required
                                minLength={2}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                Must be 8+ characters with uppercase, lowercase, number, and special character.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "Sign up →"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
