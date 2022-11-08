<template>
  <el-drawer
    title="Tag筛选"
    :size="'90%'"
    v-model="filterSettings.isShow"
    :direction="'btt'"
  >
    <div id="switch-wrapper">
      <el-switch
        v-model="showAllTags"
        @change="getTags"
        active-text="查看所有tag"
        inactive-text="仅查看图库tag"
      >
      </el-switch>
    </div>
    <div>
      <span>主类目</span>
      <el-radio-group
        @change="changeSubCategoryList"
        size="medium"
        v-model="filterSettings.primaryCategory"
      >
        <el-radio-button
          v-for="data in tagsData.tagCategories"
          :label="data.primaryCategory"
        ></el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="filterSettings.subCategoryList.length > 0">
      <span>子类目</span>
      <el-radio-group
        id="sub-category-group"
        size="medium"
        v-model="filterSettings.subCategory"
        @change="getTags"
      >
        <el-radio-button
          v-for="value in filterSettings.subCategoryList"
          :label="value"
        ></el-radio-button>
      </el-radio-group>
    </div>
    <div id="tags-wrapper">
      <el-tag class="tag" disable-transitions="true" v-for="tag in currentTags"
        >{{ tag.tagName }}-{{ tag.modifyTrans }}</el-tag
      >
    </div>
  </el-drawer>
</template>

<script>
export default {
  props: ["filterSettings", "tagsData", "allKeywordsArray"],
  data() {
    return {
      currentTags: [],
      showAllTags: true,
    };
  },
  methods: {
    changeSubCategoryList(primaryCategory) {
      const { tagCategories } = this.tagsData;
      for (let data of tagCategories) {
        if (data.primaryCategory == primaryCategory) {
          this.filterSettings.subCategoryList = data.subCategoryList;
          return;
        }
      }
    },
    getTags() {
      const { primaryCategory, subCategory } = this.filterSettings;
      const { allTags, allTagsIndex } = this.tagsData;
      this.currentTags = [];
      if (this.showAllTags) {
        for (let tagIndex in allTags) {
          if (tagIndex && tagIndex > -1 && tagIndex < 1000) {
            const tag = allTags[tagIndex];
            if (
              tag.primaryCategory == primaryCategory &&
              tag.subCategory == subCategory
            ) {
              this.currentTags.push(tag);
            }
          }
        }
      } else {
        for (let keyword of this.allKeywordsArray) {
          let tagIndex = allTagsIndex.indexOf(keyword.value);
          if (tagIndex && tagIndex > -1 && tagIndex < 1000) {
            const tag = allTags[tagIndex];
            if (
              tag.primaryCategory == primaryCategory &&
              tag.subCategory == subCategory
            ) {
              this.currentTags.push(tag);
            }
          }
        }
      }
    },
  },
};
</script>

<style>
#switch-wrapper {
  margin-bottom: 5px;
}

#sub-category-group {
  margin-top: 5px;
}

#tags-wrapper {
  margin-top: 10px;
  margin-left: 10%;
  margin-right: 10%;
  text-align: center;
}

.tag {
  margin: 2px;
}
</style>