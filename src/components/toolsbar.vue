<template>
  <div v-if="!MprWhether" class="toolsbar-content">
    <div class="toolsbar-content">
      <div
        v-for="tool in normalTools"
        :key="tool.name"
        :class="['toolsbar-item', { 'toolsbar-item-active': tool.isActive }]"
        :draggable="true"
        @click="setToolsActive(tool.name)"
        @dragstart="toolDrag(tool)"
      >
        <div class="toolsbar-item-top">
          <i :class="['miv-icon', tool.icon]" :title="tool.desc || ''" />
        </div>
        <div class="toolsbar-item-bot">{{ tool.desc }}</div>
      </div>
      <div class="toolsbar-item" @click="clearLabels">
        <div class="toolsbar-item-top">
          <a-icon type="bg-colors" />
        </div>
        <div class="toolsbar-item-bot">清除标注</div>
      </div>
      <a-popover trigger="click">
        <template slot="content">
          <div class="WcWwList">
            <div class="set-keyboard">设置</div>
            <div class="keyboard-item">
              <div class="name">类型</div>
              <div class="hotkey">快捷键</div>
            </div>
            <div
              v-for="item in dicomWcWw"
              :key="item.hotkey"
              class="keyboard-item list"
              @click="
                updateViewport({
                  type: 'setWcWw',
                  params: {
                    wc: item.wc,
                    ww: item.ww,
                  },
                })
              "
            >
              <div class="name">{{ item.name }}</div>
              <div class="hotkey">{{ item.hotkey }}</div>
            </div>
          </div>
        </template>
        <div class="toolsbar-item">
          <div class="toolsbar-item-top"><a-icon type="info-circle" /></div>
          <div class="toolsbar-item-bot">快捷调窗</div>
        </div>
      </a-popover>
      <a-popover trigger="click">
        <template slot="content">
          <table>
            <tr v-for="y in [1, 2, 3]" :key="`x${y}`">
              <td
                v-for="x in [1, 2, 3]"
                :key="`y${x}`"
                :class="{
                  hasHover: x <= viewportPart.x && y <= viewportPart.y,
                }"
                @mouseenter.stop="setTableView(x, y)"
                @mouseleave.stop="setTableView(0, 0)"
                @click.stop="setTableView(x, y, true)"
              />
            </tr>
          </table>
        </template>
        <div class="toolsbar-item">
          <div class="toolsbar-item-top"><a-icon type="table" /></div>
          <div class="toolsbar-item-bot">窗口</div>
        </div>
      </a-popover>
      <div
        class="toolsbar-item"
        :draggable="true"
        @click="$emit('operSeriesSync', autoSync)"
        @dragstart="automaticDrag('sync')"
      >
        <div class="toolsbar-item-top">
          <a-icon type="sync" />
        </div>
        <div class="toolsbar-item-bot">
          {{ autoSync ? "手动同步" : "自动同步" }}
        </div>
      </div>
      <div class="toolsbar-item" @click="$emit('displayMpr')">
        <div class="toolsbar-item-top">
          <i class="miv-icon iconMPR" />
        </div>
        <div class="toolsbar-item-bot">MPR</div>
      </div>
      <div
        class="toolsbar-item"
        :draggable="true"
        @click="$emit('whetherPlay', videoMenu)"
        @dragstart="automaticDrag('play')"
      >
        <div class="toolsbar-item-top">
          <a-icon :type="`${!videoMenu ? 'caret-right' : 'pause'}`" />
        </div>
        <div class="toolsbar-item-bot">
          {{ videoMenu ? "取消播放" : "自动播放" }}
        </div>
      </div>

      <a-popover trigger="click">
        <template slot="content">
          <div class="toolsbar-content">
            <div
              v-for="tool in moreTools"
              :key="tool.name"
              :class="[
                'toolsbar-item',
                { 'toolsbar-item-active': tool.isActive },
              ]"
              :draggable="true"
              @click="setToolsActive(tool.name)"
            >
              <div class="toolsbar-item-top">
                <i :class="['miv-icon', tool.icon]" :title="tool.desc || ''" />
              </div>
              <div class="toolsbar-item-bot">{{ tool.desc }}</div>
            </div>
          </div>
        </template>
        <div class="toolsbar-item">
          <div class="toolsbar-item-top">
            <i :class="['miv-icon', moreToolIcon]" />
          </div>
          <div class="toolsbar-item-bot">更多</div>
        </div>
      </a-popover>
    </div>
  </div>
  <div v-else class="toolsbar-content">
    <div
      :class="{
        'toolsbar-item': true,
        'toolsbar-item-active': MprToolType === 'SELECT',
      }"
      @click="$emit('changeAttrValue', 'MprToolType', 'SELECT')"
    >
      <div class="toolsbar-item-top"><i class="miv-icon iconjiatianjia" /></div>
      <div class="toolsbar-item-bot">十字线</div>
    </div>
    <div
      :class="{
        'toolsbar-item': true,
        'toolsbar-item-active': MprToolType === 'LEVEL',
      }"
      @click="$emit('changeAttrValue', 'MprToolType', 'LEVEL')"
    >
      <div class="toolsbar-item-top">
        <i class="miv-icon iconduibi1" />
      </div>
      <div class="toolsbar-item-bot">调窗</div>
    </div>
    <div
      class="toolsbar-item"
      @click="$emit('changeAttrValue', 'MprWhether', !MprWhether)"
    >
      <div class="toolsbar-item-top">
        <a-icon type="close" />
      </div>
      <div class="toolsbar-item-bot">关闭MPR</div>
    </div>
    <div class="check-tool">
      <a-checkbox
        style="color: '#fff'"
        :checked="WindowLevels"
        @click="$emit('changeAttrValue', 'WindowLevels', !WindowLevels)"
        >MPR同步调窗</a-checkbox
      >
    </div>
  </div>
