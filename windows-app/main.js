const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

let mainWindow;
let tray;
let updateInterval;

const APP_NAME = "ConsistencyGrid";
const DEFAULT_URL = "https://consistencygrid.com/dashboard";
const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: APP_NAME,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadURL(DEFAULT_URL);

    // Minimize to tray instead of closing
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'icon.ico');
    tray = new Tray(fs.existsSync(iconPath) ? iconPath : path.join(__dirname, 'placeholder_icon.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open ConsistencyGrid', click: () => mainWindow.show() },
        { label: 'Update Wallpaper Now', click: () => syncWallpaper() },
        { type: 'separator' },
        { label: 'Exit', click: () => {
            app.isQuitting = true;
            app.quit();
        }}
    ]);

    tray.setToolTip(APP_NAME);
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

// Wallpaper sync logic
async function syncWallpaper() {
    console.log('Attempting to sync wallpaper...');
    
    try {
        // We need the user's public token. 
        // We can try to get it from the WebView's localStorage or cookies
        const publicToken = await mainWindow.webContents.executeJavaScript('localStorage.getItem("consistencygrid_token") || ""');
        
        if (!publicToken) {
            console.log('No token found. Make sure you are logged in.');
            return;
        }

        const imageUrl = `https://consistencygrid.com/w/${publicToken}/image.png?t=${Date.now()}`;
        const savePath = path.join(app.getPath('userData'), 'wallpaper.png');

        downloadImage(imageUrl, savePath, (err) => {
            if (err) {
                console.error('Download failed:', err);
                return;
            }
            setWallpaper(savePath);
        });
    } catch (e) {
        console.error('Sync failed:', e);
    }
}

function downloadImage(url, dest, callback) {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(callback);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => {});
        callback(err.message);
    });
}

function setWallpaper(imagePath) {
    const psScript = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WallpaperHelper {
    public const int SPI_SETDESKWALLPAPER = 20;
    public const int SPIF_UPDATEINIFILE = 0x01;
    public const int SPIF_SENDWININICHANGE = 0x02;

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
[WallpaperHelper]::SystemParametersInfo([WallpaperHelper]::SPI_SETDESKWALLPAPER, 0, "${imagePath.replace(/\\/g, '\\\\')}", [WallpaperHelper]::SPIF_UPDATEINIFILE -bor [WallpaperHelper]::SPIF_SENDWININICHANGE)
`;

    const tempPsFile = path.join(app.getPath('temp'), 'set-wall.ps1');
    fs.writeFileSync(tempPsFile, psScript);

    exec(`powershell.exe -ExecutionPolicy Bypass -File "${tempPsFile}"`, (error) => {
        if (error) {
            console.error('PowerShell error:', error);
        } else {
            console.log('Wallpaper set successfully!');
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    // Start sync interval
    updateInterval = setInterval(syncWallpaper, UPDATE_INTERVAL_MS);
    
    // Also sync on startup after a delay
    setTimeout(syncWallpaper, 10000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // We handle this in the 'close' event of mainWindow to keep it in tray
    }
});
