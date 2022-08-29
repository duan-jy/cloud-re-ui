<template>
  <div class="home-container">
    <Logo :isHome="true" />
    <van-skeleton style="margin: 20px 0px" :loading="!complete" title :row="10">
      <div class="module-info detailed">
        <van-row>
          <van-col span="24" class="head-info">
            <img class="portrait" src="../assets/image/avatar.png" alt="" />
            <span class="head-name">{{ detail.patientName }}</span>
            <span class="head-sex">{{ detail.patientSex }}</span>
            <span class="head-age">{{ detail.age }}</span>
            <span class="head-serial">{{ detail.patientId }}</span>
          </van-col>
        </van-row>
        <van-row class="pd-5">
          <van-col span="12" class="text-left key-title">检查医院</van-col>
          <van-col span="12" class="text-right key-title">报告时间</van-col>
        </van-row>
        <van-row class="pd-5">
          <van-col span="12" class="text-left">{{ detail.orgName }}</van-col>
          <van-col span="12" class="text-right">
            {{ detail.submitTime }}
          </van-col>
        </van-row>
        <van-row class="pd-5">
          <van-col span="12" class="text-left key-title">检查类型</van-col>
          <van-col span="12" class="text-right key-title">检查部位</van-col>
        </van-row>
        <van-row class="pd-5">
          <van-col span="12" class="text-left"> {{ detail.modality }}</van-col>
          <van-col span="12" class="text-right">
            {{ detail.studyBodypart }}
          </van-col>
        </van-row>
      </div>
      <div class="module-info category">
        <van-row>
          <van-col span="6">
            <div class="category-type" @click="historySkip">
              <img
                class="category-image"
                src="../assets/image/history.png"
                alt="历史记录"
              />
              <div class="category-text">历史记录</div>
            </div>
          </van-col>
          <van-col span="6">
            <div class="category-type">
              <img
                class="category-image"
                src="../assets/image/image.png"
                alt="影像"
              />
              <div class="category-text">影像</div>
            </div>
          </van-col>
          <van-col span="6">
            <div class="category-type" @click="changeShareMode(true)">
              <img
                class="category-image"
                src="../assets/image/share.png"
                alt="分享"
              />
              <div class="category-text">分享</div>
            </div>
          </van-col>
          <van-col span="6">
            <div class="category-type" @click="downloadDcmZip">
              <img
                class="category-image"
                src="../assets/image/download.png"
                alt="下载"
              />
              <div class="category-text">下载</div>
            </div>
          </van-col>
        </van-row>
      </div>
      <div class="module-info performance">
        <div class="title"><span />影像表现</div>
        <div class="conclusion">
          {{ detail.finding }}
        </div>
      </div>
      <div class="module-info performance">
        <div class="title"><span />诊断结果</div>
        <div class="conclusion">
          {{ detail.conclusion }}
        </div>
        <div class="toptip">注：此报告仅供参考，以院内打印纸质报告为准</div>
      </div>
      <div class="footer-info">
        <div class="report">报告日期：{{ detail.submitTime }}</div>
        <div class="inspect">检查日期：{{ detail.studyTime }}</div>
      </div>
    </van-skeleton>
    <van-popup v-model="share.show" round closeable>
      <ShareComponent
        :regID="detail.regId"
        :orgCode="detail.orgCode"
        @close="changeShareMode"
        @complete="enterShareMode"
      />
    </van-popup>
  </div>
