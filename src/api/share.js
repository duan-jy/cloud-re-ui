import request from "@/utils/request";
// 获取病情详情
export function getShareCode(regId = "", orgCode = "") {
  return request({
    url: `/api/getShareCode/${regId}/${orgCode}`,
    method: "get",
  });
}
export function postShareCreate(data = {}) {
  return request({
    url: `/api/share/create`,
    method: "post",
    data,
  });
}
