/**
 * Onboarding Theme Component
 * 
 * Step 3: Select wallpaper theme/appearance
 * Shows three theme options with previews
 */

"use client";

import { CheckCircleIcon } from "@heroicons/react/20/solid";

const THEMES = [
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "Sleek and easy on the eyes",
    image: "🌙",
    colors: ["#1a1a1a", "#2d2d2d"],
    preview: "Minimal, dark aesthetic",
  },
  {
    id: "orange-glow",
    name: "Orange Glow",
    description: "Modern brand experience",
    image: "🧡",
    colors: ["#fff8f0", "#ff9500"],
    preview: "Warm, energetic feel",
  },
  {
    id: "white-clean",
    name: "White Clean",
    description: "Maximum clarity and focus",
    image: "⚪",
    colors: ["#ffffff", "#f5f5f5"],
    preview: "Bright, minimal design",
  },
];

export default function OnboardingTheme({
  formData,
  updateFormData,
  onNext,
  onBack,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 py-8 sm:px-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 mb-4">
          <span className="text-2xl">🎨</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Choose Your Theme
        </h1>
        <p className="text-orange-50 text-lg">
          Personalize your ConsistencyGrid experience. You can always change this later in settings.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-8 sm:px-8">
        {/* Theme cards */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {THEMES.map((theme) => {
            const isSelected = formData.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => updateFormData("theme", theme.id)}
                className={`relative overflow-hidden rounded-xl transition-all transform ${
                  isSelected
                    ? "ring-2 ring-orange-500 scale-105"
                    : "border-2 border-gray-200 hover:border-orange-300"
                }`}
              >
                {/* Preview area */}
                <div
                  className="relative h-48 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                  }}
                >
                  {/* Mockup preview */}
                  <div className="text-center">
                    <div className="text-6xl mb-4">{theme.image}</div>
                    <div className={`text-sm ${isSelected ? "text-orange-600" : "text-gray-600"}`}>
                      {theme.preview}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircleIcon className="w-7 h-7 text-orange-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 py-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {theme.name}
                  </h3>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            💡 <strong>Pro tip:</strong> Your chosen theme affects your wallpaper appearance across all your devices.
            The life calendar will update automatically every morning.
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
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
}
