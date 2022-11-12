const request = require("request");
const fs = require("fs");
const path = require("path");

const fileListApi = "https://www.roanne.fun/fileList";
const fileListVersionApi = "https://www.roanne.fun/fileListVersion";

function getFileList(callback) {
  request(fileListApi, (err, res, body) => {
    if (err) {
      return callback(false);
    }
    callback(body);
  });
}

function getFileListVersion(env, callback) {
  const APP_CONFIG_PATH = env.paths.APP_CONFIG_PATH;
  let appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH));

  request(fileListVersionApi, (err, res, body) => {
    const version = JSON.parse(body).version;
    callback(appConfig.fileListVersion != version, version);
  });
}

function downloadOnedriveData(env, callback) {
  const fileListPath = path.resolve(env.paths.DATA_PATH, "./fileList.json");
  const APP_CONFIG_PATH = env.paths.APP_CONFIG_PATH;

  // getFileListVersion(env, (version) => {
  //   if (env.version != Number(version)) {
  //     getFileList((data) => {
  //       if (appConfig.isPackaged) {
  //         let appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH));
  //         appConfig.fileListVersion = version;
  //         fs.writeFileSync(APP_CONFIG_PATH, JSON.stringify(appConfig));
  //       }
  //       fs.writeFileSync(fileListPath, data);
  //       downloadImage(env, JSON.parse(data), 0, () => {
  //         callback(true);
  //       });
  //     });
  //   } else {
  const data = fs.readFileSync(fileListPath);
  downloadImage(env, JSON.parse(data), 0, () => {
    callback(true);
  });
  //   }
  // });
}

let maxDownloadCount = 5;
let currentDownloadCount = 0;
let currentCount = -1;

function downloadImage(env, data, callback) {
  const imageDir = path.resolve(env.paths.IMAGES_PATH, "./t4网盘");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }
  if (currentCount >= data.length - 1) return callback(true);
  currentCount += 1;
  console.log(currentCount);

  let imageData = data[currentCount];
  const imagePath = path.resolve(imageDir, `./${imageData.name}`);
  if (fs.existsSync(imagePath)) {
    downloadImage(env, data, callback);
  } else {
    request(imageData.rawUrl)
      .pipe(fs.createWriteStream(imagePath))
      .on("close", function (err) {
        if (err) throw err;
        downloadImage(env, data, callback);
      });
    if (currentDownloadCount < maxDownloadCount) {
      currentDownloadCount += 1;
      downloadImage(env, data, callback);
    }
  }
}

module.exports = { downloadOnedriveData };
