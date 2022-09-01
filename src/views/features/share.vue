<template>
  <div class="share-container">
    <van-tabs
      type="card"
      color="#38b69b"
      v-model="pattern.mode"
      :animated="true"
      :swipeable="true"
    >
      <van-tab title="普通分享">
        <van-form label-width="50%">
          <van-cell-group>
            <van-field
              readonly
              :border="true"
              clickable
              label="有效分享时间"
              placeholder="请选择分享有效时间"
              required
              :value="pattern.time"
              @click="showDateChoice(true)"
            />
          </van-cell-group>

          <van-cell-group>
            <van-field name="switch" label="启用加密分享">
              <template #input>
                <van-switch v-model="pattern.encrypt" size="25" />
              </template>
            </van-field>
          </van-cell-group>

          <van-cell-group>
            <van-field name="switch" label="可以查看历史记录">
              <template #input>
                <van-switch v-model="pattern.history" size="25" />
              </template>
            </van-field>
          </van-cell-group>

          <van-cell-group>
            <van-field name="switch" label="匿名化分享">
              <template #input>
                <van-switch v-model="pattern.anonymous" size="25" />
              </template>
            </van-field>
          </van-cell-group>
          <van-cell-group>
            <van-checkbox
              v-model="pattern.agree"
              checked-color="#38b69b"
              :label-disabled="true"
            >
              我已阅读并同意
              <a style="color: #38b69b" @click="shareDisclaimer">使用手册 </a>
            </van-checkbox>
          </van-cell-group>
          <van-cell-group class="button-group">
            <van-button
              class="button"
              @click="closeSharePopup"
              round
              type="default"
              >取消</van-button
            >
            <van-button
              color="#38b69b"
              class="button"
              round
              type="info"
              @click="shareCommit"
              >创建分享</van-button
            >
          </van-cell-group>
        </van-form>
      </van-tab>
      <van-tab title="面对面分享" class="text-center">
        <div v-show="complete">
          <div style="margin-top: 20px">在电脑上打开以下链接</div>
          <div style="font-weight: 700">{{ pcAddress }}</div>
          <div style="padding-top: 10px">然后输入以下分享码</div>
          <div style="margin: 16px 0px; font-weight: 700; font-size: 25px">
            {{ verCode }}
          </div>
          <van-circle
            v-model="circleValue"
            :rate="circleRate"
            size="42px"
            stroke-width="200"
          />
        </div>
        <div v-show="!complete">
          <div style="margin: 20px">{{ errorMsg }}</div>
        </div>
      </van-tab>
    </van-tabs>

    <van-popup v-model="showToolBar" round position="bottom">
      <van-picker
        show-toolbar
        :columns="dateColumns"
        @cancel="showDateChoice(false)"
        @confirm="onDateConfirm"
      />
    </van-popup>
  </div>
</template>
<style lang="scss" scoped>
::v-deep(.van-tabs__wrap) {
  padding-bottom: 10px;
}
::v-deep(.van-checkbox) {
  padding: 15px;
}
::v-deep(.button-group) {
  text-align: right;
  .van-button {
    width: 45%;
    margin: 2.5%;
  }
}
.text-center {
  text-align: center;
}
.share-container {
  padding: 20px;
}
</style>
<script>
import { Dialog } from "vant";
import { getShareCode, postShareCreate } from "@/api/share";
export default {
  props: {
    regId: {
      type: String,
      default: "",
    },
    orgCode: {
      type: String,
      default: "",
    },
  },
  data() {
    const { origin } = window.location;
    const pcAddress = `${origin}/pc`;
    return {
      complete: false,
      errorMsg: "",
      verCode: "",
      showToolBar: false,
      pcAddress,
      circleValue: 0,
      circleRate: 0,
      timeout: 0,
      pattern: {
        // 分享模式
        time: "60天",
        agree: true, //
        encrypt: false, //加密
        history: false, //历史记录
        anonymous: false, //匿名的
        mode: 0 /* 0:普通分享  1:医生分享 */,
      },
      dateColumns: ["6小时", "1天", "7天", "14天", "30天", "60天"],
      columnsCompare: {
        "6小时": 21600,
        "1天": 86400,
        "7天": 604800,
        "14天": 1209600,
        "30天": 2592000,
        "60天": 5184000,
      },
    };
  },
  async mounted() {
    await this.getShareMsg();
  },
  methods: {
    showDateChoice(value) {
      this.$set(this, "showToolBar", value);
    },
    onDateConfirm(value) {
      this.$set(this, "showToolBar", false);
      this.$set(this.pattern, "time", value);
    },
    async shareCommit() {
      if (!this.pattern.agree) {
        Dialog({ message: "请阅读并勾选使用协议" });
        return;
      }
      if (!this.pattern.time) {
        Dialog({ message: "请选择有效分享时间" });
        return;
      }
      const time = this.columnsCompare[this.pattern.time] || 0;
      const { mode, encrypt, history, anonymous } = this.pattern;
      const response = await postShareCreate({
        mode,
        time,
        encrypt,
        history,
        anonymous,
        doctorid: "",
        regID: this.regId,
        orgCode: this.orgCode,
      });
      if (response.error === 0) {
        if (mode == 0) {
          const url = response.data.url;
          this.$toast.loading("加载中.....");
          this.$emit("complete", url, response.data.pwd);
          this.$emit("close", false);
        } else {
          this.$emit("close", false);
          this.$toast.success("分享成功");
        }
      } else {
        this.$toast.fail(response.message);
      }
    },
    async getShareMsg() {
      const response = await getShareCode(this.regId, this.orgCode);
      if (response.error != 0) {
        this.complete = false;
        this.errorMsg = response.message;
        return;
      }
      this.complete = true;
      let { timeout, code } = response.data;
      this.verCode = (code + "").substr(0, 3) + " " + (code + "").substr(3);
      this.timeout = timeout - 10;
      this.circleRate = 100;
      this.circleDisappear(); // start circle progress
    },
    circleDisappear() {
      this.circleRate -= 5 / this.timeout;
      if (this.circleRate > 0) {
        setTimeout(this.circleDisappear, 50);
      } else {
        this.verCode = "更新中";
        setTimeout(this.getShareMsg, this.timeout);
      }
    },
    closeSharePopup() {
      this.$toast({
        message: "取消分享",
        position: "bottom",
      });
      this.$emit("close", false);
    },
    // 显示免责声明
    shareDisclaimer() {
      let content = "";
      content +=
        "<p style='text-align: left'>感谢您对影像云平台的使用与信任！</p>";
      content +=
        "<p style='text-align: left'>为了给您提供更加优质、便捷的数字影像服务，请阅读《隐私保护指引》和《服务协议》</p>";
      content +=
        "<p style='text-align: left'>为了向您提供医疗/健康管理服务的相关功能，影像云平台会收集、使用必要信息（例如：姓名、身份证/护照号、手机号、个人健康信息等），包括但不限于向用户发出活动和服务信息等。</p>";
      content +=
        "<p style='text-align: left'>平台会采取业界先进的安全措施保护您的信息安全，将对用户资料实行保密，保护您的隐私是我们平台的一项基本政策。</p>";
      content +=
        "<p style='text-align: left'>未经您同意，我们不会从第三方处获取、共享或向其提供您的影像或健康信息。</p>";
      content +=
        "<p style='text-align: left'>若您同意，请点击“同意”并开始接受我们的服务。</p>";
      Dialog.alert({
        title: "免责声明",
        message: content,
      });
    },
  },
};
</script>
