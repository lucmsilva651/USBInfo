const { app, BrowserWindow, Menu, Tray, nativeImage, dialog, ipcMain } = require("electron/main");
const { is, platform } = require("@electron-toolkit/utils");
const pkg = require("../package.json");
const path = require("node:path");
const { usb } = require('usb');

if (require("electron-squirrel-startup")) return;

const appIcon = nativeImage.createFromPath(path.join(__dirname, "icons", "icon.png"));
const instanceLock = app.requestSingleInstanceLock();

let win;

function createWindow() {
  const webPreferences = {
    preload: path.join(__dirname, "preload.js"),
    autoplayPolicy: "no-user-gesture-required",
    ...(is.dev ? {} : { devTools: false }),
    contextIsolation: true,
    nodeIntegration: false,
    spellcheck: false,
    sandbox: true
  };

  const titleBarOverlay = {
    symbolColor: "#ffffff",
    color: "#00000000",
    height: 36
  };

  win = new BrowserWindow({
    disableAutoHideCursor: true,
    backgroundColor: "#1b1b22",
    ...(!platform.isMacOS
      ? {
        titleBarStyle: "hidden",
        titleBarOverlay
      }
      : {}),
    minimizable: false,
    maximizable: false,
    resizable: false,
    darkTheme: true,
    webPreferences,
    minHeight: 405,
    minWidth: 450,
    icon: appIcon,
    center: true,
    show: false,
    height: 405,
    width: 450
  });
  
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "static", "index.html"));
  if (is.dev) win.webContents.openDevTools();

  win.once("ready-to-show", () => {
    win.show();
    win.on('show', () => {
      win.focus();
    });
  });

  return win;
}

async function getDeviceInfo(device) {
  return new Promise((resolve) => {
    const info = {
      busNumber: device.busNumber,
      deviceAddress: device.deviceAddress,
      portNumbers: device.portNumbers,
      deviceDescriptor: device.deviceDescriptor,
      manufacturer: null,
      product: null,
      serialNumber: null
    };

    try {
      device.open();

      const descriptor = device.deviceDescriptor;
      let pending = 0;

      const checkComplete = () => {
        if (pending === 0) {
          device.close();
          resolve(info);
        }
      };

      const getInfo = (x, y) => {
        if (descriptor[x]) {
          pending++;
          device.getStringDescriptor(descriptor[x], (error, data) => {
            if (!error && data) {
              info[y] = data;
            }
            pending--;
            checkComplete();
          });
        }
      }
      
      const fields = [
        ["iManufacturer", "manufacturer"],
        ["iSerialNumber", "serialNumber"],
        ["iProduct", "product"],
      ];

      fields.forEach(([descKey, infoKey]) => getInfo(descKey, infoKey));

      if (pending === 0) {
        device.close();
        resolve(info);
      }
    } catch (error) {
      try { device.close(); } catch (e) {}
      resolve(info);
    }
  });
}

function createTray(win) {
  const tray = new Tray(appIcon);
  tray.setToolTip(pkg.packageName);

  const contextMenu = Menu.buildFromTemplate([
    { label: `Quit ${pkg.packageName}`, role: "quit" }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (win.isVisible() && !win.isMinimized()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  return tray;
}

if (!instanceLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    let mainWindow = createWindow();

    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });

    if (!platform.isMacOS) tray = createTray(mainWindow);

    usb.on('attach', async (device) => {
      const deviceInfo = await getDeviceInfo(device);
      mainWindow.webContents.send('connected', deviceInfo);
    });

    usb.on('detach', (device) => {
      mainWindow.webContents.send('disconnected', device);
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
      }
    });

    app.on("window-all-closed", () => {
      usb.unrefHotplugEvents();
      app.quit();
    });

    let isDialogOpen = false;
    ipcMain.handle("dialog", async (event, options) => {
      if (isDialogOpen) return;
      isDialogOpen = true;
      try {
        return await dialog.showMessageBox(mainWindow, {
          icon: appIcon,
          ...options
        });
      } finally {
        isDialogOpen = false;
      }
    });
  });
}