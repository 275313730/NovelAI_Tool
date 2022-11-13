<template>
  <div class="bg"></div>
  <div class="home">
    <div class="row-wrapper">
      <el-row justify="center" gutter="12">
        <el-col :span="2"> </el-col>
        <el-col :span="8">
          <el-card id="tag" class="home-card" shadow="hover"> Tag解析 </el-card>
        </el-col>
        <el-col :span="8">
          <el-card
            @click="updateView('gallery')"
            id="picture"
            class="home-card"
            shadow="hover"
          >
            图库
          </el-card>
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
      <el-row justify="center" gutter="12">
        <el-col :span="2"> </el-col>
        <el-col :span="8">
          <el-card
            @click="downloadOnedriveData"
            class="home-card"
            shadow="hover"
          >
            下载网盘图库
            <br />
            <br />
            <span v-show="downloadProgress == 0 && downloading"
              >正在获取最新数据</span
            >
            <span v-show="downloadProgress > 0 && downloadProgress < 1">
              下载中...进度{{ progressPercent }}
            </span>
            <span v-show="downloadProgress == 1"> 下载完成 </span>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="home-card" shadow="hover"> 开发中 </el-card>
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  props: ["view"],
  data() {
    return {
      downloadProgress: 0,
      downloading: false,
    };
  },
  computed: {
    progressPercent() {
      let percent = Math.round(this.downloadProgress * 10000);
      return `${percent / 100}%`;
    },
  },
  methods: {
    updateView(nextView) {
      this.view.currentView = nextView;
    },
    downloadOnedriveData() {
      if (this.downloading) return;
      this.downloading = true;
      this.$axios.get("/downloadOnedriveData").then((res) => {
        this.downloadProgress = 1;
      });
      let interval = setInterval(() => {
        if (this.downloadProgress == 1) return clearInterval(interval);
        this.$axios.get("/downloadProgress").then((res) => {
          this.downloadProgress = res.data.progress;
        });
      }, 1000);
    },
  },
};
</script>

<style>
.bg {
  height: 100vh;
  max-height: 100vh;
  width: 100%;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.home {
  height: 100vh;
}

.row-wrapper {
  top: 50vh;
  width: 100vw;
  overflow: hidden;
  position: absolute;
  transform: translateY(-50%);
}

.home-card {
  height: 200px;
  margin-top: 20px;
  font-weight: bold;
  cursor: pointer;
}
</style>