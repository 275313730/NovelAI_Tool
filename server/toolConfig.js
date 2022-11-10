const fs = require("fs");
const path = require("path");

function getToolConfig(env) {
  let configBuffer = fs.readFileSync(env.paths.APP_CONFIG_PATH);
  let config = JSON.parse(configBuffer);
  return config;
}

function modifyToolConfig(env, newConfig) {
  let configString = JSON.stringify(newConfig);
  fs.writeFileSync(env.paths.APP_CONFIG_PATH, configString);
  return true;
}

module.exports = { getToolConfig, modifyToolConfig };
