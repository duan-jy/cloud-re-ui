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
    name: "history",
    path: "/history",
    component: () => import("@/views/History.vue"),
  },
  {
    name: "pc",
    path: "/pc",
    component: () => import("@/views/Pc.vue"),
  },
  {
    name: "report",
    path: "/report",
    component: () => import("@/views/Report.vue"),
  },
  {
    name: "auth",
    path: "/auth/:method/:dest",
    component: () => import("@/views/Auth.vue"),
  },
  {
    name: "share",
    path: "/s/:id",
    component: () => import("@/views/Share.vue"),
  },
  {
    name: "miv",
    path: "/miv",
    component: () => import("@/views/Miv.vue"),
  },
  {
    path: "*",
    name: "404",
    component: () => import("@/views/features/404.vue"),
  },
];
const router = new Router({
  mode: "history",
  routes,
});

export default router;
