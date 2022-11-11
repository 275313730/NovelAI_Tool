<template>
  <div id="popover-wrapper">
    <el-popover
      v-if="!userSettings.classifyPrompt"
      style="padding-top: 6px"
      placement="top"
      trigger="hover"
      :width="200"
      :content="image.description"
      :show-after="150"
    >
      <template #reference>
        <el-button
          class="popover-button"
          v-clipboard="decodeURI(image.description)"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyError"
          slot="reference"
          >关键词</el-button
        >
      </template>
    </el-popover>
    <el-popover
      v-if="userSettings.classifyPrompt"
      style="padding-top: 6px"
      placement="top"
      trigger="hover"
      :width="400"
      :show-after="150"
    >
      <el-table max-height="300" :data="getClassifyPrompt()">
        <el-table-column
          width="80"
          property="primaryCategory"
          label="主类目"
        ></el-table-column>
        <el-table-column
          width="80"
          property="subCategory"
          label="子类目"
        ></el-table-column>
        <el-table-column
          width="200"
          property="keyword"
          label="关键词"
        ></el-table-column>
      </el-table>
      <template #reference>
        <el-button
          class="popover-button"
          v-clipboard="decodeURI(image.description)"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyError"
          slot="reference"
          >关键词</el-button
        >
      </template>
    </el-popover>
    <el-popover
      style="padding-top: 6px"
      placement="top"
      trigger="hover"
      :width="300"
      :show-after="150"
    >
      <div style="max-height: 300px; overflow: auto">
        {{ image.uc }}
      </div>
      <template #reference>
        <el-button
          class="popover-button"
          v-clipboard="decodeURI(image.uc)"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyError"
          slot="reference"
          >过滤词</el-button
        >
      </template>
    </el-popover>
    <el-popover
      style="padding-top: 6px"
      placement="top"
      trigger="hover"
      width="300"
      :show-after="150"
    >
      <el-table max-height="350" :data="getMetadata()">
        <el-table-column
          width="150"
          property="key"
          label="类型"
        ></el-table-column>
        <el-table-column
          width="150"
          property="value"
          label="数据"
        ></el-table-column>
      </el-table>
      <template #reference>
        <el-button class="popover-button" slot="reference">图片数据</el-button>
      </template>
    </el-popover>
  </div>
</template>

<script>
import classifyPrompt from "../utils/classifyPrompt";

export default {
  props: ["image", "userSettings", "tagsData"],
  methods: {
    copySuccess() {
      this.$message({
        message: "复制成功",
        type: "success",
      });
    },
    copyError() {
      this.$message({
        message: "复制失败",
        type: "warning",
      });
    },
    formatKeyword(keyword) {
      keyword = keyword.trim().toLowerCase();
      let formatElements = ["{", "}", "(", ")", "[", "]"];
      for (let ele of formatElements) {
        while (keyword.includes(ele)) keyword = keyword.replace(ele, "");
      }
      return keyword;
    },
    getClassifyPrompt() {
      return classifyPrompt(this.image.description, this.tagsData);
    },
    exactMatch(keyword) {
      const { allTagsIndex } = this.tagsData;
      return Math.max(
        ...[
          allTagsIndex.indexOf(keyword),
          allTagsIndex.indexOf(keyword.replace("_", " ")),
          allTagsIndex.indexOf(keyword.replace("-", " ")),
          allTagsIndex.indexOf(keyword.replace(" ", " ")),
        ]
      );
    },
    fuzzyMatch(keyword) {
      const { tagsIncludeIndex } = this.tagsData;
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
    },
    getMetadata() {
      let filterKeys = [
        "fileName",
        "fileSize",
        "description",
        "uc",
        "dirName",
        "imageUrl",
        "from",
      ];
      let metadata = [];
      for (let key in this.image) {
        if (!filterKeys.includes(key)) {
          metadata.push({ key, value: this.image[key] });
        }
      }
      return metadata;
    },
  },
};
</script>

<style>
#popover-wrapper {
  padding-top: 5px;
}

.popover-button {
  margin-top: 5px;
}

.el-table .el-table__cell {
  padding-top: 3px;
  padding-bottom: 3px;
}
</style>