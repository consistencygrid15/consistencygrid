import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UpdateGoalModal({ isOpen, onClose, goal, onUpdate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [targetDeadline, setTargetDeadline] = useState("");
    const [age, setAge] = useState("");
    const [subGoals, setSubGoals] = useState([]);
    const [newSubGoal, setNewSubGoal] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const categories = ["Health", "Wealth", "Mind", "Work", "lifemilestone"];

    // Update form fields when goal changes
    useEffect(() => {
        if (goal) {
            setTitle(goal.title || "");
            setDescription(goal.description || "");
            setCategory(goal.category || "General");
            setTargetDeadline(
                goal.targetDeadline ? new Date(goal.targetDeadline).toISOString().split('T')[0] : ""
            );
            setAge(goal.age ? String(goal.age) : "");
            setSubGoals(goal.subGoals || []);
            setNewSubGoal("");
        }
    }, [goal, isOpen]);

    const handleAddSubGoal = () => {
        if (!newSubGoal.trim()) {
            toast.error("Sub-goal title cannot be empty");
            return;
        }

        const newSG = {
            id: `new-${Date.now()}`, // Temporary ID for new sub-goals
            title: newSubGoal.trim(),
            isCompleted: false
        };

        setSubGoals([...subGoals, newSG]);
        setNewSubGoal("");
    };

    const handleRemoveSubGoal = (subGoalId) => {
        setSubGoals(subGoals.filter(sg => sg.id !== subGoalId));
    };

    const handleToggleSubGoal = (subGoalId) => {
        setSubGoals(subGoals.map(sg =>
            sg.id === subGoalId ? { ...sg, isCompleted: !sg.isCompleted } : sg
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Goal title is required");
            return;
        }

        if (subGoals.length === 0) {
            toast.error("At least one sub-goal is required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/goals?id=${goal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    targetDeadline: targetDeadline || null,
                    age: age ? parseInt(age) : null,
                    subGoals: subGoals.map(sg => ({
                        id: sg.id,
                        title: sg.title,
                        isCompleted: sg.isCompleted || false
                    }))
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to update goal");
            }

            const updatedGoal = await res.json();
            toast.success("Goal updated successfully!");
            onUpdate(updatedGoal);
            onClose();
        } catch (error) {
            console.error("Error updating goal:", error);
            toast.error(error.message || "Failed to update goal");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
                    <h2 className="text-xl font-bold text-gray-900">Update Goal</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Goal Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter goal title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter goal description"
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === "lifemilestone" ? "Life Milestone" : cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Age (for Life Milestones) */}
                    {category === "lifemilestone" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Age
                            </label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Enter target age"
                                min="0"
                                max="150"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    )}

                    {/* Target Deadline */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Target Deadline
                        </label>
                        <input
                            type="date"
                            value={targetDeadline}
                            onChange={(e) => setTargetDeadline(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Sub-Goals Section */}
                    <div className="border-t pt-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Sub-Goals
                        </label>

                        {/* Existing Sub-Goals */}
                        <div className="space-y-2 mb-4">
                            {subGoals.map((sg) => (
                                <div key={sg.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group">
                                    <input
                                        type="checkbox"
                                        checked={sg.isCompleted}
                                        onChange={() => handleToggleSubGoal(sg.id)}
                                        className="w-4 h-4 text-orange-500 rounded cursor-pointer"
                                    />
                                    <span className={`flex-1 text-sm ${sg.isCompleted ? "line-through text-gray-400" : "text-gray-700"}`}>
                                        {sg.title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSubGoal(sg.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove sub-goal"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Sub-Goal */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubGoal}
                                onChange={(e) => setNewSubGoal(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddSubGoal();
                                    }
                                }}
                                placeholder="Add a new sub-goal..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleAddSubGoal}
                                className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                title="Add sub-goal"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Updating..." : "Update Goal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
