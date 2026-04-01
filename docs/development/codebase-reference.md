# Master Codebase Reference: ConsistencyGrid

This document is the **Authoritative Guide** to the ConsistencyGrid codebase. It details every directory, every file, its purpose, its connections (who calls it), and its internal logic.

---

## 📂 Root Directory (Configuration)

### `next.config.mjs`
*   **Role:** The main configuration for the Next.js server.
*   **Key Logic:** 
    *   Enables "Standalone Output" (for Docker/Vercel).
    *   Configures `serverComponentsExternalPackages` to allow `canvas` to run on the server (Critical for wallpaper generation).
    *   Sets up Security Headers.

### `tailwind.config.js`
*   **Role:** Design System definitions.
*   **Key Logic:** Defines your custom colors (e.g., specific shades of `orange`), fonts (`Inter`), and animation tokens (`animate-fade-in`).

### `middleware.js`
*   **Role:** The Traffic Cop.
*   **Logic:** 
    *   Runs before *every* request.
    *   Checks: "Is the user logged in?"
    *   If No & trying to access `/dashboard` -> Redirect to `/login`.
    *   If Yes & trying to access `/login` -> Redirect to `/dashboard`.

---

## 📂 `src/app` (Routes & Pages)

This directory follows the "App Router" pattern. Folder names = URL paths.

### 🏠 Public Pages
*   **`page.js` (Root):** The Landing Page. Explains the product to visitors.
*   **`login/page.js`:** Sign In form. Calls `/api/auth/signin`.
*   **`signup/page.js`:** Registration form. Calls `/api/auth/signup`.
*   **`pricing/page.js`:** Pricing table (Free vs Premium).

### 🛡️ Dashboard (Protected Area)
*   **`dashboard/page.js`:** 
    *   **Role:** The Main Command Center.
    *   **What it does:** Fetches `User`, `Habits`, `Goals` and displays the "Today's Overview".
*   **`habits/page.js`:**
    *   **Role:** Dedicated Habit Manager.
    *   **Uses:** `<HabitCard />` list.
*   **`goals/page.js`:**
    *   **Role:** Long-term vision board.
    *   **Uses:** `<GoalCard />`, `<MilestoneItem />`.
*   **`reminders/page.js`:**
    *   **Role:** Calendar/Reminder manager.
    *   **Uses:** `<ReminderList />`.
*   **`streaks/page.js`:**
    *   **Role:** Gamification center. Shows your consistency heatmaps.
*   **`generator/page.js`:**
    *   **Role:** The "Wallpaper Editor".
    *   **Visuals:** Shows a live preview of the wallpaper on the right, settings form on the left.
    *   **Connection:** When you click "Save", it calls `/api/settings/save` AND triggers `sendWallpaperToAndroid`.

### ⚡ The Engine (`src/app/w`)
*   **`w/[token]/image.png/route.js`:**
    *   **CRITICAL FILE.**
    *   **Role:** This **IS** the wallpaper. It is not a page; it is an *API Route* that returns an image.
    *   **Logic:** 
        1. Reads `[token]` from URL.
        2. Finds User.
        3. Generates Canvas.
        4. Draws Habits/Goals/Grid.
        5. Returns PNG buffer.

---

## 📂 `src/app/api` (The Backend)

Backend logic runs here. Frontend calls these URLs to fetch/save data.

*   **`auth/[...nextauth]/route.js`:** Handles Google Login & Session management.
*   **`habits/route.js`:** `GET` (fetch habits), `POST` (create habit).
*   **`habits/toggle/route.js`:** `POST` (mark habit as done/undone). **Triggers Auto-Sync.**
*   **`goals/route.js`:** CRUD for goals.
*   **`reminders/route.js`:** CRUD for reminders.
*   **`settings/save/route.js`:** Updates wallpaper preferences (Theme, Layout). **Triggers Auto-Sync.**

---

## 📂 `src/components` (The UI Library)

### `dashboard`
*   **`Sidebar.js`:**
    *   **Role:** Left navigation menu.
    *   **Key Feature:** Contains the manual "Sync Wallpaper" button logic.
*   **`BottomNav.js`:** Mobile version of the Sidebar.
*   **`WallpaperCard.js`:** "Current Wallpaper" widget on the dashboard.

### `habits`
*   **`HabitCard.js`:** 
    *   **Role:** The single row showing a habit name + checkboxes.
    *   **Logic:** Contains the `toggleHabit()` function which calls the API and then calls `sendWallpaperToAndroid`.
*   **`AddHabitModal.js`:** The popup form to create a new habit.

### `goals`
*   **`GoalCard.js`:** Displays a goal progress bar.
*   **`MilestoneItem.js`:** Displays a "Life Milestone" (e.g., "Age 30: Buy House"). These are pinned to the Life Grid.

### `wallpaper` (Preview Logic)
*   **`renderers/grid.js`:**
    *   **Role:** Client-side preview renderer.
    *   **Why:** We can't use `node-canvas` (server tool) in the browser, so this file uses the browser's native `<canvas>` API to draw the *exact same design* as the server, so the user sees a "What You See Is What You Get" preview in the Generator.

### `settings`
*   **`WallpaperPreference.js`:**
    *   **Role:** Mobile-only component.
    *   **Logic:** Asks the user "Apply to Home Screen, Lock Screen, or Both?". Uses `window.Android.setWallpaperTarget()`.

---

## 📂 `src/lib` (The Brain)
*(See `SRC_LIB_DOCUMENTATION.md` for full details)*
*   **`wallpaper/components.js`:** The shared drawing functions. Used by BOTH the Server Route and the Client Preview. **If you want to change how the wallpaper looks, EDIT THIS.**

---

## 📂 `src/utils` (Helpers)

### `sendWallpaperToAndroid.js`
*   **Role:** The Bridge.
*   **Logic:** 
    *   Checks if `window.Android` exists (is the app running on a phone?).
    *   Appends a timestamp `?t=...` to the wallpaper URL (Cache Busting).
    *   Calls `window.Android.saveWallpaperUrl()`.
    *   Implements "Double-Tap" retry logic (sends command twice to handle database lag).

---

## 🔄 Data Flow Examples

### Cycle 1: The "Habit Check"
1.  **User** clicks checkbox in `HabitCard.js`.
2.  **Frontend** calls `POST /api/habits/toggle`.
3.  **Backend** updates PostgreSQL database.
4.  **Frontend** (on success) calls `sendWallpaperToAndroid()`.
5.  **Util** calls `window.Android.saveWallpaperUrl(url + timestamp)`.
6.  **Phone** receives Native Command.
7.  **Phone** downloads image from `/w/[token]/image.png`.
8.  **Server** `/w/.../route.js` runs, fetches *new* data from DB, draws new PNG.
9.  **Phone** sets new PNG as wallpaper.
10. **Toast** "Updating Wallpaper..." appears on screen.

### Cycle 2: The "Generator Save"
1.  **User** changes Theme to "Dark Mode" in `/generator`.
2.  **Frontend** preview updates immediately (`renderers/grid.js`).
3.  **User** clicks "Save Changes".
4.  **Frontend** calls `POST /api/settings/save`.
5.  **Backend** saves JSON settings to DB.
6.  **Frontend** calls `sendWallpaperToAndroid()`.
7.  (Rest is same as above).

---

**Generated by Antigravity Agent**
