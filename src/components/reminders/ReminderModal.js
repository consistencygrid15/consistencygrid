/**
 * ReminderModal Component
 * 
 * A beautiful, comprehensive modal for creating and editing reminders
 * with all the intelligent features: flexible duration, visual markers,
 * priority levels, and notification settings.
 */

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    X,
    Calendar,
    Palette,
    Zap,
    Star,
    Bell,
    Target,
    PartyPopper,
    Flame,
    Briefcase,
    GraduationCap,
    Plane,
    Gift,
    Lightbulb
} from "lucide-react";

export default function ReminderModal({ isOpen, onClose, onSave, editReminder = null }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        isFullDay: true,
        markerType: "dot",
        markerColor: "#ff7a00",
        markerIcon: "",
        priority: 2,
        isImportant: false,
        enableNotifications: true,
        notifyOnStart: true,
        notifyDaily: false,
    });

    const [isMultiDay, setIsMultiDay] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (editReminder) {
            setForm({
                title: editReminder.title || "",
                description: editReminder.description || "",
                startDate: editReminder.startDate?.split("T")[0] || "",
                endDate: editReminder.endDate?.split("T")[0] || "",
                startTime: editReminder.startTime || "",
                endTime: editReminder.endTime || "",
                isFullDay: editReminder.isFullDay ?? true,
                markerType: editReminder.markerType || "dot",
                markerColor: editReminder.markerColor || "#ff7a00",
                markerIcon: editReminder.markerIcon || "",
                priority: editReminder.priority || 2,
                isImportant: editReminder.isImportant || false,
                enableNotifications: editReminder.enableNotifications ?? true,
                notifyOnStart: editReminder.notifyOnStart ?? true,
                notifyDaily: editReminder.notifyDaily || false,
            });

            if (editReminder.startDate !== editReminder.endDate) {
                setIsMultiDay(true);
            }
        } else {
            // Reset form for new reminder
            const today = new Date().toISOString().split("T")[0];
            setForm((prev) => ({
                ...prev,
                startDate: today,
                endDate: today,
            }));
            setIsMultiDay(false);
        }
    }, [editReminder, isOpen]);

    // Sync end date with start date for single-day reminders
    useEffect(() => {
        if (!isMultiDay && form.startDate) {
            setForm((prev) => ({ ...prev, endDate: prev.startDate }));
        }
    }, [isMultiDay, form.startDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        if (!form.startDate) {
            toast.error("Please select a start date");
            return;
        }

        try {
            const payload = {
                ...form,
                endDate: isMultiDay ? form.endDate : form.startDate,
            };

            if (editReminder) {
                // Update existing reminder
                const res = await fetch(`/api/reminders/${editReminder.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to update reminder");
                toast.success("Reminder updated!");
            } else {
                // Create new reminder
                const res = await fetch("/api/reminders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to create reminder");
                toast.success("Reminder created!");
            }

            onSave?.();
            onClose();
        } catch (error) {
            console.error("Save reminder error:", error);
            toast.error(error.message || "Failed to save reminder");
        }
    };

    if (!isOpen) return null;

    const markerTypes = [
        { value: "dot", label: "Dot", icon: "●" },
        { value: "border", label: "Border", icon: "○" },
        { value: "fill", label: "Fill", icon: "■" },
        { value: "badge", label: "Badge", icon: "◆" },
    ];

    const priorityLevels = [
        { value: 1, label: "Low", color: "#94a3b8" },
        { value: 2, label: "Medium", color: "#3b82f6" },
        { value: 3, label: "High", color: "#f59e0b" },
        { value: 4, label: "Critical", color: "#ef4444" },
    ];

    const commonColors = [
        "#ff7a00", // Orange (default)
        "#ef4444", // Red
        "#f59e0b", // Amber
        "#10b981", // Green
        "#3b82f6", // Blue
        "#8b5cf6", // Purple
        "#ec4899", // Pink
        "#fb923c", // Light Orange
    ];

    const commonIcons = [
        { value: "target", Icon: Target },
        { value: "party", Icon: PartyPopper },
        { value: "calendar", Icon: Calendar },
        { value: "star", Icon: Star },
        { value: "flame", Icon: Flame },
        { value: "briefcase", Icon: Briefcase },
        { value: "grad", Icon: GraduationCap },
        { value: "plane", Icon: Plane },
        { value: "gift", Icon: Gift },
        { value: "bulb", Icon: Lightbulb },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {editReminder ? "Edit Reminder" : "Create New Reminder"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm text-orange-100 mt-1">
                        Create reminders that live on your timeline
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g., Team Meeting, Birthday, Deadline"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Add more details..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-orange-500"><Calendar className="w-5 h-5" /></span>
                            Date & Time
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {isMultiDay && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        min={form.startDate}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isMultiDay}
                                onChange={(e) => setIsMultiDay(e.target.checked)}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">Multi-day reminder</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isFullDay}
                                onChange={(e) => setForm({ ...form, isFullDay: e.target.checked })}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">All-day reminder</span>
                        </label>

                        {!form.isFullDay && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visual Appearance */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-orange-500"><Palette className="w-5 h-5" /></span>
                            Visual Appearance
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Marker Type
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {markerTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, markerType: type.value })}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${form.markerType === type.value
                                            ? "border-orange-500 bg-orange-50 text-orange-700"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="text-2xl">{type.icon}</div>
                                        <div className="text-xs mt-1">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {commonColors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setForm({ ...form, markerColor: color })}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all ${form.markerColor === color
                                            ? "border-gray-900 scale-110"
                                            : "border-gray-200 hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={form.markerColor}
                                    onChange={(e) => setForm({ ...form, markerColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icon (Optional)
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {commonIcons.map(({ value, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setForm({ ...form, markerIcon: value })}
                                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${form.markerIcon === value
                                            ? "border-orange-500 bg-orange-50 text-orange-600"
                                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-orange-500"><Zap className="w-5 h-5" /></span>
                            Priority
                        </h3>

                        <div className="grid grid-cols-4 gap-2">
                            {priorityLevels.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, priority: level.value })}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all ${form.priority === level.value
                                        ? "border-gray-900 scale-105"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    style={{
                                        backgroundColor: form.priority === level.value ? level.color + "20" : "transparent",
                                        color: form.priority === level.value ? level.color : "#374151",
                                    }}
                                >
                                    <div className="text-sm font-medium">{level.label}</div>
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isImportant}
                                onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                                Mark as Important Day
                            </div>
                        </label>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-orange-500"><Bell className="w-5 h-5" /></span>
                            Notifications
                        </h3>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.enableNotifications}
                                onChange={(e) => setForm({ ...form, enableNotifications: e.target.checked })}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">Enable notifications</span>
                        </label>

                        {form.enableNotifications && (
                            <>
                                <label className="flex items-center gap-2 cursor-pointer ml-6">
                                    <input
                                        type="checkbox"
                                        checked={form.notifyOnStart}
                                        onChange={(e) => setForm({ ...form, notifyOnStart: e.target.checked })}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Notify when reminder starts</span>
                                </label>

                                {isMultiDay && (
                                    <label className="flex items-center gap-2 cursor-pointer ml-6">
                                        <input
                                            type="checkbox"
                                            checked={form.notifyDaily}
                                            onChange={(e) => setForm({ ...form, notifyDaily: e.target.checked })}
                                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">Daily notification (multi-day reminder)</span>
                                    </label>
                                )}
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/30"
                        >
                            {editReminder ? "Update Reminder" : "Create Reminder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
