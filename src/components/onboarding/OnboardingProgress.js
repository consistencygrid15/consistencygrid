/**
 * Onboarding Progress Component
 * 
 * Displays progress bar and step counter at the top of onboarding flow
 */

export default function OnboardingProgress({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`h-1 flex-1 rounded-full transition-colors ${
                num <= currentStep
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
