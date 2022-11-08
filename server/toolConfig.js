const fs = require("fs");
const path = require("path");

function getToolConfig(env) {
  const CONFIG_PATH = path.resolve(env.APP_PATH, "./config/tool.config.json");
  let configBuffer = fs.readFileSync(CONFIG_PATH);
  let config = JSON.parse(configBuffer);
  return config;
}

function modifyToolConfig(env, newConfig) {
  const CONFIG_PATH = path.resolve(env.APP_PATH, "./config/tool.config.json");
  let configString = JSON.stringify(newConfig);
  fs.writeFileSync(CONFIG_PATH, configString);
  return true;
}

module.exports = { getToolConfig, modifyToolConfig };
