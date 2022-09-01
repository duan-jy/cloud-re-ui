//  应用的工具栏
const MouseBtn = 1;
const defaultTools = [
  {
    name: "Wwwc",
    toolName: "WwwcTool",
    icon: "iconduibi1",
    isActive: true,
    options: {
      mouseButtonMask: 2,
    },
    btnMask: "1",
    desc: "调窗",
    isMore: false,
  },
  {
    name: "Zoom",
    toolName: "ZoomTool",
    icon: "iconfangda",
    isActive: true,
    options: {
      mouseButtonMask: 4,
    },
    configuration: {
      invert: false,
      preventZoomOutsideImage: false,
      minScale: 0.1,
      maxScale: 20.0,
    },
    btnMask: "1",
    desc: "缩放",
    isMore: false,
  },
];

const tools = [
  {
    name: "Wwwc",
    toolName: "WwwcTool",
    icon: "iconduibi1",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "调窗",
    isMore: false,
  },
  {
    name: "StackScroll",
    toolName: "StackScrollTool",
    icon: "icongundongtuceng2",
    isActive: true,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "滑动翻页",
    isMore: false,
  },
  {
    name: "Rotate",
    toolName: "RotateTool",
    icon: "iconxuanzhuan",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "旋转",
    isMore: true,
  },
  {
    name: "Probe",
    toolName: "ProbeTool",
    icon: "iconjiatianjia",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "探针",
    isMore: true,
  },
  {
    name: "Zoom",
    toolName: "ZoomTool",
    icon: "iconfangda",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    configuration: {
      invert: false,
      preventZoomOutsideImage: false,
      minScale: 0.1,
      maxScale: 20.0,
    },
    btnMask: "1",
    desc: "缩放",
    isMore: false,
  },
  {
    name: "Pan",
    toolName: "PanTool",
    icon: "iconyidong",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "移动",
    isMore: false,
  },
  {
    name: "Length",
    toolName: "LengthTool",
    icon: "iconuntitled",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    configuration: {
      handleRadius: 0.5,
    },
    btnMask: "1",
    desc: "长度",
    isMore: true,
  },
  {
    name: "Angle",
    toolName: "AngleTool",
    icon: "iconjiaodu",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "角度",
    isMore: true,
  },
  {
    name: "RectangleRoi",
    toolName: "RectangleRoiTool",
    icon: "iconsvg-",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    configuration: {
      drawHandles: false,
    },
    btnMask: "1",
    desc: "矩形",
    isMore: true,
  },
  {
    name: "FreehandRoi",
    toolName: "FreehandRoiTool",
    icon: "iconquxian",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "自由曲线",
    isMore: true,
  },
  {
    name: "reset",
    icon: "iconhuifu",
    desc: "复原",
    hanlder: "updateViewport",
    args: {
      type: "reset",
    },
    isMore: false,
  },
  {
    name: "Magnify",
    toolName: "MagnifyTool",
    icon: "iconfangdajing",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    btnMask: "1",
    desc: "放大镜",
    isMore: true, // 将工具放到更多种
  },
  {
    name: "EllipticalRoi",
    toolName: "EllipticalRoiTool",
    icon: "icontuoyuan",
    isActive: false,
    options: {
      mouseButtonMask: MouseBtn,
    },
    configuration: {
      drawHandles: false,
      handleRadius: 0.5,
    },
    btnMask: "1",
    desc: "椭圆",
    isMore: true,
  },
  {
    name: "zuoyoufanzhuan",
    icon: "iconzuoyoufanzhuan",
    desc: "左右翻转",
    hanlder: "updateViewport",
    args: {
      type: "hflip",
    },
    isMore: true,
  },
  {
    name: "shangxiafanzhuan",
    icon: "iconshangxiafanzhuan",
    desc: "上下翻转",
    hanlder: "updateViewport",
    args: {
      type: "vflip",
    },
    isMore: true,
  },
  {
    name: "rotateviewport",
    icon: "iconxuanzhuan",
    desc: "顺时针转",
    hanlder: "updateViewport",
    args: {
      type: "rotate",
      params: {
        deg: 90,
      },
    },
    isMore: true,
  },
  {
    name: "invertviewport",
    icon: "iconhuidufanzhuan",
    desc: "灰度翻转",
    hanlder: "updateViewport",
    args: {
      type: "invert",
    },
    isMore: true,
  },
];

// 标注工具列表
const ToolsTypes = [
  "Angle",
  "Bidirectional",
  "Length",
  "FreehandMouse",
  "EllipticalRoi",
  "CircleRoi",
  "RectangleRoi",
  "FreehandRoi",
  "Probe",
];
export { ToolsTypes, defaultTools, tools };
