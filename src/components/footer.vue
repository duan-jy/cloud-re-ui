<template>
  <footer>
    <div class="footer-text">
      <span>众阳健康提供服务</span>
      <hr />
    </div>
    <div class="logo"></div>
  </footer>
</template>
<script>
export default {
  name: "Footer",
};
</script>
<style lang="less" scoped>
footer {
  position: fixed;
  bottom: 15px;
  width: 100%;
  height: 20vh;
  text-align: center;
  padding: 0px 30px;
  box-sizing: border-box;
  .footer-text {
    width: 100%;
    font-size: 13px;
    font-weight: 500;
    span {
      position: relative;
      color: #b8d9d2;
      background-color: #1c9b7f;
      padding: 0px 15px;
    }
    hr {
      top: -16px;
      position: relative;
      border: 0.2vh solid #8dc0b5;
      width: 100%;
      z-index: -10;
    }
  }
  .logo {
    margin-top: 10px;
    background: url("../assets/botlogo.png") no-repeat;
    height: 50px;
    background-position: center center;
    background-size: contain;
  }
}
</style>
