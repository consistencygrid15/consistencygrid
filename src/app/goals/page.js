"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddGoalModal from "@/components/goals/AddGoalModal";
import UpdateGoalModal from "@/components/goals/UpdateGoalModal";
import ViewFullLifeTimelineModal from "@/components/goals/ViewFullLifeTimelineModal";
import DetailedInsightsModal from "@/components/goals/DetailedInsightsModal";
import CircularProgress from "@/components/goals/CircularProgress";
import GoalCard from "@/components/goals/GoalCard";
import MilestoneItem from "@/components/goals/MilestoneItem";
import GoalSkeleton from "@/components/skeletons/GoalSkeleton";
import {
    Plus,
    Filter,
    ChevronRight,
    Zap,
    Target
} from "lucide-react";
import { sendWallpaperToAndroid } from "@/utils/sendWallpaperToAndroid";
import Card from "@/components/ui/Card";

export default function GoalsPage() {
    // State for data
    const [stats, setStats] = useState({
        completed: 12, // Demo value
        total: 18,
        percentage: 72,
        ageTarget: 35
    });

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
    const [publicToken, setPublicToken] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const goalsRes = await fetch("/api/goals");

                if (goalsRes.ok) {
                    const goalsData = await goalsRes.json();
                    setGoals(goalsData || []);
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
                console.error("Failed to load goals data:", error);
                setGoals([]);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Calculate stats from real goal data
    useEffect(() => {
        if (goals.length === 0) {
            setStats({
                completed: 0,
                total: 0,
                percentage: 0,
                ageTarget: 35,
                activeGoals: 0,
                lifeMilestones: 0,
                regularGoals: 0,
                onTrack: 0
            });
            return;
        }

        console.log("📊 DEBUG - Goals data:", goals);

        // Separate milestones and goals
        const lifeMilestones = goals.filter(goal => goal.category?.toLowerCase() === "lifemilestone");
        const regularGoals = goals.filter(goal => goal.category?.toLowerCase() !== "lifemilestone");

        // Calculate completed goals (based on sub-goal completion OR explicitly marked)
        const completedGoals = goals.filter(goal => {
            if (goal.isCompleted) return true;
            // If has subgoals, consider complete if all sub-goals are completed
            if (goal.subGoals && goal.subGoals.length > 0) {
                const allSubGoalsCompleted = goal.subGoals.every(sg => sg.isCompleted);
                return allSubGoalsCompleted;
            }
            return false;
        }).length;

        // Calculate active goals (not explicitly completed and has progress or open sub-goals)
        const activeGoals = goals.filter(goal => {
            if (goal.isCompleted) return false;
            // Has sub-goals with at least one open
            if (goal.subGoals && goal.subGoals.length > 0) {
                return goal.subGoals.some(sg => !sg.isCompleted);
            }
            return true; // No sub-goals but not completed
        }).length;

        // Calculate on-track goals (has progress > 0 and not completed)
        const onTrackGoals = goals.filter(goal => {
            if (goal.isCompleted) return false;
            if (goal.subGoals && goal.subGoals.length > 0) {
                const completedCount = goal.subGoals.filter(sg => sg.isCompleted).length;
                return completedCount > 0;
            }
            return (goal.progress || 0) > 0;
        }).length;

        // Get highest age target from life milestones
        const ageTarget = lifeMilestones.length > 0
            ? Math.max(...lifeMilestones.map(m => m.age || 35))
            : 35;

        // Calculate overall percentage
        const totalGoals = goals.length;
        const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        const newStats = {
            completed: completedGoals,
            total: totalGoals,
            percentage: percentage,
            ageTarget: ageTarget,
            activeGoals: activeGoals,
            lifeMilestones: lifeMilestones.length,
            regularGoals: regularGoals.length,
            onTrack: onTrackGoals
        };

        console.log("📊 DEBUG - Calculated stats:", newStats);
        setStats(newStats);
    }, [goals]);

    if (loading) {
        return (
            <DashboardLayout active="Goals">
                <div className="py-4 sm:py-8">
                    <GoalSkeleton />
                </div>
            </DashboardLayout>
        );
    }

    const handleToggleSubGoal = async (goalId, subGoalId) => {
        // Optimistic Update
        const originalGoals = [...goals];
        const isDemo = goalId.toString().startsWith("demo");

        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const updatedSubGoals = goal.subGoals.map(sg =>
                    sg.id === subGoalId ? { ...sg, isCompleted: !sg.isCompleted } : sg
                );

                // Recalculate progress
                const completed = updatedSubGoals.filter(sg => sg.isCompleted).length;
                const progress = Math.round((completed / updatedSubGoals.length) * 100);

                return { ...goal, subGoals: updatedSubGoals, progress };
            }
            return goal;
        });

        setGoals(updatedGoals);

        // If it's real data (not demo), sync with server
        if (!isDemo) {
            try {
                // Determine new status
                const goal = updatedGoals.find(g => g.id === goalId);
                const subGoal = goal.subGoals.find(sg => sg.id === subGoalId);

                await fetch(`/api/subgoals/${subGoalId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isCompleted: subGoal.isCompleted })
                });

                // Android Bridge: Trigger update
                if (publicToken) {
                    const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
                    sendWallpaperToAndroid(wallpaperUrl);
                }
            } catch (error) {
                console.error("Failed to update subgoal:", error);
                setGoals(originalGoals); // Revert on error
            }
        }
    };

    const handleAddGoal = (newGoal) => {
        setGoals(prev => [newGoal, ...prev]);
        setIsModalOpen(false);

        // Update stats
        setStats(prev => ({
            ...prev,
            total: prev.total + 1
        }));

        // Android Bridge: Trigger update
        if (publicToken) {
            const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
            sendWallpaperToAndroid(wallpaperUrl);
        }
    };

    const handleDeleteGoal = (goalId) => {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));

        // Update stats
        setStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1)
        }));

        // Android Bridge: Trigger update
        if (publicToken) {
            const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
            sendWallpaperToAndroid(wallpaperUrl);
        }
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateGoal = (updatedGoal) => {
        setGoals(prev =>
            prev.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal)
        );
        setIsUpdateModalOpen(false);
        setEditingGoal(null);

        // Android Bridge: Trigger update
        if (publicToken) {
            const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
            sendWallpaperToAndroid(wallpaperUrl);
        }
    };

    const handlePinGoal = (goalId, isPinned) => {
        setGoals(prev =>
            prev.map(goal => goal.id === goalId ? { ...goal, isPinned } : goal)
        );

        // Android Bridge: Trigger update
        if (publicToken) {
            const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
            sendWallpaperToAndroid(wallpaperUrl);
        }
    };

    return (
        <DashboardLayout active="Goals">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Add Goal Modal */}
                <AddGoalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleAddGoal}
                />

                {/* Update Goal Modal */}
                <UpdateGoalModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setEditingGoal(null);
                    }}
                    goal={editingGoal}
                    onUpdate={handleUpdateGoal}
                />

                {/* View Full Life Timeline Modal */}
                <ViewFullLifeTimelineModal
                    isOpen={isTimelineModalOpen}
                    onClose={() => setIsTimelineModalOpen(false)}
                    milestones={goals.filter(goal => goal.category?.toLowerCase() === "lifemilestone")}
                    onToggleSubGoal={handleToggleSubGoal}
                />

                {/* Detailed Insights Modal */}
                <DetailedInsightsModal
                    isOpen={isInsightsModalOpen}
                    onClose={() => setIsInsightsModalOpen(false)}
                    goals={goals}
                />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Goals & Milestones</h1>
                        <p className="text-gray-500 mt-1">Track your long-term vision and daily progress.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Goal
                        </button>
                    </div>
                </div>

                {/* Main Progress Card */}
                <Card className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            <CircularProgress percentage={stats.percentage} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-bold text-gray-900">Overall Life Momentum</h2>
                            <p className="text-gray-600 mt-2 max-w-xl">
                                You have achieved <span className="font-bold text-gray-900">{stats.completed} out of {stats.total}</span> {stats.total === 1 ? 'goal' : 'goals'}.
                                {stats.percentage}% of your lifetime objectives are on track for your age {stats.ageTarget} targets.
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <Zap className="w-3 h-3 fill-current" />
                                    {stats.onTrack} On Track
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <Target className="w-3 h-3" />
                                    {stats.activeGoals} Active {stats.activeGoals === 1 ? 'Goal' : 'Goals'}
                                </span>
                                {stats.lifeMilestones > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                        ⭐ {stats.lifeMilestones} {stats.lifeMilestones === 1 ? 'Milestone' : 'Milestones'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setIsInsightsModalOpen(true)}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors">
                                View Detailed Insights
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Analytics Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Goals Card */}
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-0 border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Total Goals</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                        <p className="text-xs text-blue-600 mt-2">All goals and milestones</p>
                    </Card>

                    {/* Completed Goals Card */}
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-0 border-green-100">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Completed</p>
                        <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
                        <p className="text-xs text-green-600 mt-2">Goals achieved</p>
                    </Card>

                    {/* Active Goals Card */}
                    <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-0 border-orange-100">
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">In Progress</p>
                        <p className="text-3xl font-bold text-orange-900">{stats.activeGoals}</p>
                        <p className="text-xs text-orange-600 mt-2">Currently active</p>
                    </Card>

                    {/* Life Milestones Card */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-0 border-purple-100">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Milestones</p>
                        <p className="text-3xl font-bold text-purple-900">{stats.lifeMilestones}</p>
                        <p className="text-xs text-purple-600 mt-2">Lifetime milestones</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Active Goals (2/3 width) */}
                    <div className="lg:col-span-8 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900">Active Goals</h2>

                        {/* All Goals (Non-Life Milestone only) */}
                        <div className="space-y-4">
                            {goals.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No active goals yet. Create one to get started!</p>
                            ) : (
                                <>
                                    {goals
                                        .filter(goal => goal.category?.toLowerCase() !== "lifemilestone")
                                        .map(goal => (
                                            <GoalCard key={goal.id} goal={goal} onToggleSubGoal={handleToggleSubGoal} onDelete={handleDeleteGoal} onEdit={handleEditGoal} onPin={handlePinGoal} />
                                        ))}
                                </>
                            )}

                            {/* Add New Placeholder */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50/50 transition-all group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-medium">Start a New Goal</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Milestones (1/3 width) */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900">Life Milestones</h2>

                        {/* Timeline Card */}
                        <Card className="p-6">
                            <div className="mt-2">
                                {(() => {
                                    // Filter and sort Life Milestone goals by age
                                    const lifeMilestones = goals
                                        .filter(goal => goal.category?.toLowerCase() === "lifemilestone")
                                        .sort((a, b) => (a.age || 0) - (b.age || 0));

                                    return lifeMilestones.length > 0 ? (
                                        lifeMilestones.map((goal, idx, arr) => (
                                            <MilestoneItem
                                                key={`goal-${goal.id}`}
                                                milestone={{
                                                    id: goal.id,
                                                    age: goal.age,
                                                    title: goal.title,
                                                    description: goal.description || "Life goal milestone",
                                                    status: goal.progress === 100 ? "achieved" : goal.progress >= 50 ? "targeting" : "future"
                                                }}
                                                goal={goal}
                                                isLast={idx === arr.length - 1}
                                                onDelete={handleDeleteGoal}
                                                onEdit={() => handleEditGoal(goal)}
                                                onToggleSubGoal={handleToggleSubGoal}
                                                onPin={handlePinGoal}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No life milestones yet. Create one to get started!</p>
                                    );
                                })()}
                            </div>

                            <button
                                onClick={() => setIsTimelineModalOpen(true)}
                                className="w-full mt-2 flex items-center justify-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                                View Full Life Timeline
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </Card>

                        {/* Velocity Card */}
                        <Card className="p-6 bg-orange-50 border-orange-100">
                            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Milestone Velocity</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-900">2.4x</h3>
                                    <p className="text-xs text-gray-500 font-medium">Achievement rate vs. Peers</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
