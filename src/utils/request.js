import axios from "axios";
import { Toast } from "vant";
const service = axios.create({
  timeout: 20000,
  responseType: "json",
});
// 请求拦截
service.interceptors.request.use(
  (config) => {
    config.method = config.method.toLowerCase();
    config.baseURL = "/";
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
      const msg = res.message
        ? res.message.indexOf("timeout") > -1
          ? "请求超时，请稍后"
          : res.message
        : "网络异常";
      Toast.fail(msg);
      return Promise.reject(new Error(msg || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    let msg = error.message;
    msg =
      msg.indexOf("timeout") > -1 ? "请求超时，请稍后" : "网络异常请稍后重试";
    Toast.fail(msg);
    return Promise.reject(error.message);
  }
);
export default service;
