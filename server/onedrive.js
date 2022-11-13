const request = require("request");
const fs = require("fs");
const path = require("path");

const fileListApi = "https://www.roanne.fun/fileList";
const fileListVersionApi = "https://www.roanne.fun/fileListVersion";

let maxDownloadThreads = 10;
let currentDownloadThreads = 1;
let currentCount = -1;
let fileListCount = 0;

function downloadOnedriveData(env, callback) {
  getFileList(env, (data) => {
    fileListCount = data.length;
    tryDownloadImage(env, data, () => {
      currentCount = -1;
      callback(true);
    });
  });
}

function getFileList(env, callback) {
  const fileListPath = path.resolve(env.paths.DATA_PATH, "./fileList.json");
  const APP_CONFIG_PATH = env.paths.APP_CONFIG_PATH;
  let appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH));

  request(fileListVersionApi, (err, res, body) => {
    if (err) throw err;
    const version = JSON.parse(body).version;
    if (env.version != Number(version)) {
      request(fileListApi, (err, res, body) => {
        if (err) {
          return callback(false);
        }
        if (appConfig.isPackaged) {
          let appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH));
          appConfig.fileListVersion = version;
          fs.writeFileSync(APP_CONFIG_PATH, JSON.stringify(appConfig));
        }
        fs.writeFileSync(fileListPath, body);
        callback(JSON.parse(body));
      });
    } else {
      const data = fs.readFileSync(fileListPath);
      callback(JSON.parse(data));
    }
  });
}

function tryDownloadImage(env, data, callback) {
  // console.log(`下载总数:${currentCount},当前线程数:${currentDownloadThreads}`);
  if (currentCount < data.length - 1) {
    currentCount += 1;
    setImmediate(() => {
      downloadImage(env, data, callback);
    });
    if (currentDownloadThreads < maxDownloadThreads) {
      currentDownloadThreads += 1;
      tryDownloadImage(env, data, callback);
    }
  } else {
    if (currentDownloadThreads > 1) {
      currentDownloadThreads -= 1;
    } else {
      callback(true);
    }
  }
}

function downloadImage(env, data, callback) {
  const imageDir = path.resolve(env.paths.IMAGES_PATH, "./t4网盘");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

  let imageData = data[currentCount];
  const imagePath = path.resolve(imageDir, `./${imageData.name}`);

  if (fs.existsSync(imagePath)) {
    tryDownloadImage(env, data, callback);
  } else {
    request(imageData.rawUrl)
      .pipe(fs.createWriteStream(imagePath))
      .on("close", function (err) {
        tryDownloadImage(env, data, callback);
      });
  }
}

function getDownloadProgress() {
  if (fileListCount == 0 || currentCount == -1) {
    return { progress: 0 };
  } else {
    return { progress: currentCount / fileListCount };
  }
}

module.exports = { downloadOnedriveData, getDownloadProgress };
