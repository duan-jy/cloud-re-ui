import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// 创建全局debug值
import "./mixin/debug.js";
import "@vant/touch-emulator";
import Vant from "vant/es";
import "vant/lib/index.css";
Vue.use(Vant);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
