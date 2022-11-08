const fs = require("fs");
const path = require("path");

function handleEnv(app) {
  const APP_PATH = app.getAppPath();
  const STATIC_PATH = path.resolve(APP_PATH, "./dist");
  const ROOT_PATH = app.isPackaged ? path.resolve(APP_PATH, "../../") : APP_PATH;

  return {
    isPackaged: app.isPackaged,
    ROOT_PATH,
    APP_PATH,
    STATIC_PATH,
    platform: process.platform,
    mainWindow: null,
    eletronApp: app,
    APP_URL: "http://localhost:3000",
  };
}

function handleAppConfig(env) {
  const APPCONFIG_PATH = path.resolve(env.APP_PATH, "./config/app.config.json");
  let appConfig = JSON.parse(fs.readFileSync(APPCONFIG_PATH));

  if (appConfig.webPreferences.preload) {
    appConfig.webPreferences.preload = path.resolve(env.APP_PATH, appConfig.webPreferences.preload);
  }
  return appConfig;
}

function handleServer(env, callback) {
  const checkUpdate = require("./update/update");
  checkUpdate(env, (updateStatus) => {
    callback(updateStatus);
  });
}

module.exports = { handleAppConfig, handleEnv, handleServer };
