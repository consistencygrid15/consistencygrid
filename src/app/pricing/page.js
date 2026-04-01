"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import PaymentCheckout from "@/components/payment/PaymentCheckout";
import { Check, Zap, Crown, Building2, ArrowRight, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { shouldShowPaymentUI, getPlatformMessages, getUpgradeUrl } from "@/lib/platform-utils";

import { useSearchParams, useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showPaymentUI, setShowPaymentUI] = useState(true); // Default to true for SSR
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  // Handle Auto-Login from Android App
  useEffect(() => {
    const token = searchParams.get('token');

    if (token && status === 'unauthenticated' && !isAutoLoggingIn) {
      console.log('Auto-logging in with token...');
      setIsAutoLoggingIn(true);

      signIn('token-login', {
        token,
        redirect: false,
        callbackUrl: '/pricing'
      }).then((result) => {
        if (result?.error) {
          console.error('Auto-login failed:', result.error);
          setIsAutoLoggingIn(false);
        } else {
          console.log('Auto-login successful!');
          // Refresh page state to update session
          window.location.reload();
        }
      });
    }
  }, [searchParams, status, isAutoLoggingIn]);

  // Detect platform on client side
  useEffect(() => {
    setShowPaymentUI(shouldShowPaymentUI());
  }, []);

  // Fetch user's current subscription
  useEffect(() => {
    if (session) {
      fetch('/api/payment/subscription')
        .then(res => res.json())
        .then(data => {
          setCurrentPlan(data.subscription.plan || 'free');
          setSubscriptionStatus(data.subscription.status);
        })
        .catch(err => console.error('Failed to fetch subscription:', err));
    }
  }, [session]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated' && !searchParams.get('token')) {
      router.push('/login?callbackUrl=/pricing');
    }
  }, [status, searchParams, router]);

  const pricingPlans = [
    {
      planId: "free",
      name: "Free",
      icon: Zap,
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started with life calendar tracking",
      popular: false,
      features: [
        "Life calendar wallpaper generation",
        "Habit tracking (up to 3 habits)",
        "Goal setting (up to 3 goals)",
        "Streak tracking & heatmap",
        "Basic analytics",
        "7-day history view",
        "Community support",
      ],
      limitations: [
        "Limited to 3 habits",
        "Limited to 3 goals",
        "7-day history only",
        "No AI suggestions",
        "Basic themes only",
      ],
      cta: "Get Started Free",
      ctaVariant: "secondary",
    },
    {
      planId: "pro_monthly",
      name: "Pro Monthly",
      icon: Crown,
      price: "₹99",
      period: "per month",
      description: "For serious habit trackers and goal achievers",
      popular: false,
      features: [
        "Everything in Free",
        "Unlimited habits & goals",
        "Full history access",
        "Advanced analytics & insights",
        "AI-powered suggestions",
        "All premium themes",
        "Custom wallpaper resolutions",
        "Reminder system",
        "Calendar view",
        "Export data (JSON, CSV)",
        "Priority support",
        "Early access to new features",
      ],
      limitations: [],
      cta: "Start 14-day Trial",
      ctaVariant: "secondary",
      badge: "14-day free trial",
    },
    {
      planId: "pro_yearly",
      name: "Pro Yearly",
      icon: Crown,
      price: "₹499",
      period: "per year",
      description: "Best value - Save 59% vs monthly",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited habits & goals",
        "Full history access",
        "Advanced analytics & insights",
        "AI-powered suggestions",
        "All premium themes",
        "Custom wallpaper resolutions",
        "Reminder system",
        "Calendar view",
        "Export data (JSON, CSV)",
        "Priority support",
        "Early access to new features",
        "Lifetime access to current features",
      ],
      limitations: [],
      cta: "Get Pro Yearly",
      ctaVariant: "primary",
      badge: "Most Popular",
      launchOffer: {
        enabled: true,
        price: "₹299",
        limit: "First 1000 users",
        savings: "Save 40% off annual"
      }
    },
    {
      planId: "testing_plan",
      name: "Testing Plan",
      icon: Building2,
      price: "₹1",
      period: "one-time",
      description: "Full feature access for testing purposes",
      popular: false,
      features: [
        "Everything in Pro Yearly",
        "Full unrestricted access",
        "Test all premium features",
        "Priority support",
        "Advanced analytics & AI",
        "All themes unlocked",
        "Custom wallpaper backgrounds",
      ],
      limitations: [],
      cta: "Get Testing Access",
      ctaVariant: "secondary",
      badge: "Testing Only",
    },
  ];

  // Helper function for Get Started button
  const handleGetStarted = () => {
    if (session) {
      window.location.href = '/dashboard';
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  if (status === 'loading' || (status === 'unauthenticated' && !searchParams.get('token')) || isAutoLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Android App: Show different UI without pricing
  if (!showPaymentUI) {
    const messages = getPlatformMessages();
    const upgradeUrl = getUpgradeUrl();

    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white">
        <Navbar
          rightLinkText={session ? `Hi, ${session.user?.name || (session.user?.email && session.user.email.split('@')[0]) || 'User'}` : "Log in"}
          rightLinkHref={session ? "/dashboard" : "/login"}
        />

        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                <Zap className="w-4 h-4" />
                Account Features
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Additional{" "}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Features
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
              Visit our website to manage your account and access additional features.
            </p>

            {/* Upgrade Button */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <button
                onClick={() => window.open(upgradeUrl, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                {messages.upgradeButton}
                <ExternalLink className="w-5 h-5" />
              </button>

              <p className="text-sm text-gray-500">
                Opens in your browser
              </p>
            </div>

            {/* Already Subscribed Info */}
            <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-200 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 mb-1">Already a member?</h3>
                  <p className="text-sm text-gray-600">
                    {messages.alreadySubscribed}
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Features List */}
            <div className="mt-16 p-8 bg-white rounded-2xl border border-gray-200 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Features:</h3>
              <ul className="space-y-3 text-left">
                {[
                  "Unlimited habits & goals",
                  "Full history access",
                  "Advanced analytics & insights",
                  "AI-powered suggestions",
                  "All premium themes",
                  "Custom wallpaper resolutions",
                  "Reminder system",
                  "Export data (JSON, CSV)",
                  "Priority support"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ConsistencyGrid. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    );
  }

  // Web Platform: Full pricing page with payment options
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white">
      <Navbar
        rightLinkText={session ? `Hi, ${session.user?.name || (session.user?.email && session.user.email.split('@')[0]) || 'User'}` : "Log in"}
        rightLinkHref={session ? "/dashboard" : "/login"}
      />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-orange-700">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Flexible Plans for Every Goal</span>
              <span className="sm:hidden">Flexible Plans</span>
            </span>
          </div>

          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight px-0 xs:px-2">
            Transparent{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-3xl text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-2 sm:px-0">
            Choose the perfect plan to track your life and build unstoppable consistency. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 auto-rows-max">
          {pricingPlans.map((plan, idx) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.name}
                className={`group relative rounded-2xl transition-all duration-300 ${isPopular
                  ? "lg:col-span-1 lg:row-span-1 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border-2 border-orange-300 shadow-2xl hover:shadow-2xl lg:scale-105 lg:z-10"
                  : "bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300"
                  }`}
              >
                {/* Badge */}
                {(isPopular || plan.badge) && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 ${isPopular ? "" : ""}`}>
                    <div className={`flex items-center gap-1 rounded-full px-4 py-1.5 shadow-lg ${isPopular
                      ? "bg-gradient-to-r from-orange-500 to-orange-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}>
                      <Zap className="w-4 h-4 text-white fill-white" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">{plan.badge || plan.name}</span>
                    </div>
                  </div>
                )}

                {/* Launch Offer Banner */}
                {plan.launchOffer?.enabled && (
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-t-2xl text-center">
                    <p className="text-xs font-bold uppercase tracking-widest">🚀 Launch Offer</p>
                    <p className="text-sm font-bold mt-1">{plan.launchOffer.price} - {plan.launchOffer.limit}</p>
                    <p className="text-xs text-green-100">{plan.launchOffer.savings}</p>
                  </div>
                )}

                <div className="p-6 sm:p-8 md:p-10 h-full flex flex-col">
                  {/* Icon & Header */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center justify-center p-3 rounded-xl mb-4 ${isPopular
                        ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg"
                        : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 group-hover:from-orange-100 group-hover:to-orange-50 group-hover:text-orange-600 transition-colors"
                        }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl sm:text-6xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.price !== "Custom" && !plan.price.includes("Custom") && (
                        <span className="text-gray-600 font-semibold text-sm">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    {plan.savings && (
                      <p className="mt-3 text-sm font-semibold text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {plan.savings}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mb-8">
                    {plan.planId === 'free' ? (
                      <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn whitespace-nowrap min-h-12 border-2 border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-orange-300 active:bg-gray-100"
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ) : currentPlan === plan.planId ? (
                      <button
                        disabled
                        className="w-full rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap min-h-12 bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        Current Plan
                      </button>
                    ) : (
                      <PaymentCheckout
                        planId={plan.planId}
                        planName={plan.name}
                        amount={plan.launchOffer?.enabled ? parseInt(plan.launchOffer.price.replace('₹', '')) : parseInt(plan.price.replace('₹', '').replace(',', ''))}
                      />
                    )}
                  </div>

                  {/* Features List */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 text-gray-700">
                        What's included
                      </p>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 mt-0.5 ${isPopular ? "text-orange-500" : "text-green-500"}`}>
                              <Check className="w-5 h-5 font-bold" />
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 text-gray-600">
                          Limitations
                        </p>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-lg leading-none">
                                ×
                              </span>
                              <span className="text-sm text-gray-600">
                                {limitation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our plans and pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="group rounded-2xl bg-white p-6 sm:p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
              <span className="text-orange-500 font-bold text-xl flex-shrink-0">Q</span>
              Can I change plans later?
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we'll prorate any charges.
            </p>
          </div>

          <div className="group rounded-2xl bg-white p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
              <span className="text-orange-500 font-bold text-xl flex-shrink-0">Q</span>
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay via invoice.
            </p>
          </div>

          <div className="group rounded-2xl bg-white p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
              <span className="text-orange-500 font-bold text-xl flex-shrink-0">Q</span>
              Is there a free trial for Pro?
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Yes! All new Pro subscriptions come with a 14-day free trial. No credit card required to start. Cancel anytime during the trial.
            </p>
          </div>

          <div className="group rounded-2xl bg-white p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
              <span className="text-orange-500 font-bold text-xl flex-shrink-0">Q</span>
              What happens if I exceed plan limits?
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              We'll notify you when approaching your limits. You can upgrade to Pro at any time to unlock unlimited features.
            </p>
          </div>

          <div className="group rounded-2xl bg-white p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
              <span className="text-orange-500 font-bold text-xl flex-shrink-0">Q</span>
              Do you offer refunds?
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.
            </p>
          </div>

          <div className="group rounded-2xl bg-white p-8 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
              <span className="text-orange-500 font-bold text-xl flex-shrink-0">Q</span>
              Can I use ConsistencyGrid for my team?
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Absolutely! Our Enterprise plan is perfect for teams. Contact our sales team to discuss custom pricing and features.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-550 to-orange-600 p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-white/10 rounded-full -mr-40 sm:-mr-48 -mt-40 sm:-mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-white/10 rounded-full -ml-40 sm:-ml-48 -mb-40 sm:-mb-48 blur-3xl" />

          <div className="relative z-10 text-center">
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight px-2 xs:px-4">
              Ready to Build Unstoppable Consistency?
            </h2>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-orange-50 mb-8 leading-relaxed">
              Join thousands of users tracking their progress and making every week count. Start free today, no credit card required.
            </p>

            <div className="flex flex-col xs:flex-col sm:flex-row items-stretch xs:items-center sm:items-center justify-center gap-3 sm:gap-6">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto rounded-xl bg-white text-orange-600 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                Get Started Free
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl border-2 border-white/40 bg-transparent hover:bg-white/10 hover:border-white text-white px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 group backdrop-blur-sm whitespace-nowrap"
              >
                View Dashboard
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-10 sm:mb-12 md:mb-16">
            <div className="xs:col-span-2 lg:col-span-1 lg:xs:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600" />
                <span className="text-xl font-bold text-gray-900">ConsistencyGrid</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track your life progress and build unstoppable consistency with beautiful wallpaper calendars.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs xs:text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-2 text-xs xs:text-sm">
                <li><Link href="/pricing" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Pricing</Link></li>
                <li><Link href="/generator" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Generator</Link></li>
                <li><Link href="/habits" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Habits</Link></li>
                <li><Link href="/goals" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Goals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs xs:text-sm uppercase tracking-wide">Resources</h4>
              <ul className="space-y-2 text-xs xs:text-sm">
                <li><Link href="/help" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Help Center</Link></li>
                <li><Link href="/settings" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Settings</Link></li>
                <li><a href="mailto:support@consistencygrid.com" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-xs xs:text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-2 text-xs xs:text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col xs:flex-row items-center xs:items-center justify-between gap-4 xs:gap-6">
            <p className="text-xs sm:text-sm text-gray-600 text-center xs:text-left">
              © {new Date().getFullYear()} ConsistencyGrid. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-orange-600 whitespace-nowrap">
              Make every week count ✨
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
