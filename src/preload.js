const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('usb', {
  onDisconnected: (callback) => ipcRenderer.on('disconnected', (_, device) => callback(device)),
  onConnected: (callback) => ipcRenderer.on('connected', (_, device) => callback(device)),
  exportData: (...args) => ipcRenderer.invoke("export", ...args)
});

contextBridge.exposeInMainWorld("api", {
  alert: (options) => ipcRenderer.invoke("dialog", options),
  openExt: (url) => ipcRenderer.invoke("open", url),
});