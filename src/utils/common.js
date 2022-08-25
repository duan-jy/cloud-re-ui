import { Dialog } from "vant";
export function DialogAlert(message) {
  Dialog.alert({
    title: "出错了...",
    message,
  }).then(() => {});
}
