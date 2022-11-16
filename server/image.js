const fs = require("fs");
const path = require("path");
const ExifReader = require("exifreader");
const prettyBytes = require("pretty-bytes");
const extractChunks = require("png-chunks-extract");
const text = require("png-chunk-text");

function checkImageDirs(env) {
  const { IMAGES_PATH } = env.paths;

  let response = {
    isFirstUse: false,
    platform: process.platform,
    imageDirs: [],
  };

  if (!fs.existsSync(IMAGES_PATH)) {
    response.isFirstUse = true;

    if (process.platform !== "darwin") {
      fs.mkdirSync(IMAGES_PATH);
    }
  } else {
    fs.readdirSync(IMAGES_PATH, { withFileTypes: true }).forEach(function (dirent) {
      if (dirent.isDirectory()) {
        response.imageDirs.push(dirent.name);
      }
    });
  }
  return response;
}

function getImagesData(env, imageDirs) {
  const { IMAGES_PATH } = env.paths;
  let imagesData = [];

  fs.readdirSync(IMAGES_PATH, { withFileTypes: true }).forEach((dirent) => {
    if (!dirent.isDirectory()) return;
    for (let imageDir of imageDirs) {
      if (!imageDir.selected || imageDir.dirName !== dirent.name) continue;
      let DIR_PATH = path.resolve(IMAGES_PATH, `./${imageDir.dirName}`);
      fs.readdirSync(DIR_PATH).forEach((file) => {
        if (path.extname(file) !== ".png") return;
        let FILE_PATH = path.resolve(DIR_PATH, `./${file}`);
        let fileStat = {
          name: file.split(".png")[0],
          size: fs.statSync(FILE_PATH).size,
        };
        let fileBuffer = fs.readFileSync(FILE_PATH);
        let fileInfo = readFileInfo(fileStat, fileBuffer);
        fileInfo.dirName = imageDir.dirName;
        fileInfo.imageUrl = `./${imageDir.dirName}/${file}`;
        imagesData.push(fileInfo);
      });
    }
  });
  return imagesData;
}

function readFileInfo(file, fileBuffer) {
  let textChunks = readTextChunks(fileBuffer);
  let fileInfoRef = [];

  if (textChunks.length > 0) {
    fileInfoRef = [
      { key: "fileName", value: file.name },
      { key: "fileSize", value: prettyBytes(file.size) },
    ];
    for (let chunk of textChunks) {
      if (chunk.keyword == "comment") {
        const comment = JSON.parse(chunk.text);
        for (let key in comment) {
          fileInfoRef.push({ key, value: comment[key] });
        }
      } else {
        fileInfoRef.push({
          key: chunk.keyword,
          value: chunk.text,
        });
      }
    }
  }

  if (textChunks.length == 0) {
    fileInfoRef.push({
      key: "tip",
      value: "这可能不是一张NovelAI生成的图或者不是原图, 经过了压缩",
    });
  }

  let fileInfo = {};
  fileInfoRef.forEach((v) => {
    if (!v.key) return;
    fileInfo[v.key] = v.value;
  });

  if (fileInfo.description) {
    fileInfo.description = fileInfo.description.replace(/%7B/g, "{").replace(/%7D/g, "}");
  }

  return fileInfo;
}

