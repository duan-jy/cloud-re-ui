import request from "@/utils/request";
export function authRegid(reg_id, hospital_code, phone_number) {
  return request({
    url: "/api/auth/regid",
    method: "post",
    data: {
      reg_id,
      hospital_code,
      phone_number,
    },
  });
}
export function authIdcard(id_card, hospital_code, phone_number) {
  return request({
    url: "/api/auth/idcard",
    method: "post",
    data: {
      id_card,
      hospital_code,
      phone_number,
    },
  });
}
export function authDecrypt(phone_number, id_card) {
  return request({
    url: `/api/auth/decrypt/a/${phone_number}/${id_card}`,
    method: "get",
  });
}
export function transHospitalID(hospital) {
  return request({
    url: `/api/transHospitalID/${hospital}`,
    method: "get",
  });
}
export function authShareInfo(shareId) {
  return request({
    url: `/api/auth/share/info/${shareId}`,
    method: "get",
  });
}
export function authShareCheck(pwd, shareId) {
  return request({
    url: `/api/auth/share/check`,
    method: "post",
    data: {
      pwd,
      shareId,
    },
  });
}
