import Vue from "vue";

const DebugTool = {};

DebugTool.install = function (Vue) {
  //安装混入
  Vue.mixin({
    computed: {
      isDebug() {
        return this.$store.getters.debugSwitch;
      },
    },
    mounted() {
      const $route = this.$route;
      if (!$route) return;
      const { debug } = $route.query;
      const { debugSwitch } = this.$store.getters;
      if (debug && !debugSwitch) {
        console.log("启用调试模式");
        this.$store.dispatch("app/setSwitchState", true);
      }
    },
  });
};

Vue.use(DebugTool);
