"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import AppDownloadBanner from "@/components/dashboard/AppDownloadBanner";

export default function LandingPage() {
    const [isRecovering, setIsRecovering] = useState(false);

    // Initial check for potential session
    useEffect(() => {
        if (typeof window !== "undefined" && localStorage.getItem("cg_session_active") === "true") {
            setIsRecovering(true);
            // Limit recovery timeout - if it takes more than 5s, show landing anyway
            const timer = setTimeout(() => setIsRecovering(false), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (isRecovering) {
        return (
            <div className="min-h-screen bg-[#fffaf1] flex flex-col items-center justify-center p-4">
                <div className="text-center animate-fade-in">
                    <div className="flex justify-center mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500 shadow-lg animate-bounce flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">G</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Restoring your session</h2>
                    <p className="text-gray-500 text-sm">One moment while we prepare your grid...</p>
                    <div className="mt-8 flex justify-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#fffaf1] to-white">
            <Navbar rightLinkText="Log in" rightLinkHref="/login" />

            <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                    Your life in <span className="text-orange-500">weeks</span>
                    <br />
                    <span className="text-gray-700">as your wallpaper</span>
                </h1>

                <p className="mt-6 text-xl sm:text-2xl font-serif italic text-gray-500 animate-fade-in">
                    “You’ve already lived more weeks than you think.”
                </p>

                <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
                    Generate a personalized calendar wallpaper showing your life momentum.
                    Auto-updates daily so every morning reminds you to make today count.
                </p>

                <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center px-4">
                    <p className="text-xs sm:text-sm font-bold text-orange-600 uppercase tracking-widest mb-6 animate-pulse">
                        Every week you wait is already gone
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-800 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <Link
                            href="/signup"
                            className="w-full sm:w-auto inline-block text-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            Sign up free →
                        </Link>
                    </div>
                </div>

                <div className="mt-12 sm:mt-16 flex justify-center animate-fade-in">
                    <div className="relative">
                        <div className="h-[320px] w-[180px] sm:h-[400px] sm:w-[225px] rounded-[32px] sm:rounded-[40px] border-4 border-gray-300 bg-gradient-to-br from-gray-50 to-white shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent" />
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />
                            <div className="mt-12 mx-4 space-y-2">
                                <div className="h-2 bg-gray-200 rounded w-3/4" />
                                <div className="h-2 bg-gray-200 rounded w-1/2" />
                                <div className="grid grid-cols-7 gap-1 mt-4">
                                    {Array.from({ length: 28 }).map((_, i) => (
                                        <div
                                            key={i}
                                            style={{ animationDelay: `${i * 40}ms` }}
                                            className={`h-3 rounded transition-all duration-700 ${i < 10 ? "bg-orange-500 animate-pulse" : i < 20 ? "bg-orange-300" : "bg-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Consistency Engine</h3>
                        <p className="text-sm text-gray-600">
                            Build consistency with daily habits and visualize your momentum daily
                        </p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-Update</h3>
                        <p className="text-sm text-gray-600">
                            Your wallpaper updates automatically every day to show your current momentum
                        </p>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Fully Customizable</h3>
                        <p className="text-sm text-gray-600">
                            Choose themes, resolutions, and customize every element of your wallpaper
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-20">
                <div className="rounded-2xl bg-gradient-to-br from-white to-orange-50/30 p-8 sm:p-12 text-center shadow-lg ring-1 ring-orange-100">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Auto-Update Wallpaper
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
                        Get a unique URL that always shows today's momentum. Download our mobile app
                        to automatically update your wallpaper every morning.
                    </p>

                    <Link
                        href="/signup"
                        className="mt-8 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Create Your Calendar →
                    </Link>
                </div>
            </section>

            <footer className="border-t border-gray-200 bg-white py-12">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-orange-500" />
                                <span className="text-lg font-bold text-gray-900">ConsistencyGrid</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Make every week count. Visualize your life momentum with a beautiful calendar wallpaper.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/generator" className="hover:text-orange-500 transition-colors">Generator</Link></li>
                                <li><Link href="/habits" className="hover:text-orange-500 transition-colors">Habits</Link></li>
                                <li><Link href="/goals" className="hover:text-orange-500 transition-colors">Goals</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/help" className="hover:text-orange-500 transition-colors">Help Center</Link></li>
                                <li><Link href="/settings" className="hover:text-orange-500 transition-colors">Settings</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} ConsistencyGrid. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500 mt-2 sm:mt-0">
                            Make every week count
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating App Download Banner for Landing Page */}
            <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-fade-in transition-all duration-500 delay-1000 fill-mode-both shadow-2xl rounded-2xl">
                <AppDownloadBanner />
            </div>
        </main>
    );
}
