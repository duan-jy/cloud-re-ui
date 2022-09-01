import request from "@/utils/request";

export function postAuthFf(data = {}) {
  return request({
    url: `/api/auth/f2f`,
    method: "post",
    data,
  });
}
