const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { checkImageDirs, getImagesData } = require("./image");
const { getSettings, modifySettings } = require("./settings");
const { loadTags, loadTagsInclude } = require("./tag");
const { downloadOnedriveData, getDownloadProgress } = require("./onedrive");
const { checkUpdate, updateTool } = require("./update");
const { openGitee } = require("./utils");

function initAPI(app, env) {
  app.get("/", (req, res) => {
    res.send("index.html");
  });

  app.get("/checkImageDirs", (req, res) => {
    res.send(checkImageDirs(env));
  });

  app.post("/getImagesData", jsonParser, (req, res) => {
    res.send(getImagesData(env, req.body));
  });

  app.get("/userSettings", (req, res) => {
    res.send(getSettings(env));
  });

  app.post("/userSettings", jsonParser, (req, res) => {
    res.send(modifySettings(env, req.body));
  });

  app.get("/tags", (req, res) => {
    res.send(loadTags(env));
  });

  app.get("/tagsInclude", (req, res) => {
    res.send(loadTagsInclude(env));
  });

  app.get("/downloadOnedriveData", async (req, res) => {
    const status = await downloadOnedriveData(env);
    res.send(status);
  });

  app.get("/downloadProgress", (req, res) => {
    res.send(getDownloadProgress());
  });

  app.get("/checkUpdate", jsonParser, async (req, res) => {
    const status = await checkUpdate(env, req.body.autoCheck);
    res.send(status);
  });

  app.get("/updateTool", async (req, res) => {
    const status = await updateTool(env);
    res.send(status);
  });

  app.get("/relaunch", (req, res) => {
    env.app.relaunch();
    env.app.exit(0);
  });

  app.get("/openGitee", (req, res) => {
    openGitee();
  });
}

module.exports = initAPI;
