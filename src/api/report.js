import request from "@/utils/request";
export function saveReport(data = {}) {
  return request({
    url: `/api/saveReport`,
    method: "post",
    data,
  });
}
