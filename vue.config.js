const path = require("path");
module.exports = {
  publicPath: "/",
  lintOnSave: false,
  productionSourceMap: false,
  filenameHashing: true,
  devServer: {
    port: 8081,
    overlay: { warnings: true, errors: true },
    proxy: {
      "/api": {
        //虚拟目录
        target: "https://medimage.online", //地址
        changeOrigin: true,
        pathRewrite: {
          "^/api": "api",
        },
      },
    },
  },
  configureWebpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        "@": resolve("src"),
        "cornerstone-wado-image-loader":
          "cornerstone-wado-image-loader/dist/dynamic-import/cornerstoneWADOImageLoader.min.js",
      },
    };
    //线上环境
    if (process.env.NODE_ENV === "production") {
      console.log("这是生产模式");
    }
    if (process.env.NODE_ENV === "development") {
      console.log("开发模式");
    }
  },
  chainWebpack: (config) => {
    config.set("name", "图灵医道云胶片");
    config.plugin("html").tap((args) => {
      args[0].title = "图灵医道云胶片";
      return args;
    });
    config.module
      .rule("shaderloader")
      .include.add(/vtk\.js[\/\\]Sources/)
      .end()
      .test(/\.glsl$/)
      .use("shader-loader")
      .loader("shader-loader")
      .end();
    return config;
  },
};

function resolve(dir) {
  return path.join(__dirname, dir);
}
