<template>
  <div></div>
</template>

<script>
export default {
  props: ["tagsData"],
  mounted() {
    this.checkImageDirs();
    this.getTagsData()
  },
  methods: {
    checkImageDirs() {
      this.$axios.get("/checkImageDirs").then((res) => {
        const { imageDirs } = res.data;
        this.$emit("showImageDirs", imageDirs);
      });
    },
    getTagsData() {
      this.$axios.get("/tags").then((res) => {
        this.tagsData.allTags = res.data;
        this.getAllCategories();
      });
      this.$axios.get("/tagsInclude").then((res) => {
        this.tagsData.tagsInclude = res.data;
        for (let tag of res.data) {
          this.tagsData.tagsIncludeIndex.push(tag.tagName);
        }
      });
    },
    getAllCategories() {
      const { allTags, allTagsIndex, tagCategories } = this.tagsData;
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
    },
  },
};
</script>

<style>

</style>