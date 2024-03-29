/* eslint-disable vue/no-unused-components */
<template>
  <div class="viewer2d">
    <div ref="container" class="container2d" />
    <template
      v-if="screenCoordSliceIntersection && screenCoordSliceIntersection.length"
    >
      <MPRInteractor
        :width="width"
        :height="height"
        :x-axis="xAxis"
        :y-axis="yAxis"
        :view-rotation="viewRotation"
        :point="screenCoordSliceIntersection"
        @rotate="onRotate"
        @thickness="onThickness"
      />
    </template>
  </div>
</template>

<script>
/**
 * This view is a simple wrapper for the VTK canvas, returning the VTK canvas component information through a callback during the `mounted` event.
 */

import vtkGenericRenderWindow from 'vtk.js/Sources/Rendering/Misc/GenericRenderWindow'
import vtkCoordinate from 'vtk.js/Sources/Rendering/Core/Coordinate'
import { quat, vec3, mat4 } from 'gl-matrix'

// Use modified MPRSlice interactor
import vtkInteractorStyleMPRSlice from '../libs/vtk/vtkInteractorStyleMPRSlice'

import MPRInteractor from './MPRInteractor.vue'

import { BLEND_MIP, BLEND_MINIP, BLEND_AVG, BLEND_NONE } from '../libs/consts'
import { createSub } from '../libs/createSub'
import { degrees2radians } from '../libs/math/angles'

