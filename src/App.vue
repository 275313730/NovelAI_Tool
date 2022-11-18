<template>
  <div id="app">
    <el-container style="height: 100vh">
      <el-aside width="auto">
        <Menu :view="view" />
      </el-aside>
      <el-container>
        <el-main>
          <Home v-show="view.currentView == 'home'" />
          <Gallery
            v-show="view.currentView == 'gallery'"
            :tagsData="tagsData"
          />
          <Analysis
            v-show="view.currentView == 'analysis'"
            :tagsData="tagsData"
          />
          <Options v-show="view.currentView == 'options'" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Gallery from "./views/Gallery.vue";
import Home from "./views/Home.vue";
import Analysis from "./views/Analysis.vue";
import Menu from "./components/Menu.vue";
import Options from "./views/Options.vue";
import getTags from "./utils/getTags";

export default {
  name: "App",
  components: {
    Gallery,
    Home,
    Analysis,
    Menu,
    Options,
  },
  async mounted() {
    this.tagsData = await getTags();
  },
  data() {
    return {
      view: {
        currentView: "home",
      },
      tagsData: {
        allTags: [],
        allTagsIndex: [],
        tagCategories: [],
        tagsInclude: [],
        tagsIncludeIndex: [],
      },
    };
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  max-height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.el-main {
  --el-main-padding: 0px;
}
</style>
