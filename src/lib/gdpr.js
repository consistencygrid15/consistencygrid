/**
 * GDPR Compliance Utilities
 * Handles data export, deletion, and consent management
 */

/**
 * Generate user data export as JSON
 * Includes all personal data and user-generated content
 */
export async function generateDataExport(userId) {
  try {
    console.log('[EXPORT] Starting data export...');
    console.log('[EXPORT] User ID:', userId);

    // First, test the simple endpoint
    console.log('[EXPORT] Testing simple endpoint...');
    const simpleTestRes = await fetch(`/api/gdpr/simple-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('[EXPORT] Simple test status:', simpleTestRes.status);
    const simpleTestData = await simpleTestRes.json();
    console.log('[EXPORT] Simple test response:', simpleTestData);

    if (!simpleTestRes.ok) {
      throw new Error(`Simple test failed: ${simpleTestRes.status}`);
    }

    // Now test the main endpoint
    console.log('[EXPORT] Calling main export endpoint...');
    const userRes = await fetch(`/api/gdpr/export`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('[EXPORT] Export response status:', userRes.status);

    if (!userRes.ok) {
      let errorMessage = 'Failed to export data';
      try {
        const errorData = await userRes.json();
        errorMessage = errorData.error || errorMessage;
        console.log('[EXPORT] Error response:', errorData);
      } catch (e) {
        const text = await userRes.text();
        console.log('[EXPORT] Error response text:', text);
      }
      throw new Error(errorMessage);
    }

    const data = await userRes.json();
    console.log('[EXPORT] Data exported successfully');
    console.log('[EXPORT] Response data structure:', Object.keys(data));

    return {
      success: true,
      data: data.data,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
  } catch (error) {
    console.error('[EXPORT] Error generating data export:', error);
    console.error('[EXPORT] Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Convert user data to CSV format
 */
export function convertToCSV(data) {
  const csv = [];

  // Add header with export info
  csv.push(`# ConsistencyGrid - GDPR Data Export`);
  csv.push(`# Generated: ${new Date().toISOString()}`);
  csv.push(``);

  // User Profile
  csv.push(`## User Profile`);
  csv.push(`ID,${escapeCSV(data.user.id)}`);
  csv.push(`Name,${escapeCSV(data.user.name || '')}`);
  csv.push(`Email,${escapeCSV(data.user.email)}`);
  csv.push(`Created,${data.user.createdAt}`);
  csv.push(`Updated,${data.user.updatedAt}`);
  csv.push(``);

  // Goals
  if (data.goals?.length > 0) {
    csv.push(`## Goals`);
    csv.push(`ID,Title,Description,Category,Progress,Target Deadline,Completed,Created,Updated`);
    data.goals.forEach(goal => {
      csv.push(`${escapeCSV(goal.id)},${escapeCSV(goal.title)},${escapeCSV(goal.description || '')},${escapeCSV(goal.category)},${goal.progress},${goal.targetDeadline || ''},${goal.isCompleted},${goal.createdAt},${goal.updatedAt}`);
    });
    csv.push(``);
  }

  // Habits
  if (data.habits?.length > 0) {
    csv.push(`## Habits`);
    csv.push(`ID,Title,Scheduled Time,Active,Created,Updated`);
    data.habits.forEach(habit => {
      csv.push(`${escapeCSV(habit.id)},${escapeCSV(habit.title)},${habit.scheduledTime || ''},${habit.isActive},${habit.createdAt},${habit.updatedAt}`);
    });
    csv.push(``);
  }

  // Habit Logs
  if (data.habitLogs?.length > 0) {
    csv.push(`## Habit Completion History`);
    csv.push(`Habit ID,Date,Completed`);
    data.habitLogs.forEach(log => {
      csv.push(`${escapeCSV(log.habitId)},${log.date},${log.done}`);
    });
    csv.push(``);
  }

  // Reminders
  if (data.reminders?.length > 0) {
    csv.push(`## Reminders`);
    csv.push(`ID,Title,Description,Start Date,End Date,Priority,Important,Created,Updated`);
    data.reminders.forEach(reminder => {
      csv.push(`${escapeCSV(reminder.id)},${escapeCSV(reminder.title)},${escapeCSV(reminder.description || '')},${reminder.startDate},${reminder.endDate},${reminder.priority},${reminder.isImportant},${reminder.createdAt},${reminder.updatedAt}`);
    });
    csv.push(``);
  }

  // Milestones
  if (data.milestones?.length > 0) {
    csv.push(`## Milestones`);
    csv.push(`ID,Title,Age,Status,Description,Created,Updated`);
    data.milestones.forEach(milestone => {
      csv.push(`${escapeCSV(milestone.id)},${escapeCSV(milestone.title)},${milestone.age},${escapeCSV(milestone.status)},${escapeCSV(milestone.description || '')},${milestone.createdAt},${milestone.updatedAt}`);
    });
    csv.push(``);
  }

  // Settings
  if (data.settings) {
    csv.push(`## Account Settings`);
    csv.push(`Theme,${escapeCSV(data.settings.theme)}`);
    csv.push(`Width,${data.settings.width}`);
    csv.push(`Height,${data.settings.height}`);
    csv.push(`Date of Birth,${data.settings.dob}`);
    csv.push(`Created,${data.settings.createdAt}`);
    csv.push(`Updated,${data.settings.updatedAt}`);
    csv.push(``);
  }

  return csv.join('\n');
}

/**
 * Helper to escape CSV values
 */
function escapeCSV(value) {
  if (!value) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download data export as file
 */
export function downloadDataExport(data, format = 'json') {
  try {
    const filename = `consistency-grid-export-${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const content = format === 'csv' ? convertToCSV(data) : JSON.stringify(data, null, 2);

    // ✅ Android App Bridge Support
    if (typeof window !== 'undefined' && window.Android && window.Android.downloadFile) {
      try {
        const blob = new Blob([content], { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          window.Android.downloadFile(base64data, filename, mimeType);
        };
        reader.readAsDataURL(blob);
        return { success: true, filename };
      } catch (err) {
        console.error('Android download failed, falling back to browser', err);
      }
    }

    // Standard Browser Download
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error('Error downloading data:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Request account deletion
 */
export async function requestAccountDeletion(password) {
  try {
    console.log('[GDPR] Requesting account deletion...');
    const res = await fetch('/api/gdpr/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to delete account',
      };
    }

    return {
      success: true,
      message: 'Account deletion initiated. You will be logged out.',
    };
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get user consent preferences
 */
export async function getConsentPreferences() {
  try {
    const res = await fetch('/api/gdpr/consent', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch consent preferences');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching consent preferences:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update user consent preferences
 */
export async function updateConsentPreferences(preferences) {
  try {
    const res = await fetch('/api/gdpr/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!res.ok) {
      throw new Error('Failed to update consent preferences');
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating consent preferences:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get GDPR rights information
 */
export const gdprRights = {
  right_to_access: {
    title: 'Right to Access',
    description: 'You have the right to obtain confirmation of whether your personal data is being processed and to obtain a copy of your data.',
    action: 'Export Data',
    endpoint: '/gdpr/export',
  },
  right_to_rectification: {
    title: 'Right to Rectification',
    description: 'You have the right to correct inaccurate personal data and to complete incomplete data.',
    action: 'Edit Profile',
    endpoint: '/settings',
  },
  right_to_erasure: {
    title: 'Right to Erasure (Right to be Forgotten)',
    description: 'You have the right to request deletion of your personal data, subject to certain exceptions.',
    action: 'Delete Account',
    endpoint: '/settings',
  },
  right_to_restrict_processing: {
    title: 'Right to Restrict Processing',
    description: 'You have the right to request restriction of processing of your personal data.',
    action: 'Manage Preferences',
    endpoint: '/settings',
  },
  right_to_data_portability: {
    title: 'Right to Data Portability',
    description: 'You have the right to receive your personal data in a structured, commonly used format and to transmit it to another controller.',
    action: 'Export Data',
    endpoint: '/gdpr/export',
  },
  right_to_object: {
    title: 'Right to Object',
    description: 'You have the right to object to the processing of your personal data for direct marketing or other purposes.',
    action: 'Manage Preferences',
    endpoint: '/settings',
  },
};

/**
 * Get GDPR policy information
 */
export const gdprPolicies = {
  data_retention: {
    label: 'Data Retention',
    description: 'We retain your data only as long as necessary to provide our services. You can delete your account at any time.',
    period: 'Until account deletion',
  },
  data_processing: {
    label: 'Data Processing',
    description: 'Your data is processed to provide our services, improve our application, and comply with legal obligations.',
    basis: 'Legitimate interest and contract performance',
  },
  third_parties: {
    label: 'Third-Party Sharing',
    description: 'We do not sell your data. We may share data with service providers who help us operate (with confidentiality agreements).',
    providers: 'Email service, Analytics provider, Cloud storage',
  },
  security: {
    label: 'Security Measures',
    description: 'We implement technical and organizational measures to protect your data.',
    measures: 'Encryption, secure authentication, rate limiting, regular audits',
  },
};

/**
 * Check if user has consented to specific processing
 */
export function hasConsent(consentType, preferences) {
  if (!preferences) return false;
  return preferences[consentType] === true;
}

/**
 * Log GDPR operation for audit trail
 */
export async function logGDPROperation(operationType, details) {
  try {
    await fetch('/api/gdpr/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationType,
        details,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
  } catch (error) {
    console.error('Error logging GDPR operation:', error);
  }
}

/**
 * Generate GDPR compliance report
 */
export async function generateComplianceReport() {
  try {
    const res = await fetch('/api/gdpr/compliance-report', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to generate compliance report');
    }

    return await res.json();
  } catch (error) {
    console.error('Error generating compliance report:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
