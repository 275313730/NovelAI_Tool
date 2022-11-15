const { app, BrowserWindow, Menu } = require("electron");
const preHandle = require("./utils/preHandle");
const createExpress = require("./express");
require("./utils/errorCatch");

const env = preHandle.handleEnv(app);

function createWindow() {
  const appSettings = preHandle.handleAppSettings(env);

  const mainWindow = new BrowserWindow(appSettings);

  env.window = mainWindow;

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  const url = createExpress(env);
  mainWindow.loadURL(url);
});

app.on("window-all-closed", (evt) => {
  app.quit();
});
