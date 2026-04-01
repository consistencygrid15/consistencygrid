'use client';

import { useState } from 'react';
import { Download, FileJson, FileText, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { generateDataExport, downloadDataExport } from '@/lib/gdpr';

export default function DataExportComponent() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState('json');
  const [message, setMessage] = useState('');
  const [exportData, setExportData] = useState(null);

  async function handleExport() {
    console.log('[COMPONENT] Export button clicked!');
    setLoading(true);
    setMessage('');

    try {
      console.log('[COMPONENT] Calling generateDataExport...');
      const result = await generateDataExport();
      console.log('[COMPONENT] Export result:', result);
      
      if (result.success) {
        console.log('[COMPONENT] Export successful!');
        setExportData(result);
        setMessage(`Data export ready (${format.toUpperCase()})`);
      } else {
        console.log('[COMPONENT] Export failed:', result.error);
        setMessage(`Failed to export data: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[COMPONENT] Error exporting data:', error);
      setMessage(`Error exporting data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!exportData) {
      setMessage('Please export data first');
      return;
    }

    setExporting(true);
    try {
      const result = downloadDataExport(exportData, format);
      if (result.success) {
        setMessage(`Downloaded: ${result.filename}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      setMessage('Error downloading file');
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Data Export</h3>
      <p className="text-sm text-gray-600 mb-6">
        Download all your personal data including goals, habits, reminders, and settings in a portable format.
      </p>

      {/* Format Selection */}
      <div className="mb-6 space-y-3">
        <label className="text-sm font-medium text-gray-700">Select Format</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="json"
              checked={format === 'json'}
              onChange={e => setFormat(e.target.value)}
              className="w-4 h-4 cursor-pointer"
            />
            <FileJson className="w-5 h-5 text-blue-500" />
            <span className="text-sm">JSON (Recommended)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === 'csv'}
              onChange={e => setFormat(e.target.value)}
              className="w-4 h-4 cursor-pointer"
            />
            <FileText className="w-5 h-5 text-green-500" />
            <span className="text-sm">CSV (Spreadsheet)</span>
          </label>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes('Error')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleExport}
          disabled={loading || exporting}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {loading ? 'Exporting...' : 'Step 1: Export Data'}
        </Button>

        {exportData && (
          <Button
            onClick={handleDownload}
            disabled={exporting || loading}
            className="bg-green-500 hover:bg-green-600"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Downloading...' : `Step 2: Download ${format.toUpperCase()}`}
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-2">What's included in your export:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Profile information (name, email)</li>
              <li>All goals and their progress</li>
              <li>All habits and completion history</li>
              <li>All reminders and scheduled events</li>
              <li>Milestones and achievements</li>
              <li>Account preferences and settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Format Info */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-900 mb-1">JSON Format</p>
          <p className="text-xs text-gray-600">
            Best for data portability and importing into other applications
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-900 mb-1">CSV Format</p>
          <p className="text-xs text-gray-600">
            Best for viewing in spreadsheets like Excel or Google Sheets
          </p>
        </div>
      </div>
    </Card>
  );
}
