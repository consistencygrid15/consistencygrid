import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

dotenv.config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

// Pass jitter as 0 for testing so it happens immediately!
const topic = 'daily_update_Asia_Calcutta';

async function testPush() {
  console.log(`Sending immediate test push to topic: ${topic}`);
  try {
    const response = await admin.messaging().send({
      data: {
        type: 'WALLPAPER_UPDATE_TRIGGER',
        timestamp: Date.now().toString(),
        jitter_max_minutes: "0", // 0 minutes jitter so it happens INSTANTLY!
      },
      topic: topic,
      android: { priority: 'high' },
    });
    console.log(`Success! FCM Message ID: ${response}`);
  } catch (err) {
    console.error('Error sending push:', err);
  }
}

testPush();
