import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import axios from "axios";
import VueClipboard from "vue3-clipboard";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.config.globalProperties.$axios = axios;

app.use(VueClipboard, {
  autoSetContainer: true,
  appendToBody: true,
});

app.use(ElementPlus);
app.mount("#app");
