<template>
  <div class="bg"></div>
  <div class="home">
    <div class="row-wrapper">
      <el-row justify="center" gutter="12">
        <el-col :span="4"> </el-col>
        <el-col :span="4">
          <el-card id="tag" class="home-card" shadow="hover"> Tag解析 </el-card>
        </el-col>
        <el-col :span="4">
          <el-card
            @click="updateView('gallery')"
            id="picture"
            class="home-card"
            shadow="hover"
          >
            图库
          </el-card>
        </el-col>
        <el-col :span="4"></el-col>
      </el-row>
      <el-row justify="center" gutter="12">
        <el-col :span="4"> </el-col>
        <el-col :span="4">
          <el-card class="home-card" shadow="hover"> 开发中 </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="home-card" shadow="hover"> 开发中 </el-card>
        </el-col>
        <el-col :span="4"></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  props: ["view"],
  methods: {
    updateView(nextView) {
      this.view.currentView = nextView;
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