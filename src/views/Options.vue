<template>
  <div id="options">
    <div class="row-wrapper">
      <el-row justify="center" gutter="12">
        <el-col :span="2"> </el-col>
        <el-col :span="8">
          <el-card
            class="home-card"
            shadow="hover"
            @click="downloadOnedriveData"
          >
            下载网盘图库
            <br />
            <br />
            <span v-show="downloading">{{ progressContent }} </span>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="home-card" shadow="hover" @click="checkUpdate">
            检查更新
          </el-card>
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ElMessageBox } from "element-plus";

export default {
  props: ["view"],
  data() {
    return {
      downloadProgress: 0,
      downloading: false,
      checking: false,
    };
  },
  computed: {
    progressContent() {
      let content = "";
      if (this.downloadProgress == 0 && this.downloading) {
        content = `正在获取最新数据`;
      } else if (this.downloadProgress > 0 && this.downloadProgress < 1) {
        let percent = Math.round(this.downloadProgress * 10000);
        content = `下载中...进度${percent / 100}%`;
      } else if (this.downloadProgress == 1) {
        content = `下载完成`;
      } else if (this.downloadProgress == -1) {
        content = `获取数据失败,请稍后重试`;
      }
      return content;
    },
  },
  methods: {
    async downloadOnedriveData() {
      if (this.downloading) return;
      this.downloading = true;
      const isComplete = await this.$axios.get("/downloadOnedriveData");
      if (isComplete.data) {
        this.downloadProgress = 1;
      }

      // 每秒获取后端下载进度
      let interval = setInterval(async () => {
        if (this.downloadProgress == 1) return clearInterval(interval);
        const res = await this.$axios.get("/downloadProgress");
        if (res.data == false) {
          this.downloadProgress = -1;
        } else {
          this.downloadProgress = res.data.progress;
        }
      }, 1000);
    },
    async checkUpdate() {
      if (this.checking) return;
      this.checking = true;
      const res = await this.$axios.get("/checkUpdate");
      switch (res.data.status) {
        case -1:
          console.log("检测不到更新数据");
          break;
        case 0:
          console.log("已经是最新版本");
          break;
        case 1:
          const isUpdate = await ElMessageBox.confirm(
            "检查到新版本,是否更新",
            "success",
            {
              confirmButtonText: "更新",
              cancelButtonText: "取消",
              type: "info",
            }
          );
          if (isUpdate) {
            this.updateTool();
          }
          break;
      }
    },
    async updateTool() {
      const res = await this.$axios.get("/updateTool");
      if (res.data) {
        const isRelaunch = await ElMessageBox.confirm(
          "更新完成,是否立即重启?",
          "success",
          {
            confirmButtonText: "立即重启",
            cancelButtonText: "稍后重启",
            type: "success",
          }
        );
        if (isRelaunch) {
          this.$axios.get("/relaunch");
        }
      }
    },
  },
};
</script>

<style>
.row-wrapper {
  top: 50vh;
  width: 100vw;
  overflow: hidden;
  position: absolute;
  transform: translateY(-60%);
}

.home-card {
  height: 200px;
  margin-top: 20px;
  font-weight: bold;
  cursor: pointer;
}
</style>