export default {
  name: 'View2dMpr',
  components: { MPRInteractor },
  props: {
    volumes: { type: Array, required: true },
    views: { type: Object, required: true },

    parallel: { type: Boolean, default: false },

    // Front, Side, Top, etc, for which view data to use
    index: {
      type: String,
      default: 'top'
    },

    sliceIntersection: {
      type: Array,
      default: () => {
        return [0, 0, 0]
      }
    },
    onCreated: {
      type: Function,
      default: () => {
        return new Function()
      }
    },
    onDestroyed: {
      type: Function,
      default: () => {
        return new Function()
      }
    }
  },
  data() {
    return {
      width: 0,
      height: 0,
      renderer: null,
      subs: {
        interactor: createSub(),
        data: createSub()
      }
    }
  },
  computed: {
    // Cribbed from the index and views
    slicePlaneNormal() {
      return this.views[this.index].slicePlaneNormal
    },
    slicePlaneXRotation() {
      return this.views[this.index].slicePlaneXRotation
    },
    slicePlaneYRotation() {
      return this.views[this.index].slicePlaneYRotation
    },
    sliceViewUp() {
      return this.views[this.index].sliceViewUp
    },
    viewRotation() {
      return this.views[this.index].viewRotation
    },
    sliceThickness() {
      return this.views[this.index].sliceThickness
    },
    window() {
      return this.views[this.index].window
    },
    blendMode() {
      return this.views[this.index].blendMode
    },
    viewColor() {
      return this.views[this.index].color
    },
    isActive() {
      return this.views[this.index].active
    },

    xAxis() {
      switch (this.index) {
        case 'top':
        default:
          return {
            color: this.views.front.color,
            rotation: this.views.front.slicePlaneYRotation,
            thickness: this.views.front.sliceThickness
          }
        case 'left':
          return {
            color: this.views.top.color,
            rotation: this.views.top.slicePlaneXRotation,
            thickness: this.views.top.sliceThickness
          }
        case 'front':
          return {
            color: this.views.top.color,
            rotation: this.views.top.slicePlaneYRotation,
            thickness: this.views.top.sliceThickness
          }
      }
    },
    yAxis() {
      switch (this.index) {
        case 'top':
        default:
          return {
            color: this.views.left.color,
            rotation: this.views.left.slicePlaneYRotation,
            thickness: this.views.left.sliceThickness
          }
        case 'left':
          return {
            color: this.views.front.color,
            rotation: this.views.front.slicePlaneXRotation,
            thickness: this.views.front.sliceThickness
          }
        case 'front':
          return {
            color: this.views.left.color,
            rotation: this.views.left.slicePlaneXRotation,
            thickness: this.views.left.sliceThickness
          }
      }
    },

    screenCoordSliceIntersection() {
      const point3d = this.sliceIntersection
      if (this.renderer) {
        const wPos = vtkCoordinate.newInstance()
        wPos.setCoordinateSystemToWorld()
        wPos.setValue(point3d)
        const canvasCoords = wPos.getComputedDisplayValue(this.renderer)
        return canvasCoords
      } else {
        return []
      }
    },
    voi() {
      return {
        windowWidth: this.window.width,
        windowCenter: this.window.center
      }
    }
  },
  watch: {
    volumes(newVolumes) {
      this.updateVolumesForRendering(newVolumes)
    },

    // Calculate the new normals after applying rotations to the untouched originals
    slicePlaneNormal() {
      this.updateSlicePlane()
    },
    slicePlaneXRotation() {
      this.updateSlicePlane()
    },
    slicePlaneYRotation() {
      this.updateSlicePlane()
    },
    sliceViewUp() {
      this.updateSlicePlane()
    },
    viewRotation() {
      this.updateSlicePlane()
    },

    sliceThickness(thickness) {
      const istyle = this.renderWindow.getInteractor().getInteractorStyle()
      // set thickness if the current interactor has it (it should, but just in case)
      istyle.setSlabThickness && istyle.setSlabThickness(thickness)
      this.updateBlendMode(thickness)
    },

    blendMode() {
      this.updateBlendMode(this.sliceThickness)
    },
    parallel(p) {
      this.renderer.getActiveCamera().setParallelProjection(p)
    }
  },
  created() {
    this.genericRenderWindow = null
    this.cachedSlicePlane = []
    this.cachedSliceViewUp = []
  },
  mounted() {
    window.addEventListener('resize', this.onResize)

    // cache the view vectors so we can apply the rotations without modifying the original value
    this.cachedSlicePlane = [...this.slicePlaneNormal]
    this.cachedSliceViewUp = [...this.sliceViewUp]

    this.genericRenderWindow = vtkGenericRenderWindow.newInstance({
      background: [0, 0, 0]
    })

    this.genericRenderWindow.setContainer(this.$refs.container)

    const widgets = []

    this.renderWindow = this.genericRenderWindow.getRenderWindow()
    this.renderer = this.genericRenderWindow.getRenderer()

    if (this.parallel) {
      this.renderer.getActiveCamera().setParallelProjection(true)
    }

    // update view node tree so that vtkOpenGLHardwareSelector can access the vtkOpenGLRenderer instance.
    const oglrw = this.genericRenderWindow.getOpenGLRenderWindow()
    oglrw.buildPass(true)

    const istyle = vtkInteractorStyleMPRSlice.newInstance()
    istyle.setOnScroll(this.onStackScroll)
    const inter = this.renderWindow.getInteractor()
    inter.setInteractorStyle(istyle)

    /*
    // TODO: Use for maintaining clipping range for MIP
    const interactor = this.renderWindow.getInteractor();
    //const clippingRange = renderer.getActiveCamera().getClippingRange();

    interactor.onAnimation(() => {
      renderer.getActiveCamera().setClippingRange(...r);
    });*/

    //  TODO: assumes the volume is always set for this mounted state...Throw an error?
    const istyleVolumeMapper = this.volumes[0].getMapper()

    istyle.setVolumeMapper(istyleVolumeMapper)

    // start with the volume center slice
    const range = istyle.getSliceRange()
    // console.log('view mounted: setting the initial range', range)
    istyle.setSlice((range[0] + range[1]) / 2)

    // add the current volumes to the vtk renderer
    this.updateVolumesForRendering(this.volumes)

    this.updateSlicePlane()

    // force the initial draw to set the canvas to the parent bounds.
    this.onResize()

    if (this.onCreated) {
      /**
       * Note: The contents of this Object are
       * considered part of the API contract
       * we make with consumers of this component.
       */
      this.onCreated({
        genericRenderWindow: this.genericRenderWindow,
        widgetManager: this.widgetManager,
        container: this.$refs.container,
        widgets,
        volumes: [...this.volumes],
        voi: this.voi,
        _component: this
      })
    }
    // child compontent has Mounted
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)

    // Delete the render context
    this.genericRenderWindow.delete()

    delete this.genericRenderWindow

    Object.keys(this.subs).forEach(k => {
      this.subs[k].unsubscribe()
    })
    // notify if prop defined
    if (this.onDestroyed) {
      this.onDestroyed()
    }
  },

  methods: {
    // pass events to parent, including the view they came from
    onRotate(axis, angle) {
      this.$emit('rotate', this.index, axis, angle)
    },
    onThickness(axis, thickness) {
      this.$emit('thickness', this.index, axis, thickness)
    },

    onResize() {
      // TODO: debounce for performance reasons?
      this.genericRenderWindow.resize()

      const [width, height] = [
        this.$refs.container.offsetWidth,
        this.$refs.container.offsetHeight
      ]
      this.width = width
      this.height = height
    },
    updateVolumesForRendering(volumes) {
      this.renderer.removeAllVolumes()
      if (volumes && volumes.length) {
        volumes.forEach(volume => {
          if (!volume.isA('vtkVolume')) {
            console.warn('Data to <Vtk2D> is not vtkVolume data')
          } else {
            this.renderer.addVolume(volume)
          }
        })
      }
      this.renderWindow.render()
    },
    updateSlicePlane() {
      // TODO: optimize so you don't have to calculate EVERYTHING every time?

      // rotate around the vector of the cross product of the plane and viewup as the X component
      const sliceXRotVector = []
      vec3.cross(sliceXRotVector, this.sliceViewUp, this.slicePlaneNormal)
      vec3.normalize(sliceXRotVector, sliceXRotVector)

      // rotate the viewUp vector as the Y component
      const sliceYRotVector = this.sliceViewUp

      // const yQuat = quat.create();
      // quat.setAxisAngle(yQuat, input.sliceViewUp, degrees2radians(this.slicePlaneYRotation));
      // quat.normalize(yQuat, yQuat);

      // Rotate the slicePlaneNormal using the x & y rotations.
      // const planeQuat = quat.create();
      // quat.add(planeQuat, xQuat, yQuat);
      // quat.normalize(planeQuat, planeQuat);

      // vec3.transformQuat(this.cachedSlicePlane, this.slicePlaneNormal, planeQuat);

      const planeMat = mat4.create()
      mat4.rotate(
        planeMat,
        planeMat,
        degrees2radians(this.slicePlaneYRotation),
        sliceYRotVector
      )
      mat4.rotate(
        planeMat,
        planeMat,
        degrees2radians(this.slicePlaneXRotation),
        sliceXRotVector
      )
      vec3.transformMat4(
        this.cachedSlicePlane,
        this.slicePlaneNormal,
        planeMat
      )

      // Rotate the viewUp in 90 degree increments
      const viewRotQuat = quat.create()
      // Use - degrees since the axis of rotation should really be the direction of projection, which is the negative of the plane normal
      quat.setAxisAngle(
        viewRotQuat,
        this.cachedSlicePlane,
        degrees2radians(-this.viewRotation)
      )
      quat.normalize(viewRotQuat, viewRotQuat)

      // rotate the ViewUp with the x and z rotations
      const xQuat = quat.create()
      quat.setAxisAngle(
        xQuat,
        sliceXRotVector,
        degrees2radians(this.slicePlaneXRotation)
      )
      quat.normalize(xQuat, xQuat)
      const viewUpQuat = quat.create()
      quat.add(viewUpQuat, xQuat, viewRotQuat)
      vec3.transformQuat(this.cachedSliceViewUp, this.sliceViewUp, viewRotQuat)

      // update the view's slice
      const renderWindow = this.genericRenderWindow.getRenderWindow()
      const istyle = renderWindow.getInteractor().getInteractorStyle()
      if (istyle && istyle.setSliceNormal) {
        istyle.setSliceNormal(this.cachedSlicePlane, this.cachedSliceViewUp)
      }

      renderWindow.render()
    },
    onCrosshairPointSelected(data) {
      this.$emit('crosshairPointSelected', { ...data, index: this.index })
    },
    updateBlendMode(thickness) {
      if (thickness >= 1) {
        switch (this.blendMode) {
          case BLEND_MIP:
            this.volumes[0].getMapper().setBlendModeToMaximumIntensity()
            break
          case BLEND_MINIP:
            this.volumes[0].getMapper().setBlendModeToMinimumIntensity()
            break
          case BLEND_AVG:
            this.volumes[0].getMapper().setBlendModeToAverageIntensity()
            break
          case BLEND_NONE:
          default:
            this.volumes[0].getMapper().setBlendModeToComposite()
            break
        }
      } else {
        this.volumes[0].getMapper().setBlendModeToComposite()
      }
      this.renderWindow.render()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./loading.scss";
.viewer2d {
  border: 1px solid $bs_color;
  background: #000;
}
.container2d{
  padding: 4px;
}
.viewer2d,
.container2d {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 4px;
}
</style>
