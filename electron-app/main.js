const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  session,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

// ─── Config ───────────────────────────────────────────────
const APP_URL = "https://consistencygrid.com";
const WALLPAPER_DIR = path.join(app.getPath("appData"), "ConsistencyGrid");
const WALLPAPER_PATH = path.join(WALLPAPER_DIR, "wallpaper.png");
const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// ─── State ────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let wallpaperTimer = null;
let currentToken = null;
let isQuitting = false;

// ─── Ensure wallpaper dir exists ──────────────────────────
if (!fs.existsSync(WALLPAPER_DIR)) {
  fs.mkdirSync(WALLPAPER_DIR, { recursive: true });
}

// ─── Windows Wallpaper Setter (via PowerShell) ────────────
function setWindowsWallpaper(imagePath) {
  const { exec } = require("child_process");
  const psScript = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WP {
  [DllImport("user32.dll", CharSet=CharSet.Auto)]
  public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
[WP]::SystemParametersInfo(0x0014, 0, '${imagePath.replace(/\\/g, "\\\\")}', 0x01 -bor 0x02)
`;

  exec(
    `powershell -WindowStyle Hidden -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, " ")}"`,
    (err) => {
      if (err) {
        console.error("[Wallpaper] Failed to set wallpaper:", err.message);
      } else {
        console.log("[Wallpaper] ✅ Wallpaper updated successfully!");
      }
    }
  );
}

