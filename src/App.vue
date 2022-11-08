<template>
  <div id="app">
    <Home />
    <Gallery v-if="currentView == 'gallery'" />
  </div>
</template>

<script>
import Gallery from "./views/Gallery.vue";
import Home from "./views/Home.vue";

export default {
  name: "App",
  components: {
    Gallery,
    Home,
  },
  data() {
    return {
      currentView: "",
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
  overflow-x: hidden;
}
</style>
