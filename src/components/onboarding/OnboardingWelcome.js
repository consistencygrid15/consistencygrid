/**
 * Onboarding Welcome Component
 * 
 * Step 4: Final welcome screen and completion
 * Shows a summary of selected settings and welcome message
 */

"use client";

import { CheckIcon } from "@heroicons/react/20/solid";

export default function OnboardingWelcome({
  formData,
  onBack,
  onComplete,
  loading,
}) {
  const getThemeName = (themeId) => {
    const themes = {
      "dark-minimal": "Dark Minimal",
      "orange-glow": "Orange Glow",
      "white-clean": "White Clean",
    };
    return themes[themeId] || themeId;
  };

  const calculateAge = () => {
    if (!formData.dob) return null;
    const today = new Date();
    const birthDate = new Date(formData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateWeeks = () => {
    if (!formData.dob) return null;
    const birthDate = new Date(formData.dob);
    const now = new Date();
    return Math.floor((now - birthDate) / (1000 * 60 * 60 * 24 * 7));
  };

  const age = calculateAge();
  const weeksLived = calculateWeeks();
  const totalWeeks = formData.lifeExpectancyYears * 52;
  const weeksRemaining = weeksLived ? totalWeeks - weeksLived : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 py-8 sm:px-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to ConsistencyGrid
        </h1>
        <p className="text-orange-50 text-lg">
          Your personalized life calendar is ready. Let's make every week count.
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-8 sm:px-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Profile card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">👤</div>
              <h3 className="font-semibold text-gray-900">Your Profile</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>
                  <strong>{formData.name}</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>
                  Age: <strong>{age} years old</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>
                  Life expectancy: <strong>{formData.lifeExpectancyYears} years</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Life calendar card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">📅</div>
              <h3 className="font-semibold text-gray-900">Your Calendar</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>
                  <strong>{weeksLived?.toLocaleString()}</strong> weeks lived
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>
                  <strong>{weeksRemaining?.toLocaleString()}</strong> weeks remaining
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <span>
                  Total: <strong>{totalWeeks.toLocaleString()}</strong> weeks
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Habits section */}
        {formData.habits.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🎯</div>
              <h3 className="font-semibold text-gray-900">Your Habits</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.habits.map((habit) => (
                <span
                  key={habit}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-gray-700 font-medium"
                >
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  {habit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Theme section */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🎨</div>
            <h3 className="font-semibold text-gray-900">Your Theme</h3>
          </div>
          <p className="text-gray-700 font-medium">{getThemeName(formData.theme)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Your wallpaper will be generated with this theme. You can change it anytime in settings.
          </p>
        </div>

        {/* Next steps info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What's next?</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-6">1.</span>
              <span>
                Your wallpaper will be generated and ready to download
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-6">2.</span>
              <span>
                Set it as your lock screen to see your life calendar every day
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-6">3.</span>
              <span>
                Log your habit completions to track your consistency
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-6">4.</span>
              <span>
                Watch your grid update daily as a visual reminder to stay consistent
              </span>
            </li>
          </ol>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onComplete}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Setting up...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                Go to Dashboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
