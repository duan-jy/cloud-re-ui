<template>
  <div id="app">
    <div class="debug" v-show="isDebug">在线调试模式已启用</div>
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>
<script>
export default {};
</script>
<style lang="scss">
* {
  font-family: "Noto Sans CJK SC";
}
html {
  margin: 0;
  padding: 0;
  letter-spacing: 0.46px;
  text-align: left;
  font-size: 16px;
  height: 100%;
}
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  background-color: #e8e8eb;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 16px;
  height: 100%;
  background: url("./assets/background.png") no-repeat;
  background-size: 100% 100%;
  .debug {
    height: 25px;
    text-align: center;
    background-color: rgba(64, 255, 25, 0.6);
    width: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 10000;
  }
}
</style>
