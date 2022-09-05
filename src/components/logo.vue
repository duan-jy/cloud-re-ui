<template>
  <div :class="isHome ? 'logo_home' : isPc ? 'logo_pc' : 'logo'">
    <img :src="imageLogo" />
  </div>
</template>
<script>
import imgLogo from "../assets/image/defaultlogo.png";
export default {
  name: "Logo",
  props: {
    isHome: {
      type: Boolean,
      default: false,
    },
    isPc: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imgLogo,
    };
  },
  computed: {
    imageLogo() {
      return this.imgLogo;
    },
  },
};
</script>
<style lang="scss" scoped>
.logo {
  width: 100%;
  height: 90px;
  position: absolute;
  top: 8.5%;
  left: 49%;
  transform: translate(-50%, 0%);
  text-align: center;
  z-index: 100;
  transition: 0.4s;
  color: #e8e8e8;
  img {
    width: 70%;
  }
}
.logo_pc {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 300px;
  img {
    width: 100%;
  }
}
.logo_home {
  width: 100%;
  // height: 90px;
  text-align: center;
  z-index: 100;
  transition: 0.4s;
  color: #e8e8e8;
  margin-top: 7%;
  img {
    width: 70%;
  }
}
</style>
