"use client";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";

export default function DashboardLayout({ children, active = "Dashboard" }) {
    useEffect(() => {
        // 1. Initialize Android background updates if bridge is available
        if (typeof window !== "undefined" && window.Android) {
            try {
                // Always ensure auto-update is ON in the native app when on dashboard
                if (window.Android.setAutoUpdateEnabled) {
                    window.Android.setAutoUpdateEnabled(true);
                    console.log("📱 Android Auto-Update enabled");
                }

                // 2. Automated Token Sync (Security & Persistence)
                // We fetch fresh data to get the latest publicToken for the native app
                const syncBridge = async () => {
                    try {
                        const res = await fetch("/api/settings/me");
                        if (res.ok) {
                            const data = await res.json();
                            const token = data.user?.publicToken;

                            if (token && window.Android.saveWallpaperUrl) {
                                const wallpaperUrl = `${window.location.origin}/w/${token}/image.png`;
                                console.log("📱 Auto-Syncing token to Android Bridge:", token);
                                window.Android.saveWallpaperUrl(wallpaperUrl);

                                // Also save token individually if supported
                                if (window.Android.saveToken) {
                                    window.Android.saveToken(token);
                                }

                                // 🛡️ SAVE FOR WEBVIEW RECOVERY
                                localStorage.setItem('cg_recovery_token', token);
                                localStorage.setItem('cg_session_active', 'true');
                            }
                        }
                    } catch (err) {
                        console.error("📱 Bridge sync fetch failed:", err);
                    }
                };

                syncBridge();
            } catch (error) {
                console.error("📱 Android bridge interaction error:", error);
            }
        }
    }, []);

    return (
        <main className="flex min-h-screen bg-[#fffaf1]">
            {/* 
                Toast Notification System
                Displays success/error messages in bottom-right corner
            */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#ffffff',
                        color: '#1f2937',
                        fontSize: '14px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#f97316',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />

            {/* 
                Desktop Sidebar Navigation
                Always visible on large screens
            */}
            <div className="hidden lg:flex lg:flex-col lg:flex-shrink-0 z-40 w-[240px] sticky top-0 h-screen">
                <Sidebar active={active} />
            </div>

            {/* 
                Main Content Area
                Flexible column layout that grows to fill available space
            */}
            <section className="flex-1 flex flex-col min-w-0 max-w-full">
                {/* 
                    Mobile Header Bar
                    Sticky top bar with Logo
                */}
                <div className="flex items-center justify-center bg-[#fffaf1] px-4 py-3 border-b border-gray-200/50 lg:hidden sticky top-0 z-30 shadow-sm backdrop-blur-sm bg-opacity-95">
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/logo.png"
                            alt="ConsistencyGrid Logo"
                            className="h-7 w-7"
                        />
                        <span className="text-base font-bold text-gray-900 tracking-tight">
                            ConsistencyGrid
                        </span>
                    </div>
                </div>

                {/* 
                    Page Content Area
                */}
                <div className="flex-1 overflow-x-hidden">
                    <div className="mx-auto w-full max-w-7xl p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                        {children}
                    </div>
                </div>
            </section>

            {/* 
                Mobile Bottom Navigation
            */}
            <BottomNav active={active} />
        </main>
    );
}
