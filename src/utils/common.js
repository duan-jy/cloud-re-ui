import { ToolsTypes } from "./source";
import { cornerstone, cornerstoneTools } from "./index";
import { Dialog } from "vant";
export function DialogAlert(message) {
  Dialog.alert({
    title: "出错了...",
    message,
  }).then(() => {});
}

export const ScaleOverlayConfig = {
  configuration: {
    // 自定义工具的颜色
    color: "rgb(255, 255, 255)",
    lineWidth: 1,
  },
};
export const synchronizer = new cornerstoneTools.Synchronizer(
  "cornerstonenewimage",
  cornerstoneTools.updateImageSynchronizer
);
export const scrollToIndex =
  cornerstoneTools.importInternal("util/scrollToIndex");
export const seriesSync = new cornerstoneTools.Synchronizer(
  "cornerstonetoolsstackscroll",
  cornerstoneTools.stackImagePositionSynchronizer
);

export const displayType = [
  {
    type: "diagnosis",
    name: "辅助诊断",
    src: "data:image/png;base64,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",
  },
  {
    type: "comparison",
    name: "影像对比",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABMCAYAAADQtcHiAAACBUlEQVR4Xu2cIU8EMRCF3yRIBBKJQCKQCBIsCQI8HsXP4K+QICEBg+L3oDAEAckjHIFsjs7SaXvscX0nL93t3ndvOm9mu2tYgg/JSwBHqUsxs40pLtGmmHR+TpLXAI4dMJNc4ySTCkymHKUYB5TA/CcwJP9q1X81s+cUm1zFkFwHsOYs0k9f3zcZR5KZS0HtsBszO6kE8wDg4LfsRbJ+nMA4oAVGYGYRaGbf3m005KQYKaaZYl4APNamosHx92Z2VpmVrgDsOVlpa5Cu68eNhJKbXhvCmp0q18e0nnfsfCYwaTwC48imazAkLwDsJNesnkOp1Mes/OIrMH67wy82FUpx56tQcpQmMB2D2QWQ7GB27WNUEhQUWV0rhuQhgE053zkCMngyeLHFRIqRYqSYGAEpJsaL5DmAbaXrALeuDZ5KAn+N8beVqFGlRtUP3cjgKV0H0s7nrWE1w53NBAIjMIFoInkLYF/ONwBNzle7HQJy+djE2Lnz1TYQZaVAxMjgqSQIyEUlgQ9LoaRQCoeStoHEkHVu8NQMj8ql95JAipFiCggUtB3eACSfky6c/s7MTp1iLuulF6Mdt8FbQ5qM0zOR8RtuhcJwD9MD6Q4agRGYWLBJMSuhmNifvpjRS/l48WJ+auysAuM3jLIMXgx33Wi91cwrCeq4tjlaoaRQiilpGV8p+Q7mTZ15IacqOwAAAABJRU5ErkJggg==",
  },
];
export const dataType = [
  {
    type: "lung",
    name: "肺结节",
  },
  {
    type: "rib",
    name: "肋骨",
  },
];
/** 清除工具状态
 *
 * @param {element} element
 * @param {boolean} isLabel 是否标注
 */
export function clearToolsState(element, isLabel = true, activeName) {
  const allToolTypes = isLabel
    ? [].concat(ToolsTypes)
    : ["Pan", "Wwwc"].concat(ToolsTypes);
  for (const toolType of allToolTypes) {
    const elementToolData = cornerstoneTools.getToolState(element, toolType);
    if (!elementToolData) {
      continue;
    }
    if (toolType === "FreehandRoi" && activeName === "FreehandRoi") {
      cornerstoneTools.setToolDisabled(toolType);
      cornerstoneTools.clearToolState(element, toolType);
      cornerstoneTools.setToolActive(toolType, {
        mouseButtonMask: 1,
      });
    } else {
      cornerstoneTools.clearToolState(element, toolType);
    }
    cornerstone.updateImage(element);
  }
}
/** 操作图像的viewport
 *
 * @param {Document} element
 * @param {string} type 操作的类型
 * @param {object} params 其他参数
 */
export function hanlderViewport(element, type, params) {
  if (!element) {
    return;
  }
  const viewport = cornerstone.getViewport(element);
  if (!viewport) {
    return;
  }
  switch (type) {
    case "hflip": // 左右翻转
      viewport.hflip = !viewport.hflip;
      cornerstone.setViewport(element, viewport);
      break;
    case "vflip": // 上下翻转
      viewport.vflip = !viewport.vflip;
      cornerstone.setViewport(element, viewport);
      break;
    case "rotate": {
      // 传入参数旋转
      const deg = params.deg ? params.deg : 0;
      viewport.rotation += deg;
      cornerstone.setViewport(element, viewport);
      break;
    }
    case "invert": // 灰度翻转
      viewport.invert = !viewport.invert;
      cornerstone.setViewport(element, viewport);
      break;
    case "reset":
      cornerstone.reset(element);
      break;
    case "setWcWw":
      {
        const wc = params.wc || parseInt(viewport.voi.windowCenter);
        const ww = params.ww || parseInt(viewport.voi.windowWidth);
        viewport.voi.windowCenter = wc;
        viewport.voi.windowWidth = ww;
        cornerstone.setViewport(element, viewport);
      }
      break;
    default:
      break;
  }
}
/** 获取工具响应事件附件的工具及状态值用来解析标注
 *
 * @param {*} eventData
 * @param {*} isLabel
 * @returns
 */
export function getNearLabelTools(eventData, isLabel = true) {
  // 获取最近标注的工具
  const nearbyTool = {};
  let pointNearTool = false;
  const element = eventData.element;
  const canvasCoordinates = eventData.currentPoints.canvas;
  const allToolTypes = isLabel
    ? [].concat(ToolsTypes)
    : ["Pan", "Wwwc"].concat(ToolsTypes);

  for (const toolType of allToolTypes) {
    const elementToolData = cornerstoneTools.getToolState(element, toolType);
    if (!elementToolData) {
      continue;
    }

    let elementToolInstance = cornerstoneTools.getToolForElement(
      element,
      toolType
    );
    if (!elementToolInstance) {
      elementToolInstance = cornerstoneTools.getToolForElement(
        element,
        `${toolType}Tool`
      );
    }
    if (!elementToolInstance) {
      continue;
    }
    // 循环工具数据
    elementToolData.data.forEach((toolData, index) => {
      if (
        elementToolInstance.pointNearTool(element, toolData, canvasCoordinates)
      ) {
        pointNearTool = true;
        nearbyTool.tool = toolData;
        nearbyTool.index = index;
        nearbyTool.toolType = toolType;
      }
    });
    if (pointNearTool) {
      break;
    }
  }
  return pointNearTool ? nearbyTool : undefined;
}
