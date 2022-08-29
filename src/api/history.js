import request from "@/utils/request";
export function getStudyHistoryList() {
  return request({
    url: "/api/getStudyHistoryList",
    method: "get",
  });
}
