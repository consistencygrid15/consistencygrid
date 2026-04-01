"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const GOAL_CATEGORIES = [
  { id: "health", name: "Health", icon: "❤️", color: "from-red-50 to-red-100" },
  { id: "wealth", name: "Wealth", icon: "💰", color: "from-green-50 to-green-100" },
  { id: "mind", name: "Mind", icon: "🧠", color: "from-purple-50 to-purple-100" },
  { id: "work", name: "Work", icon: "💼", color: "from-blue-50 to-blue-100" },
  { id: "lifemilestone", name: "Life Milestone", icon: "🏆", color: "from-yellow-50 to-orange-100" },
];

export default function AddGoalModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "health",
    targetDeadline: "",
    description: "",
    age: "",
    subGoals: [{ id: 1, title: "" }],
  });

  const [subGoalId, setSubGoalId] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubGoalChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      subGoals: prev.subGoals.map(sg =>
        sg.id === id ? { ...sg, title: value } : sg
      )
    }));
  };

  const addSubGoal = () => {
    setFormData(prev => ({
      ...prev,
      subGoals: [...prev.subGoals, { id: subGoalId, title: "" }]
    }));
    setSubGoalId(subGoalId + 1);
  };

  const removeSubGoal = (id) => {
    if (formData.subGoals.length === 1) {
      toast.error("You must have at least one sub-goal");
      return;
    }
    setFormData(prev => ({
      ...prev,
      subGoals: prev.subGoals.filter(sg => sg.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.title.trim()) {
        toast.error("Please enter a goal name");
        setLoading(false);
        return;
      }

      if (!formData.targetDeadline) {
        toast.error("Please select a target deadline");
        setLoading(false);
        return;
      }

      if (formData.category === "lifemilestone" && !formData.age) {
        toast.error("Please enter target age for life milestone");
        setLoading(false);
        return;
      }

      if (formData.category === "lifemilestone") {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
          toast.error("Age must be between 18 and 120");
          setLoading(false);
          return;
        }
      }

      const filledSubGoals = formData.subGoals.filter(sg => sg.title.trim());
      if (filledSubGoals.length === 0) {
        toast.error("Please add at least one sub-goal");
        setLoading(false);
        return;
      }

      // Submit to API
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          targetDeadline: formData.targetDeadline,
          description: formData.description.trim(),
          age: formData.category === "lifemilestone" ? parseInt(formData.age) : null,
          subGoals: filledSubGoals.map(sg => ({
            title: sg.title.trim(),
            isCompleted: false
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create goal");
      }

      const newGoal = await response.json();
      toast.success("Goal created successfully!");
      onAdd(newGoal);

      // Reset form
      setFormData({
        title: "",
        category: "health",
        targetDeadline: "",
        description: "",
        age: "",
        subGoals: [{ id: 1, title: "" }],
      });
      setSubGoalId(2);
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = GOAL_CATEGORIES.find(c => c.id === formData.category);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create New Goal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <p className="mb-2">{error}</p>

              {/* Show upgrade button if limit reached */}
              {(error.includes("limit") || error.includes("plan")) && (
                <div className="mt-2">
                  <p className="text-xs text-red-500 mb-2">
                    Unlock unlimited goals with our Pro plan.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window === 'undefined') return;
                      try {
                        const isAndroid = typeof window !== 'undefined' &&
                          (localStorage.getItem('consistencygrid_platform') === 'android' ||
                            /webview|wv|android/i.test(navigator.userAgent));

                        if (isAndroid) {
                          window.open('https://consistencygrid.com/pricing', '_blank');
                        } else {
                          window.location.href = '/pricing';
                        }
                      } catch (error) {
                        console.error('[AddGoalModal] Navigation error:', error);
                      }
                    }}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 w-fit"
                  >
                    {typeof window !== 'undefined' && localStorage.getItem('consistencygrid_platform') === 'android'
                      ? "Continue on Website"
                      : "View Upgrade Options"}
                    <span className="text-xs">→</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Goal Name
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Run a Marathon, Learn Swift..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              disabled={loading}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Choose Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GOAL_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all ${formData.category === category.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300 bg-gray-50"
                    }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs font-bold text-gray-900">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Target Deadline
              </label>
              <input
                type="date"
                name="targetDeadline"
                value={formData.targetDeadline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>

            {/* Age Field (only for Life Milestone) */}
            {formData.category === "lifemilestone" && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Target Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g. 30"
                  min="18"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  disabled={loading}
                />
              </div>
            )}

            {/* Description (Optional) */}
            {formData.category !== "lifemilestone" && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Description for Life Milestone */}
          {formData.category === "lifemilestone" && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Milestone Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. Achieve financial independence..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>
          )}

          {/* Sub-Goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-900">
                Add Sub-Goals (Milestones)
              </label>
              <span className="text-xs text-gray-500">
                {formData.subGoals.filter(sg => sg.title.trim()).length} added
              </span>
            </div>

            <div className="space-y-2">
              {formData.subGoals.map((subGoal, index) => (
                <div key={subGoal.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={subGoal.title}
                      onChange={(e) => handleSubGoalChange(subGoal.id, e.target.value)}
                      placeholder={`Sub-goal ${index + 1}...`}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubGoal(subGoal.id)}
                    disabled={loading || formData.subGoals.length === 1}
                    className="mt-0.5 p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubGoal}
              disabled={loading}
              className="mt-3 flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Sub-Goal
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Goal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
