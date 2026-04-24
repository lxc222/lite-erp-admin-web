import { createApp } from "vue";

import TDesign from "tdesign-vue-next";
import "tdesign-vue-next/es/style/index.css";

import Cookies from "js-cookie";

import App from "@/App.vue";

const app = createApp(App);
app.config.globalProperties.$cookies = Cookies;
app.use(TDesign);
app.mount("#id_lay_app");
