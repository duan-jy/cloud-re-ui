<style lang="scss" scoped>
$main-font-cor: #2dc2cf;
.dicom-msg {
  position: absolute;
  overflow: hidden;
  .msg {
    width: 100%;
    font-size: 14px;
    color: $main-font-cor;
    height: 20px;
    line-height: 20px;
    font-weight: bold;
    overflow: hidden;
    font-family: serif;
  }
}
.upper-left {
  top: 10px;
  left: 5px;
}
.upper-right {
  top: 10px;
  right: 5px;
  text-align: right;
}
.lower-left {
  bottom: 10px;
  left: 5px;
}
.lower-right {
  bottom: 10px;
  right: 5px;
  text-align: right;
}
</style>
<template>
  <div class="dicom-msg-content">
    <div class="dicom-msg upper-left">
      <div class="msg">IM: {{ viewMsgDesc.instanceNumber }}</div>
      <div class="msg">SE: {{ viewMsgDesc.seriesNumber }}</div>
      <div v-if="viewMsgDesc.sliceLocation !== 'NaN'" class="msg">
        P: {{ viewMsgDesc.sliceLocation }}
      </div>
      <div class="msg">KV: {{ viewMsgDesc.KV }}</div>
    </div>
    <div class="dicom-msg upper-right">
      <div class="msg">{{ viewMsgDesc.institutionName }}</div>
      <div class="msg">{{ viewMsgDesc.patientName }}</div>
      <div class="msg">{{ viewMsgDesc.patientAge }}</div>
      <div class="msg">{{ viewMsgDesc.patientSex }}</div>
      <div class="msg">{{ viewMsgDesc.patientId }}</div>
    </div>
    <div class="dicom-msg lower-left">
      <div class="msg">X: {{ viewMsgDesc.x }} Y: {{ viewMsgDesc.y }}</div>
      <div class="msg">Zoom: {{ viewMsgDesc.scale }}%</div>
      <div class="msg">
        WW: {{ viewMsgDesc.windowWidth }} WC: {{ viewMsgDesc.windowCenter }}
      </div>
      <div
        v-show="setSeriesDate(viewMsgDesc.seriesDate, viewMsgDesc.seriesTime)"
        class="msg"
      >
        {{ setSeriesDate(viewMsgDesc.seriesDate, viewMsgDesc.seriesTime) }}
      </div>
    </div>
    <div class="dicom-msg lower-right">
      <div class="msg">
        {{ `${viewMsgDesc.instanceNumber} / ${viewMsgDesc.seriesLength}` }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    viewMsgDesc: {
      type: Object,
      default: () => {
        return {
          x: 0,
          y: 0,
          sliceLocation: 0,
          instanceNumber: "",
          windowCenter: "",
          windowWidth: "",
          KV: "",
          scale: "",
          patientId: "",
          seriesDate: "",
          seriesTime: "",
          patientAge: "",
          patientSex: "",
          patientName: "",
          seriesNumber: "",
          institutionName: "",
        };
      },
    },
  },
  data() {
    return {};
  },
  methods: {
    getDateFormat(time) {
      if (!time) return "";
      let date = "";
      const str = time.split(" ")[0];
      str.slice(0, 1) + "-" + str.slice(1);
      date += str.slice(0, 6) + "-" + str.slice(6);
      return date.slice(0, 4) + "-" + date.slice(4);
    },
    add0(int) {
      return Number(int) >= 10 ? int : `0${int}`;
    },
    setSeriesDate(date, time) {
      if (date && time) {
        const dateFormat = this.getDateFormat(date);
        const dateStartTime = new Date(dateFormat).getTime();
        const dateTime = new Date(dateStartTime + Number(time) * 1000);
        const year = dateTime.getFullYear();
        const month = dateTime.getMonth() + 1;
        const day = dateTime.getDate();
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();
        const second = dateTime.getSeconds();
        return `${year}-${this.add0(month)}-${this.add0(day)} ${this.add0(
          hour
        )}:${this.add0(minute)}:${this.add0(second)}`;
      } else {
        return "";
      }
    },
  },
};
</script>
