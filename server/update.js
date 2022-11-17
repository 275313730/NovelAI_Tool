const fs = require("fs");
const path = require("path");
const request = require("request");
const StreamZip = require("node-stream-zip");

let updateInfo = {
  needUpdate: false,
  chooseUpdate: false,
  currentVersion: null,
  newVersion: null,
  downloadUrl: "",
};

async function checkUpdate(env, autoCheck) {
  return new Promise(async (resolve) => {
    let appConfig = JSON.parse(fs.readFileSync(env.paths.APP_CONFIG_PATH));

    updateInfo.currentVersion = appConfig.version;
    updateInfo.newVersion = appConfig.version;

    let currentTime = Date.now();

    // 自动检测更新
    if (autoCheck && appConfig.lastCheckTime > 0) {
      let lastCheckDate = new Date(appConfig.lastCheckTime);
      let newCheckTime = lastCheckDate.setDate(lastCheckDate.getDate() + 1);
      if (currentTime < newCheckTime) {
        resolve(false);
      }
    }

    appConfig.lastCheckTime = currentTime;

    const { githubSource, giteeSource } = appConfig.source;

    // 通过请求github的latest-release获取版本信息
    const status = await requestVersionFromGithub(githubSource, appConfig.version);

    if (env.isPackaged) {
      fs.writeFileSync(env.paths.APP_CONFIG_PATH, JSON.stringify(appConfig));
    }

    if (status == 403 || status == 404) {
      resolve({ status: -1 });
    } else if (updateInfo.newVersion == updateInfo.currentVersion) {
      resolve({ status: 0 });
    } else {
      updateInfo.downloadUrl = `${giteeSource.url}${updateInfo.newVersion}/${updateInfo.newVersion}.zip`;
      resolve({ status: 1 });
    }
  });
}

async function requestVersionFromGithub(githubSource, version) {
  return new Promise((resolve) => {
    try {
      request(githubSource.url, githubSource.options, (err, res, body) => {
        let status = 200;
        if (body.includes("403")) {
          status = 403;
        } else {
          const data = JSON.parse(body);
          if (data.message) {
            status = 404;
          } else {
            const currentVersion = Number(version.replace("v", "").replace(/\./g, ""));
            const newVersion = Number(data.tag_name.replace("v", "").replace(/\./g, ""));

            if (newVersion > currentVersion) updateInfo.newVersion = data.tag_name;
          }
        }
        resolve(status);
      });
    } catch (error) {
      resolve(404);
    }
  });
}

async function updateTool(env) {
  return new Promise((resolve) => {
    const RESOURCES_PATH = path.resolve(env.paths.ROOT_PATH, "./resources");
    const RESOURCES_OLD_PATH = path.resolve(env.paths.ROOT_PATH, "./resourcesOld");
    const ZIP_PATH = path.resolve(env.paths.ROOT_PATH, `./${updateInfo.newVersion}.zip`);

    let stream = fs.createWriteStream(ZIP_PATH);
    request(updateInfo.downloadUrl)
      .pipe(stream)
      .on("close", async (err) => {
        if (err) resolve(false);
        fs.renameSync(RESOURCES_PATH, RESOURCES_OLD_PATH);
        const unzipStatus = await unzipFile(ZIP_PATH, env.paths.ROOT_PATH);
        if (!unzipStatus) {
          resolve(false);
        } else {
          removeDirSync(RESOURCES_OLD_PATH);
          resolve(true);
        }
      });
  });
}

async function unzipFile(ZIP_PATH, UNZIP_PATH) {
  return new Promise((resolve) => {
    const zip = new StreamZip({
      file: ZIP_PATH,
      storeEntries: true,
    });

    // 报错提示
    zip.on("error", (err) => {
      resolve(false);
    });

    zip.on("ready", () => {
      if (!fs.existsSync(UNZIP_PATH)) fs.mkdirSync(UNZIP_PATH);
      zip.extract(null, UNZIP_PATH, (err, count) => {
        resolve(true);
        zip.close();
      });
    });
  });
}

function removeDirSync(dir) {
  let files = fs.readdirSync(dir);
  for (let file of files) {
    let newPath = path.join(dir, file);
    let stat = fs.statSync(newPath);
    if (stat.isDirectory()) {
      //如果是文件夹就递归下去
      removeDirSync(newPath);
    } else {
      //删除文件
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
}

module.exports = { checkUpdate, updateTool };
