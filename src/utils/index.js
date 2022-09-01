/**
 * 初始化cornerstone
 */
import Hammer from "hammerjs";
import dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
// import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader/dist/dynamic-import/cornerstoneWADOImageLoader.min.js";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
// 添加多线程
const convolveTaskPath = `/customWebWorkerTask/convolveTask.js`;
const sleepTaskPath = `/customWebWorkerTask/sleepTask.js`;
const webWorkConfig = {
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
  webWorkerTaskPaths: [convolveTaskPath, sleepTaskPath],
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false,
      usePDFJS: false,
    },
    sleepTask: {
      sleepTime: 3000,
    },
  },
};
cornerstoneWADOImageLoader.webWorkerManager.initialize(webWorkConfig);
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.configure({
  beforeSend: function (xhr, imageId) {
    // xhr.setRequestHeader('AuthorizationImage', getToken())
  },
});

// 加载并缓存图像
function loadCacheImage(imageId) {
  return new Promise((resolve, reject) => {
    cornerstone.loadAndCacheImage(imageId).then(
      (image) => {
        const modality = image.data.string("x00080060");
        if (modality === "RF") {
          const maxPixelValue = image.maxPixelValue;
          const minPixelValue =
            image.minPixelValue || maxPixelValue - maxPixelValue / 20;
          image.windowWidth = maxPixelValue - minPixelValue;
          image.windowCenter = minPixelValue + image.windowWidth / 2;
        }
        resolve(image);
      },
      (err) => {
        console.log(err);
        reject(err);
      }
    );
  });
}
//

// 加载图像
function loadImage(imageId) {
  return new Promise((resovle, reject) => {
    cornerstone.loadImage(imageId).then(
      (image) => {
        resovle(image);
      },
      (err) => {
        reject(err);
      }
    );
  });
}

export { cornerstone, cornerstoneTools, loadCacheImage, loadImage };
