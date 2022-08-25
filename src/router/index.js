import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);
const routes = [
  {
    name: "home",
    path: "/home",
    component: () => import("@/views/Home.vue"),
  },
  {
    name: "login",
    path: "/login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "*",
    name: "404",
    component: () => import("@/views/features/404.vue"),
  },
  // {
  //   name: "index",
  //   path: "/",
  //   alias: "/index",
  //   component: () => import("@/views/index/index.vue"),
  // },
  // {
  //   name: "historyRecords",
  //   path: "/historyRecords",
  //   component: () => import("@/views/historyRecords/index.vue"),
  // },
  // {
  //   name: "miv",
  //   path: "/3d",
  //   component: () => import("@/views/miv/index.vue"),
  // },
  // {
  //   name: "webmiv",
  //   path: "/webmiv",
  //   component: () => import("@/views/webmiv/index.vue"),
  // },
  // {
  //   name: "auth",
  //   path: "/auth/:method/:dest",
  //   component: () => import("@/views/auth/index.vue"),
  // },
  // {
  //   name: "share",
  //   path: "/s/:id",
  //   component: () => import("@/views/auth/share.vue"),
  // },
  // {
  //   path: "/pc",
  //   name: "pc_index",
  //   component: () => import("@/views/pc/pc.vue"),
  // },
  // {
  //   path: "/pc/report",
  //   name: "pc_report",
  //   component: () => import("@/views/pc/report.vue"),
  // },
  // {
  //   path: "*",
  //   name: "404",
  //   component: () => import("@/views/404.vue"),
  // },
];
const router = new Router({
  mode: "history",
  routes,
});

export default router;
