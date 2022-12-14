const { app, BrowserWindow, Menu } = require("electron");
const preHandle = require("./utils/preHandle");
const createExpress = require("./express");

const env = preHandle.handleEnv(app);

function createWindow() {
  const appConfig = preHandle.handleAppConfig(env);

  const mainWindow = new BrowserWindow(appConfig);

  env.mainWindow = mainWindow;

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  return mainWindow;
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  preHandle.handleServer(env, (isUpdated) => {
    if (isUpdated) {
      app.relaunch();
      app.exit(0);
    } else {
      createExpress(env);
      mainWindow.loadURL(env.APP_URL);
    }
  });
});

app.on("window-all-closed", (evt) => {
  app.quit();
});
