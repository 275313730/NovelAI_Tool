const express = require("express");
const path = require("path");
const initAPI = require("./server/index");

function createExpress(env) {
  const server = express();
  const port = 3000;

  server.use(express.static(env.paths.STATIC_PATH));

  server.use(express.static(path.resolve(env.paths.ROOT_PATH, "./images")));

  initAPI(server, env);

  server.listen(port);

  const url = `http://localhost:${port}`;

  return url;
}

module.exports = createExpress;
