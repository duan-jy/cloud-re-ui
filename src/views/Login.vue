<template>
  <div class="main-page">
    <Logo />
    <div class="login-container">
      <van-tabs
        animated
        color="#38b69b"
        :swipeable="true"
        v-model="vanTabActive"
        style="border-radius: 10px"
        @change="vanTabChange"
      >
        <van-tab title="手机验证码登陆">
          <div class="info" v-show="!phoneStatus.error && !requestReady">
            信息获取中...
          </div>
          <div class="info" v-show="phoneStatus.error">
            {{ phoneStatus.content }}
          </div>
          <div class="synopsis" v-show="requestReady">
            {{ phoneNumber }}
          </div>
          <van-button
            type="primary"
            @click="getPhoneCode"
            v-show="!isSendedCode && requestReady"
          >
            获取手机验证码
          </van-button>
          <van-password-input
            v-show="isSendedCode"
            :value="checkCode"
            :gutter="5"
            :length="6"
            :mask="false"
          />
          <span
            @click="getPhoneCode"
            class="reacquire"
            v-show="isSendedCode && requestReady"
          >
            {{ sendedInfo.info }}
          </span>
        </van-tab>
        <van-tab title="身份证号登陆">
          <div class="info" v-show="!idCardStatus.error && !requestIdReady">
            信息获取中...
          </div>
          <div class="info" v-show="idCardStatus.error">
            {{ idCardStatus.content }}
          </div>
          <div class="synopsis" v-show="requestIdReady">
            {{ idCardNumber }}
          </div>
          <van-password-input
            v-show="requestIdReady"
            :value="checkCode"
            :gutter="5"
            :length="6"
            :mask="false"
          />
          <span class="reacquire" v-show="requestIdReady">
            请输入身份证后6位
          </span>
        </van-tab>
      </van-tabs>
    </div>

    <van-number-keyboard
      extra-key="X"
      v-model="checkCode"
      :hide-on-click-outside="false"
      v-show="isSendedCode || (vanTabActive === 1 && requestIdReady)"
      :title="vanTabActive === 1 ? '请输入身份证后6位' : '请输入收到的验证码'"
    />
    <Footer />
  </div>
