import request from "@/utils/request";
// 获取病情详情
export function getPhoneNumber(regId, orgCode, regGuid) {
  return request({
    url: "/api/getPhoneNumber",
    method: "get",
    params: {
      regId,
      orgCode,
      regGuid,
    },
  });
}
export function authRegid(reg_id, hospital_code, regGuid) {
  return request({
    url: "/api/auth/regid",
    method: "post",
    data: {
      reg_id,
      hospital_code,
      regGuid,
    },
  });
}
export function sendPhoneMsg(isDebug = false) {
  return request({
    url: `/api/sendPhoneMsg${isDebug ? "?debug=true" : ""}`,
    method: "get",
    params: {},
  });
}
export function checkIdCard(code) {
  return request({
    url: `/api/checkIdCard/${code}`,
    method: "get",
    params: {},
  });
}
export function checkPhoneMsg(code) {
  return request({
    url: `/api/checkPhoneMsg/${code}`,
    method: "get",
    params: {},
  });
}
