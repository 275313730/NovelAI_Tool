function classifyPrompt(description, tagsData) {
  if (!description) return [];
  const keywords = description.split(",");

  const { tagsInclude, tagsIncludeIndex, allTags, allTagsIndex } = tagsData;
  let prompt = [];
  let keywordsArray = [];

  for (let keyword of keywords) {
    keyword = formatKeyword(keyword);
    if (keyword == "") continue;
    if (keywordsArray.includes(keyword)) continue;

    keywordsArray.push(keyword);

    let fuzzyMatching = false;
    let tagIndex = exactMatch(keyword, allTagsIndex);
    if (tagIndex == -1) {
      fuzzyMatching = true;
      tagIndex = fuzzyMatch(keyword, tagsIncludeIndex);
    }

    if (tagIndex > -1) {
      const tag = fuzzyMatching ? tagsInclude[tagIndex] : allTags[tagIndex];
      prompt.push({
        primaryCategory: tag.primaryCategory,
        subCategory: tag.subCategory,
        keyword,
      });
    } else {
      prompt.push({
        primaryCategory: "-",
        subCategory: "-",
        keyword,
      });
    }
  }
  return prompt;
}

function formatKeyword(keyword) {
  keyword = keyword.trim().toLowerCase();
  let formatElements = ["{", "}", "(", ")", "[", "]"];
  for (let ele of formatElements) {
    while (keyword.includes(ele)) keyword = keyword.replace(ele, "");
  }
  return keyword;
}

function exactMatch(keyword, allTagsIndex) {
  return Math.max(
    ...[
      allTagsIndex.indexOf(keyword),
      allTagsIndex.indexOf(keyword.replace("_", " ")),
      allTagsIndex.indexOf(keyword.replace("-", " ")),
      allTagsIndex.indexOf(keyword.replace(" ", " ")),
    ]
  );
}

function fuzzyMatch(keyword, tagsIncludeIndex) {
  for (let i in tagsIncludeIndex) {
    const tagName = tagsIncludeIndex[i];
    let splitBy = " ";
    if (keyword.includes("_")) splitBy = "_";
    if (keyword.includes("-")) splitBy = "-";
    let keywordSplitArray = keyword.split(splitBy);
    if (keywordSplitArray.includes(tagName)) {
      return i;
    }
  }
  return -1;
}

export default classifyPrompt;
