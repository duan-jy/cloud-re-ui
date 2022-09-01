/* eslint-disable no-unused-vars */
// TODO: 发布组件替换
import { cornerstone, loadImage } from "@/utils/index";
import { vec3, mat4 } from "gl-matrix";

import vtkDataArray from "vtk.js/Sources/Common/Core/DataArray";
import vtkImageData from "vtk.js/Sources/Common/DataModel/ImageData";
import vtkImageReslice from "vtk.js/Sources/Imaging/Core/ImageReslice";
//
import insertSlice from "../data/insertSlice.js";
import getSliceIndex from "../data/getSliceIndex.js";
import determineOrientation from "../data/determineOrientation.js";
import computeZAxis from "../data/computeZAxis.js";
import crossVectors from "../math/crossVectors.js";

async function _getSeriesMetaDataMap(imageIds) {
  const metaDataMap = new Map();
  const imageMap = new Map();
  for (const imageId of imageIds) {
    const image = await loadImage(imageId);
    const metaData = await cornerstone.metaData.get(
      "imagePlaneModule",
      imageId
    );
    metaDataMap.set(imageId, metaData);
    imageMap.set(imageId, image);
  }

  return {
    imageMap,
    metaDataMap,
  };
}

function _getMetaData0(imageIds) {
  const imageId0 = imageIds[0];
  let { windowWidth, windowCenter } = cornerstone.metaData.get(
    "voiLutModule",
    imageId0
  );
  if (Array.isArray(windowWidth)) {
    windowWidth = windowWidth[0];
  }

  if (Array.isArray(windowCenter)) {
    windowCenter = windowCenter[0];
  }

  const { modality } = cornerstone.metaData.get(
    "generalSeriesModule",
    imageId0
  );
  return {
    windowWidth,
    windowCenter,
    modality,
  };
}

function _calculateDimensions(metaDataMap) {
  const imagePlaneModule = metaDataMap.values().next().value;
  const { rowCosines, columnCosines } = imagePlaneModule;
  const crossProduct = crossVectors(columnCosines, rowCosines);
  const orientation = determineOrientation(crossProduct);
  const zAxis = computeZAxis(orientation, metaDataMap);

  const xSpacing = imagePlaneModule.columnPixelSpacing;
  const ySpacing = imagePlaneModule.rowPixelSpacing;
  const zSpacing = zAxis.spacing;
  const xVoxels = imagePlaneModule.columns;
  const yVoxels = imagePlaneModule.rows;
  const zVoxels = metaDataMap.size;

  // 3 === RGB?
  const multiComponent = imagePlaneModule.numberOfComponents > 1;

  return {
    dimensions: [xVoxels, yVoxels, zVoxels],
    orientation,
    multiComponent,
    spacing: [xSpacing, ySpacing, zSpacing],
    zAxis,
  };
}

/**
 * 获取窗口级别并将它们转换为一个范围（下/上）
 * 用于 VTK RGBTransferFunction
 *
 * @private
 * @param {number} [width] - window width
 * @param {number} [center] - window center
 * @param {string} [Modality] - 'PT', 'CT', etc.
 * @returns { lower, upper } - range
 */
function _getRangeFromWindowLevels(width, center, Modality = undefined) {
  // For PET just set the range to 0-5 SUV
  if (Modality === "PT") {
    return { lower: 0, upper: 5 };
  }

  const levelsAreNotNumbers = isNaN(center) || isNaN(width);

  if (levelsAreNotNumbers) {
    return { lower: 0, upper: 512 };
  }

  return {
    lower: center - width / 2.0,
    upper: center + width / 2.0,
  };
}

async function _getTypedPixelArray(imageId, dimensions) {
  const imagePixelModule = await cornerstone.metaData.get(
    "imagePixelModule",
    imageId
  );
  const { bitsAllocated, pixelRepresentation } = imagePixelModule;
  const signed = pixelRepresentation === 1;

  if (bitsAllocated === 8) {
    if (signed) {
      throw new Error(
        "8 Bit signed images are not yet supported by this plugin."
      );
    } else {
      throw new Error(
        "8 Bit unsigned images are not yet supported by this plugin."
      );
    }
  }

  let typedPixelArray;
  if (bitsAllocated === 16) {
    // x, y, z
    typedPixelArray = signed
      ? new Int16Array(dimensions[0] * dimensions[1] * dimensions[2])
      : new Uint16Array(dimensions[0] * dimensions[1] * dimensions[2]);
  } else {
    throw new Error(`Unssuported bit: ${bitsAllocated}`);
  }

  return typedPixelArray;
}

async function _createVtkVolume(imageIds, imageMap, metaDataMap, options = {}) {
  const vtkVolume = vtkImageData.newInstance();
  const typedPixelArray = await _getTypedPixelArray(
    imageIds[0],
    options.dimensions
  );
  const scalarArray = vtkDataArray.newInstance({
    name: "Pixels",
    numberOfComponents: 1,
    values: typedPixelArray,
  });

  // TODO: Is this a better place to set this?
  // vtkVolume.setOrigin(options.zAxis.origin)
  vtkVolume.setOrigin([0, 0, 0]); // zMax * zPixelSpacing
  vtkVolume.setDimensions(options.dimensions);
  vtkVolume.setSpacing(options.spacing);
  vtkVolume.getPointData().setScalars(scalarArray);
  // Add our slices
  for (const imageId of imageIds) {
    const image = imageMap.get(imageId);
    const { imagePositionPatient } = metaDataMap.get(imageId);
    const sliceIndex = getSliceIndex(options.zAxis, imagePositionPatient);
    // Prevent metadata from being tampered with
    const pixelData = image
      .getPixelData()
      .map((item) => item)
      .reverse();
    insertSlice(vtkVolume, pixelData, sliceIndex);
  }
  return vtkVolume;
}
/**
 * Calculates the center IPP for the volume. Useful for displaying
 * "best" slice on first render.
 *
 * @param {*} vtkImageData
 * @returns {Vec3} - Float32Array contain the volume's center IPP
 */
