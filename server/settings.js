const fs = require("fs");

function getSettings(env) {
  const settings = JSON.parse(fs.readFileSync(env.paths.SETTINGS_PATH));
  return settings;
}

function modifySettings(env, newSettings) {
  if (env.infos.isPackaged) {
    fs.writeFileSync(env.paths.SETTINGS_PATH, JSON.stringify(newSettings));
  }
  return true;
}

module.exports = { getSettings, modifySettings };
