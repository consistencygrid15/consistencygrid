/**
 * Onboarding Page
 * 
 * Multi-step onboarding flow for first-time users.
 * Guides users through:
 * 1. Personalization (name, birth date, life expectancy)
 * 2. Habit Selection (choose initial habits to track)
 * 3. Theme Selection (choose wallpaper appearance)
 * 4. Welcome & Completion
 * 
 * Features:
 * - Progress indicator showing current step
 * - Form validation with helpful error messages
 * - Smooth transitions between steps
 * - Keyboard navigation support
 * - Mobile-responsive design
 * - Auto-saves progress
 * - Exit confirmation to prevent accidental data loss
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import OnboardingPersonalize from "@/components/onboarding/OnboardingPersonalize";
import OnboardingHabits from "@/components/onboarding/OnboardingHabits";
import OnboardingTheme from "@/components/onboarding/OnboardingTheme";
import OnboardingWelcome from "@/components/onboarding/OnboardingWelcome";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [publicToken, setPublicToken] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    lifeExpectancyYears: 85,
    habits: [],
    theme: "dark-minimal",
  });

  // Detect if Android WebView
  const isAndroidWebView =
    typeof navigator !== 'undefined' &&
    navigator.userAgent.includes('ConsistencyGridApp');

  // Fetch publicToken once on mount (for Android users)
  useEffect(() => {
    if (isAndroidWebView) {
      console.log('[Onboarding] Retrieving publicToken for Android user');

      try {
        // First, explicitly check window.Android bridge which is 100% reliable on Android app
        const bridgeToken = typeof window !== 'undefined' && window.Android && typeof window.Android.getToken === 'function'
          ? window.Android.getToken()
          : null;

        if (bridgeToken) {
          console.log('[Onboarding] PublicToken found via window.Android bridge');
          setPublicToken(bridgeToken);
          return;
        }

        // Second, try to get from localStorage (set during signup)
        const storedToken = typeof window !== 'undefined'
          ? localStorage.getItem('publicToken')
          : null;

        if (storedToken) {
          console.log('[Onboarding] PublicToken found in localStorage');
          setPublicToken(storedToken);
          return;
        }

        console.log('[Onboarding] No token in localStorage, attempting to fetch from API');

        // Fallback: Try to fetch from API (might work if session exists)
        const fetchToken = async () => {
          try {
            const tokenRes = await fetch('/api/auth/get-token', { method: 'POST' });
            if (tokenRes.ok) {
              const tokenData = await tokenRes.json();
              if (tokenData?.data?.publicToken) {
                console.log('[Onboarding] PublicToken fetched from API');
                setPublicToken(tokenData.data.publicToken);
              }
            }
          } catch (e) {
            console.error('[Onboarding] Error fetching token from API:', e.message);
          }
        };
        fetchToken();
      } catch (e) {
        console.error('[Onboarding] Error retrieving publicToken:', e.message);
      }
    }
  }, [isAndroidWebView]);

  // Redirect if not authenticated — BUT skip for Android WebView users
  // because they authenticate via publicToken cookie, not NextAuth session.
  // useSession() returns 'unauthenticated' for them since there is no JWT cookie.
  useEffect(() => {
    if (status === "unauthenticated" && !isAndroidWebView) {
      router.push("/signup");
    }
  }, [status, router, isAndroidWebView]);

  // Check if already onboarded
  useEffect(() => {
    if (session?.user?.onboarded) {
      router.push("/dashboard");
    }
  }, [session?.user?.onboarded, router]);

  // Prevent navigation away during onboarding
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step < TOTAL_STEPS) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  /**
   * Handle next step - validates current step data
   */
  const handleNext = async () => {
    if (step === 1) {
      // Validate personalization
      if (!formData.name?.trim() || formData.name.trim().length < 2) {
        toast.error("Please enter your full name");
        return;
      }
      if (!formData.dob) {
        toast.error("Please enter your birth date");
        return;
      }
      if (!formData.lifeExpectancyYears || formData.lifeExpectancyYears < 40 || formData.lifeExpectancyYears > 120) {
        toast.error("Life expectancy must be between 40 and 120 years");
        return;
      }
    }

    if (step === 2) {
      // Validate at least one habit is selected
      if (formData.habits.length === 0) {
        toast.error("Please select at least one habit");
        return;
      }
    }

    if (step === 3) {
      // Validate theme selection
      if (!formData.theme) {
        toast.error("Please select a theme");
        return;
      }
    }

    if (step === 4) {
      // Final submission
      await handleComplete();
      return;
    }

    setStep(step + 1);
  };

  /**
   * Handle previous step
   */
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /**
   * Complete onboarding and save all data
   */
  const handleComplete = async () => {
    setLoading(true);
    try {
      console.log('[Onboarding] Completing onboarding, isAndroidWebView:', isAndroidWebView);

      // Prepare form data
      let requestBody = { ...formData };

      // For Android users, include the stored publicToken if available
      // Do NOT block if missing, because the backend httpOnly cookie will likely work!
      if (isAndroidWebView) {
        // Fallback check right when clicking the button
        let activeToken = publicToken;
        if (!activeToken && typeof window !== 'undefined' && window.Android && typeof window.Android.getToken === 'function') {
          activeToken = window.Android.getToken();
        }

        if (activeToken) {
          requestBody.publicToken = activeToken;
          console.log('[Onboarding] Using stored publicToken for completion');
        } else {
          console.warn('[Onboarding] publicToken not available on client, hoping httpOnly cookie works');
        }
      }

      console.log('[Onboarding] Sending completion request with body keys:', Object.keys(requestBody));

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log('[Onboarding] Completion response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete onboarding");
      }

      toast.success("Welcome! Redirecting to your dashboard...");

      // On Android WebView the JWT was minted at login time with onboarded:false.
      // If we navigate straight to /dashboard, the middleware reads the stale cookie
      // and bounces us back to /onboarding in an infinite loop.
      // Fix: go through /api/auth/webview-login again — it reads the DB (now onboarded:true)
      // and mints a fresh JWT before redirecting to /dashboard.
      if (isAndroidWebView) {
        console.log('[Onboarding] Redirecting Android user directly to dashboard');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        return;
      }

      // Standard web redirect — middleware will pick up the updated session via
      // the JWT callback which re-reads onboarded from DB on the next request.
      console.log('[Onboarding] Redirecting to dashboard');
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  /**
   * Handle form field changes
   */
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkipHabits = () => {
    setFormData((prev) => ({
      ...prev,
      habits: [], // Skip habits selection
    }));
    setStep(3);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Toaster position="top-center" />

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Progress bar */}
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        {/* Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            {/* Step 1: Personalization */}
            {step === 1 && (
              <OnboardingPersonalize
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
              />
            )}

            {/* Step 2: Habits */}
            {step === 2 && (
              <OnboardingHabits
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkipHabits}
              />
            )}

            {/* Step 3: Theme */}
            {step === 3 && (
              <OnboardingTheme
                formData={formData}
                updateFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 4: Welcome */}
            {step === 4 && (
              <OnboardingWelcome
                formData={formData}
                onBack={handleBack}
                onComplete={handleComplete}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
