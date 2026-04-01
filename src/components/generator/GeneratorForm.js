"use client";

import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Settings, ChevronDown, Lock, Crown } from "lucide-react";
import UpgradeButton from "@/components/payment/UpgradeButton";
import ThemeSelector from "./ThemeSelector";
import ToggleRow from "./ToggleRow";
import ResolutionPicker from "./ResolutionPicker";
import GoalSettings from "./GoalSettings";
import GridModeSelector from "./GridModeSelector";

/**
 * GeneratorForm Component - Enhanced Version
 * 
 * Comprehensive wallpaper generator form with the following features:
 * ✨ Responsive design (mobile-first)
 * ✨ Real-time preview updates
 * ✨ Advanced settings with collapsible sections
 * ✨ Life progress visualization
 * ✨ Form validation and error handling
 * ✨ Save status feedback
 * ✨ Organized code structure with clear comments
 * 
 * @param {Object} form - Form state object
 * @param {Function} setForm - State setter for form
 * @param {Function} onSave - Callback function when saving
 * @param {string} publicToken - Public token for sharing wallpaper
 */
export default function GeneratorForm({ form, setForm, onSave, publicToken, onBgUploaded, isPremium }) {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'

    // Background photo upload state
    const [bgUploadState, setBgUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
    const [bgUploadError, setBgUploadError] = useState('');
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const fileInputRef = useRef(null);

    // ============================================================================
    // ANDROID WEBVIEW BRIDGE
    // ============================================================================

    /**
     * Set up the Android bridge:
     * - Detect if running inside the Android WebView
     * - Expose window.onAndroidImagePicked() so native code can send back the picked image
     */
    useEffect(() => {
        const androidDetected = typeof window !== 'undefined' && !!window.Android;
        setIsAndroid(androidDetected);

        if (androidDetected) {
            // Android calls this function with the base64 image data after user picks a photo
            window.onAndroidImagePicked = async (base64Data, mimeType) => {
                if (!base64Data) return;
                const safeType = mimeType || 'image/jpeg';
                // Convert base64 string to a File-like Blob for the upload handler
                try {
                    const byteString = atob(base64Data);
                    const byteArray = new Uint8Array(byteString.length);
                    for (let i = 0; i < byteString.length; i++) {
                        byteArray[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([byteArray], { type: safeType });
                    const file = new File([blob], 'background.jpg', { type: safeType });
                    await handleBgUpload(file);
                } catch (err) {
                    setBgUploadError('Failed to process picked image.');
                    setBgUploadState('error');
                }
            };
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete window.onAndroidImagePicked;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Handle input changes for text, number, and checkbox inputs
     * Automatically detects input type and updates state accordingly
     */
    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    /**
     * Handle theme selection from ThemeSelector component
     */
    function handleThemeChange(themeId) {
        setForm((prev) => ({ ...prev, theme: themeId }));
    }

    /**
     * Handle resolution/size changes from ResolutionPicker
     */
    function handleSizeChange(dimension, value) {
        setForm((prev) => ({ ...prev, [dimension]: value }));
    }

    /**
     * Handle custom background photo upload
     */
    async function handleBgUpload(file) {
        if (!file) return;

        // Client-side validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setBgUploadError('Only JPEG, PNG, and WebP images are allowed.');
            setBgUploadState('error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setBgUploadError('Image must be under 5MB.');
            setBgUploadState('error');
            return;
        }

        setBgUploadState('uploading');
        setBgUploadError('');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('/api/settings/upload-background', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || 'Upload failed');
            }

            const json = await res.json();
            setForm((prev) => ({ ...prev, customBackgroundUrl: json.url }));
            setBgUploadState('success');
            // Tell the parent to force-refresh the preview
            if (onBgUploaded) onBgUploaded();
        } catch (err) {
            setBgUploadError(err.message || 'Upload failed. Please try again.');
            setBgUploadState('error');
        }
    }

    /**
     * Remove the custom background photo
     */
    async function handleBgRemove() {
        setBgUploadState('uploading');
        try {
            await fetch('/api/settings/upload-background', { method: 'DELETE' });
            setForm((prev) => ({ ...prev, customBackgroundUrl: '' }));
            setBgUploadState('idle');
            setBgUploadError('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            // Tell the parent to force-refresh the preview
            if (onBgUploaded) onBgUploaded();
        } catch (err) {
            setBgUploadState('error');
            setBgUploadError('Failed to remove background.');
        }
    }

    /**
     * Handle save button click with:
     * - Loading state management
     * - Error handling
     * - Success/failure feedback
     * - Auto-dismiss after 3 seconds
     */
    async function handleSaveClick() {
        if (!isDobValid) return; // Prevent save if DOB is invalid

        setSaving(true);
        setSaveStatus(null);
        try {
            await onSave();
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setSaving(false);
        }
    }

    // ============================================================================
    // CALCULATIONS & DERIVED DATA
    // ============================================================================

    /**
     * Calculate life progress metrics
     * - weeks lived: from DOB to today
     * - total weeks: based on life expectancy
     * - progress percentage: visual indicator
     * - remaining weeks: time left
     */
    const lived = Math.floor(
        (new Date() - new Date(form.dob || "2000-01-01")) / (1000 * 60 * 60 * 24 * 7)
    );
    const total = (form.lifeExpectancyYears || 80) * 52;
    const progress = Math.min(100, Math.max(0, (lived / total) * 100)).toFixed(1);
    const remaining = total - lived;

    // Validation: DOB must be set before saving
    const isDobValid = form.dob && form.dob.length > 0;

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div className="space-y-3 sm:space-y-4 pb-6 sm:pb-12 md:pb-8">

            {/* ╔═══════════════════════════════════════════════════════════════════════════╗ */}
            {/* ║ SECTION 1: BASIC INFORMATION                                              ║ */}
            {/* ║ - Date of Birth input with validation                                     ║ */}
            {/* ║ - Life Expectancy slider with visual feedback                             ║ */}
            {/* ║ - Life Progress bar with percentage                                       ║ */}
            {/* ║ - Stats grid showing weeks lived, total, remaining                        ║ */}
            {/* ╚═══════════════════════════════════════════════════════════════════════════╝ */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="mb-4 text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    Basic Information
                </h2>

                <div className="space-y-4">
                    {/* Date of Birth Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={form.dob}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50 focus:bg-white transition-all"
                        />
                        {isDobValid && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Valid date entered
                            </p>
                        )}
                    </div>

                    {/* Life Expectancy Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Life Expectancy
                            </label>
                            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                {form.lifeExpectancyYears} years
                            </span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            name="lifeExpectancyYears"
                            value={form.lifeExpectancyYears}
                            onChange={handleChange}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>50 years</span>
                            <span>100 years</span>
                        </div>
                    </div>

                    {/* Life Progress Bar */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Life Progress</span>
                            <span className="text-lg font-bold text-orange-600">{progress}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Life Stats Grid - Responsive */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                            <div className="text-lg sm:text-xl font-bold text-gray-900">
                                {lived.toLocaleString()}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mt-1">
                                Weeks Lived
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                            <div className="text-lg sm:text-xl font-bold text-blue-600">
                                {total.toLocaleString()}
                            </div>
                            <div className="text-[10px] sm:text-xs text-blue-600/70 uppercase font-semibold mt-1">
                                Total Weeks
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                            <div className="text-lg sm:text-xl font-bold text-orange-600">
                                {remaining.toLocaleString()}
                            </div>
                            <div className="text-[10px] sm:text-xs text-orange-600/70 uppercase font-semibold mt-1">
                                Remaining
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ╔═══════════════════════════════════════════════════════════════════════════╗ */}
            {/* ║ SECTION 2: THEME SELECTION                                                ║ */}
            {/* ║ - Visual theme selector with color previews                               ║ */}
            {/* ║ - 6 theme options with live preview                                       ║ */}
            {/* ╚═══════════════════════════════════════════════════════════════════════════╝ */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="mb-4 text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">🎨</span>
                    Visual Theme
                </h2>
                <ThemeSelector activeTheme={form.theme} onChange={handleThemeChange} />
            </div>

            {/* ╔═══════════════════════════════════════════════════════════════════════════╗ */}
            {/* ║ SECTION 3: ADVANCED SETTINGS - Collapsible Details Element                ║ */}
            {/* ║ - Progressively disclose advanced options                                 ║ */}
            {/* ║ - Smooth animations when expanded                                         ║ */}
            {/* ║ - Organized subsections                                                   ║ */}
            {/* ╚═══════════════════════════════════════════════════════════════════════════╝ */}
            <details className="group space-y-4 sm:space-y-6 md:space-y-8">
                <summary className="list-none cursor-pointer p-3 sm:p-5 flex items-center justify-between select-none bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] rounded-2xl transition-all duration-300 group-open:border-orange-200 group-open:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.15)] ring-1 ring-black/[0.02] hover:ring-orange-500/20">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 text-gray-500 group-hover:from-orange-50 group-hover:to-orange-100/80 group-hover:text-orange-600 group-hover:border-orange-200/50 shadow-sm transition-all duration-500 ease-out group-hover:scale-[1.05] group-open:from-orange-50 group-open:to-orange-100/80 group-open:text-orange-600 group-open:border-orange-200/50">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-700 ease-in-out group-hover:rotate-90 group-open:rotate-[135deg]" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-orange-600 group-open:text-orange-600 transition-colors duration-300 tracking-tight">
                                Advanced Settings
                            </h3>
                            <p className="text-[11px] sm:text-[13px] text-gray-500 font-medium group-hover:text-gray-600 transition-colors duration-300 mt-0.5">
                                Resolution, layouts & display elements
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 ring-1 ring-inset ring-gray-900/5 text-gray-400 group-hover:bg-origin-border group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:ring-orange-500/20 group-open:bg-orange-50 group-open:text-orange-600 group-open:ring-orange-500/20 transition-all duration-300">
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 transform group-open:rotate-180 transition-transform duration-500 ease-in-out" />
                    </div>
                </summary>

                <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

                    {/* ─────────────────────────────────────────────────────────────────── */}
                    {/* SUBSECTION 3.1: Resolution Settings                                 */}
                    {/* ─────────────────────────────────────────────────────────────────── */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>📱</span>
                            Resolution Settings
                        </h3>
                        <ResolutionPicker
                            width={form.width}
                            height={form.height}
                            onChange={handleSizeChange}
                        />
                        <p className="text-xs text-gray-500 mt-3 p-2 bg-blue-50 rounded-lg">
                            💡 Tip: Choose a preset matching your device for best results
                        </p>
                    </div>

                    {/* ─────────────────────────────────────────────────────────────────── */}
                    {/* SUBSECTION 3.2: Layout & Display Options                            */}
                    {/* ─────────────────────────────────────────────────────────────────── */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <span>📐</span>
                            Layout Options
                        </h3>

                        {/* Grid Mode Selector */}
                        <div>
                            <GridModeSelector
                                mode={form.yearGridMode || "weeks"}
                                onChange={(val) => setForm(prev => ({ ...prev, yearGridMode: val }))}
                            />
                        </div>

                        {/* Wallpaper Type Selector */}
                        <div className="space-y-2 pb-4 border-b border-gray-100">
                            <label className="text-sm font-bold text-gray-900">Wallpaper Type</label>
                            <select
                                name="wallpaperType"
                                value={form.wallpaperType || "lockscreen"}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white transition-all"
                            >
                                <option value="lockscreen">🔒 Lock Screen (Life Grid)</option>
                                <option value="homescreen">🏠 Home Screen (Minimal)</option>
                                <option value="calendar">📅 Monthly Calendar</option>
                            </select>
                        </div>

                        {/* Display Toggles - Organized with Categories */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider px-2 mb-3">
                                Display Elements
                            </h4>
                            <div className="divide-y divide-gray-100">
                                <ToggleRow
                                    label="Show Progress Bar"
                                    subLabel="Life journey percentage at top"
                                    name="showAgeStats"
                                    checked={form.showAgeStats}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Life Grid"
                                    subLabel="Weeks visualization of your life"
                                    name="showLifeGrid"
                                    checked={form.showLifeGrid}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Year Grid"
                                    subLabel="Current year breakdown"
                                    name="showYearGrid"
                                    checked={form.showYearGrid}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Missed Days"
                                    subLabel="Red dotted outline for skipped habits"
                                    name="showMissedDays"
                                    checked={form.showMissedDays}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Quote"
                                    subLabel="Display custom motivational text"
                                    name="showQuote"
                                    checked={form.showQuote}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Habit Layer"
                                    subLabel="Overlay your habit tracking"
                                    name="showHabitLayer"
                                    checked={form.showHabitLayer}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Goal Progress"
                                    subLabel="Display active goal tracking"
                                    name="goalEnabled"
                                    checked={form.goalEnabled}
                                    onChange={handleChange}
                                />
                                <ToggleRow
                                    label="Show Legend"
                                    subLabel="Display color meaning guide"
                                    name="showLegend"
                                    checked={form.showLegend}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─────────────────────────────────────────────────────────────────── */}
                    {/* SUBSECTION 3.3: Goals & Milestones                                  */}
                    {/* ─────────────────────────────────────────────────────────────────── */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🎯</span>
                            Goals & Milestones
                        </h3>
                        <GoalSettings />
                    </div>

                    {/* ─────────────────────────────────────────────────────────────────── */}
                    {/* SUBSECTION 3.5: Custom Background Photo                              */}
                    {/* ─────────────────────────────────────────────────────────────────── */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <span>🖼️</span>
                            Custom Background Photo
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Upload a personal photo as your wallpaper background. All your stats &amp; grids will display on top of it.
                        </p>

                        {/* Current background preview or Locked UI */}
                        {!isPremium ? (
                            /* ── LOCKED UI for Free Users (Platform-Appropriate) ── */
                            <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50/50 p-6 flex flex-col items-center justify-center gap-4 group">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-0" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Lock className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-orange-500 fill-orange-500" />
                                        {isAndroid ? 'Members-Only Feature' : 'Premium Feature'}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-6 max-w-[280px]">
                                        {isAndroid
                                            ? 'Custom background photos are available for active members. Sign in on our website to manage your account.'
                                            : <>Custom background photos are available for <strong>Pro</strong> users only. Make your calendar truly yours.</>
                                        }
                                    </p>

                                    <UpgradeButton
                                        size="sm"
                                        className="!px-8 !py-2.5 rounded-full shadow-orange-200"
                                    >
                                        {isAndroid ? 'Manage Account' : 'Upgrade to Unlock'}
                                    </UpgradeButton>
                                </div>
                            </div>
                        ) : form.customBackgroundUrl ? (
                            <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                <img
                                    src={form.customBackgroundUrl}
                                    alt="Custom background preview"
                                    className="w-full h-40 sm:h-52 object-cover"
                                />
                                {/* Dark overlay preview */}
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                    <p className="text-white text-xs font-semibold tracking-wide opacity-80">YOUR STATS APPEAR OVER THIS</p>
                                    <p className="text-white/60 text-[10px] mt-1">50% dark overlay applied automatically</p>
                                </div>
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={handleBgRemove}
                                    disabled={bgUploadState === 'uploading'}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg px-3 py-1.5 flex items-center gap-1 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <span>✕</span> Remove
                                </button>
                            </div>
                        ) : (
                            /* Upload / drag-drop zone OR Android gallery button (Only shown to premium if no URL yet) */
                            <div className="mb-4">
                                {isAndroid ? (
                                    /* ── Android WebView: Native gallery picker button ── */
                                    <div className="flex flex-col items-center gap-3 py-6 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50">
                                        <span className="text-4xl">
                                            {bgUploadState === 'uploading' ? '⏳' : '🖼️'}
                                        </span>
                                        <p className="text-sm font-semibold text-gray-700 text-center px-4">
                                            {bgUploadState === 'uploading'
                                                ? 'Uploading your photo...'
                                                : 'Choose a photo from your gallery'}
                                        </p>
                                        {bgUploadState !== 'uploading' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.Android?.pickImage) {
                                                        // Calls native Android: opens gallery
                                                        // Android will call back window.onAndroidImagePicked(base64, mimeType)
                                                        window.Android.pickImage();
                                                    } else {
                                                        // Fallback: open file input (in case bridge isn't fully set up)
                                                        fileInputRef.current?.click();
                                                    }
                                                }}
                                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl px-6 py-3 shadow-md transition-all active:scale-95"
                                            >
                                                <span>📸</span>
                                                <span>Pick from Gallery</span>
                                            </button>
                                        )}
                                        {bgUploadState === 'uploading' && (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
                                                <span className="text-xs text-orange-600 font-semibold">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* ── Web: Drag & drop upload zone ── */
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                                        onDragLeave={() => setIsDraggingOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDraggingOver(false);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) handleBgUpload(file);
                                        }}
                                        className={`
                                            w-full h-36 sm:h-44 rounded-xl border-2 border-dashed cursor-pointer
                                            flex flex-col items-center justify-center gap-2 select-none
                                            transition-all duration-200
                                            ${isDraggingOver
                                                ? 'border-orange-400 bg-orange-50 scale-[1.01]'
                                                : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/50'
                                            }
                                        `}
                                    >
                                        <span className="text-3xl">{bgUploadState === 'uploading' ? '⏳' : '📸'}</span>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {bgUploadState === 'uploading' ? 'Uploading...' : 'Click or drag & drop your photo'}
                                        </p>
                                        <p className="text-xs text-gray-400">JPEG, PNG, WebP · Max 5MB</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hidden file input (web fallback; also used as Android fallback) */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleBgUpload(file);
                            }}
                        />

                        {/* Status feedback */}
                        {bgUploadState === 'success' && (
                            <p className="text-xs text-green-600 flex items-center gap-1 font-semibold mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Background photo set! Preview updated automatically.
                            </p>
                        )}
                        {bgUploadState === 'error' && bgUploadError && (
                            <p className="text-xs text-red-600 flex items-center gap-1 font-semibold mt-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {bgUploadError}
                            </p>
                        )}

                        {/* Tips */}
                        {!form.customBackgroundUrl && bgUploadState !== 'uploading' && (
                            <p className="text-xs text-gray-500 mt-3 p-2.5 bg-blue-50 rounded-lg">
                                💡 Tip: Use a high-resolution portrait photo for the best result. A semi-transparent dark overlay will be applied so your stats remain readable.
                            </p>
                        )}
                    </div>


                    {/* ─────────────────────────────────────────────────────────────────── */}
                    {/* SUBSECTION 3.4 (existing): Custom Quote (Conditional)              */}
                    {/* ─────────────────────────────────────────────────────────────────── */}
                    {form.showQuote && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-bold text-gray-900 block mb-3 flex items-center gap-2">
                                <span>✨</span>
                                Custom Quote
                            </label>
                            <input
                                type="text"
                                name="quote"
                                value={form.quote}
                                onChange={handleChange}
                                placeholder="Make every week count."
                                maxLength={100}
                                className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-gray-50 focus:bg-white transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {form.quote.length}/100 characters
                            </p>
                        </div>
                    )}
                </div>
            </details>

            {/* ╔═══════════════════════════════════════════════════════════════════════════╗ */}
            {/* ║ SAVE SECTION - Below Advanced Settings                                   ║ */}
            {/* ║ - Save button with public link option                                    ║ */}
            {/* ║ - Real-time save status feedback                                          ║ */}
            {/* ║ - Data persistence confirmation                                           ║ */}
            {/* ╚═══════════════════════════════════════════════════════════════════════════╝ */}
            <div className="mt-8 sm:mt-10 space-y-4">
                {/* Status Message */}
                {saveStatus && (
                    <div className={`text-xs sm:text-sm font-semibold py-3 sm:py-4 px-4 sm:px-5 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all animate-in fade-in ${saveStatus === 'success'
                        ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                        : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                        }`}>
                        {saveStatus === 'success' ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                                <span>✓ Settings saved successfully!</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                                <span>✕ Save failed. Please try again.</span>
                            </>
                        )}
                    </div>
                )}

                {/* Action Buttons Container */}
                <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                    {/* Public Link Button */}
                    {publicToken && (
                        <a
                            href={`/w/${publicToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open your public wallpaper link in a new tab"
                            className="
                                w-full xs:w-auto
                                px-4 sm:px-6 md:px-8
                                py-3 sm:py-3.5 md:py-4
                                rounded-xl sm:rounded-2xl
                                font-semibold text-sm sm:text-base
                                flex items-center justify-center gap-2 xs:gap-2.5
                                transition-all duration-300 ease-out
                                bg-gradient-to-r from-blue-100 to-blue-50
                                text-blue-700
                                hover:from-blue-200 hover:to-blue-100
                                hover:shadow-lg
                                border border-blue-200
                                active:scale-95
                                focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                            "
                        >
                            <ExternalLink className="w-5 h-5 sm:w-5 sm:h-5" />
                            <span>Open Public Link</span>
                        </a>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSaveClick}
                        disabled={saving || !isDobValid}
                        title={!isDobValid ? "❌ Please enter a valid date of birth first" : "✅ Save your wallpaper settings"}
                        aria-label={saving ? "Saving changes..." : isDobValid ? "Save changes" : "Please enter date of birth"}
                        aria-disabled={saving || !isDobValid}
                        className={`
                            w-full xs:flex-1
                            px-4 sm:px-6 md:px-8
                            py-3 sm:py-3.5 md:py-4
                            rounded-xl sm:rounded-2xl
                            font-semibold text-sm sm:text-base
                            flex items-center justify-center gap-2 xs:gap-2.5
                            transition-all duration-300 ease-out
                            shadow-md hover:shadow-lg
                            active:scale-95 active:shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${isDobValid && !saving
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 cursor-pointer focus:ring-orange-300'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60 focus:ring-gray-300'
                            }
                        `}
                    >
                        {saving ? (
                            <>
                                <span className="inline-flex animate-spin text-lg">⏳</span>
                                <span>Saving...</span>
                            </>
                        ) : isDobValid ? (
                            <>
                                <span className="text-lg">💾</span>
                                <span>Save Changes</span>
                            </>
                        ) : (
                            <>
                                <span className="text-lg">⚠️</span>
                                <span>Enter Date of Birth</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Helper Text */}
                <p className="text-xs sm:text-sm text-gray-500 text-center italic pt-2">
                    💡 Your changes are auto-saved to your profile
                </p>
            </div>

        </div>
    );
}
