# ConsistencyGrid — Complete API Documentation

> **Base URL:** `https://consistencygrid.com`  
> **Stack:** Next.js App Router · Prisma ORM · Supabase (Postgres) · Firebase FCM · Razorpay

---

## 🔑 Environment Variables (A-to-Z)

| Variable | Required | Where to Get | What it Does |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Supabase → Settings → Database → Connection String | Postgres DB connection |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` | Signs NextAuth JWTs |
| `NEXTAUTH_URL` | ✅ | Your domain e.g. `https://consistencygrid.com` | NextAuth callback base |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Same as above | SEO / open graph links |
| `GOOGLE_CLIENT_ID` | ✅ | Google Cloud Console → OAuth 2.0 | Google login |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google Cloud Console → OAuth 2.0 | Google login |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase Console → Project Settings | FCM push notifications |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase Console → Service Accounts → Generate Key | FCM admin SDK |
| `FIREBASE_PRIVATE_KEY` | ✅ | Same JSON file (copy `private_key` field as-is) | FCM admin SDK |
| `CRON_SECRET` | ✅ | `openssl rand -base64 32` | Protects `/api/cron/*` routes |
| `RESEND_API_KEY` | ✅ | resend.com → API Keys | Password reset emails |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay Dashboard → API Keys | Payment (frontend) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay Dashboard → API Keys | Payment (backend verify) |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | Razorpay Dashboard → Webhooks | Payment webhook verify |
| `NEXT_PUBLIC_GA_ID` | ❌ | Google Analytics | Analytics tracking |
| `GITHUB_CLIENT_ID` | ❌ | GitHub → Settings → OAuth Apps | GitHub login |
| `GITHUB_CLIENT_SECRET` | ❌ | GitHub → Settings → OAuth Apps | GitHub login |
| `ALLOWED_ORIGINS` | ❌ | Comma-separated list | CORS control |

---

## 🔐 Authentication Methods

### Method 1 — NextAuth Session (Web)
All web routes use `getServerSession(authOptions)`. User must be logged in via browser.

### Method 2 — Native Android Auth (Mobile)
Android app sends these two cookies with every request:
```
Cookie: publicToken=<user_token>; native_auth=true
```
The middleware reads `native_auth=true` and uses `publicToken` to identify the user.

### Method 3 — Cron Auth (Internal)
```
Header: Authorization: Bearer <CRON_SECRET>
```
Only for `/api/cron/*` routes.

---

## 📡 All API Endpoints

---

### 🔑 AUTH

#### `POST /api/auth/signup`
Register new user (web).
```json
Body: { "email": "user@email.com", "password": "..." }
Response: { "success": true }
```

#### `POST /api/auth/native/email-signup`
Register new user (Android app).
```json
Body: { "email": "user@email.com", "password": "...", "name": "..." }
Response: { "token": "publicToken", "user": { "id", "name", "email" } }
```

#### `POST /api/auth/native/email-login`
Login (Android app).
```json
Body: { "email": "user@email.com", "password": "..." }
Response: { "token": "publicToken", "user": { "id", "name", "email" } }
```

#### `POST /api/auth/native/google`
Google OAuth for Android.
```json
Body: { "idToken": "<google_id_token>" }
Response: { "token": "publicToken", "user": { ... } }
```

#### `GET /api/auth/native/refresh`
Refresh Android session token.
```
Cookie: publicToken=<token>; native_auth=true
Response: { "token": "new_publicToken" }
```

#### `GET /api/auth/get-token`
Get current user's publicToken (for Android to save locally).
```
Auth: NextAuth session (web)
Response: { "token": "publicToken" }
```

#### `GET /api/auth/webview-login?token=X&callbackUrl=/dashboard`
Android WebView login bridge — sets httpOnly cookies and redirects.
```
Params: token (publicToken), callbackUrl (redirect after login)
Response: HTML page that sets cookies and redirects
```

#### `POST /api/auth/forgot-password`
Send password reset email.
```json
Body: { "email": "user@email.com" }
Response: { "success": true }
```

#### `POST /api/auth/reset-password`
Reset password with token from email.
```json
Body: { "token": "reset_token", "password": "new_password" }
Response: { "success": true }
```

---

### 🏠 HABITS

#### `GET /api/habits`
Get all habits for current user.
```
Auth: Session or Native Cookie
Response: [{ "id", "title", "scheduledTime", "isActive", "logs": [...] }]
```

#### `POST /api/habits/create`
Create a new habit.
```json
Body: { "title": "Morning Run", "scheduledTime": "07:00" }
Response: { "id", "title", "scheduledTime", "isActive": true }
```

#### `GET /api/habits/today`
Get today's habits with completion status.
```
Auth: Session or Native Cookie
Response: [{ "id", "title", "completedToday": true/false }]
```

