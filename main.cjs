const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function getDistPath() {
    const candidates = [
        path.join(__dirname, 'dist', 'index.html'),
        path.join(__dirname, '..', 'app', 'dist', 'index.html'),
    ];
    for (const p of candidates) {
        try { if (fs.existsSync(p)) return p; } catch (e) { }
    }
    return candidates[0];
}

/* =============================================
   IPC: Silent Print — no dialog
   Uses Electron webContents.print({ silent: true })
   Margins: 'printableArea' respects printer's
   physical non-addressable zone (EPSON TM-U220)
============================================= */
ipcMain.handle('print-silent', async (event, htmlContent) => {
    const tmpPath = path.join(os.tmpdir(), `shoe-inv-${Date.now()}.html`);
    fs.writeFileSync(tmpPath, htmlContent, 'utf-8');

    const printWin = new BrowserWindow({
        show: false,
        width: 600,
        height: 800,
        webPreferences: { nodeIntegration: false, contextIsolation: true, webSecurity: false },
    });

    // Wait for page to load
    await new Promise((resolve, reject) => {
        printWin.webContents.once('did-finish-load', resolve);
        printWin.webContents.once('did-fail-load', (e, c, d) => reject(new Error(d)));
        printWin.loadFile(tmpPath);
    });

    // Wait for layout/fonts to render
    await new Promise(r => setTimeout(r, 800));

    // Find default printer
    const printers = await printWin.webContents.getPrintersAsync();
    const defaultPrinter = printers.find(p => p.isDefault) || printers[0];

    // Send print job silently — marginType:none gives CSS full positional control
    // body padding-left:8mm in HTML keeps content past EPSON's non-addressable zone
    printWin.webContents.print({
        silent: true,
        printBackground: true,
        margins: { marginType: 'none' },
        ...(defaultPrinter ? { deviceName: defaultPrinter.name } : {}),
    });

    // Wait for spooler, then clean up
    await new Promise(r => setTimeout(r, 3000));
    if (!printWin.isDestroyed()) printWin.close();
    try { fs.unlinkSync(tmpPath); } catch (_) { }

    return { success: true };
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 600,
        title: 'Shoe POS',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),  // Exposes electronAPI to renderer
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false,
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
