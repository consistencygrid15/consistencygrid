const fs = require('fs');
const admin = require('firebase-admin');

// Parse .env.local manually
const envRaw = fs.readFileSync('.env.local', 'utf8');
const env = {};
envRaw.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

const projectId = env['FIREBASE_PROJECT_ID'];
const clientEmail = env['FIREBASE_CLIENT_EMAIL'];
const privateKey = env['FIREBASE_PRIVATE_KEY'] ? env['FIREBASE_PRIVATE_KEY'].replace(/\\n/g, '\n') : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

// Android typically uses Kolkata
const topic = 'daily_update_Asia_Kolkata';

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
