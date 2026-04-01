import { X, ChevronRight } from "lucide-react";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export default function ViewFullLifeTimelineModal({ isOpen, onClose, milestones, onToggleSubGoal }) {
    const [expandedMilestones, setExpandedMilestones] = useState({});

    if (!isOpen) return null;

    const sortedMilestones = [...milestones].sort((a, b) => (a.age || 0) - (b.age || 0));

    const toggleExpanded = (milestoneId) => {
        setExpandedMilestones(prev => ({
            ...prev,
            [milestoneId]: !prev[milestoneId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Your Life Timeline</h2>
                        <p className="text-sm text-gray-500 mt-1">{milestones.length} life milestones</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="p-6">
                    {sortedMilestones.length > 0 ? (
                        <div className="space-y-6">
                            {sortedMilestones.map((milestone, idx, arr) => {
                                const isAchieved = milestone.status === "achieved";
                                const isTargeting = milestone.status === "targeting";
                                
                                return (
                                    <div key={milestone.id} className="relative pl-12">
                                        {/* Connector Line */}
                                        {idx !== arr.length - 1 && (
                                            <div className="absolute left-[23px] top-12 bottom-0 w-[2px] bg-gray-200" />
                                        )}

                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 top-1.5 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                                            isAchieved 
                                                ? "border-orange-500 bg-orange-50" 
                                                : isTargeting 
                                                ? "border-orange-400 bg-orange-50"
                                                : "border-gray-300 bg-gray-50"
                                        }`}>
                                            {isAchieved && (
                                                <CheckCircle2 className="w-6 h-6 text-orange-500 fill-orange-500" />
                                            )}
                                            {isTargeting && (
                                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            )}
                                            {!isAchieved && !isTargeting && (
                                                <div className="text-xs font-bold text-gray-500">{milestone.age}</div>
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100 rounded-lg p-5 hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-sm font-bold ${
                                                            isAchieved ? "text-orange-600" : "text-gray-600"
                                                        }`}>
                                                            Age {milestone.age}
                                                        </span>
                                                        {isAchieved && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                ✓ ACHIEVED
                                                            </span>
                                                        )}
                                                        {isTargeting && (
                                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                → TARGETING
                                                            </span>
                                                        )}
                                                        {!isAchieved && !isTargeting && (
                                                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                ◯ FUTURE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                                                </div>
                                            </div>
                                            
                                            {milestone.description && (
                                                <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                                            )}

                                            {/* Sub-goals Section */}
                                            {milestone.subGoals && milestone.subGoals.length > 0 && (
                                                <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                                                    <button
                                                        onClick={() => toggleExpanded(milestone.id)}
                                                        className="text-xs font-bold text-orange-600 hover:text-orange-700 mb-2 flex items-center gap-1"
                                                    >
                                                        <ChevronRight 
                                                            className={`w-3 h-3 transition-transform ${expandedMilestones[milestone.id] ? 'rotate-90' : ''}`}
                                                        />
                                                        {milestone.subGoals.filter(sg => sg.isCompleted).length}/{milestone.subGoals.length} Sub-goals
                                                    </button>
                                                    
                                                    {expandedMilestones[milestone.id] && (
                                                        <div className="space-y-2 mt-2">
                                                            {milestone.subGoals.map((subGoal) => (
                                                                <div key={subGoal.id} className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => onToggleSubGoal?.(milestone.id, subGoal.id)}
                                                                        className={`flex-shrink-0 transition-colors ${
                                                                            subGoal.isCompleted ? "text-orange-500" : "text-gray-300 hover:text-orange-400"
                                                                        }`}
                                                                    >
                                                                        {subGoal.isCompleted ? (
                                                                            <CheckCircle2 className="w-4 h-4 fill-current" />
                                                                        ) : (
                                                                            <Circle className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                    <span className={`text-xs ${
                                                                        subGoal.isCompleted ? "text-gray-400 line-through" : "text-gray-600"
                                                                    }`}>
                                                                        {subGoal.title}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${
                                                                isAchieved 
                                                                    ? "bg-green-500 w-full"
                                                                    : isTargeting
                                                                    ? "bg-orange-500"
                                                                    : "bg-gray-300"
                                                            }`}
                                                            style={{
                                                                width: !isAchieved && !isTargeting ? "0%" : undefined
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold ${
                                                    isAchieved ? "text-green-600" : "text-gray-500"
                                                }`}>
                                                    {milestone.progress || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎯</div>
                            <p className="text-gray-500 text-lg">No life milestones yet</p>
                            <p className="text-gray-400 text-sm mt-2">Start creating your life milestones to build your timeline</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t bg-gray-50 p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                    >
                        Close Timeline
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
