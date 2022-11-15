<template>
  <el-menu id="menu" default-active="1" :collapse="isCollapse">
    <el-menu-item index="1" @click="view.currentView = 'home'">
      <el-icon><House /></el-icon>
      <template #title>主页</template>
    </el-menu-item>
    <el-menu-item index="2" @click="view.currentView = 'gallery'">
      <el-icon><Picture /></el-icon>
      <template #title>图库</template>
    </el-menu-item>
    <el-menu-item index="3" @click="view.currentView = 'analysis'">
      <el-icon><Reading /></el-icon>
      <template #title>Prompt解析</template>
    </el-menu-item>
    <el-menu-item index="4" @click="view.currentView = 'options'">
      <el-icon><setting /></el-icon>
      <template #title>设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  props: ["view"],
  data() {
    return {
      isCollapse: true,
    };
  },
};
</script>

<style>
#menu {
  height: 100vh;
}
</style>