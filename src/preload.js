const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('usb', {
  onConnected: (callback) => ipcRenderer.on('connected', (_, device) => callback(device)),
  onDisconnected: (callback) => ipcRenderer.on('disconnected', (_, device) => callback(device)),
});

contextBridge.exposeInMainWorld("api", {
  alert: (options) => ipcRenderer.invoke("dialog", options)
});