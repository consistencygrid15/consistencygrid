import { CheckCircle2, Trash2, Edit2, Circle, Zap } from "lucide-react";
import { useState } from "react";

/**
 * Milestone Timeline Item Component
 * Displays a single milestone in the life timeline with status indicator and connector line
 */
export default function MilestoneItem({ milestone, isLast, onDelete, onEdit, goal, onToggleSubGoal, onPin }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSubGoals, setShowSubGoals] = useState(false);
    const isAchieved = milestone.status === "achieved";
    const isTargeting = milestone.status === "targeting";

    // Get sub-goals from full goal object if available
    const subGoals = goal?.subGoals || [];
    const completedSubGoals = subGoals.filter(sg => sg.isCompleted).length;

    const handleDelete = async () => {
        if (!window.confirm(`Delete milestone "${milestone.title}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/goals?id=${milestone.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                onDelete?.(milestone.id);
            } else {
                console.error("Failed to delete milestone");
                alert("Failed to delete milestone. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting milestone:", error);
            alert("Error deleting milestone. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePin = async () => {
        try {
            const newPinStatus = !goal.isPinned;
            const res = await fetch("/api/goals/pin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goalId: goal.id, isPinned: newPinStatus })
            });

            if (res.ok) {
                onPin?.(goal.id, newPinStatus);
            } else {
                console.error("Failed to update pin status");
                alert("Failed to pin milestone. Please try again.");
            }
        } catch (error) {
            console.error("Error pinning milestone:", error);
            alert("Error pinning milestone. Please try again.");
        }
    };

    return (
        <div className="relative pl-8 pb-8 group">
            {/* Connector Line */}
            {!isLast && (
                <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gray-100" />
            )}

            {/* Icon/Dot */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10 ${isAchieved ? "border-orange-500 bg-orange-500" :
                isTargeting ? "border-orange-500" :
                    "border-gray-200"
                }`}>
                {isAchieved ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isTargeting ? (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                ) : null}
            </div>

            {/* Content */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold ${isAchieved ? "text-orange-600" : "text-gray-500"
                            }`}>
                            Age {milestone.age}
                        </span>
                        {isAchieved && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">ACHIEVED</span>
                        )}
                        {isTargeting && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded">TARGETING</span>
                        )}
                    </div>
                    <h4 className="font-bold text-gray-900">{milestone.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>

                    {/* Sub-goals Section */}
                    {subGoals.length > 0 && (
                        <div className="mt-3">
                            <button
                                onClick={() => setShowSubGoals(!showSubGoals)}
                                className="text-xs font-bold text-orange-500 hover:text-orange-600 mb-2"
                            >
                                {showSubGoals ? "Hide" : "Show"} {completedSubGoals}/{subGoals.length} sub-goals
                            </button>

                            {showSubGoals && (
                                <div className="space-y-2 mt-2 pl-2 border-l-2 border-gray-200">
                                    {subGoals.map((subGoal) => (
                                        <div key={subGoal.id} className="flex items-center gap-2">
                                            <button
                                                onClick={() => onToggleSubGoal?.(goal.id, subGoal.id)}
                                                className={`flex-shrink-0 transition-colors ${subGoal.isCompleted ? "text-orange-500" : "text-gray-300 hover:text-orange-400"
                                                    }`}
                                            >
                                                {subGoal.isCompleted ? (
                                                    <CheckCircle2 className="w-4 h-4 fill-current" />
                                                ) : (
                                                    <Circle className="w-4 h-4" />
                                                )}
                                            </button>
                                            <span className={`text-xs ${subGoal.isCompleted ? "text-gray-400 line-through" : "text-gray-600"
                                                }`}>
                                                {subGoal.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handlePin}
                        className={`transition-colors ${goal.isPinned ? "text-orange-500" : "text-gray-300 hover:text-orange-400"}`}
                        title={goal.isPinned ? "Unpin from wallpaper" : "Pin to wallpaper"}
                    >
                        <Zap className={`w-4 h-4 ${goal.isPinned ? "fill-current" : ""}`} />
                    </button>
                    <button
                        onClick={() => onEdit?.(milestone)}
                        disabled={isDeleting}
                        className="text-gray-300 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit milestone"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete milestone"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