#### `GET /api/habits/me`
Get habits with full log history.
```
Auth: Session or Native Cookie
Response: [{ "id", "title", "logs": [{ "date", "done" }] }]
```

#### `POST /api/habits/toggle`
Mark habit as done/undone for today.
```json
Body: { "habitId": "clxxx...", "done": true }
Response: { "success": true, "log": { "date", "done" } }
```
> ⚡ This also sends an instant FCM push to Android to update wallpaper.

#### `PUT /api/habits/[id]`
Update a specific habit.
```json
Body: { "title": "New Name", "scheduledTime": "08:00", "isActive": true }
Response: updated habit object
```

#### `DELETE /api/habits/[id]`
Delete a habit.
```
Response: { "success": true }
```

#### `POST /api/habits/sync`
Sync habits in bulk (for offline support).
```json
Body: { "habits": [...] }
Response: { "synced": [...] }
```

---

### 🎯 GOALS

#### `GET /api/goals`
Get all active goals.
```
Auth: Session or Native Cookie
Response: [{ "id", "title", "progress", "target", "unit", "isPinned" }]
```

#### `POST /api/goals`
Create a new goal.
```json
Body: { "title": "Read 12 books", "target": 12, "unit": "books", "category": "Learning" }
Response: created goal object
```

#### `PUT /api/goals`
Update a goal.
```json
Body: { "id": "clxxx", "progress": 5, "isCompleted": false }
Response: updated goal object
```

#### `DELETE /api/goals`
Delete a goal.
```json
Body: { "id": "clxxx" }
Response: { "success": true }
```

#### `POST /api/goals/pin`
Pin/unpin a goal (shows on wallpaper).
```json
Body: { "id": "clxxx", "isPinned": true }
Response: { "success": true }
```

#### `POST /api/goals/sync`
Bulk sync goals.
```json
Body: { "goals": [...] }
Response: { "synced": [...] }
```

---

### ⏰ REMINDERS

#### `GET /api/reminders`
Get all reminders.
```
Auth: Session or Native Cookie
Response: [{ "id", "title", "startDate", "endDate", "startTime", "isRecurring", ... }]
```

#### `POST /api/reminders`
Create a reminder.
```json
Body: {
  "title": "Doctor Appointment",
  "startDate": "2026-04-01",
  "endDate": "2026-04-01",
  "startTime": "10:00",
  "isFullDay": false,
  "priority": "high",
  "markerType": "dot",
  "markerColor": "#ff0000"
}
Response: created reminder object
```

#### `PUT /api/reminders/[id]`
Update a reminder.
```json
Body: { any reminder fields to update }
Response: updated reminder object
```

#### `DELETE /api/reminders/[id]`
Delete a reminder.
```
Response: { "success": true }
```

#### `GET /api/reminders/range?start=YYYY-MM-DD&end=YYYY-MM-DD`
Get reminders in a date range.
```
Params: start (date), end (date)
Response: [reminders in range]
```

---

### 🖼️ WALLPAPER

#### `GET /api/wallpaper-data?token=X&canvasWidth=1080&canvasHeight=2340`
Fetch all data needed to render the wallpaper. Used by Android WebView.
```
Auth: publicToken via query param (no cookie needed)
Params:
  token       = user's publicToken (required)
  canvasWidth = screen width in px (optional, default 1080)
  canvasHeight= screen height in px (optional, default 2340)

Response: {
  "user": { "name", "settings": { theme, canvasWidth, canvasHeight, ... } },
  "stats": { "streak", "todayCompletionPercentage", "growthHistory", "totalHabits" },
  "data": { "activityMap", "habits", "goals", "reminders" }
}
```

#### `GET /api/w/[token]/image.png`
Render wallpaper as PNG image (for sharing/widget).
```
Params: token = publicToken (in URL)
Response: image/png binary
```

---

### ⚙️ SETTINGS

#### `GET /api/settings/me`
Get current user settings.
```
Auth: Session or Native Cookie
Response: { "settings": { theme, canvasWidth, dateOfBirth, ... } }
```

#### `POST /api/settings/save`
Save user settings.
```json
Body: {
  "theme": "dark-minimal",
  "canvasWidth": 1080,
  "canvasHeight": 2340,
  "dateOfBirth": "1998-05-10",
  "lifeExpectancyYears": 80,
  "yearGridMode": "weeks",
  "showQuote": true,
  "quoteText": "Stay consistent.",
  "showAgeStats": true,
  "wallpaperType": "lockscreen",
  "goalEnabled": false
}
Response: { "success": true }
```

#### `POST /api/settings/upload-background`
Upload a custom background image (Premium only).
```json
Body: { "imageBase64": "data:image/png;base64,..." }
Response: { "url": "https://..." }
```

---

