import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from "../../auth/authOptions";

/**
 * GET /api/gdpr/consent
 * Get user's consent preferences
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if consent record exists
    let consent = await prisma.consentPreference.findUnique({
      where: { userId },
    });

    // Create default consent record if it doesn't exist
    if (!consent) {
      consent = await prisma.consentPreference.create({
        data: {
          userId,
          analytics: true,
          marketing_emails: false,
          performance_monitoring: true,
          data_processing: true,
        },
      });
    }

    return Response.json({
      success: true,
      preferences: {
        analytics: consent.analytics,
        marketing_emails: consent.marketing_emails,
        performance_monitoring: consent.performance_monitoring,
        data_processing: consent.data_processing,
      },
    });
  } catch (error) {
    console.error('Error fetching consent preferences:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gdpr/consent
 * Update user's consent preferences
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const preferences = await req.json();

    // Validate that required consent is always true
    if (preferences.data_processing === false) {
      return Response.json(
        {
          success: false,
          error: 'Data processing consent is required to use the service',
        },
        { status: 400 }
      );
    }

    // Update or create consent record
    const consent = await prisma.consentPreference.upsert({
      where: { userId },
      update: {
        analytics: preferences.analytics ?? true,
        marketing_emails: preferences.marketing_emails ?? false,
        performance_monitoring: preferences.performance_monitoring ?? true,
        data_processing: preferences.data_processing ?? true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        analytics: preferences.analytics ?? true,
        marketing_emails: preferences.marketing_emails ?? false,
        performance_monitoring: preferences.performance_monitoring ?? true,
        data_processing: preferences.data_processing ?? true,
      },
    });

    // Log GDPR operation
    console.log(`[GDPR AUDIT] Consent Updated: ${userId}`, {
      preferences: {
        analytics: consent.analytics,
        marketing_emails: consent.marketing_emails,
        performance_monitoring: consent.performance_monitoring,
      },
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        analytics: consent.analytics,
        marketing_emails: consent.marketing_emails,
        performance_monitoring: consent.performance_monitoring,
        data_processing: consent.data_processing,
      },
    });
  } catch (error) {
    console.error('Error updating consent preferences:', error);
    return Response.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
