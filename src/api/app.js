import request from "@/utils/request";
export function getByHospitalId(HospitalId) {
  return request({
    url: `/data/api/appConfig/getByHospitalId?HospitalId=${HospitalId}`,
    method: "get",
  });
}
