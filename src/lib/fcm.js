import * as admin from 'firebase-admin';
import prisma from '@/lib/prisma';

// ─────────────────────────────────────────────
// FIREBASE ADMIN INITIALIZATION
// Uses explicit service account credentials from env vars.
// Works reliably on Vercel and any cloud host (no GOOGLE_APPLICATION_CREDENTIALS needed).
// ─────────────────────────────────────────────
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Vercel env vars store \n as literal "\\n" — replace back to actual newlines
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in environment.'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    console.log('[FCM] Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('[FCM] Firebase Admin initialization error:', error.message);
  }
}

// ─────────────────────────────────────────────
// STALE TOKEN CLEANUP
// Deletes FCM tokens from DB that Firebase rejected as invalid/unregistered.
// Called automatically after every multicast batch.
// ─────────────────────────────────────────────
async function pruneStaleTokens(tokens, responses) {
  const staleTokens = [];

  responses.forEach((resp, idx) => {
    if (!resp.success) {
      const code = resp.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        staleTokens.push(tokens[idx]);
      }
    }
  });

  if (staleTokens.length > 0) {
    try {
      const { count } = await prisma.deviceToken.deleteMany({
        where: { token: { in: staleTokens } },
      });
      console.log(`[FCM] Pruned ${count} stale token(s) from DB.`);
    } catch (err) {
      console.error('[FCM] Error pruning stale tokens:', err.message);
    }
  }
}

// ─────────────────────────────────────────────
// SEND TOPIC PUSH (Broadcast to thousands at once)
// Solves scalable thundering herd since max timeout is avoided
// ─────────────────────────────────────────────
export async function sendTopicWallpaperUpdatePush(topic, jitterMaxMinutes = 60) {
  try {
    const response = await admin.messaging().send({
      data: {
        type: 'WALLPAPER_UPDATE_TRIGGER',
        timestamp: Date.now().toString(),
        jitter_max_minutes: jitterMaxMinutes.toString(),
      },
      topic: topic,
      android: { priority: 'high' },
    });
    console.log(`[FCM] Topic (${topic}) push success: ${response}`);
    return true;
  } catch (error) {
    console.error(`[FCM] Topic (${topic}) push error:`, error.message);
    return false;
  }
}

// ─────────────────────────────────────────────
// SEND SINGLE PUSH (for a single token)
// ─────────────────────────────────────────────
export async function sendWallpaperUpdatePush(token) {
  try {
    await admin.messaging().send({
      data: {
        type: 'WALLPAPER_UPDATE_TRIGGER',
        timestamp: Date.now().toString(),
      },
      token,
      android: { priority: 'high' },
    });
    return true;
  } catch (error) {
    console.error('[FCM] Single push error:', error.message);
    return false;
  }
}

// ─────────────────────────────────────────────
// SEND MULTICAST PUSH (batched, parallel, with stale token cleanup)
//
// Design for 100k+ users:
//   • Firebase limit: 500 tokens per sendEachForMulticast call
//   • Batches are sent in PARALLEL using Promise.all (not sequential)
//   • After each batch, stale tokens are pruned from DB automatically
// ─────────────────────────────────────────────
export async function sendMulticastWallpaperUpdatePush(tokens) {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const BATCH_SIZE = 500;
  const batches = [];

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    batches.push(tokens.slice(i, i + BATCH_SIZE));
  }

  console.log(`[FCM] Sending push to ${tokens.length} device(s) in ${batches.length} parallel batch(es).`);

  const results = await Promise.all(
    batches.map(async (batchTokens, batchIndex) => {
      const batchNum = batchIndex + 1;
      let batchSuccess = 0;
      let batchFailure = 0;

      try {
        const response = await admin.messaging().sendEachForMulticast({
          data: {
            type: 'WALLPAPER_UPDATE_TRIGGER',
            timestamp: Date.now().toString(),
            jitter_max_minutes: "0", // Instant update for manual habit toggles!
          },
          tokens: batchTokens,
          android: { priority: 'high' },
        });

        batchSuccess = response.successCount;
        batchFailure = response.failureCount;

        console.log(
          `[FCM] Batch ${batchNum}/${batches.length}: ${batchSuccess} sent, ${batchFailure} failed.`
        );

        // Automatically remove stale/invalid tokens from DB
        await pruneStaleTokens(batchTokens, response.responses);
      } catch (err) {
        console.error(`[FCM] Batch ${batchNum}/${batches.length} error:`, err.message);
        batchFailure = batchTokens.length;
      }

      return { successCount: batchSuccess, failureCount: batchFailure };
    })
  );

  // Aggregate totals across all batches
  const totals = results.reduce(
    (acc, r) => ({
      successCount: acc.successCount + r.successCount,
      failureCount: acc.failureCount + r.failureCount,
    }),
    { successCount: 0, failureCount: 0 }
  );

  console.log(
    `[FCM] Total: ${totals.successCount} succeeded, ${totals.failureCount} failed across ${batches.length} batch(es).`
  );

  return totals;
}

// ─────────────────────────────────────────────
// INSTANT HABIT PUSH HELPER
// Clean single-call helper used by the habit toggle route.
// Fetches the user's Android tokens from DB and fires push.
// Replaces duplicate inline push code in toggle route.
// ─────────────────────────────────────────────
export async function sendInstantHabitPush(userId) {
  try {
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId, deviceType: 'android' },
      select: { token: true },
    });

    if (deviceTokens.length === 0) {
      console.log(`[FCM] No Android tokens found for user ${userId}. Skipping push.`);
      return { successCount: 0, failureCount: 0 };
    }

    const tokens = deviceTokens.map((d) => d.token);
    const result = await sendMulticastWallpaperUpdatePush(tokens);
    console.log(`[FCM] Instant habit push for user ${userId}: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`[FCM] sendInstantHabitPush error for user ${userId}:`, error.message);
    return { successCount: 0, failureCount: 0 };
  }
}
