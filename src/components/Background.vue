<template>
  <div></div>
</template>

<script>
export default {
  props: ["tagsData"],
  mounted() {
    this.getAllTags();
    this.getTagsInclude();
  },
  methods: {
    async getAllTags() {
      const tagsRes = await this.$axios.get("/tags");
      this.tagsData.allTags = tagsRes.data;

      this.getAllCategories();
    },
    async getTagsInclude() {
      const tagsIncludeRes = await this.$axios.get("/tagsInclude");
      this.tagsData.tagsInclude = tagsIncludeRes.data;
      for (let tag of tagsIncludeRes.data) {
        this.tagsData.tagsIncludeIndex.push(tag.tagName);
      }
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