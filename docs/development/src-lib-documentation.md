# Documentation: `src/lib` Directory

The `/src/lib` directory contains the **core business logic**, **utility functions**, and **shared configurations** of the application. These files are "helper" libraries that are imported by your API routes and React components.

---

## 🏗️ Core Infrastructure (Database & Performance)

### `prisma.js`
*   **What it is:** The Database Client. Initializes the connection to your PostgreSQL database.
*   **Why it's here:** To prevent creating multiple connections to the database (which crashes apps in serverless environments like Vercel). It creates a *single* shared instance.
*   **Called By:** Almost every API route (e.g., `/api/habits`, `/api/goals`, `/api/auth`).
*   **Key Code:** `global.prisma = prisma` (saves it to global variable).

### `performance.js`
*   **What it is:** A utility to measure how fast your code runs.
*   **Why it's here:** To debug slow API responses. It logs how many milliseconds a function took.
*   **Called By:** Heavy data fetching routes like `dashboard-cache.js`.

### `rate-limit.js` / `rateLimit.js`
*   **What it is:** Security tool to stop hackers from spamming your API.
*   **Why it's here:** Prevents "Brute Force" attacks (guessing passwords 1000 times/sec).
*   **Called By:** `/api/login`, `/api/register`, and `/api/contact`.

---

## 🎨 Wallpaper Engine (The "Secret Sauce")

### `wallpaper/components.js`
*   **What it is:** The **Drawing Instructions** for your dynamic wallpaper.
*   **Why it's here:** This is the most critical file for the wallpaper. It contains functions like `drawGrid()`, `drawHeader()`, and `drawHeatmap()`.
*   **Called By:** 
    1.  **Server:** `/src/app/w/[token]/image.png/route.js` (to generate the actual PNG file).
    2.  **Client:** `/src/components/wallpaper/renderers/grid.js` (to show the live preview in the Generator).
    *   *Note: It allows both the server and the browser to draw the EXACT same image using shared logic.*

---

## 🔒 Security & Auth

### `apiSecurity.js`
*   **What it is:** Checks if a user is allowed to do something.
*   **Why it's here:** Ensures User A cannot delete User B's habits. Also sanitizes inputs to prevent SQL Injection.
*   **Called By:** All sensitive API routes (Update, Delete, Create).

### `csrf.js`
*   **What it is:** Cross-Site Request Forgery protection.
*   **Why it's here:** Prevents malicious websites from tricking your browser into deleting your account.
*   **Called By:** Form submissions and settings updates.

### `token.js`
*   **What it is:** Generates random strings (like the Public Token for wallpapers).
*   **Why it's here:** Simple helper to create `a1b2c3d4` type tokens.
*   **Called By:** User Registration, "Reset Public Token" button.

### `validation.js`
*   **What it is:** Checks if data is valid (e.g., "Is this a real email?", "Is password > 8 chars?").
*   **Why it's here:** Clean code. Instead of writing `if (email.includes('@'))` everywhere, we just call `validateEmail()`.
*   **Called By:** `/api/signup`, `/api/settings/save`.

---

## 🚀 Caching & Data Layer

### `api-cache.js` / `dashboard-cache.js`
*   **What it is:** A "Short-term Memory" for the server.
*   **Why it's here:** Calculating the dashboard stats (Streaks, Completion rates) is "expensive" (takes time). This saves the result for 60 seconds so the database doesn't get overloaded.
*   **Called By:** `/api/dashboard`, `/api/stats`.

### `cache-invalidation.js`
*   **What it is:** The "Memory Cleaner".
*   **Why it's here:** When you update a habit, the cached dashboard data is now *wrong*. This file deletes the old cache so the user sees fresh data immediately.
*   **Called By:** `HabitCard.js` (via API), `UpdateGoalModal.js`.

---

## 📊 Analytics & Monitoring

### `analytics.js` / `analytics-provider.js`
*   **What it is:** Tracks user behavior (e.g., "User clicked 'Upgrade Premium'").
*   **Why it's here:** To understand how people use the app and improve it.
*   **Called By:** Buttons like "Save Settings", "Add Goal".

### `sentry.js` / `sentry-client.js` / `sentry-server.js`
*   **What it is:** Error Tracking.
*   **Why it's here:** If the app crashes on someone's phone, Sentry sends you an email with the exact line of code number.
*   **Called By:** `next.config.mjs` (automatically wraps the whole app).

---

## 📧 Email & Communication

### `email.js`
*   **What it is:** Sends emails (Welcome, Password Reset).
*   **Why it's here:** Wraps an email provider (like Resend or SendGrid).
*   **Called By:** `/api/auth/register`, `/api/auth/forgot-password`.

---

## ⚖️ Legal & Compliance

### `gdpr.js`
*   **What it is:** "Right to be Forgotten" logic.
*   **Why it's here:** Required by law (GDPR/CCPA). It allows users to "Delete My Account" or "Export My Data".
*   **Called By:** `/settings/privacy` page.

---

## 📱 PWA (Progressive Web App)

### `pwa.js`
*   **What it is:** Configuration for installing the app on a phone home screen.
*   **Why it's here:** Handles "Service Workers" which let the app work offline.
*   **Called By:** `layout.js` (runs in background).

---

## 💰 Subscription & Premium

### `subscription-middleware.js` / `subscription-utils.js`
*   **What it is:** The "Bouncer". Checks if you paid.
*   **Why it's here:** 
    *   Determines: *Is this user Free or Premium?*
    *   Enforces limits: *Free users get 3 habits. Premium get unlimited.*
*   **Called By:** `/api/habits` (before adding a new one), `/api/wallpaper` (checking for custom themes).

---

## 🛠️ General Helpers

### `apiResponse.js` / `errorResponse.js`
*   **What it is:** Standardizes how the API talks back.
*   **Why it's here:** Ensures every success looks like `{ success: true, data: ... }` and every error looks like `{ success: false, error: "..." }`. Makes the frontend code much cleaner.
*   **Called By:** Every single API route.

### `db-optimization.js`
*   **What it is:** Advanced database tuning.
*   **Why it's here:** Helps execute complex queries faster (like calculating streaks over 365 days).
*   **Called By:** Streak calculation logic.

### `seo.js`
*   **What it is:** Search Engine Optimization helpers.
*   **Why it's here:** Generates meta tags keys so Google can find the site.
*   **Called By:** `layout.js`, `page.js`.

---

**Generated by Antigravity Agent**
