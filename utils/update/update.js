const { dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const request = require("request");
const StreamZip = require("node-stream-zip");

async function checkUpdate(env, callback) {
  await env.mainWindow.loadFile(path.resolve(env.APP_PATH, "./utils/update/index.html"));

  const TOOLINFO_PATH = path.resolve(env.APP_PATH, "./config/tool.update.json");

  let toolInfo = JSON.parse(fs.readFileSync(TOOLINFO_PATH));

  let updateInfo = {
    status: 200,
    needUpdate: false,
    chooseUpdate: false,
    currentVersion: toolInfo.version,
    newVersion: toolInfo.version,
    downloadUrl: "",
  };

  let currentTime = Date.now();
  if (toolInfo.lastCheckTime > 0) {
    let lastCheckDate = new Date(toolInfo.lastCheckTime);
    let newCheckTime = lastCheckDate.setDate(lastCheckDate.getDate() + 1);
    if (currentTime < newCheckTime) {
      return callback(false);
    }
  }

  toolInfo.lastCheckTime = currentTime;

  const { githubSource, giteeSource } = toolInfo.source;

  request(githubSource.url, githubSource.options, (err, res, body) => {
    if (err) throw err;
    if (body.includes("403")) {
      updateInfo.status = 403;
    } else {
      const data = JSON.parse(body);
      if (data.message) {
        updateInfo.status = 404;
      } else {
        updateInfo.newVersion = data.tag_name;
        updateInfo.downloadUrl = `${giteeSource.url}${updateInfo.newVersion}/${updateInfo.newVersion}.zip`;

        const currentVersion = Number(toolInfo.version.replace("v", "").replace(/\./g, ""));
        const newVersion = Number(data.tag_name.replace("v", "").replace(/\./g, ""));

        if (newVersion > currentVersion) {
          updateInfo.needUpdate = true;
          const updateDialog = dialog.showMessageBoxSync(env.mainWindow, {
            message: `检查到新版本${updateInfo.newVersion}发布，是否更新(取消后今日不会再出现)`,
            buttons: ["取消", "更新"],
            defaultId: 1,
          });
          updateInfo.chooseUpdate = updateDialog == 1;
          if (updateDialog == 1) {
            env.mainWindow.webContents.send("update-content", 1);
          }
        }
      }

      if (updateInfo.status == 403) {
        dialog.showMessageBoxSync(env.mainWindow, {
          message: "无法获取更新数据",
        });
      }
      if (updateInfo.needUpdate && updateInfo.chooseUpdate) {
        updateVersion(env, updateInfo, (updateStatus) => {
          callback(updateStatus);
        });
      } else {
        callback(false);
      }
    }
  });
}

function updateVersion(env, updateInfo, callback) {
  const ZIP_PATH = path.resolve(env.ROOT_PATH, `./${updateInfo.newVersion}.zip`);
  const UNZIP_PATH = env.ROOT_PATH;
  let stream = fs.createWriteStream(ZIP_PATH);
  env.mainWindow.webContents.send("update-content", 2);
  request(updateInfo.downloadUrl)
    .pipe(stream)
    .on("close", (err) => {
      env.mainWindow.webContents.send("update-content", 3);
      unzipFile(ZIP_PATH, UNZIP_PATH, (isUnziped) => {
        if (isUnziped) {
          callback(true);
        } else {
          callback(false);
        }
      });
    });
}

function unzipFile(ZIP_PATH, UNZIP_PATH, callback) {
  const zip = new StreamZip({
    file: ZIP_PATH,
    storeEntries: true,
  });

  // 报错提示
  zip.on("error", (err) => {
    callback(false);
  });

  zip.on("ready", () => {
    if (!fs.existsSync(UNZIP_PATH)) fs.mkdirSync(UNZIP_PATH);
    zip.extract(null, UNZIP_PATH, (err, count) => {
      callback(true);
      zip.close();
    });
  });
}

module.exports = checkUpdate;
