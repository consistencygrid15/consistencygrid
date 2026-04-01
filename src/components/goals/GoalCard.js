import { useState } from "react";
import { MoreHorizontal, CheckCircle2, Circle, Trash2, Edit2, Pin, PinOff } from "lucide-react";
import Card from "@/components/ui/Card";

/**
 * Goal Card Component
 * Displays individual goal with progress bar, sub-goals, and expandable details
 */
export default function GoalCard({ goal, onToggleSubGoal, onDelete, onEdit, onPin }) {
    const [showAllSubGoals, setShowAllSubGoals] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isPinned, setIsPinned] = useState(goal.isPinned || false);
    const completedSubGoals = goal.subGoals.length > 0 ? goal.subGoals.filter(sg => sg.isCompleted).length : 0;
    const subGoalProgress = goal.subGoals.length > 0 ? Math.round((completedSubGoals / goal.subGoals.length) * 100) : 0;
    const visibleSubGoals = showAllSubGoals ? goal.subGoals : goal.subGoals.slice(0, 2);
    const hiddenCount = Math.max(0, goal.subGoals.length - 2);

    const categoryStyles = {
        "Health": "bg-red-100 text-red-700",
        "Wealth": "bg-green-100 text-green-700",
        "Mind": "bg-purple-100 text-purple-700",
        "Work": "bg-blue-100 text-blue-700",
        "Life Milestone": "bg-yellow-100 text-yellow-700",
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete goal "${goal.title}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/goals?id=${goal.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                onDelete?.(goal.id);
            } else {
                console.error("Failed to delete goal");
                alert("Failed to delete goal. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting goal:", error);
            alert("Error deleting goal. Please try again.");
        }
    };

    const handlePin = async () => {
        try {
            const newPinStatus = !isPinned;
            const res = await fetch("/api/goals/pin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goalId: goal.id, isPinned: newPinStatus })
            });

            if (res.ok) {
                setIsPinned(newPinStatus);
                onPin?.(goal.id, newPinStatus);
            } else {
                console.error("Failed to update pin status");
                alert("Failed to pin goal. Please try again.");
            }
        } catch (error) {
            console.error("Error pinning goal:", error);
            alert("Error pinning goal. Please try again.");
        }
    };

    return (
        <Card className="p-4 sm:p-6 transition-all hover:shadow-md hover:border-orange-200 border-2 border-transparent h-full flex flex-col">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase ${categoryStyles[goal.category] || "bg-gray-100 text-gray-700"
                        }`}>
                        {goal.category}
                    </span>
                    <h3 className="mt-2.5 text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">{goal.title}</h3>

                    {/* Deadline info */}
                    {goal.targetDeadline && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            📅 Target: {new Date(goal.targetDeadline).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0 relative z-10">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50 touch-manipulation"
                        aria-label="Options"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => {
                                        handlePin();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-50"
                                >
                                    {isPinned ? (
                                        <>
                                            <PinOff className="w-4 h-4 text-blue-500" />
                                            <span>Unpin from Wallpaper</span>
                                        </>
                                    ) : (
                                        <>
                                            <Pin className="w-4 h-4" />
                                            <span>Pin to Wallpaper</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        onEdit?.(goal);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors border-b border-gray-50"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Goal</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleDelete();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Goal</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-500">Progress</span>
                    <span className="font-bold text-orange-600">{goal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${goal.progress}%` }}
                    />
                </div>
            </div>

            {/* Sub-goals Summary */}
            <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm">
                <div className="flex-1">
                    <span className="text-gray-600">
                        <span className="font-bold text-orange-600">{completedSubGoals}</span>
                        <span className="text-gray-400"> / {goal.subGoals.length} steps</span>
                    </span>
                </div>
                {subGoalProgress === 100 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wide">
                        ✓ Complete
                    </span>
                )}
            </div>

            {/* Sub-goals List */}
            <div className="mt-5 pt-4 border-t border-gray-50 flex-1">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Next Steps</p>
                <div className="space-y-3">
                    {visibleSubGoals.map((subGoal) => (
                        <div key={subGoal.id} className="flex items-start gap-3 group">
                            <button
                                onClick={() => onToggleSubGoal(goal.id, subGoal.id)}
                                className={`mt-0.5 flex-shrink-0 transition-all active:scale-90 ${subGoal.isCompleted ? "text-orange-500" : "text-gray-300 hover:text-orange-400"
                                    }`}
                            >
                                {subGoal.isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 fill-current" />
                                ) : (
                                    <Circle className="w-5 h-5" />
                                )}
                            </button>
                            <span className={`text-sm leading-snug transition-colors ${subGoal.isCompleted ? "text-gray-400 line-through" : "text-gray-600"
                                }`}>
                                {subGoal.title}
                            </span>
                        </div>
                    ))}

                    {visibleSubGoals.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No sub-goals added yet.</p>
                    )}
                </div>

                {/* Show more button */}
                {hiddenCount > 0 && (
                    <button
                        onClick={() => setShowAllSubGoals(!showAllSubGoals)}
                        className="mt-4 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1 group/btn"
                    >
                        {showAllSubGoals ? "Show less" : (
                            <>
                                <span>+{hiddenCount} more steps</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </Card>
    );
}
