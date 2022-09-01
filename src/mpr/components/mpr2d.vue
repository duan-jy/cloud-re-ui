/* eslint-disable no-unused-vars */
<style scoped lang="scss">
@import "./loading.scss";
.mpr-content {
  width: 100%;
  height: 100%;
  padding: 2px;
  background: #151a1f;
  > div {
    width: 100%;
    height: 100%;
  }
}
.mpr-row {
  display: flex;
  flex-direction: row;
  .mpr-top,
  .mpr-left,
  .mpr-front {
    padding: 5px;
    position: relative;
  }
  &.vertical {
    .mpr-top {
      width: 100%;
      height: 33%;
    }
    .mpr-other {
      width: 100%;
      height: 66%;
      > div {
        width: 100%;
        height: 50%;
      }
    }
  }
  &.horizontal {
    .mpr-top {
      width: 33%;
      height: 100%;
    }
    .mpr-other {
      width: 67%;
      height: 100%;
      > div {
        width: 50%;
        height: 100%;
        float: left;
      }
    }
  }
  .mpr-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: 20;
  }
}
.mpr-loading {
  position: relative;
}
.wwwc {
  width: 90%;
  height: 20px;
  line-height: 20px;
  color: #fff;
  position: absolute;
  left: 20px;
  bottom: 10px;
  z-index: 20;
}
</style>
<template>
  <div class="mpr-content">
    <div v-if="loading" class="mpr-loading">
      <slot name="loading">
        <div class="loader">
          <ul class="hexagon-container">
            <li class="hexagon hex_1" />
            <li class="hexagon hex_2" />
            <li class="hexagon hex_3" />
            <li class="hexagon hex_4" />
            <li class="hexagon hex_5" />
            <li class="hexagon hex_6" />
            <li class="hexagon hex_7" />
          </ul>
          <div class="load-text">LOADING...</div>
        </div>
      </slot>
    </div>
    <div v-if="volumes && volumes.length" :class="['mpr-row', screenOrigin]">
      <!-- <div v-for="(view, key) in viewDataArray" :key="key" class="mpr-col">

      </div> -->
      <div class="mpr-top">
        <view-2d-mpr
          :volumes="volumes"
          :slice-intersection="sliceIntersection"
          :views="viewDataArray"
          :on-created="saveComponentRefGenerator('top')"
          :index="'top'"
          @rotate="onRotate"
          @thickness="onThickness"
        />
        <div class="mpr-dot" :style="{ background: top.color }" />
        <div class="wwwc">
          WW:{{ top.window.width }} WC:{{ top.window.center }}
        </div>
      </div>
      <div class="mpr-other">
        <div class="mpr-left">
          <view-2d-mpr
            :volumes="volumes"
            :slice-intersection="sliceIntersection"
            :views="viewDataArray"
            :on-created="saveComponentRefGenerator('left')"
            :index="'left'"
            @rotate="onRotate"
            @thickness="onThickness"
          />
          <div class="mpr-dot" :style="{ background: left.color }" />
          <div class="wwwc">
            WW:{{ left.window.width }} WC:{{ left.window.center }}
          </div>
        </div>
        <div class="mpr-front">
          <view-2d-mpr
            :volumes="volumes"
            :slice-intersection="sliceIntersection"
            :views="viewDataArray"
            :on-created="saveComponentRefGenerator('front')"
            :index="'front'"
            @rotate="onRotate"
            @thickness="onThickness"
          />
          <div class="mpr-dot" :style="{ background: front.color }" />
          <div class="wwwc">
            WW:{{ front.window.width }} WC:{{ front.window.center }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vtkVolume from "vtk.js/Sources/Rendering/Core/Volume";
import vtkVolumeMapper from "vtk.js/Sources/Rendering/Core/VolumeMapper";

import vtkMatrixBuilder from "vtk.js/Sources/Common/Core/MatrixBuilder";
import vtkCoordinate from "vtk.js/Sources/Rendering/Core/Coordinate";

// import vtkImageDataHand from 'vtk.js/Sources/Common/DataModel/ImageData'

import vtkInteractorStyleMPRCrosshairs from "../libs/vtk/vtkInteractorStyleMPRCrosshairs";
import vtkInteractorStyleMPRWindowLevel from "../libs/vtk/vtkInteractorStyleMPRWindowLevel";
import getPlaneIntersection from "../libs/vtk/getPlaneIntersection";
import { getVOI } from "../libs/vtk/volumeData";

import View2dMPR from "./2DMPRView";
import createVtkVolume from "../libs/vtk/createVtkVolume";

export default {
  components: {
    "view-2d-mpr": View2dMPR,
  },
  props: {
    imageIds: {
      type: Array,
      default: () => {
        return [];
      },
    },
    activeTool: {
      type: String,
      default: "SELECT",
    },
    syncWindowLevels: {
      // sync Window Levels
      type: Boolean,
      default: false,
    },
    activePos: {
      // 点击的pos位置
      type: Array,
      default: () => {
        return [];
      },
    },
    screenOrigin: {
      type: String,
      default: "horizontal",
    },
  },
  data() {
    return {
      volumes: [],
      components: [],
      focusedWidgetId: null,
      loading: true,
      sliceIntersection: [0, 0, 0],
      isInit: true,
      top: {
        color: "#F8B42C",
        slicePlaneNormal: [0, 0, 1],
        sliceViewUp: [0, -1, 0],
        slicePlaneXRotation: 0,
        slicePlaneYRotation: 0,
        viewRotation: 180,
        sliceThickness: 0.1,
        blendMode: "none",
        window: {
          width: 0,
          center: 0,
        },
      },
      left: {
        color: "#A62CF8",
        slicePlaneNormal: [1, 0, 0],
        sliceViewUp: [0, 0, -1],
        slicePlaneXRotation: 0,
        slicePlaneYRotation: 0,
        viewRotation: -180,
        sliceThickness: 0.1,
        blendMode: "none",
        window: {
          width: 0,
          center: 0,
        },
      },
      front: {
        color: "#2C92F8",
        slicePlaneNormal: [0, -1, 0],
        sliceViewUp: [0, 0, -1],
        slicePlaneXRotation: 0,
        slicePlaneYRotation: 0,
        viewRotation: -180,
        sliceThickness: 0.1,
        blendMode: "none",
        window: {
          width: 0,
          center: 0,
        },
      },
      vtkImageData: null, // 图像数据
      // childMountedCount: 0
    };
  },
  computed: {
    viewDataArray() {
      return { top: this.top, left: this.left, front: this.front };
    },
  },
  watch: {
    window: {
      handler(newWindow) {
        this.updateColorWindow(newWindow.value);
      },
      deep: true,
    },
    level: {
      handler(newLevel) {
        this.updateColorLevel(newLevel.value);
      },
      deep: true,
    },
    imageIds(newVal) {
      if (newVal && newVal.length) {
        this.loadData(newVal);
      }
    },
    activeTool(newVal) {
      if (newVal) {
        this.selectTool(newVal);
      }
    },
    activePos(newVal) {
      if (newVal && newVal.length) {
        // const imgageInstance = vtkImageDataHand.newInstance()
        // imgageInstance.setInputData(this.vtkImageData)
        // vtkImageDataHand.
        // this.onCrosshairPointSelected({ worldPos: [newVal[1], newVal[0], newVal[2]], index: 'top' })
        // this.onScrolled(newVal[2])
      }
    },
  },
  mounted() {
    this.resizeFunction = () => {
      window.setTimeout(() => {
        this.onScrolled();
      }, 10);
    };
    window.addEventListener("resize", this.resizeFunction);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeFunction);
  },
  methods: {
    selectTool(tool) {
      switch (tool) {
        case "LEVEL":
          Object.entries(this.components).forEach(this.setLevelTool);
          break;
        case "SELECT":
          Object.entries(this.components).forEach(this.setCrosshairTool);
          break;
      }
    },
    setLevelTool([viewportIndex, component]) {
      const istyle = vtkInteractorStyleMPRWindowLevel.newInstance();
      istyle.setOnScroll(this.onScrolled);
      istyle.setOnLevelsChanged((levels) => {
        this.updateLevels({ ...levels, index: viewportIndex });
      });
      setInteractor(component, istyle, this.isInit);
    },
    setCrosshairTool([viewportIndex, component]) {
      const istyle = vtkInteractorStyleMPRCrosshairs.newInstance();
      istyle.setOnScroll(this.onScrolled);
      istyle.setOnClickCallback(({ worldPos }) =>
        this.onCrosshairPointSelected({ worldPos, index: viewportIndex })
      );
      setInteractor(component, istyle, this.isInit);
    },
    onRotate(index, axis, angle) {
      // Match the source axis to the associated plane
      switch (index) {
        case "top":
          if (axis === "x") this.front.slicePlaneYRotation = angle;
          else if (axis === "y") this.left.slicePlaneYRotation = angle;
          break;
        case "left":
          if (axis === "x") this.top.slicePlaneXRotation = angle;
          else if (axis === "y") this.front.slicePlaneXRotation = angle;
          break;
        case "front":
          if (axis === "x") this.top.slicePlaneYRotation = angle;
          else if (axis === "y") this.left.slicePlaneXRotation = angle;
          break;
      }
    },
    onThickness(index, axis, thickness) {
      const shouldBeMIP = thickness > 1;
      let view;
      switch (index) {
        case "top":
          if (axis === "x") view = this.front;
          else if (axis === "y") view = this.left;
          break;
        case "left":
          if (axis === "x") view = this.top;
          else if (axis === "y") view = this.front;
          break;
        case "front":
          if (axis === "x") view = this.top;
          else if (axis === "y") view = this.left;
          break;
      }
      view.sliceThickness = thickness;
      // TODO: consts instead of magic strings
      if (shouldBeMIP && view.blendMode === "none") view.blendMode = "MIP";
      // else if(!shouldBeMIP) {
      //   view.blendMode = "none"
      // }
    },
    onScrolled() {
      const planes = [];
      Object.entries(this.components).forEach(([viewportIndex, component]) => {
        const camera = component.genericRenderWindow
          .getRenderer()
          .getActiveCamera();
        const position = camera.getFocalPoint();
        planes.push({
          position,
          normal: camera.getDirectionOfProjection(),
          // this[viewportIndex].slicePlaneNormal
        });
      });
      // console.log('planes', planes)
      const newPoint = getPlaneIntersection(...planes);
      // console.log('newPoint', newPoint)
      if (!Number.isNaN(newPoint)) {
        this.sliceIntersection = newPoint;
      }
    },
    onCrosshairPointSelected({ index, worldPos }) {
      Object.entries(this.components).forEach(([viewportIndex, component]) => {
        if (viewportIndex !== index) {
          const renderWindow = component.genericRenderWindow.getRenderWindow();
          const istyle = renderWindow.getInteractor().getInteractorStyle();
          const sliceNormal = istyle.getSliceNormal();
          const transform = vtkMatrixBuilder
            .buildFromDegree()
            .identity()
            .rotateFromDirections(sliceNormal, [1, 0, 0]);
          const mutatedWorldPos = worldPos.slice();
          transform.apply(mutatedWorldPos);
          const slice = mutatedWorldPos[0];
          istyle.setSlice(slice);
          renderWindow.render();
        }

        const renderer = component.genericRenderWindow.getRenderer();
        const wPos = vtkCoordinate.newInstance();
        wPos.setCoordinateSystemToWorld();
        wPos.setValue(worldPos);

        // eslint-disable-next-line no-unused-vars
        const displayPosition = wPos.getComputedDisplayValue(renderer);
      });
    },

    updateLevels({ windowCenter, windowWidth, index }) {
      this[index].window.center = windowCenter;
      this[index].window.width = windowWidth;

      if (this.syncWindowLevels) {
        Object.entries(this.components)
          .filter(([key]) => key !== index)
          .forEach(([key, component]) => {
            this[key].window.center = windowCenter;
            this[key].window.width = windowWidth;
            component.genericRenderWindow
              .getInteractor()
              .getInteractorStyle()
              .setWindowLevel(windowWidth, windowCenter);
            component.genericRenderWindow.getRenderWindow().render();
          });
      }
    },

    saveComponentRefGenerator(viewportIndex) {
      return (component) => {
        this.components[viewportIndex] = component;

        const { windowWidth, windowLevel } = getVOI(component.volumes[0]);

        // get initial window leveling
        this[viewportIndex].windowWidth = windowWidth;
        this[viewportIndex].windowLevel = windowLevel;

        const renderWindow = component.genericRenderWindow.getRenderWindow();

        // eslint-disable-next-line no-unused-vars
        const renderer = component.genericRenderWindow.getRenderer();

        renderWindow.getInteractor().getInteractorStyle().setVolumeMapper(null);
        // default to the level tool
        this.setLevelTool([viewportIndex, component]);

        renderWindow.render();
      };
    },

    rerenderAllViewports() {
      // Update all render windows, since the automatic re-render might not
      // happen if the viewport is not currently using the painting widget
      Object.values(this.components).forEach((component) => {
        component.genericRenderWindow.getRenderWindow().render();
      });
    },
    async loadData(imageIds) {
      this.isInit = true;
      try {
        this.loading = true;
        const {
          vtkImageData,
          lower,
          upper,
          windowCenter,
          windowWidth,
          centerIpp,
        } = await createVtkVolume(imageIds);
        this.vtkImageData = vtkImageData;
        const volumeActor = vtkVolume.newInstance();
        const volumeMapper = vtkVolumeMapper.newInstance();
        volumeMapper.setSampleDistance(1);
        volumeActor.setMapper(volumeMapper);
        volumeMapper.setInputData(vtkImageData);

        const rgbTransferFunction = volumeActor
          .getProperty()
          .getRGBTransferFunction(0);

        rgbTransferFunction.setMappingRange(lower, upper);

        Object.values(this.viewDataArray).forEach((view) => {
          view.window.center = windowCenter;
          view.window.width = windowWidth;
        });

        this.sliceIntersection = centerIpp
          .toString()
          .split(",")
          .map((item) => Number(item));

        this.volumes = [volumeActor];
        this.$nextTick(() => {
          // 设置工具及将加载去掉
          this.selectTool(this.activeTool);
          this.loading = false;
          this.isInit = false;
        });
      } catch (error) {
        this.loading = false;
        this.isInit = false;
        this.$emit("renderError", error);
      }
    },
  },
};

