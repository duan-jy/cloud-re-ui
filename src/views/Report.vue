<template>
  <div class="report-container">
    <!-- <img class="logo" alt="logo" src="@/assets/image/defaultlogo.png" /> -->
    <Logo :isPc="true" />
    <div class="header">
      <button @click="openMivOnline">在线查看影像</button>
      <button @click="openAbout">关于</button>
    </div>
    <div class="main">
      <div class="report">
        <div class="title">原始报告内容</div>
        <h1>{{ detailed.orgName }}</h1>
        <hr />
        <a-row>
          <a-col class="item" :span="3">姓名：</a-col>
          <a-col class="value" :span="3">{{ detailed.patientName }}</a-col>
          <a-col class="item" :span="3">性别：</a-col>
          <a-col class="value" :span="3">{{ detailed.patientSex }}</a-col>
          <a-col class="item" :span="3">年龄：</a-col>
          <a-col class="value" :span="3">{{ detailed.age }}</a-col>
          <a-col class="item" :span="3">模态：</a-col>
          <a-col class="value" :span="3">{{ detailed.modality }}</a-col>
        </a-row>
        <a-row>
          <a-col class="item" :span="3">序号：</a-col>
          <a-col class="value" :span="21">{{ detailed.patientId }}</a-col>
        </a-row>
        <a-row>
          <a-col class="item" :span="3">类型：</a-col>
          <a-col class="value" :span="20">{{ detailed.studyBodypart }}</a-col>
        </a-row>
        <hr />
        <div class="content">
          <h2 class="">影像表现</h2>
          <div>{{ detailed.finding }}</div>

          <h2 class="">诊断结果</h2>
          <div>{{ detailed.conclusion }}</div>
        </div>
        <a-row>
          <a-col class="item" :span="4">报告日期：</a-col>
          <a-col class="value" :span="6">{{ detailed.submitTime }}</a-col>
          <a-col class="item" :span="4">报告医生：</a-col>
          <a-col class="value" :span="3">{{ detailed.reportDoctor }}</a-col>
          <a-col class="item" :span="4">审核医生：</a-col>
          <a-col class="value" :span="3">{{ detailed.confirmDoctor }}</a-col>
        </a-row>
        <hr />
        <a-row>
          <a-col class="item" :span="24" style="fontweight: '400'">
            注：此报告仅供参考，以院内打印纸质报告为准
          </a-col>
        </a-row>
      </div>
      <!-- <div class="write">
        <div class="title">书写会诊意见</div>
        <hr />
        <a-textarea
          placeholder="在此处书写会诊意见"
          bordered="{false}"
          a-rows="4"
          v-model="reportContent"
        />
        <hr />
        <div class="operate">
          <button @click="saveReportEdit">保存</button>
          <button style="color:'#202020',background:'#f2f2f2'" @click="goBack">
            返回
          </button>
        </div>
      </div> -->

    </div>
  </div>
</template>
<style lang="scss" scoped>
  .report-container {
    width: 100%;
    height: 100%;
    padding: 20px;
    hr {
      border-color: #e6e6e6;
      width: 100%;
    }
    .logo {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 200px;
    }
    button {
      height: 35px;
      padding: 0px 23px;
      background-color: #15b895;
      color: #fff;
      font-size: 13px;
      border: 0px;
      border-radius: 5px;
      margin-left: 15px;
      cursor: pointer;
      min-width: 90px;
    }
    .header {
      box-sizing: border-box;
      background: transparent;
      width: 100%;
      height: 50px;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      margin-bottom: 15px;
    }
    .main {
      width: 100%;
      height: calc(100% - 65px);
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;

      .title {
        width: 100%;
        font-size: 25px;
        color: #1faa8c;
        font-weight: 700;
      }

      .report {
        // 左侧报告部分
        padding: 20px;
        display: inline-block;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: #fff;
      }

      h1 {
        text-align: center;
        color: #333;
        font-weight: 600;
        font-size: 35px;
        margin-top: 10px;
      }

      h2 {
        color: #333;
        font-weight: 600;
        font-size: 18px;
        margin-top: 10px;
      }

      .content {
        min-height: 53%;
      }

      .item {
        color: #333333;
        font-weight: 700;
        text-align: right;
      }

      .value {
        color: #333333;
        font-weight: 400;
        text-align: left;
      }

      .ant-a-row {
        margin-bottom: 8px;
      }

      .write {
        // 右侧书写报告部分
        padding: 20px;
        display: inline-block;
        width: calc(100% - 730px - 10px);
        height: 100%;
        background-color: #fff;
        display: flex;
        flex-direction: column;
      }

      textarea {
        color: #999;
        height: 90%;
        resize: none;
        outline: none;
      }

      textarea:hover {
        background-color: #efefef;
        color: #000;
      }

      .operate {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
<script>
  import Logo from '@/components/logo.vue'
  import { getStudyInfo, getViewerUrl } from '@/api/home'
  import { saveReport } from '@/api/report'
  export default {
    components: {
      Logo,
    },
    data() {
      return {
        reportContent: '',
        detailed: {},
      }
    },
    async created() {
      try {
        const { regId, orgCode } = this.$route.query
        const { data } = await getStudyInfo(regId, orgCode)
        this.$set(this, 'detailed', data)
        if (data.onlineReport) {
          this.report = data.onlineReport.report
        }
      } catch (e) {
        this.$toast({ message: '分享码已失效', position: 'center' })
        this.$router.push('/pc')
        console.error(e)
      }
    },
    methods: {
      openAbout() {
        this.$toast({ message: '图灵医道提供技术支持', position: 'center' })
      },
      goBack() {
        this.$router.push('/pc')
      },
      async saveReportEdit() {
        const { regId, orgCode } = this.$route.query
        const params = {
          report: this.reportContent,
          regId,
          orgCode,
        }
        const data = await saveReport(params)
        if (data.error == 0) {
          this.$toast({ message: '保存成功', position: 'center' })
        } else {
          this.$toast({ message: '保存失败', position: 'center' })
        }
      },
      async openMivOnline() {
        const { regId, orgCode } = this.$route.query
        const response = await getViewerUrl(regId, orgCode)
        if (response.error != 0) {
          this.$toast({
            message: response.error,
            position: 'bottom',
          })
        } else {
          this.$toast({
            message: '加载中',
            position: 'bottom',
          })
          window.location.href = response.data.url
        }
      },
    },
  }
</script>
