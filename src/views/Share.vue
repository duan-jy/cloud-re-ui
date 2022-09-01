<template>
  <div class="mainpage">
    <Logo />
    <div id="login">
      <div class="info">{{ info }}</div>
      <van-password-input
        style="margin-top: 20px"
        v-show="share.pwdPanel"
        :value="share.pwd"
        gutter="15"
        :length="4"
        :mask="false"
        @focus="share.keyboardPanel = true"
      />
    </div>
    <van-number-keyboard v-model="share.pwd" v-show="share.keyboardPanel" />
  </div>
</template>
<script>
import { Dialog } from "vant";
import Logo from "@/components/logo.vue";
import { authShareInfo, authShareCheck } from "@/api/auth";
export default {
  components: { Logo },
  data() {
    return {
      info: "登陆中...",
      share: {
        // 需要输密码的相关数据
        pwd: "",
        pwdPanel: false,
        keyboardPanel: false,
      },
    };
  },
  async mounted() {
    // 获取认证的方法
    const shareId = this.$route.params.id;
    if (!shareId) {
      this.info = "链接参数错误，请确定链接正确性";
      return;
    }
    const data = await authShareInfo(shareId);
    if (data.error != 0) {
      this.info = data.message;
    } else {
      // 判断有没有密码
      if (data.data.hasPwd) {
        // 准备输入密码
        this.info = "请输入访问密码";
        this.$set(this.share, "pwdPanel", true);
        this.$set(this.share, "keyboardPanel", true);
      } else {
        this.submitSharePwd();
      }
    }
  },
  methods: {
    async submitSharePwd() {
      // 提交分享的密码
      const shareId = this.$route.params.id;
      const response = await authShareCheck(this.share.pwd, shareId);
      if (response.error == 0) {
        this.$router.replace({
          path: "/home",
          query: {
            hospital_code: response.data.hospital,
            reg_id: response.data.reg_id,
          },
        });
      } else {
        Dialog.alert({
          title: "出错了...",
          message: response.message,
        }).then(() => {});
        this.$set(this.share, "pwd", "");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#login {
  position: absolute;
  top: 35%;
  left: 50%;
  background: url("../assets/littlebg.png") no-repeat;
  transform: translate(-50%, 0%);
  box-sizing: border-box;
  text-align: center;
  border-radius: 10px;
  padding: 0px 10px;
  margin: 0px auto;
  width: 90%;
  height: 30vh;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;

  .info {
    padding: 0 20px;
    font-size: 24px;
    font-weight: 700;
  }
}
</style>
