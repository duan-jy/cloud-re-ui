<template>
  <div class="content-container">
    <Loading :loading="loading" />
    <div class="toolsbar">
      <Toolsbar
        ref="toolsbar"
        :auto-sync="autoSync"
        :active-element="activeElement"
        :video-menu="videoMenu"
        :ai-display-show="aiDisplayShow"
        :screen-origin="isPortrait"
        :mpr-whether="MprWhether"
        :mpr-tool-type="MprToolType"
        :window-levels="WindowLevels"
        @displayMpr="displayMpr"
        @whetherPlay="whetherPlay"
        @operSeriesSync="operSeriesSync"
        @createElements="createElements"
        @changeAttrValue="changeAttrValue"
      />
    </div>
    <div class="viewer" v-show="!MprWhether">
      <div class="horizontal">
        <div class="viewport">
          <div
            v-for="item in partArray"
            :id="`dicomRegion${item}`"
            :key="`dicomRegion${item}`"
            :style="{ width: xWidth, height: yHeight }"
            :class="{
              'dicom-region': true,
              'border-left-empty': item !== 0 && item % regionPart.x !== 0,
              'border-top-empty': item !== 0 && item / regionPart.x >= 1,
              active: activeElement === `dicomRegion${item}`,
            }"
            @drop.stop="seriesDropdown"
            @dragover.stop="allowDropdown"
            @click="changeAttrValue('activeElement', `dicomRegion${item}`)"
          >
            <a-slider
              v-if="
                sliderRange.seriesLength !== 1 &&
                activeElement === `dicomRegion${item}`
              "
              :reverse="true"
              theme="dark"
              class="slider"
              :tooltip-visible="false"
              vertical
              :default-value="1"
              :value="sliderRange.instanceNumber"
              :max="sliderRange.seriesLength"
              :min="1"
              @change="onSliderChange"
            />
            <DicomMsg
              v-if="viewMsgDesc[`dicomRegion${item}`] && isDicomMsg === '1'"
              :view-msg-desc="viewMsgDesc[`dicomRegion${item}`]"
            />
            <div
              v-show="videoMenu && videoOptions.id === `dicomRegion${item}`"
              class="menu-container"
            >
              <div class="menu-center">
                <a-icon type="step-backward" @click="onStepChange(-1)" />
                <a-icon
                  :type="`${videoOptions.play ? 'pause' : 'caret-right'}`"
                  @click="whetherPlay()"
                />
                <a-icon type="step-forward" @click="onStepChange(1)" />
                <div class="step">
                  <a-icon
                    type="minus-circle"
                    @click="changeVideoOption('speed', -1)"
                  />
                  <span>{{ videoOptions.speed }}</span>
                  <a-icon
                    type="plus-circle"
                    @click="changeVideoOption('speed', 1)"
                  />
                </div>
              </div>
            </div>
            <div v-if="isMobile" class="dicomRegion-dialog"></div>
          </div>
        </div>
      </div>
      <div class="thumbnail">
        <div
          v-for="item in seriesSequence || []"
          :key="item.seriesInstanceUid"
          :draggable="true"
          :class="`thumbnail-item ${
            activeSeries === item.seriesInstanceUid ? 'thumbnail-active' : ''
          }`"
          @click="thumbnailClick(item.seriesInstanceUid)"
          @dragstart="thumbnailDrag(item.seriesInstanceUid)"
          @touchstart="thumbnailTouch($event, item.seriesInstanceUid)"
          @touchend="thumbnailTouchEnd($event, item.seriesInstanceUid)"
        >
          <div class="thumbnail-item-top">
            <div
              :ref="`thumbnail${item.seriesInstanceUid}`"
              class="thumbnail-viewer"
            >
              <span class="thumbnail-se"
                >{{ item.instances.length }} / {{ item.imageCount }}</span
              >
            </div>
          </div>
          <div class="thumbnail-item-bot">
            <span>SE：{{ item.seriesNumber }}</span>
            <span>{{ item.seriesDescription }}</span>
          </div>
          <div class="thumbnail-dialog"></div>
        </div>
      </div>
    </div>
    <div v-show="MprWhether" class="viewer">
      <Mpr2D
        v-if="MprWhether"
        :image-ids="MprImagesID"
        :active-tool="MprToolType"
        :sync-window-levels="WindowLevels"
        :active-pos="MprActivePos"
        :screen-origin="isPortrait === '1' ? 'vertical' : 'horizontal'"
      />
    </div>
  </div>
</template>
<script>
import Loading from "@/components/loading.vue";
import Toolsbar from "@/components/toolsbar.vue";
import DicomMsg from "@/components/dicomsg.vue";
import Mpr2D from "@/mpr/components/mpr2d.vue";
import { loadCacheImage, cornerstone, cornerstoneTools } from "@/utils/index";
import createMetadata from "@/utils/createMetadata";
import createViewdata from "@/utils/createViewdata";
import { synchronizer, seriesSync, scrollToIndex } from "@/utils/common";
import { getDicomMetaData } from "@/api/miv";

export default {
  name: "Home",
  components: {
    Mpr2D,
    Loading,
    Toolsbar,
    DicomMsg,
  },
  data() {
    return {
      activeElement: "dicomRegion0",
      activePatientIndex: "0",
      loading: false, // 控制是否显示Loading框
      showSideBar: true, // 控制是否显示左侧框
      showAnalysis: true, // 控制是否显示右侧框
      activeSeries: null, // 当前选中的Series值
      activePatientId: "", // 当前选中的患者ID值
      activeStudyId: "", // 当前选中的患者ID值
      wholeImages: [], // 当前界面保存的所有数据
      synchronizer, // 同步各图像
      seriesSync, // 同步序列信息
      autoSync: true,
      /**
       * 图像当前显示的viewer
       */
      dragSeries: "",
      viewMsgDesc: {},
      aiDisplayShow: true, // 控制显示影像AI
      regionPart: { x: 0, y: 0 }, // 当前的dicom显示区域
      elementToPart: {},
      // 自动播放的初始配置
      videoOptions: {
        id: "dicomRegion0",
        speed: 9,
        play: false,
      },
      videoMenu: false,
      isPortrait: "1",
      isDicomMsg: "1",
      /**
       * MPR 相关配置以及控制显示
       */
      MprWhether: false,
      MprImagesID: [],
      MprToolType: "SELECT",
      WindowLevels: true,
      MprActivePos: [],
    };
  },
  computed: {
    // 获取当前活跃状态的患者序列
    activePatientImage() {
      return (
        this.wholeImages.find(
          (item) => item.studyInstanceUid === this.activeStudyId
        ) || {}
      );
    },
    // 获取当前活跃状态的患者Series序列
    seriesSequence() {
      const activePatientImage = this.activePatientImage;
      return activePatientImage.seriesList || [];
    },
    activeSequence() {
      const seriesSequence = this.seriesSequence;
      const activeSeriesList = seriesSequence.find(
        (item) => item.seriesInstanceUid === this.activeSeries
      );
      return activeSeriesList || {};
    },
    // 获取当前滑动的值
    // sliderRange() {
    //   const targetID = this.activeElement
    //   const targetDesc = this.viewMsgDesc[targetID]
    //   if (targetDesc) {
    //     return {
    //       seriesLength: Number(targetDesc['seriesLength']),
    //       instanceNumber: Number(targetDesc['instanceNumber'])
    //     }
    //   } else {
    //     return {
    //       seriesLength: 1,
    //       instanceNumber: 1
    //     }
    //   }
    // },
    sliderRange() {
      const targetID = this.activeElement;
      const targetDesc = this.viewMsgDesc[targetID];
      if (targetDesc) {
        const activeSequence = this.seriesSequence.find((item) => {
          return item.seriesInstanceUid === this.activeSeries;
        });
        const instanceNumber = targetDesc["instanceNumber"];
        if (!targetDesc["seriesLength"]) {
          return {
            seriesLength: 1,
            instanceNumber: 1,
          };
        }
        const seriesLength = Number(targetDesc["seriesLength"]);
        if (activeSequence) {
          const activeInstance = activeSequence.instances.findIndex((item) => {
            return item.instanceNumber === instanceNumber;
          });
          return {
            seriesLength,
            instanceNumber: Number(activeInstance) + 1,
          };
        }
        return {
          seriesLength,
          instanceNumber: Number(instanceNumber),
        };
      } else {
        return {
          seriesLength: 1,
          instanceNumber: 1,
        };
      }
    },

    // 活跃状态的pcs_id
    activePcsId() {
      const targetID = this.activeElement;
      if (targetID && this.viewMsgDesc[targetID]) {
        const { patientId, seriesInstanceUid, seriesLength } =
          this.viewMsgDesc[targetID];
        return `${patientId}_${seriesInstanceUid}___${seriesLength}`;
      } else {
        return "";
      }
    },
    activeCompareId() {
      // if (this.wholeImages.length !== 2) return ''
      const regionPart = this.regionPart;
      if (regionPart.x !== 2 || regionPart.y !== 1) return "";
      const elementToPart = this.elementToPart;
      const partKeys = Object.keys(elementToPart);
      if (partKeys.length !== 2) return "";
      let id = "";
      if (
        elementToPart[partKeys[0]].patientName !==
        elementToPart[partKeys[1]].patientName
      ) {
        return "error";
      }
      for (const key in elementToPart) {
        const { patientId, seriesInstanceUid, seriesLength } =
          elementToPart[key];
        id += `${patientId}_${seriesInstanceUid}___${seriesLength}${
          id ? "" : "&"
        }`;
      }
      return id;
    },
    // 当前需要创建的part
    partArray() {
      const { x, y } = this.regionPart;
      return x * y > 1 ? Array.from({ length: x * y }, (v, k) => k) : [0];
    },
    // 已经创建了的element
    wholeElement() {
      const partArray = this.partArray;
      return partArray.map((i) => document.getElementById(`dicomRegion${i}`));
    },
    xWidth() {
      const X = this.regionPart.x;
      return X ? parseFloat(100 / X).toFixed(1) + "%" : "100%";
    },
    yHeight() {
      const Y = this.regionPart.y;
      return Y ? parseFloat(100 / Y).toFixed(1) + "%" : "100%";
    },
    isMobile() {
      const browser = this.browser();
      return (
        browser.mobile ||
        browser.android ||
        browser.ios ||
        document.body.clientWidth < 787
      );
    },
  },
  watch: {
    activeElement(refer) {
      this.$nextTick(() => {
        this.removeActiveSync(document.getElementById(refer));
      });
    },
    isPortrait(refer) {
      this.resizeElement();
    },
    MprWhether(refer) {
      if (!refer) {
        this.$nextTick(() => {
          this.thumbnailShow();
        });
      }
    },
  },
  created() {
    cornerstoneTools.init({
      // 全局配置
      globalToolSyncEnabled: true,
    });
  },
  mounted() {
    document.oncontextmenu = function () {
      return false;
    };
    const studyId = this.$route.query.studyId;
    if (studyId) {
      this.$set(this, "activeStudyId", studyId);
      this.getDicomData(studyId);
    }
  },
  beforeRouteUpdate(to, from, next) {
    const studyId = this.$route.query.studyId;
    if (studyId) {
      this.$set(this, "activeStudyId", studyId);
      this.getDicomData(studyId);
    }
    next();
  },
  methods: {
    /**
     * 创建显示的折叠面板
     * 目前来看在影像对比以及前端显示多样化上是需要的
     */
    collapseChange(key) {
      if (!key) return;
      const activePatientId = this.wholeImages[key].patientId;
      this.$set(this, "activePatientId", activePatientId);
      this.$nextTick(() => {
        setTimeout(() => {
          this.thumbnailShow();
        }, 200);
      });
    },
    /**
     * 点击删除当前患者列表
     */
    collapseClick(index, patientId) {
      const wholeImages = [...this.wholeImages];
      wholeImages.splice(index, 1);
      if (this.activePatientId === patientId) {
        if (wholeImages.length === 0) {
          this.activePatientId = "";
        } else {
          this.activePatientId = wholeImages[0].patientId;
        }
        this.activePatientIndex = "0";
      }
      this.$set(this, "wholeImages", wholeImages);
    },
    /**
     * 配置显示当前数据匹配的MPR
     */
    displayMpr() {
      const seriesSequence = this.seriesSequence;
      const activeSeriesList = seriesSequence.find(
        (item) => item.seriesInstanceUid === this.activeSeries
      );
      if (!activeSeriesList) return;
      const seriesImages = activeSeriesList.instances || [];
      if (!seriesImages.length) return;
      this.MprWhether = true;
      this.$nextTick(() => {
        const timer = setTimeout(() => {
          this.MprImagesID = seriesImages.map((item) => item.url);
          clearTimeout(timer);
        }, 100);
      });
    },
    /**
     * 控制侧边栏以及右侧AI显示
     */
    displaySideBar(mold) {
      if (mold === "thumbnail") {
        this.showSideBar = !this.showSideBar;
      } else {
        this.showAnalysis = !this.showAnalysis;
      }
      this.resizeElement();
    },
    resizeElement() {
      this.$nextTick(() => {
        this.thumbnailShow();
        try {
          for (const element of this.wholeElement) {
            if (!element) continue;
            const enabledElement = cornerstone.getEnabledElement(element);
            if (!enabledElement) continue;
            cornerstone.resize(element, true);
          }
        } catch (err) {
          // console.log(err)
        }
      });
    },
    /**
     * 缩略图点击时的处理
     */
    async thumbnailClick(series) {
      this.activeSeries = series;
      const elementId = this.activeElement;
      await this.initElement(elementId);
      const element = document.getElementById(this.activeElement);
      const { imageDataSet, seriesLength } = await this.setStack(element);
      this.$set(this.viewMsgDesc, elementId, { ...imageDataSet, seriesLength });
    },
    /**
     * 控制缩略图的显示
     * 添加判断是解决在隐藏状态下无法获取宽高而导致的无法显示问题
     */
    thumbnailShow() {
      if (!this.showSideBar) return;
      const seriesSequence = this.seriesSequence;
      for (const item of seriesSequence) {
        const image = item.instances[0].image;
        const seriesInstanceUid = item.seriesInstanceUid;
        const thumbnailEl = this.$refs[`thumbnail${seriesInstanceUid}`][0];
        cornerstone.enable(thumbnailEl);
        cornerstone.displayImage(thumbnailEl, image);
      }
    },
    /**
     * 控制拖拽
     */
    thumbnailDrag(seriesId) {
      this.dragSeries = seriesId;
    },
    thumbnailTouch(evt, seriesId) {
      if (this.isMobile) {
        // 判断是否是移动端
        this.dragSeries = seriesId;
      } else {
        // evt.preventDefault();
        console.log("这里是pc端");
        return;
      }
    },
    async thumbnailTouchEnd(evt, seriesId) {
      if (this.isMobile) {
        // 判断是否是移动端
        const { clientX, clientY } = evt.changedTouches[0];
        const elementId = this.judgeIsInDiv(clientX, clientY);
        if (elementId === "") return;
        this.$set(this, "activeSeries", this.dragSeries);
        await this.initElement(elementId);
        const { imageDataSet, seriesLength } = await this.setStack(
          document.getElementById(elementId)
        );
        this.$set(this, "activeElement", elementId);
        this.$set(this.viewMsgDesc, elementId, {
          ...imageDataSet,
          seriesLength,
        });
      } else {
        // evt.preventDefault();
        console.log("这里是pc端");
        return;
      }
      // evt.preventDefault();
    },
    browser() {
      // 获取浏览器UA标识
      var u = navigator.userAgent;
      // Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36
      return {
        trident: u.indexOf("Trident") > -1, // IE内核
        presto: u.indexOf("Presto") > -1, // opera内核
        webKit: u.indexOf("AppleWebKit") > -1, // 苹果、谷歌内核
        gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") === -1, // 火狐内核
        mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
        android: u.indexOf("Android") > -1 || u.indexOf("Adr") > -1, // android终端
        iPhone: u.indexOf("iPhone") > -1, // 是否为iPhone或者QQHD浏览器
        iPad: u.indexOf("iPad") > -1, // 是否iPad
        webApp: u.indexOf("Safari") === -1, // 是否web应该程序，没有头部与底部
        weixin: u.indexOf("MicroMessenger") > -1, // 是否微信 （2015-01-22新增）
        qq: u.match(/\sQQ/i) === " qq", // 是否QQ
      };
    },
    judgeIsInDiv(x, y) {
      const divList = document.getElementsByClassName("dicom-region");
      let filterDivList = [];
      for (let i = 0; i < divList.length; i++) {
        const item = divList[i];
        const offsetLeft = item.offsetLeft;
        const offsetTop = item.offsetTop + 60;
        const offsetRight = item.offsetLeft + item.offsetWidth;
        const offsetBot = item.offsetTop + item.offsetHeight + 60;
        if (
          x > offsetLeft &&
          x < offsetRight &&
          y > offsetTop &&
          y < offsetBot
        ) {
          filterDivList.push(item);
        }
      }
      return filterDivList[0] ? filterDivList[0].id : "";
    },
    async seriesDropdown(e) {
      this.$set(this, "activeSeries", this.dragSeries);
      let element = e.target;
      if (element.className.indexOf("cornerstone-canvas") > -1) {
        element = e.target.parentNode; // 如果拖进已经初始化的则选择其父级
      }
      const elementId = element.id;
      await this.initElement(elementId);
      const { imageDataSet, seriesLength } = await this.setStack(element);
      this.$set(this, "activeElement", elementId);
      this.$set(this.viewMsgDesc, elementId, { ...imageDataSet, seriesLength });
    },
    allowDropdown(e) {
      // e.preventDefault();
    },
    async getDicomData(studyId) {
      this.loading = true;
      this.$set(this, "wholeImages", []);
      const dataList = this.wholeImages || [];
      try {
        const { imageIds, aImageIdObj, priority, patientId } =
          await getDicomMetaData(studyId);
        // document.title = patientId;
        this.$set(this, "activePatientId", patientId);
        if (imageIds.length === 0) {
          this.loading = false;
          this.$message.error("服务器暂无图像数据");
          return;
        }
        // this.$set(this, 'activeSeries', Object.keys(aImageIdObj)[0])
        // this.activePatientIndex = `${dataList.length}`
        const ignoreImageIds = [];
        let isAutoShow = true;
        for (const imageObject of priority) {
          try {
            const imageOriginalData = await loadCacheImage(imageObject.imageId);
            imageObject.imageIds = aImageIdObj[imageObject.seriesInstanceID];
            createMetadata(imageObject, imageOriginalData, dataList);
            this.$nextTick(async () => {
              if (this.loading) this.loading = false;
              this.thumbnailShow();
              if (isAutoShow) {
                isAutoShow = false;
                this.activeSeries = imageObject.seriesInstanceID;
                const { imageDataSet, seriesLength } = await this.setStack(
                  document.getElementById(this.activeElement)
                );
                this.$set(this.viewMsgDesc, this.activeElement, {
                  ...imageDataSet,
                  seriesLength,
                });
              }
            });
          } catch (e) {
            continue;
          }
        }
        for (const series in aImageIdObj) {
          const seriesImageIds = aImageIdObj[series];
          for (const imageId of seriesImageIds) {
            try {
              if (this.activeSeries === series) {
                await this.updateDesc(seriesImageIds);
              }
              const { patientId: patientIdPart } =
                this.elementToPart[this.activeElement] || {};
              if (
                this.activeSeries &&
                this.activeSeries !== series &&
                patientId === patientIdPart
              ) {
                ignoreImageIds.push(imageId);
                continue;
              }
              const imageOriginalData = await loadCacheImage(imageId);
              createMetadata(imageId, imageOriginalData, dataList);
            } catch (e) {
              console.log(e);
              continue;
            }
          }
        }
        for (const imageId of ignoreImageIds) {
          try {
            const imageOriginalData = await loadCacheImage(imageId);
            createMetadata(imageId, imageOriginalData, dataList);
          } catch (e) {
            console.log(e);
            continue;
          }
        }
        if (this.activeSeries) {
          this.updateDesc(aImageIdObj[this.activeSeries]);
        }
        this.$message.success("图像加载完成");
      } catch (e) {
        console.log(e);
        this.loading = false;
      }
    },
    // 更新当前界面显示
    updateDesc(imageIds) {
      return new Promise((resolve) => {
        const elementToPart = this.elementToPart;
        const stackedElement = Object.keys(elementToPart) || [];
        stackedElement.map((elementId) => {
          if (elementId !== this.activeElement) return;
          const element = document.getElementById(elementId);
          const stackStatus = cornerstoneTools.getToolState(element, "stack");
          stackStatus.data[0].imageIds = imageIds;
          cornerstoneTools.addToolState(element, "stack", stackStatus);
        });
        resolve();
      });
    },
    /**
     * 创建stack组，鼠标滑轮滚动
     */
    setStack(element) {
      return new Promise((resolve) => {
        try {
          this.initElement(element.id);
          this.videoMenu = false;
          this.videoOptions.play = false;
          this.stopVideo(element);
          const seriesSequence = this.seriesSequence;
          const activeSeriesList = seriesSequence.find(
            (item) => item.seriesInstanceUid === this.activeSeries
          );
          if (!activeSeriesList) return;
          const seriesImages = activeSeriesList.instances || [];
          seriesImages.sort((aSort, bSort) => {
            return aSort.instanceNumber - bSort.instanceNumber;
          });
          const imageIds = seriesImages.map((item) => item.url);
          const image = seriesImages[0].image;
          cornerstone.displayImage(element, image);
          cornerstone.reset(element);
          const stack = {
            currentImageIdIndex: 0,
            imageIds,
          };
          // this.synchronizer.add(element)
          cornerstoneTools.addStackStateManager(element, ["stack"]);
          cornerstoneTools.addToolState(element, "stack", stack);
          const imageDataSet = createViewdata(image);
          const resolveData = {
            imageDataSet,
            seriesLength: activeSeriesList.imageCount,
          };
          this.$set(this.elementToPart, element.id, {
            patientName: imageDataSet.patientName,
            patientId: imageDataSet.patientId,
            seriesInstanceUid: imageDataSet.seriesInstanceUid,
            seriesLength: activeSeriesList.imageCount,
            seriesDate: imageDataSet.seriesDate,
          });
          this.addSeriesSync(element, imageDataSet.patientId);
          resolve(resolveData);
        } catch (error) {
          console.log(error);
          resolve(undefined);
        }
      });
    },
    /**
     * 滑轮发生变化时的处理
     */
    onSliderChange(index, id = this.activeElement) {
      const elementId = id;
      const element = document.getElementById(elementId);
      const { instanceNumber } = this.viewMsgDesc[elementId];
      const loadedCount = this.activeSequence.instances.length;
      if (loadedCount - index < 0) {
        this.$message.error("暂未加载至当前图像，努力加载中请稍后");
        return;
      }
      if (!(instanceNumber - index)) {
        cornerstone.updateImage(element);
      }
      scrollToIndex(element, index - 1);
    },
    // 初始化定义element
    initElement(elementId) {
      const element = document.getElementById(elementId);
      return new Promise((resolve, reject) => {
        try {
          cornerstone.getEnabledElement(element);
          cornerstone.resize(element, true);
          resolve(true);
        } catch (err) {
          try {
            cornerstone.enable(element);
            // window.addEventListener('resize', e => this.resizeElement())
            const toolsbar = this.$refs.toolsbar;
            this.initSynchronizer(element);
            toolsbar.initTools(element, this.seriesSync, () => {
              this.addListener(element, "MOUSE_CLICK", "mouseClick");
              this.addListener(element, "MOUSE_WHEEL", "mouseWheel");
              this.addListener(element, "MOUSE_DRAG", "mouseDrag");
              this.addListener(element, "MOUSE_MOVE", "mouseMove");
              this.addListener(
                element,
                "LABELMAP_MODIFIED",
                "labelmapModified"
              );
              this.addListener(
                element,
                "cornerstoneimagerendered",
                "imageRendered"
              );
              resolve(true);
            });
          } catch (error) {
            console.log(error);
            reject(false);
          }
        }
      });
    },
    // 封装监听函数
    addListener(element, category, method) {
      if (category === "cornerstoneimagerendered") {
        element.addEventListener(category, this[method]);
        return;
      }
      element.addEventListener(cornerstoneTools.EVENTS[category], this[method]);
    },
    /**
     * 图像监听事件
     */
    mouseClick(evt) {
      console.log(evt)
      // evt.preventDefault();
    },
    mouseWheel(evt) {
      // evt.preventDefault();
    },
    mouseDrag(evt) {
      // evt.preventDefault();
    },
    mouseMove(evt) {
      const elmentId = evt.target.id;
      const targetData = this.viewMsgDesc[elmentId];
      const x = evt.detail.currentPoints.image.x.toFixed(0);
      const y = evt.detail.currentPoints.image.y.toFixed(0);
      this.$set(this.viewMsgDesc, elmentId, { ...targetData, x, y });
    },
    labelmapModified(e) {
      // console.log(e)
    },
    imageRendered(evt) {
      if (evt.detail && evt.detail.image) {
        const elementId = evt.target.id;
        const targetData = this.viewMsgDesc[elementId];
        const viewport = cornerstone.getViewport(evt.detail.element);
        const instanceNumber = evt.detail.image.data.string("x00200013");
        this.$set(this.viewMsgDesc, elementId, {
          ...targetData,
          windowCenter: parseInt(viewport.voi.windowCenter),
          windowWidth: parseInt(viewport.voi.windowWidth),
          scale: parseInt(viewport.scale * 100),
          sliceLocation: parseFloat(evt.detail.image.data.string("x00201041")),
          instanceNumber,
          KV: evt.detail.image.data.string("x00180060"),
          sopInstanceUid: evt.detail.image.data.string("x00080018"),
        });
      }
    },
    /**
     * 创建DIV容器
     */
    createElements(x, y) {
      this.activeElement = "dicomRegion0";
      this.$set(this.regionPart, "x", x);
      this.$set(this.regionPart, "y", y);
      this.$nextTick(() => {
        const AllViewArray = Array.from({ length: x * y }, (v, k) => k);
        // const viewMsgElement = Object.keys(this.viewMsgDesc)

        for (const v of AllViewArray) {
          this.initElement(`dicomRegion${v}`);
        }
      });
    },
    // 更新当前属性值
    changeAttrValue(key, value) {
      this.$set(this, key, value);
    },
    // 初始化异步标准线
    initSynchronizer(element) {
      if (this.wholeElement.length > 2) return;
      this.synchronizer.add(element);
      if (element.id === this.activeElement) return;
      cornerstoneTools.addToolForElement(
        element,
        cornerstoneTools.ReferenceLinesTool
      );
      cornerstoneTools.setToolEnabled("ReferenceLines", {
        synchronizationContext: this.synchronizer,
        overwrite: true,
      });
    },
    removeActiveSync(refer) {
      console.log(refer);
      // if (refer) {
      //   this.synchronizer.remove(refer);
      //   cornerstoneTools.removeToolForElement(refer, "ReferenceLines");
      //   cornerstone.updateImage(refer);
      //   this.initSynchronizer(refer);
      //   return;
      // }
      this.wholeElement.map((item) => {
        this.synchronizer.remove(item);
        cornerstoneTools.removeToolForElement(item, "ReferenceLines");
        cornerstone.updateImage(item);
        this.initSynchronizer(item);
      });
    },
    // 响应同步
    addSeriesSync(element) {
      if (!this.autoSync) return;
      this.seriesSync.add(element);
    },
    operSeriesSync(boolean, compare) {
      this.autoSync = !boolean;
      if (!boolean) {
        if (compare) {
          this.createElements(1, 1);
        }
        // 在非同一患者的情况下 默认去除影像同步功能
        this.wholeElement.map((item) => {
          // const elementId = item.id
          // const patientId = this.elementToPart[elementId].patientId
          // if (patientId !== this.activePatientId) return
          this.seriesSync.add(item);
        });
      } else {
        if (compare) {
          this.createElements(2, 1);
        }
        this.wholeElement.map((item) => {
          this.seriesSync.remove(item);
        });
      }
    },
    // 自动播放
    whetherPlay(isShow) {
      const play = this.videoOptions.play;
      if (isShow !== undefined) this.videoMenu = !this.videoMenu;
      if (isShow && !play) return;
      if (isShow === false) {
        this.$set(this.videoOptions, "id", this.activeElement);
      }
      this.videoOptions.play = !this.videoOptions.play;
      const activeElement = document.getElementById(this.activeElement);
      if (this.videoOptions.play) {
        cornerstoneTools.playClip(activeElement, this.videoOptions.speed);
        return;
      }
      const element = document.getElementById(this.videoOptions.id);
      cornerstoneTools.stopClip(element);
    },
    stopVideo(element, start) {
      cornerstoneTools.stopClip(element);
      if (start) {
        cornerstoneTools.playClip(element, this.videoOptions.speed);
      }
    },
    changeVideoOption(key, value) {
      const element = document.getElementById(this.activeElement);
      if (key === "speed") {
        const defaultValue = this.videoOptions.speed;
        value = defaultValue + value < 1 ? 1 : defaultValue + value;
      }
      this.$set(this.videoOptions, key, value);
      if (this.videoOptions.play) {
        this.stopVideo(element, true);
      }
    },
    onStepChange(step) {
      const element = document.getElementById(this.activeElement);
      const { instanceNumber, seriesLength } =
        this.viewMsgDesc[this.activeElement];
      let index = instanceNumber - 1 + step;
      if (index === seriesLength) {
        index = 0;
      }
      if (index === -1) {
        index = seriesLength - 1;
      }
      scrollToIndex(element, index);
    },
  },
};
</script>
<style lang="scss">
$toolsbarColor: #232d58;
$thumbnail: #0b1336;
$border: #0f4f60;
.menu {
  background: #1e3c84 !important;
  padding: 0 !important;
  border-radius: 5px;
  .menu_item__available {
    color: #ddd !important;
  }
  .menu_item__available:hover {
    background: #365e8a !important;
    color: #ddd !important;
    border-radius: 5px;
  }
}

.ant-cascader-menus {
  z-index: 17000 !important;
}
.ant-popover-message > .anticon {
  left: 0;
}
.ant-popover-message-title {
  color: #ddd;
}
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
.ant-collapse-borderless {
  background-color: #232d58 !important;
  user-select: none;
  .ant-collapse-item {
    border-bottom: 1px solid #6d8ed6 !important;
  }
  .ant-collapse-header {
    background-color: #3f5482 !important;
    color: #dddddd !important;
  }
}

.content-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-basis: 0;
  flex-grow: 0;
  .toolsbar {
    overflow: hidden;
    width: 100%;
    height: 60px;
    display: flex;
    text-align: center;
    flex-direction: row;
    background: $toolsbarColor;
    user-select: none;
    .logo {
      flex-shrink: 0;
      height: 100%;
      width: 180px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        height: 66%;
      }
    }
  }
  .viewer {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
    background: $toolsbarColor;
    position: relative;
    .location {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      .location-common {
        z-index: 16901;
        cursor: pointer;
        position: absolute;
        top: 50%;
        color: #e6e6e6;
        background: #3c5283;
        height: 60px;
        width: 13px;
        text-align: center;
        border-radius: 10px;
        line-height: 60px;
        transform: translate(0, -100%);
        &:hover {
          background: #2d3f65;
        }
      }
      .thumbnail-oper {
        left: 167px;
        border-radius: 5px 0 0 5px;
      }
      .thumbnail-hide {
        border-radius: 0 5px 5px 0;
        left: 0;
      }
      .analysis-oper {
        border-radius: 0 5px 5px 0;
        right: 337px;
        z-index: 16902;
      }
      .analysis-hide {
        border-radius: 5px 0 0 5px;
        right: 0;
      }
      &.vertical {
        .analysis-oper {
          width: 60px;
          border-radius: 5px 5px 0 0;
          height: 13px;
          line-height: 13px;
          left: calc(50% + 90px);
          transform: translate(-100%, 0);
          bottom: 301px;
          top: auto;
        }
      }
    }

    .thumbnail {
      position: relative;
      width: 100%;
      height: 180px;
      background: $thumbnail;
      overflow-x: auto;
      overflow-y: hidden;
      flex-shrink: 0;
      padding-bottom: 10px;
      color: #fbfbfb;
      display: flex;
      flex-direction: row;
      .thumbnail-up {
        padding-left: 5px;
        font-size: 12px;
      }
      .thumbnail-table {
        width: 100%;
        height: auto;
      }
      .thumbnail-title {
        width: 100%;
        height: 30px;
        line-height: 30px;
        padding-left: 5px;
        color: #fbfbfb;
        font-size: 12px;
        background-color: #0d2457;
      }
      .thumbnail-item {
        overflow: hidden;
        text-align: center;
        background: black;
        margin: 14px 10px;
        width: 150px;
        height: 140px;
        border: 1px dashed $border;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        border-radius: 5px;
        position: relative;
        .thumbnail-dialog {
          width: 100%;
          height: 100%;
          z-index: 100;
          position: absolute;
          left: 0;
          top: 0;
        }
        .thumbnail-item-top {
          // flex: 1;
          // flex-grow: 1;
          width: 105px;
          height: 105px;
          margin: 0 auto;
          margin-top: 10px;
          .thumbnail-viewer {
            width: 100%;
            height: 100%;
            position: relative;
            .thumbnail-se {
              position: absolute;
              right: 0;
              bottom: 0;
              color: #fbfbfb;
              font-size: 12px;
              background: #2d2d2d;
            }
          }
        }
        .thumbnail-item-bot {
          user-select: none;
          font-size: 12px;
          height: 25px;
          line-height: 25px;
          color: #ddd;
          padding: 0 10px;
          display: flex;
          flex-direction: row;
          overflow: hidden;
          span:nth-child(1) {
            width: 45px;
          }
          span:nth-child(2) {
            flex: 1;
          }
        }
      }
    }
    .thumbnail-active {
      border: 1px solid #005c9e !important;
      .thumbnail-item-bot {
        background: #173885;
      }
    }
    .viewport {
      overflow: hidden;
      border-bottom: 1px solid #163580;
      background: black;
      flex: 1;
      width: 100%;
      display: flex;
      flex-shrink: 0;
      flex-direction: row;
      flex-wrap: wrap;
      .dicom-region {
        width: 100%;
        height: 100%;
        position: relative;
        border: 1px solid #163580;
        z-index: 100;
        .dicomRegion-dialog {
          width: 100%;
          height: 100%;
          z-index: 1000;
          position: absolute;
          left: 0;
          top: 0;
        }
        .ant-slider-vertical {
          width: 8px !important;
        }
        .slider {
          height: 60%;
          position: absolute;
          right: 0;
          top: 50%;
          // z-index: 16900;
          transform: translate(0, -50%);
          .ant-slider-rail {
            background: #4e4e4e !important;
          }
          .ant-slider:hover .ant-slider-rail {
            background: #676767 !important;
          }
          .ant-slider-track {
            background: #3c5283;
          }
          .ant-slider-handle {
            width: 10px;
            height: 10px;
            margin-left: -3px;
            background: #4973d2;
            border: 0;
          }
        }
        &.active {
          border: 1px solid #2254c8;
        }
        .menu-container {
          user-select: none;
          width: 100%;
          height: 30px;
          color: #dddddd;
          font-size: 25px;
          line-height: 30px;
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 18000;
          .menu-center {
            margin: 0 auto;
            background: #27272b;
            width: 200px;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            .anticon {
              margin: 0 5px;
            }
            .step {
              font-size: 20px;
            }
            span {
              line-height: 30px;
            }
          }
        }
      }
      .border-left-empty {
        border-left: 0;
      }
      .border-top-empty {
        border-top: 0;
      }
    }
    .analysis {
      flex-shrink: 0;
      width: 350px;
      height: 100%;
      background-color: black;
      padding: 5px;
      display: flex;
      z-index: 16901;
      flex-direction: column;
    }
    .horizontal {
      flex: 1;
      display: flex;
      flex-direction: row;
      overflow: hidden;
      flex-shrink: 0;
    }
    .vertical {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .viewport {
        width: 100%;
        height: auto;
      }
      .analysis {
        width: 100%;
        height: 300px;
      }
    }
  }
}
</style>
