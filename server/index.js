const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { checkImageDirs, getImagesData } = require("./image");
const { getToolConfig, modifyToolConfig } = require("./toolConfig");
const { loadTags, loadTagsInclude } = require("./tag");

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

  app.get("/configData", (req, res) => {
    res.send(getToolConfig(env));
  });

  app.post("/configData", jsonParser, (req, res) => {
    res.send(modifyToolConfig(env, req.body));
  });

  app.get("/tags", (req, res) => {
    res.send(loadTags(env));
  });

  app.get("/tagsInclude", (req, res) => {
    res.send(loadTagsInclude(env));
  });
}

module.exports = initAPI;
