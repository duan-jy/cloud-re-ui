<template>
  <div id="main">
    <van-tabs
      type="card"
      color="#38b69b"
      v-model="shareInfo.mode"
      :animated="true"
      :swipeable="true"
    >
      <!-- <van-tab title="分享给其他人"> -->
      <van-tab title="普通分享">
        <van-form label-width="50%">
          <van-cell-group>
            <van-field
              :border="true"
              readonly
              clickable
              label="有效分享时间"
              :value="shareInfo.time"
              placeholder="请选择分享有效时间"
              required
              @click="dswitch.time = true"
            />
          </van-cell-group>

          <van-cell-group>
            <van-field name="switch" label="启用加密分享">
              <template #input>
                <van-switch v-model="shareInfo.encrypt" size="25" />
              </template>
            </van-field>
          </van-cell-group>

          <van-cell-group>
            <van-field name="switch" label="可以查看历史记录">
              <template #input>
                <van-switch v-model="shareInfo.history" size="25" />
              </template>
            </van-field>
          </van-cell-group>

          <van-cell-group>
            <van-field name="switch" label="匿名化分享">
              <template #input>
                <van-switch v-model="shareInfo.anonymous" size="25" />
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </van-tab>
      <van-tab title="面对面分享" style="text-align: center">
        <div v-show="f2f_init">
          <div style="margin-top: 20px">在电脑上打开以下链接</div>
          <div style="font-weight: 700">
            qiluhospital.medimage.online:8081/pc
          </div>
          <div style="padding-top: 10px">然后输入以下分享码</div>
          <div
            style="margin: 16px 0px; font-weight: 700; font-size: 25px"
            v-text="f2f_code"
          ></div>
          <van-circle
            v-model="currentRate"
            :rate="f2f_value"
            size="42px"
            stroke-width="200"
          />
        </div>
        <div v-show="!f2f_init">
          <div style="margin: 20px" v-text="f2f_msg"></div>
        </div>
      </van-tab>
      <!-- <van-tab title="分享给医生"> 
        <van-form label-width="50%">
          <van-cell-group>
            <van-field
              readonly
              clickable
              label="有效分享时间"
              :value="shareInfo.time"
              placeholder="请选择分享有效时间"
              @click="dswitch.time = true"
            />
          </van-cell-group>

          <van-cell-group>
            <van-field 
              v-model="shareInfo.doctorid"
              label="医生ID" 
              placeholder="请输入医生ID" 
            />
          </van-cell-group>
        </van-form>
      </van-tab> -->
    </van-tabs>

    <van-popup v-model="dswitch.time" round position="bottom">
      <van-picker
        show-toolbar
        :columns="columns"
        @cancel="dswitch.time = false"
        @confirm="onConfirm"
      />
    </van-popup>

    <div class="line disclaimer" v-show="shareInfo.mode != 1">
      <van-checkbox
        v-model="shareInfo.agree"
        checked-color="#38b69b"
        :label-disabled="true"
      >
        我已阅读并同意<a @click="shareDisclaimer">使用手册</a>
      </van-checkbox>
    </div>

    <div class="button-group" v-show="shareInfo.mode != 1">
      <van-button
        class="button"
        style="margin-right: 5px"
        @click="cancel"
        round
        type="default"
        >取消</van-button
      >
      <van-button
        color="#38b69b"
        class="button"
        style="margin-left: 5px"
        @click="share"
        round
        type="info"
        >创建分享</van-button
      >
    </div>

    <!-- <van-popup v-model="qr.show" round @close="close()">
      <div id="qrCode" ref="qrCodeDOM"></div>
    </van-popup>
  <van-share-sheet v-model="showShareMethod" :options="shareOptions" @select="selectShareMode" /> -->
  </div>
</template>

<script>
import { Toast, Dialog } from "vant";
import axios from "axios";

