'use client';

import { useState } from 'react';
import { Download, FileJson, FileText } from 'lucide-react';
import { exportData } from '@/lib/export-data';

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('json');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleExport() {
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const result = await exportData(format);
      
      if (result.success) {
        setMessage(`✓ ${result.message}`);
        setIsSuccess(true);
      } else {
        setMessage(`✗ ${result.error}`);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage(`✗ ${error.message}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-orange-200 p-6 mb-6">
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">Export Your Data</h3>
      <p className="text-sm text-gray-600 mb-6">
        Download all your personal data (goals, habits, reminders, and settings) in your preferred format.
      </p>

      {/* Format Selection */}
      <div className="mb-6 space-y-3">
        <label className="text-sm font-medium text-gray-700">Select Format</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="export-format"
              value="json"
              checked={format === 'json'}
              onChange={(e) => setFormat(e.target.value)}
              className="w-4 h-4"
            />
            <FileJson className="w-5 h-5 text-blue-500" />
            <span className="text-sm">JSON (Recommended)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="export-format"
              value="csv"
              checked={format === 'csv'}
              onChange={(e) => setFormat(e.target.value)}
              className="w-4 h-4"
            />
            <FileText className="w-5 h-5 text-green-500" />
            <span className="text-sm">CSV (Spreadsheet)</span>
          </label>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        <Download className="w-5 h-5" />
        {loading ? 'Exporting...' : 'Download My Data'}
      </button>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg text-sm ${
            isSuccess
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">What's included:</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Profile information (name, email)</li>
          <li>All goals and their progress</li>
          <li>All habits and completion history</li>
          <li>All reminders and scheduled events</li>
          <li>Milestones and achievements</li>
          <li>Account settings and preferences</li>
        </ul>
      </div>

      {/* Format Info */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="font-semibold text-blue-900 mb-1">JSON Format</p>
          <p className="text-blue-700">Best for data portability and importing elsewhere</p>
        </div>
        <div className="p-3 bg-green-50 rounded border border-green-200">
          <p className="font-semibold text-green-900 mb-1">CSV Format</p>
          <p className="text-green-700">Best for viewing in Excel or Google Sheets</p>
        </div>
      </div>
    </div>
  );
}
