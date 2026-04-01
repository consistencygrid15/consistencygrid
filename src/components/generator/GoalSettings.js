"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trash2, Target, Zap, Award } from "lucide-react";

/**
 * GoalSettings Component - Enhanced Version
 * 
 * Displays and manages user goals with:
 * ✨ Real-time goal data from API
 * ✨ Progress visualization with animated bars
 * ✨ Life milestone tracking with age indicators
 * ✨ Sub-goal completion tracking
 * ✨ Color-coded categories (life milestones vs habits)
 * ✨ Responsive grid layout
 * ✨ Loading and empty states
 * 
 * Features:
 * - Fetches goals from /api/goals endpoint
 * - Calculates progress based on completed sub-goals
 * - Supports both regular goals and life milestones
 * - Shows goal descriptions and metadata
 */
export default function GoalSettings() {
    // ============================================================================================
    // STATE MANAGEMENT
    // ============================================================================================
    
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ============================================================================================
    // EFFECTS: FETCH GOALS FROM API
    // ============================================================================================
    
    /**
     * Load goals from the API on component mount
     * Handles loading states and errors gracefully
     */
    useEffect(() => {
        async function loadGoals() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/goals");
                if (res.ok) {
                    const data = await res.json();
                    setGoals(data || []);
                } else {
                    throw new Error(`API responded with ${res.status}`);
                }
            } catch (error) {
                console.error("Failed to load goals:", error);
                setError("Unable to load goals. Please try again.");
                setGoals([]);
            } finally {
                setLoading(false);
            }
        }
        loadGoals();
    }, []);

    // ============================================================================================
    // CALCULATIONS
    // ============================================================================================
    
    /**
     * Calculate goal progress based on completed sub-goals
     * Handles both percentage-based and checklist-based goals
     * 
     * @param {Object} goal - The goal object
     * @returns {number} Progress percentage (0-100)
     */
    const getGoalProgress = (goal) => {
        if (goal.subGoals && goal.subGoals.length > 0) {
            const completed = goal.subGoals.filter(sg => sg.isCompleted).length;
            return Math.round((completed / goal.subGoals.length) * 100);
        }
        return goal.progress || 0;
    };

    /**
     * Get appropriate icon based on goal category
     */
    const getCategoryIcon = (category) => {
        if (!category) return <Target className="w-4 h-4" />;
        const lower = category.toLowerCase();
        if (lower === "lifemilestone") return <Award className="w-4 h-4" />;
        if (lower === "habit") return <Zap className="w-4 h-4" />;
        return <Target className="w-4 h-4" />;
    };

    /**
     * Get background and border colors based on goal type
     */
    const getGoalColors = (isLifeMilestone) => {
        if (isLifeMilestone) {
            return {
                bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
                border: "border-purple-200",
                badge: "bg-purple-100 text-purple-700",
                progress: "bg-purple-500",
                barBg: "bg-purple-100",
            };
        }
        return {
            bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
            border: "border-blue-200",
            badge: "bg-blue-100 text-blue-700",
            progress: "bg-blue-500",
            barBg: "bg-blue-100",
        };
    };

    // ============================================================================================
    // RENDER
    // ============================================================================================

    return (
        <div className="space-y-3">
            
            {/* Loading State */}
            {loading && (
                <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="animate-spin text-xl">⏳</div>
                        <p className="text-sm font-medium text-gray-600">Loading your goals...</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This usually takes a moment</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
                    <p className="text-xs text-red-600 mt-1">Try refreshing the page</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && goals.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50/50 to-gray-100/50 py-12 text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No Goals Yet</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        Create your first goal in the Goals section to start tracking your progress
                    </p>
                </div>
            )}

            {/* Goals List */}
            {!loading && !error && goals.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {goals.map((goal) => {
                        const progress = getGoalProgress(goal);
                        const isLifeMilestone = goal.category?.toLowerCase() === "lifemilestone";
                        const colors = getGoalColors(isLifeMilestone);
                        
                        return (
                            <div 
                                key={goal.id} 
                                className={`rounded-xl border ${colors.border} ${colors.bg} p-3 sm:p-4 hover:shadow-md transition-all`}
                            >
                                {/* Header: Title and Status Badge */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg flex-shrink-0">
                                                {isLifeMilestone ? "🏆" : "⭐"}
                                            </span>
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                                {goal.title}
                                            </h4>
                                        </div>
                                        
                                        {/* Metadata: Category, Age, Status */}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${colors.badge}`}>
                                                {getCategoryIcon(goal.category)}
                                                {isLifeMilestone ? `Age ${goal.age}` : goal.category || "Goal"}
                                            </span>
                                            
                                            {goal.isCompleted && (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Section */}
                                <div className="space-y-2 pt-2 border-t border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Progress
                                        </span>
                                        <span className={`text-sm font-bold ${colors.badge} px-2 py-0.5 rounded-lg`}>
                                            {progress}%
                                        </span>
                                    </div>
                                    
                                    {/* Progress Bar with Animation */}
                                    <div className={`h-2 w-full rounded-full overflow-hidden ${colors.barBg}`}>
                                        <div 
                                            className={`h-full ${colors.progress} rounded-full transition-all duration-500 ease-out`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Sub-Goals Count */}
                                {goal.subGoals && goal.subGoals.length > 0 && (
                                    <div className="text-xs text-gray-600 font-medium mt-2">
                                        {goal.subGoals.filter(sg => sg.isCompleted).length}/{goal.subGoals.length}
                                        {" "}milestones completed
                                    </div>
                                )}

                                {/* Description */}
                                {goal.description && (
                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                                        {goal.description}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
