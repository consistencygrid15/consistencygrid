'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getConsentPreferences, updateConsentPreferences } from '@/lib/gdpr';

export default function ConsentManagement() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const result = await getConsentPreferences();
      if (result.success) {
        setPreferences(result.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreferences() {
    setSaving(true);
    setMessage('');

    try {
      const result = await updateConsentPreferences(preferences);
      if (result.success) {
        setMessage('Preferences saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save preferences');
      }
    } catch (error) {
      setMessage('Error saving preferences');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  }

  function togglePreference(key) {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  }

  const consentOptions = [
    {
      key: 'analytics',
      label: 'Analytics',
      description: 'Allow us to collect anonymous analytics data to improve our service',
      required: false,
    },
    {
      key: 'marketing_emails',
      label: 'Marketing Emails',
      description: 'Receive emails about new features and updates',
      required: false,
    },
    {
      key: 'performance_monitoring',
      label: 'Performance Monitoring',
      description: 'Allow us to monitor app performance and errors',
      required: false,
    },
    {
      key: 'data_processing',
      label: 'Data Processing Agreement',
      description: 'Consent to process your data as described in our Privacy Policy',
      required: true,
    },
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Consent & Privacy Preferences</h3>

      <div className="space-y-4 mb-6">
        {consentOptions.map(option => (
          <div
            key={option.key}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <button
              onClick={() => !option.required && togglePreference(option.key)}
              disabled={option.required}
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${
                preferences?.[option.key]
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              } ${option.required ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {preferences?.[option.key] && (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-gray-900 cursor-pointer">
                  {option.label}
                </label>
                {option.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes('successfully')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleSavePreferences}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        <Button
          onClick={loadPreferences}
          variant="outline"
          disabled={saving}
        >
          Reset
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Privacy Notice:</strong> Your preferences are saved securely and can be changed at any time. 
          For more information, see our <a href="/privacy" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>.
        </p>
      </div>
    </Card>
  );
}