function readTextChunks(fileBuffer) {
  let chunks = [];
  try {
    chunks = extractChunks(new Uint8Array(fileBuffer));
  } catch (error) {
    if (error) {
      return [
        {
          keyword: "description",
          text: "",
        },
        { keyword: "uc", text: "" },
        {
          keyword: "tips",
          text: "文件可能损坏",
        },
      ];
    }
  }

  let textChunks = chunks
    .filter((chunk) => {
      return chunk.name === "tEXt" || chunk.name === "iTXt";
    })
    .map((chunk) => {
      if (chunk.name === "iTXt") {
        let data = chunk.data.filter((x) => x != 0x0);
        let txt = new TextDecoder().decode(data);
        if (txt.includes("Description")) {
          return {
            keyword: "description",
            text: txt.split("Description")[1],
          };
        } else {
          return {
            keyword: "info",
            text: txt,
          };
        }
      }
      return text.decode(chunk.data);
    });

  switch (checkModel(textChunks)) {
    case "webui":
      textChunks = handleWebUiData(textChunks[0]);
      break;
    case "dream":
      // dream生成的数据全部都在textChunks[1]中
      textChunks = handleDreamData(textChunks[1]);
      break;
    case "naifu":
      textChunks.push({ keyword: "from", text: "naifu" });
      break;
  }

  // 字符串后处理,统一格式
  for (let data of textChunks) {
    data.keyword = data.keyword.toLowerCase();
    if (data.keyword == "description") {
      data.text = data.text.replace(/，/g, ",");
    }
  }

  return textChunks;
}

function checkModel(textChunks) {
  if (textChunks.length == 1) return "webui";
  if (textChunks.length == 2) {
    for (let data of textChunks) {
      if (data.keyword == "Dream") return "dream";
    }
    return "webui";
  }
  if (textChunks.length > 2) {
    return "naifu";
  }
}

function handleDreamData(data) {
  let textChunks = [
    { keyword: "uc", text: "" },
    {
      keyword: "from",
      text: "dream",
    },
  ];
  let imageData;
  data = JSON.parse(data.text);
  for (let key in data) {
    if (key == "image") {
      imageData = data[key];
    } else {
      textChunks.push({ keyword: key, text: data[key] });
    }
  }
  for (let key in imageData) {
    if (key == "prompt") {
      for (let promptKey in imageData[key]) {
        if (promptKey == "prompt") {
          textChunks.push({ keyword: "description", text: imageData["prompt"]["prompt"] });
        } else {
          textChunks.push({ keyword: "weight", text: "" + imageData["prompt"]["weight"] });
        }
      }
    } else {
      textChunks.push({ keyword: key, text: imageData[key] });
    }
  }
  return textChunks;
}

function handleWebUiData(data) {
  let keywords = "",
    negativeKeywords = "",
    commentString = "";
  if (data.keyword == "parameters") data.text = "parameters" + data.text;
  if (data.text.includes("parameters")) {
    if (data.text.includes("Negative prompt:")) {
      keywords = data.text.split("Negative prompt:")[0].split("parameters")[1];
      negativeKeywords = data.text.split("Negative prompt:")[1].split("Steps:")[0].trim();
      let splitCommentString = data.text.split("Negative prompt:")[1].split("Steps:")[1];
      commentString = `steps:${formatComment(splitCommentString)}`;
    } else {
      keywords = data.text.split("Steps:")[0].split("parameters")[1];
      let splitCommentString = data.text.split("Steps:")[1];
      commentString = `steps:${formatComment(splitCommentString)}`;
    }
  }

  let dataArray = [
    {
      keyword: "description",
      text: decodeURIComponent(keywords),
    },
    {
      keyword: "uc",
      text: decodeURIComponent(negativeKeywords),
    },
    {
      keyword: "from",
      text: "webui",
    },
  ];
  if (commentString !== "") {
    commentString.split(",").map((comment) => {
      let [keyword, text] = comment.split(":");
      dataArray.push({ keyword: keyword.trim().toLowerCase(), text: text.trim() });
    });
  }
  return dataArray;
}

function formatComment(text = "") {
  let replaceTexts = [/\{/g, /\}/g, /\(/g, /\)/g];
  for (let replaceText of replaceTexts) {
    text = text.replace(replaceText, "");
  }
  return text.trim();
}

function readExif(fileBuffer) {
  let exifInfo = [];
  const data = ExifReader.load(fileBuffer);
  const entries = Object.entries(data);
  exifInfo = entries.map(([key, value]) => ({ key, value: value.description }));
  return exifInfo;
}

module.exports = { checkImageDirs, getImagesData };