</template>
<script>
import Logo from "@/components/logo.vue";
import ShareComponent from "@/views/features/share.vue";
import { getStudyInfo, downloadZip } from "@/api/home";
import { DialogAlert } from "@/utils/common";
export default {
  components: { Logo, ShareComponent },
  data() {
    return {
      complete: false,
      query: {
        reg_id: "",
        hospital_code: "",
      },
      detail: {},
      share: {
        url: "",
        show: false,
        password: "",
        modalPanel: false,
      },
    };
  },
  async created() {
    try {
      const { reg_id, hospital_code } = this.$route.query;
      this.$set(this.query, "reg_id", reg_id);
      this.$set(this.query, "hospital_code", hospital_code);
      const response = await getStudyInfo(reg_id, hospital_code);
      if (response.error != 0) {
        this.backOff("getStudyInfo ret != 0");
        return;
      }
      this.$set(this, "detail", response.data);
      this.$set(this, "complete", true);
    } catch (error) {}
  },
  methods: {
    changeShareMode(status = false) {
      this.$set(this.share, "show", status);
    },
    // 历史记录跳转
    historySkip() {
      this.$router.push({
        name: "history",
        query: {
          reg_id: this.query.reg_id,
          hospital_code: this.query.hospital_code,
        },
      });
    },
    // 进入分享模式（1.选择分享模式 2.显示相关DOM）
    enterShareMode(url, password) {
      this.$set(this.share, "url", url);
      this.$set(this.share, "password", password);
      this.$set(this.share, "modalPanel", true);
    },
    // 下载影像
    downloadDcmZip() {
      const { reg_id: regId, hospital_code: hospitalCode } =
        this.$route.query || {};
      if (!regId || !hospitalCode) {
        this.$toast.fail("未包含必要参数，无法下载");
        return;
      }
      downloadZip(regId, hospitalCode)
        .then((data) => {
          const url = URL.createObjectURL(data);
          const a = document.createElement("a");
          a.href = url; // 给a标签赋上下载地址
          a.download = `${name}`;
          a.style.display = "none"; // 让a标签不显示
          a.click(); // a标签自点击
          URL.revokeObjectURL(a.href);
        })
        .catch((err) => {
          // DialogAlert("下载图像失败->" + err);
        });
      // window.open(`/api/download/${regId}/${hospitalCode}`);
    },
    backOff(error) {
      this.$dialog
        .alert({
          message: `发生错误，返回到登录页面 error:${error}`,
        })
        .then(() => {
          this.$router.push({
            name: "login",
            query: {
              reg_id: this.query.reg_id,
              hospital_code: this.query.hospital_code,
            },
          });
        });
    },
  },
};
</script>
<style lang="less" scoped>
.key-title {
  color: #38b69b;
  font-weight: 700;
  font-size: 16px;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
.pd-5 {
  padding: 5px 0;
}
.home-container {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 15px;
  color: #747171;
  background: url("../assets/home-bg.png");
  background-size: 100% 100%;
  .module-info {
    box-sizing: border-box;
    width: 94%;
    margin: 0 auto;
    margin-top: 12px;
    border-radius: 15px;
    background: #ffffff;
    padding: 5px;
  }
  .detailed {
    background: #f4fffd;
    padding: 10px 10px 10px 10px;
    .head-info {
      max-height: 50px;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      line-height: 50px;
      .portrait {
        height: 100%;
        max-height: 40px;
        vertical-align: bottom;
      }
      .head-sex,
      .head-age {
        padding: 0 5px;
      }
      .head-name {
        color: #38b69b;
        padding: 0 5px;
        font-size: 17px;
        font-weight: 600;
      }
      .head-serial {
        font-weight: 600;
        flex: auto;
        text-align: right;
      }
    }
  }
  .category {
    .category-type {
      display: block;
      overflow: hidden;
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 0;
      padding-top: 15px;
      .category-image {
        width: 50%;
      }
      .category-text {
        padding: 5px 0;
        font-weight: 700;
        color: #2c3e50;
      }
    }
  }
  .performance {
    color: #2c3e50;
    padding: 10px;
    .title {
      font-size: 18px;
      font-weight: 600;
      padding: 0 0 10px 0;
      span {
        font-size: 14px;
        border-left: 3px solid #38b69b;
        padding-right: 3px;
      }
    }
    .conclusion {
      color: #888888;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
        monospace;
      line-height: 1.5;
    }
    .toptip {
      font-size: 10px;
      text-align: left;
      color: #38b69b;
      padding-top: 10px;
    }
  }
  .footer-info {
    padding: 10px;
    margin: 2px;
    .report,
    .inspect {
      font-size: 13px;
      padding: 2px 0;
      color: white;
    }
  }
}
</style>
