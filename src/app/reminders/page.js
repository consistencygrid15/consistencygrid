/**
 * Reminders Page
 * 
 * Main page for managing the intelligent reminder system
 * Shows upcoming reminders, allows creation/editing, and provides
 * quick access to the grid view
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ReminderModal from "@/components/reminders/ReminderModal";
import ReminderList from "@/components/reminders/ReminderList";
import ReminderSkeleton from "@/components/skeletons/ReminderSkeleton";
import { sendWallpaperToAndroid } from "@/utils/sendWallpaperToAndroid";

export default function RemindersPage() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [filter, setFilter] = useState("upcoming"); // upcoming, past, all
    const [publicToken, setPublicToken] = useState("");

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/reminders");
            const data = await res.json();

            if (data.reminders) {
                setReminders(data.reminders);
            }

            // Get public token
            const settingsRes = await fetch("/api/settings/me");
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                if (settingsData?.user?.publicToken) {
                    setPublicToken(settingsData.user.publicToken);
                }
            }
        } catch (error) {
            console.error("Load reminders error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingReminder(null);
        setShowModal(true);
    };

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingReminder(null);
    };

    const handleSave = () => {
        loadReminders();

        // Trigger immediate wallpaper refresh (for web wallpaper renderer)
        // This ensures reminders show up immediately without waiting for midnight update
        if (typeof window !== 'undefined' && window.refreshWallpaper) {
            try {
                window.refreshWallpaper();
                console.log('✅ Wallpaper refresh triggered');
            } catch (error) {
                console.error('Failed to refresh wallpaper:', error);
            }
        }

        // Android Bridge: Trigger update for native app
        if (publicToken) {
            const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
            sendWallpaperToAndroid(wallpaperUrl);
        }
    };

    // Filter reminders
    const today = new Date().toISOString().split("T")[0];
    const filteredReminders = reminders.filter((reminder) => {
        const endDate = reminder.endDate.split("T")[0];

        if (filter === "upcoming") {
            return endDate >= today;
        } else if (filter === "past") {
            return endDate < today;
        }
        return true; // all
    });

    // Stats
    const upcomingCount = reminders.filter((r) => r.endDate.split("T")[0] >= today).length;
    const pastCount = reminders.filter((r) => r.endDate.split("T")[0] < today).length;
    const importantCount = reminders.filter((r) => r.isImportant && r.endDate.split("T")[0] >= today).length;

    return (
        <DashboardLayout active="Reminders">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Reminders
                            </h1>
                            <p className="text-gray-600">
                                Reminders that live on your timeline, not just notify you
                            </p>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/30 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Reminder
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Upcoming</p>
                                    <p className="text-3xl font-bold">{upcomingCount}</p>
                                </div>
                                <div className="text-4xl opacity-80">📅</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm mb-1">Important</p>
                                    <p className="text-3xl font-bold">{importantCount}</p>
                                </div>
                                <div className="text-4xl opacity-80">⭐</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-100 text-sm mb-1">Past</p>
                                    <p className="text-3xl font-bold">{pastCount}</p>
                                </div>
                                <div className="text-4xl opacity-80">🕐</div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                        <button
                            onClick={() => setFilter("upcoming")}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === "upcoming"
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Upcoming ({upcomingCount})
                        </button>
                        <button
                            onClick={() => setFilter("past")}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === "past"
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Past ({pastCount})
                        </button>
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === "all"
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            All ({reminders.length})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-2">
                        <ReminderSkeleton />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <ReminderList
                            reminders={filteredReminders}
                            onEdit={handleEdit}
                            onRefresh={handleSave}
                        />

                        {filteredReminders.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">
                                    {filter === "upcoming" ? "📅" : filter === "past" ? "🕐" : "📋"}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No {filter} reminders
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {filter === "upcoming"
                                        ? "Create a reminder to see it on your timeline"
                                        : filter === "past"
                                            ? "You don't have any past reminders"
                                            : "Get started by creating your first reminder"}
                                </p>
                                {filter === "upcoming" && (
                                    <button
                                        onClick={handleCreateNew}
                                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                    >
                                        Create Your First Reminder
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">💡</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Reminders on Your Grid
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Your reminders appear as visual markers on the month, year, and life grids.
                                Important days stand out at a glance, creating a living memory system.
                            </p>
                            <Link
                                href="/dashboard/calendar"
                                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                            >
                                View Calendar Grid
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <ReminderModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSave={handleSave}
                editReminder={editingReminder}
            />
        </DashboardLayout>
    );
}
