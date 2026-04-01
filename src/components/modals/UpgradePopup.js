"use client";

import { X, Lock, Zap, Star, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { isAndroidApp, getUpgradeUrl } from "@/lib/platform-utils";

/**
 * Shared hook: detects Android platform client-side only (safe for SSR)
 */
function usePlatform() {
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    setIsAndroid(isAndroidApp());
  }, []);
  return isAndroid;
}

/**
 * Shared CTA button:
 * - Android: opens external browser (Play Store compliant, no in-app purchase)
 * - Web: navigates to /pricing internally
 */
function UpgradeCTA({ isAndroid, label = "View Plans", className = "" }) {
  const handleClick = () => {
    if (typeof window === 'undefined') return;
    try {
      if (isAndroid) {
        window.open(getUpgradeUrl(), "_blank", "noopener,noreferrer");
      } else {
        window.location.href = "/pricing";
      }
    } catch (error) {
      console.error('[UpgradeCTA] Navigation error:', error);
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {isAndroid ? "Continue on Website ↗" : label}
    </button>
  );
}

/**
 * HabitLimitPopup - Shows when user tries to add 4th habit on free plan
 */
export function HabitLimitPopup({ isOpen, onClose, currentCount = 3, maxFreeLimit = 3 }) {
  const isAndroid = usePlatform();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Habit Limit Reached</h2>
          <p className="text-gray-600 mb-6">
            You've reached the limit of {maxFreeLimit} habits on the Free plan. Upgrade to Pro to
            create unlimited habits and really transform your life.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 py-4 border-y border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{maxFreeLimit}</div>
              <div className="text-xs text-gray-600">Free plan limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">∞</div>
              <div className="text-xs text-gray-600">Pro plan limit</div>
            </div>
          </div>

          <div className="text-left mb-8 space-y-2">
            {[
              "Unlimited habits & goals",
              "Full history access",
              "Advanced analytics & AI suggestions",
              "Priority support",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          {/* Pricing block — hidden on Android (Play Store policy) */}
          {!isAndroid && (
            <div className="mb-8 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹99</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-600">or ₹499/year (save 59%)</p>
              <p className="text-xs font-semibold text-green-600 mt-2">
                🚀 Launch offer: ₹299/year for first 1000 users
              </p>
            </div>
          )}

          <div className="space-y-3 pb-6">
            <UpgradeCTA
              isAndroid={isAndroid}
              label="View Plans"
              className="block w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 text-center hover:shadow-lg transition-all duration-200 active:scale-95"
            />
            <button
              onClick={onClose}
              className="w-full rounded-xl border-2 border-gray-200 text-gray-700 font-bold py-3 hover:border-gray-300 transition-colors"
            >
              Keep Free Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HistoryLimitPopup - Shows when free user tries to view history beyond 7 days
 */
export function HistoryLimitPopup({ isOpen, onClose, requestedDaysBack = 30 }) {
  const isAndroid = usePlatform();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-50">
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">History Access Limited</h2>
          <p className="text-gray-600 mb-6">
            You can view the last 7 days on the Free plan. Upgrade to Pro to access your complete
            history and see long-term trends in your progress.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 py-4 border-y border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">7</div>
              <div className="text-xs text-gray-600">days available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">All</div>
              <div className="text-xs text-gray-600">with Pro</div>
            </div>
          </div>

          <div className="text-left mb-8 space-y-2">
            {[
              "View entire habit history",
              "See long-term trends & patterns",
              "Export full data for analysis",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          {/* Pricing block — hidden on Android (Play Store policy) */}
          {!isAndroid && (
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹99</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-600">or ₹499/year (save 59%)</p>
            </div>
          )}

          <div className="space-y-3 pb-6">
            <UpgradeCTA
              isAndroid={isAndroid}
              label="Upgrade to Pro"
              className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 text-center hover:shadow-lg transition-all duration-200 active:scale-95"
            />
            <button
              onClick={onClose}
              className="w-full rounded-xl border-2 border-gray-200 text-gray-700 font-bold py-3 hover:border-gray-300 transition-colors"
            >
              View 7-Day History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AnalyticsLockPopup - Shows when free user tries to access advanced analytics
 */
export function AnalyticsLockPopup({ isOpen, onClose }) {
  const isAndroid = usePlatform();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-50">
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
          <p className="text-gray-600 mb-6">
            Unlock detailed insights, AI-powered suggestions, and predictive analytics to optimize
            your habit formation and achieve your goals faster.
          </p>

          <div className="text-left mb-8 space-y-2">
            {[
              "Completion rate trends",
              "AI-powered habit suggestions",
              "Predictive success scores",
              "Personalized improvement tips",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          {/* Pricing block — hidden on Android (Play Store policy) */}
          {!isAndroid && (
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹99</span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-600">or ₹499/year (save 59%)</p>
            </div>
          )}

          <div className="space-y-3 pb-6">
            <UpgradeCTA
              isAndroid={isAndroid}
              label="Unlock Analytics"
              className="block w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 text-center hover:shadow-lg transition-all duration-200 active:scale-95"
            />
            <button
              onClick={onClose}
              className="w-full rounded-xl border-2 border-gray-200 text-gray-700 font-bold py-3 hover:border-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TrialInvitationPopup - Shows day 3-7 users to invite them to 14-day free trial
 */
export function TrialInvitationPopup({ isOpen, onClose, daysActive = 5 }) {
  const isAndroid = usePlatform();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 relative">
            <Star className="w-8 h-8 text-green-500" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Building Great Habits!</h2>
          <p className="text-gray-600 mb-4">
            You've been consistently using ConsistencyGrid for {daysActive} days. Try Pro free for
            14 days and experience the full power.
          </p>

          <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-sm font-bold text-gray-900 mb-3">14-Day Free Trial Includes:</p>
            <ul className="text-left space-y-2">
              {[
                "Unlimited habits & goals",
                "Full history access",
                "Advanced analytics & AI suggestions",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing note — hidden on Android (Play Store policy) */}
          {!isAndroid && (
            <div className="mb-8 text-center">
              <p className="text-xs text-gray-500 mb-3">
                ✓ No credit card required • ✓ Cancel anytime • ✓ Get 40% off if you continue
              </p>
              <div className="text-sm font-semibold text-orange-600">
                Launch offer: ₹299/year for the first 1000 users
              </div>
            </div>
          )}

          <div className="space-y-3 pb-6">
            <UpgradeCTA
              isAndroid={isAndroid}
              label="Start Free Trial"
              className="block w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 text-center hover:shadow-lg transition-all duration-200 active:scale-95"
            />
            <button
              onClick={onClose}
              className="w-full rounded-xl border-2 border-gray-200 text-gray-700 font-bold py-3 hover:border-gray-300 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Upgrade Popup component (catch-all)
 */
export default function UpgradePopup({ isOpen, onClose, type = "habit-limit", ...props }) {
  const popupProps = { isOpen, onClose, ...props };

  switch (type) {
    case "habit-limit":
      return <HabitLimitPopup {...popupProps} />;
    case "history-limit":
      return <HistoryLimitPopup {...popupProps} />;
    case "analytics":
      return <AnalyticsLockPopup {...popupProps} />;
    case "trial-invitation":
      return <TrialInvitationPopup {...popupProps} />;
    default:
      return null;
  }
}
