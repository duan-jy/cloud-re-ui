import request from "@/utils/reqtitle";
export function getByHospitalId(HospitalId) {
  return request({
    url: "/api/appConfig/getByHospitalId",
    method: "get",
    params: {
      HospitalId,
    },
  });
}
