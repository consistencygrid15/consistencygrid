'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { requestAccountDeletion } from '@/lib/gdpr';

export default function AccountDeletionComponent() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Check if user has password on load
  useEffect(() => {
    async function checkAuthType() {
      try {
        const res = await fetch('/api/settings/me');
        if (res.ok) {
          const data = await res.json();
          setHasPassword(!!data.user.hasPassword);
        }
      } catch (err) {
        console.error('Failed to check auth type:', err);
      }
    }
    checkAuthType();
  }, []);

  async function handleRequestDeletion() {
    if (!confirmationInput) {
      setError(`Please enter your ${hasPassword ? 'password' : 'email'} to confirm`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await requestAccountDeletion(confirmationInput);

      if (result.success) {
        // Clear form
        setConfirmationInput('');
        setShowConfirmation(false);
        setStep(1);

        // Show final message and logout
        alert('Your account and all your data have been permanently deleted. Goodbye.');

        // Give user time to see message
        setTimeout(() => {
          // Clear all auth-related localStorage
          localStorage.removeItem('cg_auth_token');
          localStorage.removeItem('cg_session_active');
          localStorage.removeItem('cg_last_recovery_attempt');

          signOut({ redirect: true, callbackUrl: '/' });
        }, 1500);
      } else {
        setError(result.error || 'Failed to delete account');
        setStep(2); // Go back to input step on error
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setShowConfirmation(false);
    setConfirmationInput('');
    setError('');
    setStep(1);
  }

  if (!showConfirmation) {
    return (
      <Card className="p-6 border-l-4 border-l-red-500 bg-red-50 shadow-sm">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account Permanentally</h3>
            <p className="text-sm text-red-700 mb-4">
              This action is irreversible. All your habits, goals, and history will be wiped clean.
            </p>

            <div className="bg-white/80 p-4 rounded-lg mb-4 text-sm text-gray-700 space-y-2 border border-red-100">
              <p className="font-semibold text-red-900">Once deleted, you lose:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Every goal, habit, and milestone ever tracked</li>
                <li>Your customized wallpaper settings</li>
                <li>Subscription access (if any)</li>
                <li>Account profile and settings</li>
              </ul>
            </div>

            <Button
              onClick={() => setShowConfirmation(true)}
              className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Start Deletion Process
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-200 shadow-xl animate-in fade-in zoom-in duration-200">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Final Goodbye?</h3>
        <p className="text-sm text-gray-500 mb-6">Step {step} of 3</p>

        {/* Improved Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s === step
                  ? 'bg-red-600 text-white ring-4 ring-red-100'
                  : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-1 flex-1 mx-2 rounded ${s < step ? 'bg-green-500' : 'bg-gray-100'}`}></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <p className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> Point of no return
              </p>
              <p className="text-sm text-orange-800 leading-relaxed">
                ConsistencyGrid is built to track your progress over years. Deleting your account means losing your life's data visualization forever.
                <br /><br />
                Are you sure you want to stop tracking your consistency?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 shadow-orange-100"
              >
                I am sure, continue
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Keep my account
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-sm text-red-900 leading-relaxed font-medium">
                {hasPassword
                  ? "Security Check: Please enter your password to authorize this permanent deletion."
                  : "Security Check: Since you use Google Login, please type your email address to confirm deletion."
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {hasPassword ? 'Your Password' : 'Confirm Registration Email'}
                </label>
                <input
                  type={hasPassword ? "password" : "email"}
                  value={confirmationInput}
                  onChange={e => {
                    setConfirmationInput(e.target.value);
                    setError('');
                  }}
                  autoFocus
                  placeholder={hasPassword ? "••••••••" : "you@example.com"}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium"
                />
                {error && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2">
                    <AlertTriangle size={14} /> {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (!confirmationInput) {
                      setError(`Please provide your ${hasPassword ? 'password' : 'email'}`);
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Verify Identity
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-black text-white rounded-xl p-6 border-l-4 border-red-600">
              <p className="text-lg font-bold mb-2">Wait! Last chance.</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                As soon as you click the button below, your data will start being erased from our servers immediately. This cannot be reversed even by our support team.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRequestDeletion}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-base shadow-xl shadow-red-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin h-4 w-4" /> Erasing Data...
                  </span>
                ) : 'ERASE MY ACCOUNT'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="outline"
                className="flex-1 h-12"
              >
                I changed my mind
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