function setInteractor(component, istyle, init) {
  const renderWindow = component.genericRenderWindow.getRenderWindow();
  // We are assuming the old style is always extended from the MPRSlice style
  const oldStyle = renderWindow.getInteractor().getInteractorStyle();

  renderWindow.getInteractor().setInteractorStyle(istyle);
  // NOTE: react-vtk-viewport's code put this here, so we're copying it. Seems redundant?
  istyle.setInteractor(renderWindow.getInteractor());

  // Make sure to set the style to the interactor itself, because reasons...?!
  const inter = renderWindow.getInteractor();
  inter.setInteractorStyle(istyle);

  // Copy previous interactors styles into the new one.
  if (istyle.setSliceNormal && oldStyle.getSliceNormal()) {
    // console.log("setting slicenormal from old normal");
    istyle.setSliceNormal(oldStyle.getSliceNormal(), oldStyle.getViewUp());
  }
  if (istyle.setSlabThickness && oldStyle.getSlabThickness()) {
    istyle.setSlabThickness(oldStyle.getSlabThickness());
  }
  istyle.setVolumeMapper(component.volumes[0]);
  if (init && oldStyle.setWindowLevel) {
    oldStyle.setWindowLevel(
      component.voi.windowWidth,
      component.voi.windowCenter
    );
    renderWindow.render();
  }
}
</script>
