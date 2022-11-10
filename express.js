const express = require("express");
const path = require("path");

const initAPI = require("./server/index");

function createExpress(env) {
  const app = express();
  const port = 3000;

  app.use(express.static(env.paths.STATIC_PATH));

  app.use(express.static(path.resolve(env.paths.ROOT_PATH, "./images")));

  initAPI(app, env);

  app.listen(port);

  return app;
}

module.exports = createExpress;
