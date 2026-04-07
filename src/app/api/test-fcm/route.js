import { NextResponse } from 'next/server';
import { getUniversalSession } from '@/lib/getAndroidAuth';
import { sendInstantHabitPush } from '@/lib/fcm';
import * as admin from 'firebase-admin';

export async function GET(req) {
  try {
    const session = await getUniversalSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try sending the push!
    const result = await sendInstantHabitPush(session.user.id);
    
    // Check if Firebase admin is initialized (this catches private key formatting issues)
    const isFirebaseInitialized = admin.apps.length > 0;

    return NextResponse.json({
      success: true,
      message: 'Test FCM Triggered',
      firebaseInitialized: isFirebaseInitialized,
      pushResult: result,
      userId: session.user.id
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}
