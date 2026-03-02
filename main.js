const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function getDistPath() {
    // Try multiple candidate paths to find index.html
    const candidates = [
        // 1. Same folder as main.js (electron-packager structure)
        path.join(__dirname, 'dist', 'index.html'),
        // 2. resources/app/dist (electron-builder extraResources)
        path.join(__dirname, '..', 'app', 'dist', 'index.html'),
    ];
    for (const p of candidates) {
        try { if (fs.existsSync(p)) return p; } catch (e) { }
    }
    return candidates[0];
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 600,
        title: 'Shoe POS',
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (!app.isPackaged) {
        win.loadURL('http://localhost:5173/');
        win.webContents.on('did-fail-load', () => {
            setTimeout(() => win.loadURL('http://localhost:5173/'), 1500);
        });
    } else {
        win.loadFile(getDistPath());
    }

    win.webContents.setWindowOpenHandler(({ url }) => {
        const isLocal = url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('blob:');
        if (isLocal) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: { width: 900, height: 700, autoHideMenuBar: true },
            };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
