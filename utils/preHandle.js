const fs = require("fs");
const path = require("path");

function handleEnv(app) {
  const APP_PATH = app.getAppPath();
  const STATIC_PATH = path.resolve(APP_PATH, "./dist");
  const ROOT_PATH = app.isPackaged ? path.resolve(APP_PATH, "../../") : APP_PATH;
  const APP_CONFIG_PATH = path.resolve(APP_PATH, "./app.config.json");
  const IMAGES_PATH = path.resolve(ROOT_PATH, "./images");

  return {
    paths: {
      ROOT_PATH,
      APP_PATH,
      STATIC_PATH,
      APP_CONFIG_PATH,
      IMAGES_PATH,
    },
    infos: {
      isPackaged: app.isPackaged,
      platform: process.platform,
      APP_URL: "http://localhost:3000",
    },
    window: null,
    app,
  };
}

function handleAppSettings(env) {
  const appConfig = JSON.parse(fs.readFileSync(env.paths.APP_CONFIG_PATH));
  const { appSettings } = appConfig;

  if (appSettings.webPreferences.preload) {
    appSettings.webPreferences.preload = path.resolve(env.paths.APP_PATH, appSettings.webPreferences.preload);
  }
  return appSettings;
}

function handleServer(env, callback) {
  const checkUpdate = require("./update/index");
  checkUpdate(env, (updateStatus) => {
    callback(updateStatus);
  });
}

module.exports = { handleAppSettings, handleEnv, handleServer };
