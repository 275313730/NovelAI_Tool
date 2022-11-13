const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { checkImageDirs, getImagesData } = require("./image");
const { getUserSettings, modifyUserSettings } = require("./userSettings");
const { loadTags, loadTagsInclude } = require("./tag");
const { downloadOnedriveData, getDownloadProgress } = require("./onedrive");

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
    res.send(getUserSettings(env));
  });

  app.post("/userSettings", jsonParser, (req, res) => {
    res.send(modifyUserSettings(env, req.body));
  });

  app.get("/tags", (req, res) => {
    res.send(loadTags(env));
  });

  app.get("/tagsInclude", (req, res) => {
    res.send(loadTagsInclude(env));
  });

  app.get("/downloadOnedriveData", (req, res) => {
    downloadOnedriveData(env, (status) => {
      res.send(status);
    });
  });

  app.get("/downloadProgress", (req, res) => {
    res.send(getDownloadProgress());
  });
}

module.exports = initAPI;
