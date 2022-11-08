<template>
  <el-tabs id="user-settings" type="border-card">
    <el-tab-pane label="图库管理">
      <div class="title-wrapper">
        <span>请选择要加载的图库</span>
      </div>
      <el-checkbox
        v-for="imageDir in loadSettings.imageDirs"
        v-model="imageDir.selected"
        :label="imageDir.dirName"
        class="image-dir-checkbox"
        border
      ></el-checkbox>
      <el-button id="confirm-button" type="primary" @click="confirmSettings"
        >确认</el-button
      >
    </el-tab-pane>
    <el-tab-pane label="配置管理">
      <div class="block">
        <div>
          <p class="demonstration">页面显示图片数量(防卡顿)</p>
          <el-radio v-model="userSettings.imagesLimitCount" :label="100"
            >100</el-radio
          >
          <el-radio v-model="userSettings.imagesLimitCount" :label="200"
            >200</el-radio
          >
          <el-radio v-model="userSettings.imagesLimitCount" :label="300"
            >300</el-radio
          >
          <el-radio v-model="userSettings.imagesLimitCount" :label="400"
            >400</el-radio
          >
          <el-radio v-model="userSettings.imagesLimitCount" :label="500"
            >500</el-radio
          >
        </div>
        <el-divider></el-divider>
        <div>
          <p class="demonstration">一行显示图片数量</p>
          <el-radio v-model="userSettings.rowLimitCount" :label="3">3</el-radio>
          <el-radio v-model="userSettings.rowLimitCount" :label="4">4</el-radio>
          <el-radio v-model="userSettings.rowLimitCount" :label="6">6</el-radio>
        </div>
        <el-divider></el-divider>
        <div>
          <p class="demonstration">是否开启关键词分类</p>
          <el-radio v-model="userSettings.classifyPrompt" :label="false"
            >否</el-radio
          >
          <el-radio v-model="userSettings.classifyPrompt" :label="true"
            >是</el-radio
          >
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  props: ["userSettings", "loadSettings"],
  mounted() {
    this.$axios({
      method: "get",
      url: "/configData",
    }).then((res) => {
      for (let key in res.data) {
        this.userSettings[key] = res.data[key];
      }
    });
  },
  methods: {
    confirmSettings() {
      this.$axios({
        method: "post",
        url: "/configData",
        data: this.userSettings,
      }).then((res) => {
        this.$emit("getImagesData");
      });
    },
  },
};
</script>

<style>
.title-wrapper {
  margin-top: 10px;
  margin-bottom: 15px;
}

.image-dir-checkbox {
  margin: 5px;
}

#confirm-button {
  margin: 10px;
}
</style>