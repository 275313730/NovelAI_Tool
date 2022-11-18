import axios from "axios";

async function getTags() {
  let tagsData = {
    allTags: [],
    allTagsIndex: [],
    tagCategories: [],
    tagsInclude: [],
    tagsIncludeIndex: [],
  };

  const tagsRes = await axios.get("/tags");
  tagsData.allTags = tagsRes.data;

  getAllCategories(tagsData);
  await getTagsInclude(tagsData);

  return tagsData;
}

async function getTagsInclude(tagsData) {
  const tagsIncludeRes = await axios.get("/tagsInclude");
  tagsData.tagsInclude = tagsIncludeRes.data;
  for (let tag of tagsIncludeRes.data) {
    tagsData.tagsIncludeIndex.push(tag.tagName);
  }
}

function getAllCategories(tagsData) {
  const { allTags, allTagsIndex, tagCategories } = tagsData;
  for (let i = 0; i < 999; i++) {
    const tag = allTags[i];
    allTagsIndex.push(tag.tagName);
    const { primaryCategory, subCategory } = tag;
    if (primaryCategory && subCategory) {
      let exist = false;
      for (let data of tagCategories) {
        if (data.primaryCategory === primaryCategory) {
          exist = true;
          if (!data.subCategoryList.includes(subCategory)) {
            data.subCategoryList.push(subCategory);
          }
          break;
        }
      }
      if (!exist) {
        tagCategories.push({
          primaryCategory,
          subCategoryList: [subCategory],
        });
      }
    }
  }
}

export default getTags;