export default {
  name: "share",
  props: {
    regID: String,
    orgCode: String,
  },
  data() {
    return {
      currentRate: 0,

      f2f_init: false,
      f2f_msg: "初始化中....",

      f2f_value: 0,
      f2f_timer: null,
      f2f_timeout: 50,

      f2f_code: "",
      columns: ["6小时", "1天", "7天", "14天", "30天", "60天"],
      showPicker: false,
      agree: "0",
      showShareMethod: false,

      dswitch: {
        time: false,
        shareModePanel: false,
        QRPanel: false,
      },

      shareInfo: {
        time: "60天",
        encrypt: false,
        history: false,
        anonymous: false,

        agree: true,
        doctorid: "",
        mode: 0 /* 0:普通分享  1:医生分享 */,
      },
    };
  },

  async mounted() {
    const regID = this.regID;
    const orgCode = this.orgCode;

    const f2f_deal = async () => {
      const { data } = await axios.get(`/getShareCode/${regID}/${orgCode}`);
      if (data.error != 0) {
        clearInterval(this.f2f_timer);
        this.f2f_init = false;
        this.f2f_msg = data.message;
        return false;
      }
      this.f2f_init = true;

      let { timeout, code } = data.data;
      timeout -= 10;

      code = "" + code;
      this.f2f_code = code.substr(0, 3) + " " + code.substr(3);

      const circle = () => {
        this.f2f_value -= 5 / timeout;
        if (this.f2f_value > 0) {
          setTimeout(circle, 50);
        } else {
          this.f2f_code = "更新中";
          setTimeout(f2f_deal, timeout);
        }
      };

      this.f2f_value = 100;
      circle(); // start circle progress
    };

    await f2f_deal();
  },

  beforeDestroy() {
    if (clearInterval(this.f2f_timer)) clearInterval(this.f2f_timer);
  },

  methods: {
    cancel() {
      Toast({
        message: "取消分享",
        position: "bottom",
      });
      this.$emit("close");
    },

    onConfirm(value) {
      this.dswitch.time = false;
      this.shareInfo.time = value;
    },

    // 分享操作
    async share() {
      if (!this.shareInfo.agree) {
        Dialog({ message: "请阅读并勾选使用协议" });
        return;
      }
      if (!this.shareInfo.time) {
        Dialog({ message: "请选择有效分享时间" });
        return;
      }
      if (this.shareInfo.mode == 1) {
        if (this.shareInfo.doctorid == "") {
          Dialog({ message: "请填写医生ID" });
          return;
        }
      }

      /////////////
      let time = 0;
      switch (this.shareInfo.time) {
        case "6小时":
          time = 6 * 3600;
          break;
        case "1天":
          time = 24 * 3600;
          break;
        case "7天":
          time = 7 * 24 * 3600;
          break;
        case "14天":
          time = 14 * 24 * 3600;
          break;
        case "30天":
          time = 30 * 24 * 3600;
          break;
        default:
        case "60天":
          time = 60 * 24 * 3600;
          break;
      }

      const res = await axios.post("/share/create", {
        mode: this.shareInfo.mode,
        time: time,
        encrypt: this.shareInfo.encrypt,
        history: this.shareInfo.history,
        anonymous: this.shareInfo.anonymous,
        doctorid: this.shareInfo.doctorid,
        regID: this.regID,
        orgCode: this.orgCode,
      });
      if (res.data.error == 0) {
        if (this.shareInfo.mode == 0) {
          const url = res.data.data.url;
          this.$emit("complete", [url, res.data.data.pwd]);
          this.$emit("close");
        } else {
          this.$emit("close");
          Toast.success("分享成功");
        }
      } else {
        Toast.fail(res.data.message);
      }
    },

    // 显示免责声明
    shareDisclaimer() {
      const content = `
        <p style='text-align: left'>感谢您对影像云平台的使用与信任！</p>
        <p style='text-align: left'>为了给您提供更加优质、便捷的数字影像服务，请阅读《隐私保护指引》和《服务协议》</p>
        <p style='text-align: left'>为了向您提供医疗/健康管理服务的相关功能，影像云平台会收集、使用必要信息（例如：姓名、身份证/护照号、手机号、个人健康信息等），包括但不限于向用户发出活动和服务信息等。</p>
        <p style='text-align: left'>平台会采取业界先进的安全措施保护您的信息安全，将对用户资料实行保密，保护您的隐私是我们平台的一项基本政策。</p>
        <p style='text-align: left'>未经您同意，我们不会从第三方处获取、共享或向其提供您的影像或健康信息。</p>
        <p style='text-align: left'>若您同意，请点击“同意”并开始接受我们的服务。</p>
        `;
      Dialog.alert({
        title: "免责声明",
        message: content,
      });
    },
  },
};
</script>
<style lang="stylus" scoped>
/deep/ .van-tabs__wrap{
  margin-bottom: 10px;
}

#main {
  padding: 20px;



  .button-group{
    margin-top:30px;
    display: flex;
    justify-content: center;
    align-items: center;

    .button{
      width: 50%;
    }
  }
}

.line {
  width: 100%;

  a {
    cursor: pointer;
  }
}

.disclaimer{
  margin-top:20px;
}
</style>