### 📱 DEVICE TOKEN (Android FCM)

#### `POST /api/device-token`
Register Android device FCM token. Called automatically on app launch.
```
Auth: Native Cookie (publicToken + native_auth)
Body: {
  "token": "<FCM_TOKEN>",
  "timezone": "Asia/Kolkata",
  "deviceType": "android"
}
Response: { "success": true, "id": "..." }
```
> ⚠️ `timezone` must be a valid IANA timezone string (e.g. `"Asia/Kolkata"`)

---

### 🕛 CRON JOBS

#### `GET /api/cron/midnight-push`
Sends silent FCM push to all Android devices whose timezone is currently at midnight.
```
Auth: Header: Authorization: Bearer <CRON_SECRET>
Schedule: */15 * * * * (every 15 minutes — set in vercel.json)
Response: {
  "success": true,
  "utcTime": "...",
  "timezones": ["Asia/Kolkata"],
  "deviceCount": 142,
  "fcmResult": { "successCount": 140, "failureCount": 2 }
}
```

---

### 💳 PAYMENTS

#### `GET /api/payment/plans`
Get available subscription plans.
```
Auth: None (public)
Response: [{ "id", "name", "price", "currency", "features" }]
```

#### `POST /api/payment/create-order`
Create a Razorpay order.
```json
Body: { "planId": "pro_monthly" }
Response: { "orderId": "order_xxx", "amount": 29900, "currency": "INR" }
```

#### `POST /api/payment/verify`
Verify payment after Razorpay checkout.
```json
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "abc123"
}
Response: { "success": true, "plan": "pro" }
```

#### `POST /api/payment/webhook`
Razorpay webhook (auto-called by Razorpay on payment events).
```
Auth: Razorpay signature verification (RAZORPAY_WEBHOOK_SECRET)
Body: Razorpay event payload
```

#### `GET /api/payment/subscription`
Get current user's subscription status.
```
Auth: Session or Native Cookie
Response: { "plan": "pro", "expiresAt": "2027-01-01" }
```

---

### 📊 DASHBOARD & ANALYTICS

#### `GET /api/dashboard/stats`
Get dashboard summary stats.
```
Auth: Session or Native Cookie
Response: { "streak", "totalHabits", "completedToday", "growthHistory" }
```

#### `POST /api/analytics`
Log user analytics event (internal).
```json
Body: { "event": "wallpaper_set", "metadata": { ... } }
Response: { "success": true }
```

---

### 🏥 HEALTH

#### `GET /api/health`
Server health check.
```
Auth: None
Response: { "status": "ok", "timestamp": "..." }
```

---

### 🗃️ GDPR

#### `GET /api/gdpr/export`
Export all user data (GDPR).
```
Auth: Session
Response: JSON file download with all user data
```

#### `DELETE /api/gdpr/delete-account`
Permanently delete account and all data.
```
Auth: Session
Response: { "success": true }
```

---

### 🎖️ MILESTONES

#### `GET /api/milestones`
Get user life milestones.
```
Auth: Session or Native Cookie
Response: [{ "id", "title", "date", "category": "LifeMilestone" }]
```

---

### 🔧 ADMIN

#### `POST /api/admin/grant-access`
Manually grant premium access to a user (admin only).
```json
Body: { "email": "user@email.com", "plan": "pro" }
Response: { "success": true }
```

---

## 🔄 How Midnight Wallpaper Update Works (Full Flow)

```
Every 15 min (Vercel Cron)
    ↓
GET /api/cron/midnight-push  [Auth: CRON_SECRET]
    ↓
Check which IANA timezones have localHour === 0
    ↓
Fetch all Android FCM tokens for those timezones
    ↓
Send silent FCM push { type: "WALLPAPER_UPDATE_TRIGGER" }
    ↓ (on phone)
WallpaperMessagingService.onMessageReceived()
    ↓
Enqueue WallpaperWorker (WorkManager)
    ↓
WallpaperWorker loads /wallpaper-renderer?token=X in headless WebView
    ↓
WebView calls GET /api/wallpaper-data?token=X
    ↓
Canvas renders → window.Android.saveWallpaper(base64)
    ↓
WallpaperManager.setBitmap() → Wallpaper applied ✅

PARALLEL: Android Exact Alarm (12:00–12:30 AM) does same thing.
Duplicate guard: if lastUpdateDate == today → skip.
```

---

## 🧪 Quick Test Commands

```bash
# Test FCM cron (replace YOUR_CRON_SECRET)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://consistencygrid.com/api/cron/midnight-push

# Health check
curl https://consistencygrid.com/api/health

# Get wallpaper data (replace TOKEN)
curl "https://consistencygrid.com/api/wallpaper-data?token=TOKEN&canvasWidth=1080&canvasHeight=2340"
```
