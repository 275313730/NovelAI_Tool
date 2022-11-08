const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    onUpdateContent: (callback) => ipcRenderer.on('update-content', callback)
})