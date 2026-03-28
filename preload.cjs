const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    printSilent: (html) => ipcRenderer.invoke('print-silent', html),
    isElectron: true,
});
