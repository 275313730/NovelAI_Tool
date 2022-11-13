const fs = require("fs");

function getUserSettings(env) {
  const appConfig = JSON.parse(fs.readFileSync(env.paths.APP_CONFIG_PATH));
  const { userSettings } = appConfig;
  return userSettings;
}

function modifyUserSettings(env, userSettings) {
  if (env.info.isPackaged) {
    const appConfig = JSON.parse(fs.readFileSync(env.paths.APP_CONFIG_PATH));
    for (let key in userSettings) {
      appConfig.userSettings[key] = userSettings[key];
    }
    fs.writeFileSync(env.paths.APP_CONFIG_PATH, JSON.stringify(appConfig));
  }
  return true;
}

module.exports = { getUserSettings, modifyUserSettings };
