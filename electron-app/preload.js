const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API to the web page running inside the WebView
contextBridge.exposeInMainWorld("consistencyGridDesktop", {
  // The website can call this to notify the app of a habit update
  notifyHabitUpdated: () => {
    ipcRenderer.send("habit-updated");
  },
  // Get the app version
  getVersion: () => ipcRenderer.sendSync("get-version"),
  // Is this running inside the desktop app?
  isDesktopApp: true,
});

// ─── Smart Injection: intercept fetch calls on the web page ──────────────
// We monkey-patch fetch so when /api/habits/toggle is called, we also trigger wallpaper update
window.addEventListener("DOMContentLoaded", () => {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const result = await originalFetch.apply(this, args);

    // Check if this was a habit/goal/settings update call
    const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
    const method = (args[1]?.method || "GET").toUpperCase();
    const isUpdateCall =
      (url.includes("/api/habits") ||
        url.includes("/api/goals") ||
        url.includes("/api/settings") ||
        url.includes("/api/generator")) &&
      (method === "POST" || method === "PUT" || method === "PATCH");

    if (isUpdateCall && result.ok) {
      // Notify the main process to update the wallpaper
      try {
        ipcRenderer.send("habit-updated");
      } catch (e) {
        // silently fail
      }
    }

    return result;
  };
});
