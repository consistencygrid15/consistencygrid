"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, HelpCircle, LifeBuoy } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import WallpaperPreference from "@/components/settings/WallpaperPreference";
import ExportDataNew from "@/components/settings/ExportDataNew";
import ConsentManagement from "@/components/settings/ConsentManagement";
import AccountDeletionComponent from "@/components/settings/AccountDeletionComponent";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await fetch("/api/settings/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Failed to load user:", err);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    if (loading) {
        return (
            <DashboardLayout active="Settings">
                <div className="py-2">
                    <SettingsSkeleton />
                </div>
            </DashboardLayout>
        );
    }

    const handleLogout = async () => {
        // Clear all auth-related localStorage items
        localStorage.removeItem('cg_auth_token');
        localStorage.removeItem('cg_session_active');
        localStorage.removeItem('cg_last_recovery_attempt');

        // Clear Android WebView token if available
        if (typeof window !== "undefined" && window.Android && window.Android.clearToken) {
            window.Android.clearToken();
        }

        await signOut({ callbackUrl: "/" });
    };

    const tabs = [
        { id: "profile", label: "Profile" },
        { id: "preferences", label: "Preferences" },
        { id: "notifications", label: "Notifications" },
        { id: "privacy", label: "Privacy & Data" },
    ];

    return (
        <DashboardLayout active="Settings">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900">Profile</h2>
                            <p className="text-sm text-gray-500">
                                Your personal information
                            </p>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={loading ? "Loading..." : user?.name || ""}
                                        disabled
                                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={loading ? "Loading..." : user?.email || ""}
                                        disabled
                                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        Public Token
                                    </label>
                                    <input
                                        type="text"
                                        value={loading ? "Loading..." : user?.publicToken || ""}
                                        disabled
                                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono outline-none"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Used for your public wallpaper URL
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Account Actions */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900">Account Actions</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Manage your session and support
                            </p>

                            <div className="space-y-3">
                                <Link href="/help" className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <HelpCircle className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Help & Support</p>
                                            <p className="text-xs text-gray-500">Get guidance on using the app</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-between w-full p-4 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-colors group text-red-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                                            <LogOut className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold">Sign Out</p>
                                            <p className="text-xs text-red-500/80">Log out of your account on this device</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Wallpaper Preferences
                            </h2>
                            <p className="text-sm text-gray-500">
                                Default settings for wallpaper generation
                            </p>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-700">
                                        Default Resolution
                                    </label>
                                    <select className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500">
                                        <option>1080 x 2400 (Phone)</option>
                                        <option>1920 x 1080 (Desktop)</option>
                                        <option>2560 x 1440 (2K)</option>
                                        <option>3840 x 2160 (4K)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700">Theme</label>
                                    <select className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500">
                                        <option>Dark Minimal</option>
                                        <option>Light Clean</option>
                                        <option>Colorful</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button variant="primary">Save Preferences</Button>
                            </div>
                        </Card>

                        <WallpaperPreference />
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                        <p className="text-sm text-gray-500">
                            Manage how you receive updates
                        </p>

                        <div className="mt-6 space-y-3">
                            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                <div>
                                    <p className="font-semibold text-gray-900">Daily Reminders</p>
                                    <p className="text-xs text-gray-500">
                                        Get reminded to check your habits
                                    </p>
                                </div>
                                <input type="checkbox" className="h-5 w-5" />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                <div>
                                    <p className="font-semibold text-gray-900">Weekly Summary</p>
                                    <p className="text-xs text-gray-500">
                                        Receive weekly progress reports
                                    </p>
                                </div>
                                <input type="checkbox" className="h-5 w-5" />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                <div>
                                    <p className="font-semibold text-gray-900">Streak Alerts</p>
                                    <p className="text-xs text-gray-500">
                                        Get notified about streak milestones
                                    </p>
                                </div>
                                <input type="checkbox" className="h-5 w-5" />
                            </label>
                        </div>
                    </Card>
                )}

                {/* Privacy & Data Tab */}
                {activeTab === "privacy" && (
                    <div className="space-y-6">
                        <ConsentManagement />
                        <ExportDataNew />
                        <AccountDeletionComponent />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
