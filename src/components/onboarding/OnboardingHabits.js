/**
 * Onboarding Habits Component
 * 
 * Step 2: Select initial habits to track
 * Shows preset habits with icons and descriptions
 * Users can add custom habits or skip to next step
 */

"use client";

import { useState } from "react";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/20/solid";

const PRESET_HABITS = [
  {
    id: "meditate",
    title: "Meditate",
    description: "Focus your mind & breathe",
    emoji: "🧘",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "gym",
    title: "Gym",
    description: "Build strength & stamina",
    emoji: "🏋️",
    color: "from-red-400 to-red-600",
  },
  {
    id: "read",
    title: "Read",
    description: "Expand your knowledge",
    emoji: "📖",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "water",
    title: "Water",
    description: "Stay hydrated all day",
    emoji: "💧",
    color: "from-cyan-400 to-cyan-600",
  },
  {
    id: "walk",
    title: "Walk",
    description: "10,000 steps daily movement",
    emoji: "🚶",
    color: "from-green-400 to-green-600",
  },
  {
    id: "journal",
    title: "Journal",
    description: "Reflect on your daily progress",
    emoji: "📝",
    color: "from-yellow-400 to-yellow-600",
  },
];

export default function OnboardingHabits({
  formData,
  updateFormData,
  onNext,
  onBack,
  onSkip,
}) {
  const [customHabit, setCustomHabit] = useState("");

  const toggleHabit = (habitTitle) => {
    const habits = formData.habits || [];
    if (habits.includes(habitTitle)) {
      updateFormData("habits", habits.filter((h) => h !== habitTitle));
    } else {
      updateFormData("habits", [...habits, habitTitle]);
    }
  };

  const addCustomHabit = () => {
    if (customHabit.trim().length < 2) {
      return;
    }
    const habits = formData.habits || [];
    if (!habits.includes(customHabit.trim())) {
      updateFormData("habits", [...habits, customHabit.trim()]);
      setCustomHabit("");
    }
  };

  const removeHabit = (habitTitle) => {
    const habits = formData.habits || [];
    updateFormData("habits", habits.filter((h) => h !== habitTitle));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 py-8 sm:px-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Set Your First Habits
        </h1>
        <p className="text-orange-50 text-lg">
          Choose some common habits to get started. You can always add more or customize them later.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-8 sm:px-8">
        {/* Preset habits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PRESET_HABITS.map((habit) => {
            const isSelected = formData.habits?.includes(habit.title);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.title)}
                className={`relative overflow-hidden rounded-xl p-4 text-left transition-all transform ${
                  isSelected
                    ? "ring-2 ring-orange-500 scale-105"
                    : "border-2 border-gray-200 hover:border-orange-300"
                }`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${habit.color} opacity-0 transition-opacity ${
                    isSelected ? "opacity-10" : ""
                  }`}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{habit.emoji}</span>
                    {isSelected && (
                      <CheckCircleIcon className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {habit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{habit.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom habit input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Add custom habits
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Code, Yoga, Write..."
              value={customHabit}
              onChange={(e) => setCustomHabit(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addCustomHabit();
                }
              }}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={addCustomHabit}
              disabled={customHabit.trim().length < 2}
              className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected habits display */}
        {(formData.habits?.length || 0) > 0 && (
          <div className="mb-8 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Selected habits ({formData.habits.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.habits.map((habit) => (
                <button
                  key={habit}
                  onClick={() => removeHabit(habit)}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-orange-200 rounded-full text-sm text-gray-700 hover:border-orange-400 transition-colors"
                >
                  {habit}
                  <span className="text-orange-500 font-bold cursor-pointer hover:text-orange-600">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Start with 2-3 habits you're genuinely excited about. Quality over quantity helps you stay consistent!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onSkip}
            className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            disabled={(formData.habits?.length || 0) === 0}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
}
