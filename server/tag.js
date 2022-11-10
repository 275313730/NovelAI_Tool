// 引入 node-xlsx 模块
const xlsx = require("node-xlsx");
const path = require("path");

function loadTags(env) {
  // excel文件类径
  const excelFilePath = path.resolve(env.paths.APP_PATH, "./data/tags.xlsx");

  //解析excel, 获取到所有sheets
  const sheets = xlsx.parse(excelFilePath);

  // 打印页面信息..
  const sheet = sheets[0];
  const data = sheet.data.slice(1, 1000);
  const tags = [];
  for (let tagData of data) {
    let tag = {
      order: tagData[0],
      tagName: tagData[1],
      translate: tagData[2],
      note: tagData[3],
      reference: tagData[4],
      primaryCategory: tagData[5],
      subCategory: tagData[6],
    };
    tags.push(tag);
  }

  return tags;
}

function loadTagsInclude(env) {
  // excel文件类径
  const excelFilePath = path.resolve(env.paths.APP_PATH, "./data/tagsInclude.xlsx");

  //解析excel, 获取到所有sheets
  const sheets = xlsx.parse(excelFilePath);

  // 打印页面信息..
  const sheet = sheets[0];
  const data = sheet.data.slice(1);
  const tags = [];
  for (let tagData of data) {
    let tag = {
      primaryCategory: tagData[0],
      subCategory: tagData[1],
      tagName: tagData[2],
    };
    tags.push(tag);
  }

  return tags;
}

module.exports = { loadTags, loadTagsInclude };
