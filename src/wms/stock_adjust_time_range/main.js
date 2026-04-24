import { createApp } from "vue";
import TDesign from "tdesign-vue-next";
import "tdesign-vue-next/es/style/index.css";

import App from "@/wms/stock_adjust_time_range/App.vue";

const app = createApp(App);
app.use(TDesign);
app.mount("#id_lay_app");
