"use client";

import Link from 'next/link';
import { XCircle, ArrowRight, RefreshCw, HelpCircle } from 'lucide-react';

export default function PaymentFailedPage() {
    const handleRetry = () => {
        if (typeof window === 'undefined') return;
        try {
            window.location.href = '/pricing';
        } catch (error) {
            console.error('[PaymentFailed] Navigation error:', error);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Error Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Payment Failed
                    </h1>

                    <p className="text-lg text-gray-600">
                        We couldn't process your payment. Don't worry, no charges were made.
                    </p>
                </div>

                {/* Common Reasons */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-orange-500" />
                        Common Reasons
                    </h2>

                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>Insufficient funds in your account</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>Incorrect card details or expired card</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>Payment declined by your bank</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>Network connectivity issues</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-orange-500 font-bold">•</span>
                            <span>Daily transaction limit exceeded</span>
                        </li>
                    </ul>
                </div>

                {/* What to Do */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        What You Can Do:
                    </h3>

                    <ol className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                            <span>Check your card details and try again</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                            <span>Try using a different payment method</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                            <span>Contact your bank to authorize the transaction</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">4</span>
                            <span>Contact our support team if the issue persists</span>
                        </li>
                    </ol>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleRetry}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <Link
                        href="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white text-gray-800 px-6 py-4 font-bold hover:bg-gray-50 hover:border-orange-300 transition-all duration-300"
                    >
                        Back to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Support */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">Need Help?</h4>
                    <p className="text-sm text-gray-700 mb-3">
                        Our support team is here to help you complete your purchase.
                    </p>
                    <a
                        href="mailto:support@consistencygrid.com"
                        className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:underline"
                    >
                        Contact Support
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                {/* Continue with Free Plan */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    You can continue using ConsistencyGrid with the{' '}
                    <Link href="/dashboard" className="text-orange-600 hover:underline font-semibold">
                        Free Plan
                    </Link>
                    {' '}while you resolve the payment issue.
                </p>
            </div>
        </main>
    );
}
