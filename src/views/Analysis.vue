<template>
  <div id="wrapper">
    <el-input
      v-model="description"
      :autosize="{ minRows: 2, maxRows: 4 }"
      type="textarea"
      placeholder="Please input"
    />
    <el-table max-height="70vh" :data="getClassifyPrompt()" :border="true">
      <el-table-column
        property="primaryCategory"
        label="主类目"
      ></el-table-column>
      <el-table-column property="subCategory" label="子类目"></el-table-column>
      <el-table-column property="keyword" label="关键词"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import classifyPrompt from "../utils/classifyPrompt";

export default {
  props: ["tagsData"],
  data() {
    return {
      description: "",
    };
  },
  methods: {
    getClassifyPrompt() {
      return classifyPrompt(this.description, this.tagsData);
    },
  },
};
</script>

<style>
#wrapper {
  width: 50vw;
  margin: auto;
  left: 0;
  right: 0;
}
</style>