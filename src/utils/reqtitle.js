import axios from "axios";
import { Dialog } from "vant";
const service = axios.create({
  timeout: 10000,
  responseType: "json",
});
// 请求拦截
service.interceptors.request.use(
  (config) => {
    config.method = config.method.toLowerCase();
    config.baseURL = "http://36.138.44.14:27021/data";
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);
// 响应拦截
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (response.status !== 200) {
      // const msg = res.message
      //   ? res.message.indexOf("timeout") > -1
      //     ? "请求超时，请稍后重试"
      //     : res.message
      //   : "网络异常，请稍后重试";
      const msg = "网络异常，请稍后重试";
      Dialog.alert({ message: msg });
      return Promise.reject(new Error(msg || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    // let msg = error.message;
    // msg =
    //   msg.indexOf("timeout") > -1
    //     ? "请求超时，请稍后重试"
    //     : "网络异常请稍后重试";
    const msg = "网络异常，请稍后重试";
    Dialog.alert({ message: msg });
    return Promise.reject(error.message);
  }
);
export default service;
