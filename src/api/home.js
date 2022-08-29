import request from "@/utils/request";
export function getStudyInfo(reg_id, hospital_code) {
  return request({
    url: "/api/getStudyInfo",
    method: "post",
    data: {
      reg_id,
      hospital_code,
    },
  });
}
// 下载DCM.zip
export function downloadZip(regId, hospitalCode) {
  return request({
    url: `/api/download/${regId}/${hospitalCode}`,
    method: "get",
  });
}
