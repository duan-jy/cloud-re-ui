<template>
  <div class="logo">
    <img src="../assets/image/qlicon.png" />
  </div>
</template>
<script>
export default {
  name: "Logo",
};
</script>
<style lang="less" scoped>
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
</style>