</template>
<script>
import { tools, defaultTools } from "@/utils/source";
import {
  ScaleOverlayConfig,
  hanlderViewport,
  clearToolsState,
} from "@/utils/common";
import { cornerstone, cornerstoneTools } from "@/utils/index";
export default {
  props: {
    activeElement: {
      type: String,
      default: "dicomRegion0",
    },
    MprToolType: {
      type: String,
      default: "SELECT",
    },
    autoSync: {
      type: Boolean,
      default: true,
    },
    displayMamo: {
      type: Boolean,
      default: true,
    },
    aiDisplayShow: {
      type: Boolean,
      default: true,
    },
    videoMenu: {
      type: Boolean,
      default: true,
    },
    MprWhether: {
      type: Boolean,
      default: false,
    },
    WindowLevels: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      tools: localStorage.tools ? JSON.parse(localStorage.tools) : tools,
      automatic: localStorage.automatic
        ? JSON.parse(localStorage.automatic)
        : {
            mpr: false,
            sync: false,
            play: false,
          },
      activeAutoDrag: "",
      activeDragTool: "",
      isUpload: false,
      settingVisible: false,
      viewportPart: { x: 0, y: 0 },
      moreToolIcon: "iconArrow-DownCircle",
      toolColor: "rgba(255, 255, 0, 1)",
      toolWidth: 2,
      dicomWcWw: [
        {
          type: "CT",
          name: "骨",
          wc: 600,
          ww: 2500,
          hotkey: "1",
        },
        {
          type: "CT",
          name: "脑",
          wc: 40,
          ww: 95,
          hotkey: "2",
        },
        {
          type: "CT",
          name: "颞骨",
          wc: 700,
          ww: 4000,
          hotkey: "3",
        },
        {
          type: "CT",
          name: "软",
          wc: 40,
          ww: 250,
          hotkey: "4",
        },
        {
          type: "CT",
          name: "肺",
          wc: -650,
          ww: 1600,
          hotkey: "5",
        },
        {
          type: "CT",
          name: "肺增强血管",
          wc: -315,
          ww: 935,
          hotkey: "6",
        },
        {
          type: "CT",
          name: "腹部",
          wc: 50,
          ww: 350,
          hotkey: "7",
        },
        {
          type: "CT",
          name: "钙化血管",
          wc: 300,
          ww: 1200,
          hotkey: "8",
        },
        {
          type: "CT",
          name: "肝脏",
          wc: 30,
          ww: 170,
          hotkey: "9",
        },
        {
          type: "CT",
          name: "骨盆",
          wc: 40,
          ww: 400,
          hotkey: "0",
        },
        {
          type: "CT",
          name: "骨盆骨",
          wc: 300,
          ww: 1500,
          hotkey: "alt+1",
        },
        {
          type: "CT",
          name: "骨髓",
          wc: 40,
          ww: 300,
          hotkey: "alt+2",
        },
        {
          type: "CT",
          name: "喉",
          wc: 125,
          ww: 900,
          hotkey: "alt+3",
        },
        {
          type: "CT",
          name: "结肠",
          wc: -200,
          ww: 1500,
          hotkey: "alt+4",
        },
        {
          type: "CT",
          name: "内耳道",
          wc: 250,
          ww: 3200,
          hotkey: "alt+5",
        },
        {
          type: "CT",
          name: "头颈部",
          wc: 90,
          ww: 350,
          hotkey: "alt+6",
        },
        {
          type: "CT",
          name: "胸部",
          wc: 40,
          ww: 350,
          hotkey: "alt+7",
        },
        {
          type: "CT",
          name: "眼眶",
          wc: 30,
          ww: 325,
          hotkey: "alt+8",
        },
        {
          type: "CT",
          name: "椎骨",
          wc: 120,
          ww: 750,
          hotkey: "alt+9",
        },
        {
          type: "CT",
          name: "纵膈",
          wc: 40,
          ww: 350,
          hotkey: "alt+0",
        },
      ],
      isPortrait: "1",
    };
  },
  computed: {
    normalTools() {
      return this.tools.filter((item) => !item.isMore);
    },
    moreTools() {
      return this.tools.filter((item) => item.isMore);
    },
    moreActive() {
      return this.tools.findIndex((item) => item.isMore && item.isActive);
    },
  },
  methods: {
    /**
     * 初始化工具
     */
    initTools(element, seriesSync, callback) {
      // 设置tools的线宽
      cornerstoneTools.toolStyle.setToolWidth(this.toolWidth);
      // 设置tools的线的颜色
      cornerstoneTools.toolColors.setToolColor(this.toolColor);
      const ScaleOverlayTool = cornerstoneTools.ScaleOverlayTool;

      const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
      cornerstoneTools.addTool(ZoomTouchPinchTool);
      cornerstoneTools.setToolActive("ZoomTouchPinch", {});
      cornerstoneTools.addToolForElement(
        element,
        ScaleOverlayTool,
        ScaleOverlayConfig
      );
      cornerstoneTools.setToolActive("ScaleOverlay", {
        mouseButtonMask: 4,
      });
      cornerstoneTools.setToolDisabled("ScaleOverlay");
      // // 滚动图层工具
      const StackScrollMouseWheelTool =
        cornerstoneTools.StackScrollMouseWheelTool;
      cornerstoneTools.addToolForElement(element, StackScrollMouseWheelTool);
      cornerstoneTools.setToolActive("StackScrollMouseWheel", {
        synchronizerContext: seriesSync,
      });
      for (const tool of defaultTools) {
        if (!tool.toolName) continue;
        const ActiveTool = cornerstoneTools[tool.toolName];
        cornerstoneTools.addToolForElement(element, ActiveTool, {
          configuration: tool.configuration || {},
        });
        if (tool.isActive) {
          cornerstoneTools.setToolActive(tool.name, tool.options);
        }
      }

      for (const tool of this.tools) {
        if (!tool.toolName) {
          continue;
        }
        const ActiveTool = cornerstoneTools[tool.toolName];
        cornerstoneTools.addToolForElement(element, ActiveTool, {
          configuration: tool.configuration || {},
        });
        if (tool.isActive) {
          cornerstoneTools.setToolActive(tool.name, tool.options);
        }
      }
      // 如果有回调调用回调
      if (callback) callback();
    },
    /**
     * 使当前选中的工具置为活跃状态
     */
    setToolsActive(name) {
      const toolIndex = this.tools.findIndex((item) => item.name === name);
      if (toolIndex < 0) return;
      const tool = this.tools[toolIndex];
      if (!tool.toolName) {
        // 执行对应方法并且当前实例存在此属性
        if (tool.hanlder && Object.hasOwnProperty.call(this, tool.hanlder)) {
          this[tool.hanlder](tool.args ? tool.args : tool);
        }
        return;
      }
      if (tool.isActive) {
        tool.isActive = false;
        this.$set(this.tools, toolIndex, tool);
        cornerstoneTools.setToolEnabled(tool.name);
        const StackScrollIndex = this.tools.findIndex(
          (item) => item.name === "StackScroll"
        );
        const StackScroll = this.tools[StackScrollIndex];
        StackScroll.isActive = true;
        this.$set(this.tools, StackScrollIndex, StackScroll);
        cornerstoneTools.setToolActive(StackScroll.name, StackScroll.options);
        return;
      }
      // 禁用有相同操作响应的工具
      if (Object.hasOwnProperty.call(tool, "btnMask")) {
        const btnMask = tool["btnMask"];
        this.tools.forEach((aTool, aIndex) => {
          aTool.isActive = false;
          if (
            Object.hasOwnProperty.call(aTool, "btnMask") &&
            aTool["btnMask"] === btnMask &&
            aTool.name !== tool.name &&
            aTool.name !== "Wwwc" &&
            aTool.name !== "Zoom"
          ) {
            cornerstoneTools.setToolEnabled(aTool.name);
            this.$set(this.tools, aIndex, aTool);
          }
        });
      }
      if (tool.isMore) {
        this.moreToolIcon = tool.icon;
      } else {
        this.moreToolIcon = "iconArrow-DownCircle";
      }
      tool.isActive = true;
      this.$set(this.tools, toolIndex, tool);
      cornerstoneTools.setToolActive(tool.name, tool.options);
    },
    /**
     * 更新窗口状态
     */
    updateViewport({ type, params }) {
      // this.ShowWcWwView = false
      try {
        const element = document.getElementById(this.activeElement);
        if (!element) return;
        const enabledElement = cornerstone.getEnabledElement(element);
        if (!enabledElement) return;
        hanlderViewport(element, type, params);
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    /**
     * 实时显示table的样式，并在点击后进行提交
     */
    setTableView(x, y, refer) {
      this.$set(this.viewportPart, "x", x);
      this.$set(this.viewportPart, "y", y);
      if (refer) {
        this.$emit("createElements", x, y);
      }
    },
    // 更新当前组件的值
    changeDataStatus(name, value) {
      this.$set(this, name, value);
    },
    // 更新工具状态
    updateToolStatus() {
      // 设置tools的线宽
      cornerstoneTools.toolStyle.setToolWidth(this.toolWidth);
      // 设置tools的线的颜色
      cornerstoneTools.toolColors.setToolColor(this.toolColor);
      try {
        const element = document.getElementById(this.activeElement);
        if (!element) return;
        const enabledElement = cornerstone.getEnabledElement(element);
        if (!enabledElement) return;
        cornerstone.updateImage(element);
      } catch (error) {
        console.log(error);
      }
    },
    clearLabels() {
      const activeTool =
        this.tools.find((item) => {
          return item.isActive;
        }) || {};
      const element = document.getElementById(this.activeElement);
      if (!element) return;
      clearToolsState(element, false, activeTool.name);
    },
    toolDrag(item) {
      this.activeDragTool = item;
    },
    automaticDrag(item) {
      this.activeAutoDrag = item;
    },
    AllowDrop(e) {
      e.preventDefault();
    },
    SeriesDrop(e, isMore, isAuto) {
      if (isAuto || this.activeDragTool === "") {
        this.$set(
          this.automatic,
          this.activeAutoDrag,
          !this.automatic[this.activeAutoDrag]
        );
        this.activeAutoDrag = "";
        localStorage.automatic = JSON.stringify(this.automatic);
        return;
      }
      const tools = this.tools.map((item) => {
        if (this.activeDragTool.name === item.name) {
          item.isMore = !!isMore;
        }
        return item;
      });
      this.activeDragTool = "";
      console.log(tools);
      localStorage.tools = JSON.stringify(tools);
      this.$set(this, "tools", tools);
    },
  },
};
</script>
<style lang="scss">
$toolsbarColor: #232d58;
$toolsbarContent: #212742;
$toolsbarActive: #173885;
.toolsbar-content {
  padding: 0 5px;
  // background: $toolsbarContent;
  flex: auto;
  display: flex;
  flex-direction: row;
  color: #ddd;
  overflow-x: auto;
  overflow-y: hidden;
  .activeDragTool {
    background: #0b1336 !important;
  }
  .toolsbar-item {
    cursor: pointer;
    flex-shrink: 0;
    width: 60px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .toolsbar-item-top {
      font-size: 22px;
      flex: auto;
      color: #8f97af;
      .miv-icon {
        font-size: 22px;
        line-height: 28px;
      }
      .anticon {
        line-height: 28px;
        font-size: 20px;
        vertical-align: bottom;
      }
      img {
        width: 18px;
        height: 18px;
        vertical-align: initial;
      }
      .icon-folder {
        line-height: 1;
        font-size: 22px;
        vertical-align: bottom;
      }
    }
    .toolsbar-item-bot {
      height: 24px;
      font-size: 12px;
      color: #a1a9be;
    }
    .anticon-folder-open {
      font-size: 22px;
      color: #a1a9be;
      vertical-align: bottom;
    }
  }
  .toolsbar-item-active {
    background: $toolsbarActive;
    .toolsbar-item-top {
      color: #fdfdfd;
      .anticon-folder-open {
        color: #fdfdfd;
      }
    }
    .toolsbar-item-bot {
      color: #fdfdfd;
    }
  }
  .flex-auto {
    flex: auto;
  }

  .check-tool {
    margin-left: 10px;
    line-height: 60px;
    .ant-checkbox-wrapper {
      color: #dddddd;
      user-select: none;
    }
  }
}
.ant-popover {
  z-index: 16905 !important;
  max-width: 99%;
}
.ant-popover-arrow {
  border-top-color: #212742 !important;
  border-left-color: #212742 !important;
}
.ant-popover-inner {
  // background: #212742 !important;
  background: #212742ed !important;
}
.ant-popover-inner-content {
  padding: 5px 16px;
  text-align: center;
}
.ant-popover-inner-content {
  table {
    width: 80px;
    height: 80px;
    background: #fff;
    border-spacing: 0;
    border-collapse: collapse;
  }
  tr {
    width: 60px;
  }
  td {
    width: 20px;
    height: 20px;
    background-color: #fff;
    cursor: pointer;
    border: 1px solid #cbcbcb;
    &.hasHover {
      background-color: #3c5d80;
    }
  }

  .WcWwList {
    width: 240px;
    padding: 5px 10px;
    overflow: hidden;
    transform-origin: center center;
    background-color: #151a1f;
    border: 1px solid #3c5d80;
    border-radius: 4px;
    user-select: none;
    .set-keyboard {
      height: 30px;
      font-size: 16px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      color: #fff;
      // &:hover {
      //   color: #3c5d80;
      // }
    }

    .keyboard-item {
      color: #ddd;
      width: 100%;
      border-top: 1px solid #3c5d80;
      display: flex;
      height: 24px;

      &.list {
        &:hover {
          background-color: #3c5d80;
        }
      }

      > div {
        font-size: 14px;
        flood-color: left;
        text-align: center;
        line-height: 24px;
      }

      .name {
        width: 100px;
      }

      .hotkey {
        width: 100px;
      }
    }
  }
}
</style>
