# ConsistencyGrid – Windows Desktop App

A native Windows desktop app built with Electron that wraps the ConsistencyGrid website and **auto-updates your desktop wallpaper** every time you mark a habit!

## How it works

- Opens `https://consistencygrid.com` in a native app window
- Runs in the **System Tray** (background) when you close the window
- The moment you **mark a habit**, **update a goal**, or **change settings** on the website — your desktop wallpaper automatically updates within 3 seconds

## Development Setup

```bash
cd electron-app
npm install
npm start
```

## Build Windows Installer (.exe)

```bash
npm run build
# Output: dist/ConsistencyGrid Setup 1.0.0.exe
```

## How Wallpaper Update Works

1. After you log in, the app reads your `publicToken` from cookies/localStorage
2. It watches all API calls to `/api/habits/toggle`, `/api/goals`, `/api/settings`
3. On any update → it downloads `https://consistencygrid.com/w/{token}/image.png`
4. Sets it as Windows desktop wallpaper using `SystemParametersInfo` Windows API
5. Also runs a fallback auto-update every 1 hour

## System Tray Menu

Right-click the tray icon to:
- Open ConsistencyGrid
- Update Wallpaper Now
- Open Wallpaper Folder
- Quit
