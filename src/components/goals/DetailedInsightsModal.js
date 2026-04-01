import { X, TrendingUp, CheckCircle2, Circle, Target, Zap } from "lucide-react";
import { useState } from "react";

export default function DetailedInsightsModal({ isOpen, onClose, goals }) {
    const [selectedTab, setSelectedTab] = useState("overview");

    if (!isOpen) return null;

    // Separate and categorize goals
    const lifeMilestones = goals.filter(goal => goal.category?.toLowerCase() === "lifemilestone");
    const regularGoals = goals.filter(goal => goal.category?.toLowerCase() !== "lifemilestone");
    
    // Calculate stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.isCompleted).length;
    const completedMilestones = lifeMilestones.filter(goal => goal.isCompleted).length;
    const totalSubGoals = goals.reduce((acc, goal) => acc + (goal.subGoals?.length || 0), 0);
    const completedSubGoals = goals.reduce((acc, goal) => {
        const completed = goal.subGoals?.filter(sg => sg.isCompleted).length || 0;
        return acc + completed;
    }, 0);

    // Category breakdown
    const categoryBreakdown = regularGoals.reduce((acc, goal) => {
        const cat = goal.category || "General";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    // Calculate average progress
    const avgProgress = goals.length > 0 
        ? Math.round(goals.reduce((acc, goal) => acc + (goal.progress || 0), 0) / goals.length)
        : 0;

    // Get progress percentage for each goal
    const getGoalProgress = (goal) => {
        if (goal.subGoals && goal.subGoals.length > 0) {
            const completed = goal.subGoals.filter(sg => sg.isCompleted).length;
            return Math.round((completed / goal.subGoals.length) * 100);
        }
        return goal.progress || 0;
    };

    // Render Overview Tab
    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Goals</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{totalGoals}</p>
                    <p className="text-xs text-blue-600 mt-2">All goals</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{completedGoals}</p>
                    <p className="text-xs text-green-600 mt-2">{totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% complete</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Sub-goals</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{completedSubGoals}/{totalSubGoals}</p>
                    <p className="text-xs text-orange-600 mt-2">{totalSubGoals > 0 ? Math.round((completedSubGoals / totalSubGoals) * 100) : 0}% complete</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Avg Progress</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{avgProgress}%</p>
                    <p className="text-xs text-purple-600 mt-2">Average across all</p>
                </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(categoryBreakdown).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Goal Categories</h3>
                    <div className="space-y-2">
                        {Object.entries(categoryBreakdown).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{category}</span>
                                <span className="inline-flex items-center gap-2">
                                    <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-orange-500"
                                            style={{ width: `${(count / regularGoals.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 w-8">{count}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Life Milestones Summary */}
            {lifeMilestones.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Life Milestones</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Milestones</span>
                            <span className="text-sm font-bold text-gray-900">{lifeMilestones.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-bold text-green-600">{completedMilestones}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">In Progress</span>
                            <span className="text-sm font-bold text-orange-600">{lifeMilestones.length - completedMilestones}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render Life Milestones Tab
    const renderMilestones = () => (
        <div className="space-y-4">
            {lifeMilestones.length > 0 ? (
                lifeMilestones.map((milestone) => {
                    const progress = getGoalProgress(milestone);
                    const subGoalsCompleted = milestone.subGoals?.filter(sg => sg.isCompleted).length || 0;
                    const totalSubs = milestone.subGoals?.length || 0;

                    return (
                        <div key={milestone.id} className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900">{milestone.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Age {milestone.age}</p>
                                </div>
                                {milestone.isCompleted ? (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">✓ Achieved</span>
                                ) : (
                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">→ Targeting</span>
                                )}
                            </div>

                            {milestone.description && (
                                <p className="text-xs text-gray-600 mb-3">{milestone.description}</p>
                            )}

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-600">Overall Progress</span>
                                    <span className="text-xs font-bold text-gray-900">{progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sub-goals Summary */}
                            {totalSubs > 0 && (
                                <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                                    <p className="font-semibold mb-2">{subGoalsCompleted}/{totalSubs} Sub-goals completed</p>
                                    <div className="space-y-1">
                                        {milestone.subGoals.map((sg) => (
                                            <div key={sg.id} className="flex items-center gap-2">
                                                {sg.isCompleted ? (
                                                    <CheckCircle2 className="w-3 h-3 text-purple-500 fill-purple-500" />
                                                ) : (
                                                    <Circle className="w-3 h-3 text-gray-300" />
                                                )}
                                                <span className={sg.isCompleted ? "line-through text-gray-400" : "text-gray-600"}>{sg.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No life milestones yet</p>
                </div>
            )}
        </div>
    );

    // Render Goals Tab
    const renderGoals = () => (
        <div className="space-y-4">
            {regularGoals.length > 0 ? (
                regularGoals.map((goal) => {
                    const progress = getGoalProgress(goal);
                    const subGoalsCompleted = goal.subGoals?.filter(sg => sg.isCompleted).length || 0;
                    const totalSubs = goal.subGoals?.length || 0;

                    return (
                        <div key={goal.id} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900">{goal.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{goal.category}</p>
                                </div>
                                {goal.isCompleted ? (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">✓ Done</span>
                                ) : (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">→ Active</span>
                                )}
                            </div>

                            {goal.description && (
                                <p className="text-xs text-gray-600 mb-3">{goal.description}</p>
                            )}

                            {/* Progress Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-600">Progress</span>
                                    <span className="text-xs font-bold text-gray-900">{progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sub-goals Summary */}
                            {totalSubs > 0 && (
                                <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                                    <p className="font-semibold mb-2">{subGoalsCompleted}/{totalSubs} Sub-goals completed</p>
                                    <div className="space-y-1">
                                        {goal.subGoals.map((sg) => (
                                            <div key={sg.id} className="flex items-center gap-2">
                                                {sg.isCompleted ? (
                                                    <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" />
                                                ) : (
                                                    <Circle className="w-3 h-3 text-gray-300" />
                                                )}
                                                <span className={sg.isCompleted ? "line-through text-gray-400" : "text-gray-600"}>{sg.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {goal.targetDeadline && (
                                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                    Due: {new Date(goal.targetDeadline).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No regular goals yet</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Detailed Insights</h2>
                        <p className="text-sm text-gray-500 mt-1">Your complete progress analytics</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50 px-6">
                    <button
                        onClick={() => setSelectedTab("overview")}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            selectedTab === "overview"
                                ? "text-orange-600 border-orange-600"
                                : "text-gray-600 border-transparent hover:text-gray-900"
                        }`}
                    >
                        Overview
                    </button>
                    {lifeMilestones.length > 0 && (
                        <button
                            onClick={() => setSelectedTab("milestones")}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                selectedTab === "milestones"
                                    ? "text-orange-600 border-orange-600"
                                    : "text-gray-600 border-transparent hover:text-gray-900"
                            }`}
                        >
                            Life Milestones ({lifeMilestones.length})
                        </button>
                    )}
                    {regularGoals.length > 0 && (
                        <button
                            onClick={() => setSelectedTab("goals")}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                selectedTab === "goals"
                                    ? "text-orange-600 border-orange-600"
                                    : "text-gray-600 border-transparent hover:text-gray-900"
                            }`}
                        >
                            Goals ({regularGoals.length})
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedTab === "overview" && renderOverview()}
                    {selectedTab === "milestones" && renderMilestones()}
                    {selectedTab === "goals" && renderGoals()}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t bg-gray-50 p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                    >
                        Close Insights
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
