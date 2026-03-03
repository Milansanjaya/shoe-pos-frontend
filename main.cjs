const { app, BrowserWindow, shell, ipcMain } = require('electron');
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
            webSecurity: false, // Required: Vite adds crossorigin attrs that CORS-block under file://
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
            const isPrint = url.includes('/print');
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: isPrint ? 800 : 900,
                    height: isPrint ? 700 : 700,
                    autoHideMenuBar: true,
                    webPreferences: {
                        contextIsolation: true,
                        nodeIntegration: false,
                    },
                },
            };
        }
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // When a child window finishes loading a /print URL, trigger silent print
    app.on('browser-window-created', (_e, childWin) => {
        childWin.webContents.on('did-finish-load', () => {
            const winUrl = childWin.webContents.getURL();
            if (winUrl.includes('/print')) {
                childWin.webContents.print(
                    { silent: false, printBackground: true },
                    (_success, _errorType) => {
                        // Close the window after print dialog is dismissed
                        if (!childWin.isDestroyed()) childWin.close();
                    }
                );
            }
        });
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
