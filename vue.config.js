module.exports = {
  publicPath: "./",
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
      "/viewer": {
        //虚拟目录
        target: "http://127.0.0.1:3000", //地址
        changeOrigin: true,
        pathRewrite: {
          "^/viewer": "",
        },
      },
    },
  },
};
