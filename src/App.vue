<template>
  <div id="app">
    <Background :tagsData="tagsData" />
    <Home :view="view" v-if="view.currentView == 'home'" />
    <Analysis v-if="view.currentView == 'analysis'" :tagsData="tagsData" />
    <Gallery v-if="view.currentView == 'gallery'" :tagsData="tagsData" />
  </div>
</template>

<script>
import Gallery from "./views/Gallery.vue";
import Home from "./views/Home.vue";
import Analysis from "./views/Analysis.vue";
import Background from "./components/Background.vue";

export default {
  name: "App",
  components: {
    Gallery,
    Home,
    Analysis,
    Background,
  },
  data() {
    return {
      view: {
        currentView: "analysis",
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
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
