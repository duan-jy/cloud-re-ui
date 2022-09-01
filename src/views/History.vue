<template>
  <div class="history-container">
    <van-nav-bar
      title="历史记录"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      z-index="200"
      @click-left="$router.go(-1)"
    />
    <van-search
      v-model="filter.search"
      placeholder="请输入搜索关键词"
      input-align="center"
    />
    <van-dropdown-menu active-color="#38b69b">
      <van-dropdown-item
        title-class="dropdown-item"
        v-model="filter.hospital"
        :options="hospitalList"
      />
      <van-dropdown-item v-model="filter.sort" :options="historySort" />
    </van-dropdown-menu>
    <div
      v-for="history in detailedList"
      :key="history.regId"
      class="detailed-container"
      @click="detailJump(history.regId, history.orgCode)"
    >
      <div class="header">
        <span class="name">{{ history.patientName }}</span>
        <span class="org">&nbsp; {{ history.orgName }}</span>
      </div>
      <div class="basics">
        <div class="info">
          <span class="time">{{ history.studyTime }}</span>
          <span class="dist">{{ distanceFromNow(history.studyTime) }}</span>
        </div>
        <div class="tip">检查项目</div>
        <p>{{ history.studyBodypart }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
moment.locale("zh-cn");
import { getStudyHistoryList } from "@/api/history";
export default {
  name: "History",
  data() {
    return {
      filter: {
        search: "",
        hospital: 0,
        sort: 0,
      },
      historyList: [],
      historySort: [
        { text: "默认排序", value: 0 },
        { text: "时间由远到近", value: 1 },
        { text: "时间由近到远", value: 2 },
      ],
    };
  },
  computed: {
    detailedList() {
      let detailedList = [];
      // 过滤器
      const { search, hospital, sort } = this.filter;
      if (!search) {
        detailedList = this.historyList;
      } else {
        this.historyList.map((item) => {
          if (item.orgName.indexOf(search) !== -1) {
            detailedList.push(item);
            return;
          }
          if (item.inspections && item.inspections.indexOf(search) !== -1) {
            detailedList.push(item);
            return;
          }
        });
      }
      //医院过滤
      const hospitalItem = this.historyList[hospital];
      if (hospitalItem !== undefined) {
        const hospitalName = hospitalItem.orgName;
        detailedList = detailedList.filter((item) => {
          return item.orgName === hospitalName;
        });
      }
      if (sort === 1) {
        detailedList.sort((aSort, bSort) => {
          return (
            new Date(aSort.studyTime).getTime() -
            new Date(bSort.studyTime).getTime()
          );
        });
      }
      if (sort === 2) {
        detailedList.sort((aSort, bSort) => {
          return (
            new Date(bSort.studyTime).getTime() -
            new Date(aSort.studyTime).getTime()
          );
        });
      }
      console.log(detailedList);
      return detailedList;
    },
    hospitalList() {
      let orgNameArray = [];
      const historyList = this.historyList;
      historyList.map((item) => {
        if (orgNameArray.indexOf(item.orgName) === -1) {
          orgNameArray.push(item.orgName);
        }
      });
      if (!orgNameArray.length) return [];
      let hospitalList = [];
      orgNameArray.map((item) => {
        hospitalList.push({ text: item, value: hospitalList.length });
      });
      return hospitalList;
    },
  },
  async created() {
    const response = await getStudyHistoryList();
    if (response.error !== 0) {
      this.$toast({
        message: response.message,
        position: "bottom",
      });
      this.$router.back();
      return;
    }
    this.$set(this, "historyList", response.data);
  },
  methods: {
    detailJump(reg_id, hospital_code) {
      this.$router.push({
        name: "home",
        query: {
          reg_id: reg_id,
          hospital_code: hospital_code,
        },
      });
    },
    distanceFromNow(studyTime) {
      try {
        const t = moment(studyTime);
        if (t.isValid()) {
          return t.fromNow();
        } else {
          return "";
        }
      } catch (e) {
        return "";
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep(.van-nav-bar__content) {
  background-color: #38b69b;
  .van-icon,
  .van-nav-bar__title,
  .van-nav-bar__text {
    color: #fff;
  }
}
::v-deep(.van-nav-bar) {
  background-color: #38b69b;
}
::v-deep(.van-dropdown-menu__item:first-child) {
  background-color: #38b69b;
  .van-dropdown-menu__title {
    color: #ffffff !important;
  }
}
::v-deep(.van-search) {
  background: transparent;
  .van-search__content {
    border-radius: 17px;
  }
  .van-icon {
    color: #38b69b;
  }
  .van-field__control {
    text-align: left;
  }
}
.history-container {
  width: 100%;
  height: 100%;
  background: #e8e8eb;
  overflow-x: hidden;
  overflow-y: auto;
}
.detailed-container {
  box-sizing: border-box;
  width: 94%;
  margin: 0 auto;
  margin-top: 12px;
  border-radius: 15px;
  background: #ffffff;
  overflow: hidden;
  .header {
    padding: 10px 15px 10px 25px;
    display: flex;
    justify-content: space-between;
    color: #35b69a;
    align-items: center;
    font-weight: 500;
    background-color: #fff;
    .name {
      font-weight: 700;
      font-size: 20px;
    }
    .org:before {
      content: "11";
      color: transparent;
      background: url("../assets/image/hospital.png") no-repeat;
      background-size: contain;
      background-position: center center;
    }
  }
  .basics {
    padding: 3px 15px 20px 15px;
    background-color: #f7f7f7;
    .info {
      color: #949494;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      .time {
        padding: 5px 0;
      }
    }
    .tip {
      font-weight: 700;
      color: #000;
      font-size: 17px;
    }
    p {
      color: #949494;
      margin: 5px 0px 0px 0px;
      font-size: 16px;
    }
  }
}
</style>
