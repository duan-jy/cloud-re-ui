<template>
  <div id="app">
    <div class="debug" v-show="isDebug">在线调试模式已启用</div>
    <router-view />
    <!-- <keep-alive>
    </keep-alive> -->
  </div>
</template>
<script>
import { getByHospitalId } from "@/api/app";
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["isObtainConfig"]),
  },
  async updated() {
    // try {
    //   if (this.isObtainConfig) return
    //   let { hospital_code, orgCode } = this.$route.query
    //   if (!orgCode && !hospital_code) return
    //   const response = await getByHospitalId(hospital_code || orgCode)
    //   if (response.success) {
    //     this.$store.dispatch('app/setObtainConfig', true)
    //     if (!response.data) return
    //     let { title, logoUrl } = response.data
    //     logoUrl = logoUrl.replace(
    //       'http://36.138.42.236:8188',
    //       // `${window.location.protocol}//${window.location.hostname}`
    //       `https://medimage.online`,
    //     )
    //     if (title) {
    //       document.title = title
    //     }
    //     this.$store.dispatch('app/setConfig', {
    //       logoUrl,
    //       title,
    //     })
    //   }
    // } catch (e) {
    //   this.$store.dispatch('app/setObtainConfig', true)
    // }
  },

  beforeRouteEnter(e) {
    console.log(e);
  },
};
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
