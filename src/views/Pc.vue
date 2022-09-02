<template>
  <div class="pc-container">
    <!-- <img class="logo" alt="logo" src="@/assets/image/defaultlogo.png" /> -->
    <Logo :isPc="true" />
    <div class="header">
      <h1>{{ config.title || "图灵医道云胶片" }}</h1>
      <h2>智慧医院 影像先行</h2>
    </div>
    <div class="main">
      <input
        @keydown.enter="authSubmit"
        v-model.trim="authCode"
        placeholder="请输入分享码"
      />
      <button @click="authSubmit" class="button">确定</button>
    </div>
    <div class="footer">
      Copyright © {{ new Date().getFullYear() }} turing.msun.com All Rights
      Reserved.
    </div>
  </div>
</template>
<script>
import Logo from "@/components/logo.vue";
import { postAuthFf } from "@/api/pc";
import { mapGetters } from "vuex";
export default {
  components: { Logo },
  data() {
    return {
      authCode: "",
    };
  },
  computed: {
    ...mapGetters(["config"]),
  },
  methods: {
    async authSubmit() {
      const authCode = this.authCode.replace(/\s*/g, "");
      if (!authCode) {
        this.$toast({ message: "请输入分享码", position: "center" });
        return;
      }
      const { data, error } = await postAuthFf({ code: authCode });
      if (error != 0) {
        this.$toast({ message: "分享码已失效", position: "center" });
        return;
      }
      const { regId, orgCode } = data;
      this.$router.push(`/report?regId=${regId}&orgCode=${orgCode}`);
    },
  },
};
</script>
<style lang="scss" scoped>
.pc-container {
  .logo {
    margin: 20px;
    width: 200px;
  }
  .header {
    position: fixed;
    text-align: center;
    top: 18%;
    color: #b3e3d6;
    width: 100%;
    font-size: 18px;
    user-select: none;
    h1 {
      color: #d8ece7;
      font-size: 55px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    h2 {
      color: #d8ece7;
      font-size: 25px;
      font-weight: 400;
    }
  }
  .main {
    width: 600px;
    height: 60px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: space-between;
    input {
      width: 68%;
      border: 0px;
      border-radius: 8px;
      padding: 13px;
      font-size: 20px;
      color: #87afa7;
      outline: none;
      text-align: center;
      background-color: #effffb;
    }

    .button {
      width: 26%;
      background-color: #14cca4;
      color: #fff;
      font-size: 20px;
      border: 0px;
      border-radius: 8px;
      cursor: pointer;
      transition: 0.2s;
      &:hover {
        background-color: #0d9577;
      }
    }
  }
  .footer {
    position: fixed;
    text-align: center;
    bottom: 10%;
    color: #b3e3d6;
    width: 100%;
    font-size: 18px;
    user-select: none;
  }
}
</style>