function _getVolumeCenterIpp(vtkImageData) {
  const [x0, y0, z0] = vtkImageData.getOrigin();
  const [xSpacing, ySpacing, zSpacing] = vtkImageData.getSpacing();
  const [xMin, xMax, yMin, yMax, zMin, zMax] = vtkImageData.getExtent();

  const centerOfVolume = vec3.fromValues(
    x0 + xSpacing * 0.5 * (xMin + xMax),
    y0 + ySpacing * 0.5 * (yMin + yMax),
    z0 + zSpacing * 0.5 * (zMin + zMax)
  );

  return centerOfVolume;
}

/**
 * Creates a 4x4 matrix that vtk can use as a "rotation matrix". The values
 * correspond to:
 *
 * ux, uy, uz, 0
 * vx, vy, vz, 0
 * wx, wy, wz, 0
 * px, py, pz, 1
 *
 * ux, uy, uz, vx, vy, vz - "ImageOrientationPatient"
 * w - cross_product(u,v)
 * px, py, pz - "ImagePositionPatient"
 *
 * ImagePositionPatient: [60.3642578125, 170.3642578125, -32]
 * ImageOrientationPatient: [-1, 0, 0, 0, -1, 0]
 * RowCosines: [-1, 0, 0]
 * ColumnCosines: [0, -1, 0]
 *
 * Reference: https://public.kitware.com/pipermail/vtkusers/2012-November/077297.html
 * Reference: http://nipy.org/nibabel/dicom/dicom_orientation.html
 *
 * @param {Float32Array} rowCosines
 * @param {Float32Array} colCosines
 * @param {Float32Array} ippArray
 * @returns {Mat4} - 4x4 Rotation Matrix
 */
function _calculateRotationAxes(rowCosines, colCosines, ippArray) {
  const wCrossProd = vec3.create();
  vec3.cross(wCrossProd, rowCosines, colCosines);

  const axes = mat4.fromValues(
    rowCosines[0],
    rowCosines[1],
    rowCosines[2],
    0,
    colCosines[0],
    colCosines[1],
    colCosines[2],
    0,
    wCrossProd[0],
    wCrossProd[1],
    wCrossProd[2],
    0,
    ippArray[0],
    ippArray[1],
    ippArray[2],
    1
  );

  return axes;
}
/** 获取图像的windowCenter
 *
 * @param {*} vtkImageData
 * @param {*} centerIpp
 * @returns
 */
function _getImageWwWc(vtkImageData, centerIpp) {
  const coronalIop = new Float32Array([1, 0, 0, 0, 0, -1]);
  const iop = coronalIop.join();
  const iopArray = iop.split(",").map(parseFloat);
  const rowCosinesVec3 = vec3.fromValues(iopArray[0], iopArray[1], iopArray[2]);
  const colCosinesVec3 = vec3.fromValues(iopArray[3], iopArray[4], iopArray[5]);
  const zedCosinesVec3 = vec3.create();
  vec3.cross(zedCosinesVec3, rowCosinesVec3, colCosinesVec3);

  const [x0, y0, z0] = vtkImageData.getOrigin();
  const [xSpacing, ySpacing, zSpacing] = vtkImageData.getSpacing();
  const [xMin, xMax, yMin, yMax, zMin, zMax] = vtkImageData.getExtent();
  const zStart = z0 + zSpacing * (zMax - zMin);

  const position = vec3.fromValues(
    zedCosinesVec3[0] * -1 * (centerIpp[0] - x0) + x0,
    zedCosinesVec3[1] * (centerIpp[1] - y0) + y0,
    zedCosinesVec3[2] * (centerIpp[2] - zStart) + zStart
  );

  const axes = _calculateRotationAxes(rowCosinesVec3, colCosinesVec3, position);

  const imageReslice = vtkImageReslice.newInstance();
  imageReslice.setInputData(vtkImageData);
  imageReslice.setOutputDimensionality(2);
  imageReslice.setResliceAxes(axes);

  const outputSlice = imageReslice.getOutputData();
  const scalars = outputSlice.getPointData().getScalars();
  const dataRange = scalars.getRange(0);
  return {
    windowCenter: Math.round((dataRange[0] + dataRange[1]) / 2),
    windowWidth: dataRange[1] - dataRange[0],
  };
}

export default async function (imageIds) {
  const { imageMap, metaDataMap } = await _getSeriesMetaDataMap(imageIds);
  const { windowCenter, windowWidth, modality } = _getMetaData0(imageIds);
  const { lower, upper } = _getRangeFromWindowLevels(
    windowWidth,
    windowCenter,
    modality
  );
  const { dimensions, orientation, multiComponent, spacing, zAxis } =
    _calculateDimensions(metaDataMap);
  if (multiComponent) {
    throw new Error("can not mpr volume");
  }
  const imageData = await _createVtkVolume(imageIds, imageMap, metaDataMap, {
    dimensions,
    spacing,
    zAxis,
  });
  const centerIpp = _getVolumeCenterIpp(imageData);
  const wwwc = _getImageWwWc(imageData, centerIpp);

  const imageDataObject = {
    imageIds,
    orientation,
    vtkImageData: imageData,
    centerIpp,
    zAxis,
    lower,
    upper,
    spacing,
    windowCenter: wwwc.windowCenter,
    windowWidth: wwwc.windowWidth,
  };

  return imageDataObject;
}