</template>
<script>
import Logo from "@/components/logo.vue";
import Footer from "@/components/footer.vue";
import { DialogAlert } from "@/utils/common";
import {
  getPhoneNumber,
  sendPhoneMsg,
  checkIdCard,
  checkPhoneMsg,
  authRegid,
} from "@/api/login";
export default {
  name: "Login",
  components: { Logo, Footer },
  data() {
    return {
      vanTabActive: 0,
      requestReady: false,
      requestIdReady: false,
      phoneStatus: {
        error: false,
        content: "",
      },
      idCardStatus: {
        error: false,
        content: "",
      },
      phoneNumber: "",
      idCardNumber: "",
      checkCode: "",
      isSendedCode: false, // 是否发送了验证码
      sendedInfo: {
        info: "", // 底下那行小字
        countDown: 3, // 倒计时
        timer: 0,
      },
    };
  },
  watch: {
    async checkCode(code) {
      if (code.length !== 6) return;
      try {
        const isCheckID = this.vanTabActive === 1;
        let data = {};
        if (isCheckID) {
          data = await checkIdCard(code);
        } else {
          data = await checkPhoneMsg(code);
        }
        if (data.error === 0) {
          this.signInSubmit();
        } else {
          DialogAlert(data.message);
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
  mounted() {
    this.getFilmInfo();
  },
  methods: {
    async getPhoneCode() {
      try {
        if (this.sendedInfo.timer !== 0) return;
        const { error, data, message } = await sendPhoneMsg(
          this.$route.query.debug
        );
        if (error === 0) {
          this.isSendedCode = true;
          const sendedInfo = {
            info: "没有收到验证码？", // 底下那行小字
            countDown: data.interval, // 倒计时
            timer: 0, // 计时器资源句柄
          };
          this.$set(this, "sendedInfo", sendedInfo);
          this.intervalEvent();
        }
        if (error === 1) {
          DialogAlert(`${message}！请刷新界面重试`);
        }
        if (error === 4) {
          DialogAlert(`发送失败，${message}`);
        }
      } catch (e) {
        console.log(e);
      }
    },
    async getFilmInfo() {
      try {
        const {
          reg_id: regId,
          hospital_code: orgCode,
          regGuid,
        } = this.$route.query;
        const response = await getPhoneNumber(regId, orgCode, regGuid);
        const data = response.data || {};
        this.idCardNumber = data.id_card;
        if (!data.phone_number) {
          const phoneStatus = {
            error: true,
            content: "无法通过手机号登陆，未找到相关手机号信息",
          };
          this.$set(this, "phoneStatus", phoneStatus);
        } else {
          this.phoneNumber = data.phone_number;
          this.requestReady = true;
        }

        if (!data.id_card) {
          const idCardStatus = {
            error: true,
            content: "无法通过身份证号登陆，未找到相关身份证号信息",
          };
          this.$set(this, "idCardStatus", idCardStatus);
        } else {
          this.idCardNumber = data.id_card;
          this.requestIdReady = true;
        }
      } catch (e) {
        console.log(e);
      }
    },
    intervalEvent() {
      clearInterval(this.sendedInfo.timer);
      this.sendedInfo.timer = setInterval(() => {
        if (this.sendedInfo.countDown === 0) {
          clearInterval(this.sendedInfo.timer);
          this.sendedInfo.info = "重新获取验证码";
          this.sendedInfo.timer = 0;
          this.sendedInfo.countDown = 60; //默认60秒，实际上由服务器返回的数据决定
        } else {
          this.sendedInfo.countDown--;
          this.sendedInfo.info = `没有收到验证码？ ${this.sendedInfo.countDown}秒后重试`;
        }
      }, 1000);
    },
    async signInSubmit() {
      try {
        this.$toast.loading({
          message: "登陆中...",
          forbidClick: true,
        });
        const { reg_id, hospital_code, regGuid } = this.$route.query;
        const { data, error } = await authRegid(reg_id, hospital_code, regGuid);
        this.$toast.clear();
        if (error !== 0) {
          DialogAlert("登陆失败，请刷新重试");
        } else {
          await this.$router.replace({
            name: "home",
            query: {
              reg_id: reg_id,
              hospital_code: hospital_code,
            },
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    vanTabChange() {
      this.checkCode = "";
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep(.van-tabs__nav) {
  background: transparent;
}
::v-deep(.van-tabs__line) {
  width: 100px;
}
::v-deep(.van-tab__text--ellipsis) {
  font-size: 16px;
  font-weight: 600;
}
::v-deep(.van-button) {
  font-size: 18px;
  width: 80%;
  margin: 10px auto;
  border: 0px;
  background-color: #2cb396;
}
::v-deep(.van-password-input__item) {
  font-weight: 600;
  font-size: 30px;
  border-radius: 12px;
}
::v-deep(.van-number-keyboard__header) {
  font-size: 10px;
  color: #828284;
}
::v-deep(.van-number-keyboard) {
  background-color: #e7f4f1;
}
::v-deep(.van-key__wrapper) {
  .van-key {
    color: #2b383c;
    box-sizing: border-box;
    background-color: #dce8e9;
    border-bottom: 2px solid #c1cecd;
  }
  .van-key--delete {
    color: #2b383c;
    box-sizing: border-box;
    background-color: #e7f4f1;
    border: 0px;
  }
}

.main-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .login-container {
    box-sizing: border-box;
    background: url("../assets/littlebg.png") no-repeat;
    background-size: cover;
    width: 90%;
    height: 300px;
    overflow: hidden;
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0%);
    border-radius: 5px;
    transition: 0.4s;
    padding: 20px 10px;
    margin: 0px auto;
    text-align: center;
    .info {
      font-size: 22px;
      font-weight: 700;
      color: #19aa8b;
      padding: 40px 20px;
      text-align: center;
    }
    .synopsis {
      margin: 25px 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2px;
      text-align: center;
    }
    .reacquire {
      display: inline-block;
      font-size: 14px;
      color: #0b8b6f;
      margin-top: 15px;
      cursor: pointer;
      font-weight: 500;
    }
  }
}
</style>
