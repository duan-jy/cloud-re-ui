<template>
  <div :class="isHome ? 'logo_home' : 'logo'">
    <img src="../assets/image/defaultlogo.png" />
  </div>
</template>
<script>
export default {
  name: "Logo",
  props: {
    isHome: {
      type: Boolean,
      default: false,
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
    width: 80%;
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
    width: 80%;
  }
}
</style>