// ─── Download Image ───────────────────────────────────────
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    const cacheBustedUrl = `${url}?t=${Date.now()}`;

    protocol
      .get(cacheBustedUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

// ─── Read publicToken from Cookies ────────────────────────
async function getTokenFromCookies() {
  try {
    const cookies = await session.defaultSession.cookies.get({
      url: APP_URL,
    });

    // Try to find the publicToken cookie
    const tokenCookie = cookies.find(
      (c) => c.name === "publicToken" || c.name === "cg_public_token"
    );
    if (tokenCookie) return tokenCookie.value;

    // Fallback: try to extract from the page via JS
    if (mainWindow && !mainWindow.isDestroyed()) {
      const token = await mainWindow.webContents.executeJavaScript(
        `(function() {
          try {
            return localStorage.getItem('publicToken') || 
                   localStorage.getItem('cg_public_token') || 
                   null;
          } catch(e) { return null; }
        })()`
      );
      if (token) return token;
    }
  } catch (e) {
    console.error("[Token] Failed to get token:", e.message);
  }
  return null;
}

// ─── Core: Update Wallpaper ───────────────────────────────
async function updateWallpaper(force = false) {
  console.log("[Wallpaper] Checking for update...");

  // Try to get the token if we don't have it
  if (!currentToken) {
    currentToken = await getTokenFromCookies();
  }

  if (!currentToken) {
    console.log("[Wallpaper] No token yet — user may not be logged in.");
    return;
  }

  const wallpaperUrl = `${APP_URL}/w/${currentToken}/image.png`;

  try {
    await downloadImage(wallpaperUrl, WALLPAPER_PATH);
    setWindowsWallpaper(WALLPAPER_PATH);

    // Update tray tooltip
    if (tray) {
      tray.setToolTip(
        `ConsistencyGrid — Updated ${new Date().toLocaleTimeString()}`
      );
    }
  } catch (err) {
    console.error("[Wallpaper] Download failed:", err.message);
  }
}

// ─── Start auto-update timer ──────────────────────────────
function startWallpaperTimer() {
  if (wallpaperTimer) clearInterval(wallpaperTimer);
  wallpaperTimer = setInterval(() => updateWallpaper(), UPDATE_INTERVAL_MS);
  console.log("[Timer] Auto-update every 1 hour.");
}

// ─── Google OAuth Popup (clean isolated session) ──────────
// Opens Google sign-in in a fresh isolated window so it does NOT
// inherit all Gmail accounts logged into the main browser session.
// This gives a minimal, clean account picker — exactly like an app.
function openGoogleAuthPopup(authUrl) {
  const authWin = new BrowserWindow({
    width: 520,
    height: 680,
    title: "Sign in with Google",
    parent: mainWindow,
    modal: true,
    resizable: false,
    center: true,
    webPreferences: {
      // Use a completely separate partition so no existing Google
      // cookies/sessions bleed into this popup
      partition: "persist:google-auth-isolated",
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  authWin.setMenuBarVisibility(false);
  authWin.loadURL(authUrl);

  // After Google auth redirects back to our site, close popup & reload main
  authWin.webContents.on("did-navigate", async (e, url) => {
    if (url.startsWith(APP_URL)) {
      // Copy the session cookies from the isolated auth windows into the main session
      const cookies = await authWin.webContents.session.cookies.get({
        url: APP_URL,
      });
      for (const cookie of cookies) {
        await mainWindow.webContents.session.cookies.set({
          url: APP_URL,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || "/",
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate,
        });
      }
      authWin.close();
      mainWindow.loadURL(url);
    }
  });

  return authWin;
}

// ─── Create Main Window ───────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    title: "ConsistencyGrid",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
    },
    backgroundColor: "#0f172a",
    show: false, // show after ready
  });

  mainWindow.loadURL(APP_URL);

  // ── Intercept Google OAuth navigation ──────────────────
  // When the user clicks "Continue with Google", the main window
  // would navigate to accounts.google.com — we catch that and open
  // a clean popup instead so fewer/no accounts are pre-shown.
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.includes("accounts.google.com") || url.includes("google.com/o/oauth2")) {
      event.preventDefault();
      // Append prompt=select_account to force account chooser
      const authUrl = url.includes("prompt=")
        ? url
        : url + (url.includes("?") ? "&" : "?") + "prompt=select_account";
      openGoogleAuthPopup(authUrl);
    }
  });

  // Also catch new-window navigations (some OAuth flows open a popup)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("accounts.google.com") || url.includes("google.com/o/oauth2")) {
      const authUrl = url.includes("prompt=")
        ? url
        : url + (url.includes("?") ? "&" : "?") + "prompt=select_account";
      openGoogleAuthPopup(authUrl);
      return { action: "deny" }; // deny default popup
    }
    return { action: "allow" };
  });

  // Show window once it's ready (avoid white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // ── HABIT DETECTION: Listen for API calls ──────────────
  // When user toggles a habit, the page calls /api/habits/toggle
  // We intercept that response and immediately update wallpaper
  mainWindow.webContents.session.webRequest.onCompleted(
    { urls: [`${APP_URL}/api/habits/toggle*`, `${APP_URL}/api/habits*`] },
    async (details) => {
      if (
        details.method === "POST" &&
        details.statusCode >= 200 &&
        details.statusCode < 300
      ) {
        console.log(
          "[Trigger] Habit updated → triggering wallpaper update..."
        );
        // Small delay so the server has time to regenerate the image
        setTimeout(() => updateWallpaper(true), 3000);
      }
    }
  );

  // ── Also trigger on goals/settings changes ─────────────
  mainWindow.webContents.session.webRequest.onCompleted(
    {
      urls: [
        `${APP_URL}/api/goals*`,
        `${APP_URL}/api/settings*`,
        `${APP_URL}/api/generator*`,
      ],
    },
    async (details) => {
      if (
        (details.method === "POST" ||
          details.method === "PUT" ||
          details.method === "PATCH") &&
        details.statusCode >= 200 &&
        details.statusCode < 300
      ) {
        console.log("[Trigger] Data updated → refreshing wallpaper...");
        setTimeout(() => updateWallpaper(true), 3000);
      }
    }
  );

  // ── After login: read token & do first wallpaper update ─
  mainWindow.webContents.on("did-navigate", async (e, url) => {
    if (
      url.includes("/dashboard") ||
      url.includes("/habits") ||
      url.includes("/generator")
    ) {
      // Give the page time to load and set cookies/localStorage
      setTimeout(async () => {
        currentToken = await getTokenFromCookies();
        if (currentToken) {
          console.log("[Token] Got token after login:", currentToken);
          await updateWallpaper(true);
          startWallpaperTimer();
        }
      }, 2000);
    }
  });

  // Minimize to tray instead of quitting
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      tray.displayBalloon({
        title: "ConsistencyGrid",
        content: "Wallpaper updater is still running in the background!",
        icon: path.join(__dirname, "assets", "icon.ico"),
      });
    }
  });
}

// ─── Create System Tray ───────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, "assets", "tray-icon.png");
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open ConsistencyGrid",
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: "separator" },
    {
      label: "🔄 Update Wallpaper Now",
      click: async () => {
        await updateWallpaper(true);
      },
    },
    {
      label: "📂 Open Wallpaper Folder",
      click: () => {
        require("electron").shell.showItemInFolder(WALLPAPER_PATH);
      },
    },
    { type: "separator" },
    {
      label: "❌ Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("ConsistencyGrid – Wallpaper Updater");
  tray.setContextMenu(contextMenu);

  // Double click tray to open
  tray.on("double-click", () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// ─── IPC: triggered from preload.js (web page → main) ────
ipcMain.on("habit-updated", async () => {
  console.log("[IPC] Habit update received from webpage!");
  setTimeout(() => updateWallpaper(true), 2000);
});

ipcMain.on("get-version", (event) => {
  event.returnValue = app.getVersion();
});

// ─── App Lifecycle ────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();

  console.log("[App] ConsistencyGrid Desktop started.");
});

app.on("window-all-closed", (e) => {
  // Don't quit — keep running in tray
  e.preventDefault();
});

app.on("before-quit", () => {
  isQuitting = true;
  if (wallpaperTimer) clearInterval(wallpaperTimer);
});
