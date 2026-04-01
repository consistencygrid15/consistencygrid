# FCM Production Upgrade — Walkthrough

## What Was Changed

### 1. [fcm.js](file:///d:/startup/consistencygrid/src/lib/fcm.js) — Complete Upgrade

| Before | After |
|---|---|
| `applicationDefault()` (needs `GOOGLE_APPLICATION_CREDENTIALS` file path) | Explicit `credential.cert({projectId, clientEmail, privateKey})` from env vars |
| Sequential `for` loop over 500-token batches | `Promise.all` — all batches fire in parallel |
| No stale token cleanup | [pruneStaleTokens()](file:///d:/startup/consistencygrid/src/lib/fcm.js#32-63) auto-runs after every batch, deletes invalid tokens from DB |
| No helper for habit toggle | Exported [sendInstantHabitPush(userId)](file:///d:/startup/consistencygrid/src/lib/fcm.js#156-183) — fetches tokens + fires push in one call |

### 2. [toggle/route.js](file:///d:/startup/consistencygrid/src/app/api/habits/toggle/route.js) — Deduplication

- Removed two nearly identical `try/catch` push blocks (one for update, one for create)
- Removed `require()` (not valid in ES modules)
- Replaced with a single fire-and-forget call: [sendInstantHabitPush(user.id)](file:///d:/startup/consistencygrid/src/lib/fcm.js#156-183)

### 3. [midnight-push/route.js](file:///d:/startup/consistencygrid/src/app/api/cron/midnight-push/route.js) — New Route

New dedicated cron target route. Identical logic to `midnight-update` but purpose-named for the Vercel cron scheduler.

### 4. [midnight-update/route.js](file:///d:/startup/consistencygrid/src/app/api/cron/midnight-update/route.js) — Cleaned Up

- Added `deviceType: 'android'` filter to DB query (only fetch relevant tokens)
- Improved comments explaining the 15-min cron + timezone window design

### 5. [vercel.json](file:///d:/startup/consistencygrid/vercel.json) — Cron Schedule Added

```json
"crons": [
  { "path": "/api/cron/midnight-push", "schedule": "*/15 * * * *" }
]
```
This was missing before — the cron was never running in production.

### 6. [device-token/route.js](file:///d:/startup/consistencygrid/src/app/api/device-token/route.js) — Timezone Validation

- Uses `Intl.supportedValuesOf('timeZone')` to validate IANA timezone strings
- Rejects registrations with invalid timezone strings with a clear 400 error

### 7. [.env.example](file:///d:/startup/consistencygrid/.env.example) — Firebase Vars Documented

Added the three Firebase Admin vars and `CRON_SECRET` with instructions.

---

## Setup Checklist (Before Deploy)

> [!IMPORTANT]
> You must complete these steps or push notifications will NOT work in production.

**Step 1 — Get Firebase service account credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON file
3. Copy these three values from the JSON:

```
project_id       → FIREBASE_PROJECT_ID
client_email     → FIREBASE_CLIENT_EMAIL
private_key      → FIREBASE_PRIVATE_KEY
```

**Step 2 — Add to Vercel environment variables:**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n"
CRON_SECRET=<generate with: openssl rand -base64 32>
```

> [!WARNING]
> Paste `FIREBASE_PRIVATE_KEY` **with the quotes** in Vercel's dashboard. Vercel stores `\n` as literal `\\n` — the code already handles this replacement automatically.

**Step 3 — Redeploy on Vercel.** The cron schedule in [vercel.json](file:///d:/startup/consistencygrid/vercel.json) activates automatically after deploy.

---

## Architecture Overview

```mermaid
graph TD
    A[Android App] -->|POST /api/device-token| B[DB: DeviceToken table]
    C[User toggles habit] -->|POST /api/habits/toggle| D[sendInstantHabitPush]
    D -->|DB: fetch tokens by userId| E[sendMulticastWallpaperUpdatePush]
    F[Vercel Cron every 15min] -->|GET /api/cron/midnight-push| G[Find midnight timezones]
    G -->|DB: fetch tokens by timezone| E
    E -->|Batch 500, parallel| H[Firebase FCM]
    H -->|Silent push| A
    E -->|Auto-prune stale tokens| B
```

---

## Scalability Numbers

| Metric | Value |
|---|---|
| Tokens per FCM batch | 500 (Firebase max) |
| Batch execution | Parallel (`Promise.all`) |
| 100k users at midnight | 200 batches fired simultaneously |
| Stale token cleanup | Automatic after every batch |
| Cron granularity | Every 15 minutes (catches any timezone midnight window) |
