import request from "@/utils/request";
/**
 * wadouri Imageid
 * @param { string } studyInstanceID
 * @param { string } sopInstanceID
 * @returns imageId
 */
export function getImageWadouri(
  studyInstanceID,
  seriesInstanceID,
  sopInstanceID
) {
  const location = `${window.location.origin}`;
  // const location = `https://qiluhospital.medimage.online:8081`;
  // const location = `https://medimage.online`;
  return `wadouri:${location}/api/rs/wadouri?requestType=WADO&studyUID=${studyInstanceID}&seriesUID=${seriesInstanceID}&objectUID=${sopInstanceID}&contentType=application/dicom&transferSyntax=*`;
}

// 通过序列通过studyInstanceID,seriesInstanceID单个序列的所有图像值
export function getImagesBySeriesID(studyInstanceID, seriesInstanceID) {
  return request({
    url: `/api/rs/studies/${studyInstanceID}/series/${seriesInstanceID}/metadata`,
    method: "GET",
  });
}
// 通过studyInstanceID 获取序列
export function getSeriesByStudyInstanceID(studyInstanceID) {
  return request({
    url: `/api/rs/studies/${studyInstanceID}/series`,
    method: "GET",
  });
}
/** 通过检查号获取图像
 *
 * @param {string} patientId 病人检查号
 * @returns 检查号下全部的imageid
 */
export async function getDicomMetaData(studyInstanceID) {
  return new Promise(async (resovle, reject) => {
    try {
      let aImageID = [];
      const aImageIdObj = {};
      const priority = [];
      let patientId = "";
      const response = await getSeriesByStudyInstanceID(studyInstanceID);
      const seriesArrList = response;
      console.log(seriesArrList);
      for (const item of seriesArrList) {
        const seriesInstanceID = item["0020000E"]["Value"][0];
        if (aImageIdObj[seriesInstanceID] === undefined) {
          aImageIdObj[seriesInstanceID] = [];
        }
        const sopResponse = await getImagesBySeriesID(
          studyInstanceID,
          seriesInstanceID
        );
        const sopArr = sopResponse || [];
        sopArr.map((sop) => {
          const sopInstanceID = sop["00080018"]["Value"][0];
          if (patientId === "") {
            patientId = sop["00100020"]["Value"][0];
          }
          const imageId = getImageWadouri(
            studyInstanceID,
            seriesInstanceID,
            sopInstanceID
          );
          aImageIdObj[seriesInstanceID].push(imageId);
        });
      }
      for (const key in aImageIdObj) {
        aImageIdObj[key] = aImageIdObj[key].sort((aSort, bSort) => {
          const lastNumberA = aSort.substring(aSort.length - 4);
          const lastNumberB = bSort.substring(bSort.length - 4);
          return lastNumberA - lastNumberB;
        });
        priority.push({
          seriesInstanceID: key,
          imageId: aImageIdObj[key][0],
          imageCount: aImageIdObj[key].length,
        });
        aImageID = aImageID.concat(aImageIdObj[key]);
      }
      resovle({ imageIds: aImageID, aImageIdObj, priority, patientId });
    } catch (error) {
      reject(error);
    }
  });
}
