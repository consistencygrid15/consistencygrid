/**
 * Calendar Page
 * 
 * Visual calendar view showing reminders on the grid
 * This is where users see their reminders "living on the timeline"
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CalendarGrid from "@/components/reminders/CalendarGrid";
import ReminderModal from "@/components/reminders/ReminderModal";
import CalendarSkeleton from "@/components/skeletons/CalendarSkeleton";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        loadReminders();
    }, [year, month]);

    const loadReminders = async () => {
        try {
            setLoading(true);

            // Get first and last day of the month
            const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
            const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

            const res = await fetch(`/api/reminders/range?start=${firstDay}&end=${lastDay}`);
            const data = await res.json();

            if (data.reminders) {
                setReminders(data.reminders);
            }
        } catch (error) {
            console.error("Load reminders error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (year, month, day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedDate(null);
    };

    const handleSave = () => {
        loadReminders();
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get upcoming reminders for sidebar
    const today = new Date().toISOString().split("T")[0];
    const upcomingReminders = reminders
        .filter((r) => r.endDate.split("T")[0] >= today)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);

    return (
        <DashboardLayout active="Calendar">
            {loading ? (
                <div className="py-4 sm:py-8">
                    <CalendarSkeleton />
                </div>
            ) : (
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Calendar View
                        </h1>
                        <p className="text-gray-600">
                            Your reminders living on the timeline
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Calendar */}
                        <div className="lg:col-span-2">
                            {/* Month Navigation */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {monthNames[month]} {year}
                                        </h2>
                                        <button
                                            onClick={handleToday}
                                            className="mt-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            Today
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleNextMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <CalendarGrid
                                year={year}
                                month={month}
                                reminders={reminders}
                                onDateClick={handleDateClick}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Add */}
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-lg font-bold mb-2">Quick Add</h3>
                                <p className="text-orange-100 text-sm mb-4">
                                    Create a new reminder for any date
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedDate(null);
                                        setShowModal(true);
                                    }}
                                    className="w-full px-4 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                                >
                                    + New Reminder
                                </button>
                            </div>

                            {/* Upcoming Reminders */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Upcoming
                                </h3>

                                {upcomingReminders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📅</div>
                                        <p className="text-sm text-gray-500">
                                            No upcoming reminders
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingReminders.map((reminder) => {
                                            const startDate = new Date(reminder.startDate);
                                            const dateStr = startDate.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            });

                                            return (
                                                <div
                                                    key={reminder.id}
                                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => handleDateClick(
                                                        startDate.getFullYear(),
                                                        startDate.getMonth(),
                                                        startDate.getDate()
                                                    )}
                                                >
                                                    <div
                                                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                        style={{ backgroundColor: reminder.markerColor + "20" }}
                                                    >
                                                        {reminder.markerIcon || "●"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                                {reminder.title}
                                                            </h4>
                                                            {reminder.isImportant && (
                                                                <span className="text-amber-500 text-xs">⭐</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {dateStr}
                                                            {!reminder.isFullDay && reminder.startTime && (
                                                                <span> • {reminder.startTime}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    This Month
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Reminders</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {reminders.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Important Days</span>
                                        <span className="text-lg font-bold text-amber-600">
                                            {reminders.filter((r) => r.isImportant).length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Multi-day</span>
                                        <span className="text-lg font-bold text-purple-600">
                                            {reminders.filter((r) => r.startDate !== r.endDate).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            <ReminderModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSave={handleSave}
                editReminder={selectedDate ? { startDate: selectedDate, endDate: selectedDate } : null}
            />
        </DashboardLayout>
    );
}
