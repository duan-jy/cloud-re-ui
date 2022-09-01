/**
 * Get required metadata of studies, series and instances
 * @param imageObject
 * @param image
 * @param studies
 */
export default function createMetadata(imageObject, image, studies) {
  const dataSet = image.data;
  const patientName = dataSet.string("x00100010");
  const patientId = dataSet.string("x00100020");
  if (!patientId) {
    return;
  }
  const studyInstanceUid = dataSet.string("x0020000d");
  if (!studyInstanceUid) {
    return;
  }
  const studyDate = dataSet.string("x00080020");
  const studyTime = dataSet.string("x00080030");
  const studyDescription = dataSet.string("x00081030");

  const seriesInstanceUid = dataSet.string("x0020000e");
  const seriesDescription = dataSet.string("x0008103e");
  const seriesNumber = dataSet.string("x00200011");
  const modality = dataSet.string("x00080060");
  const sopInstanceUid = dataSet.string("x00080018");
  const rows = dataSet.uint16("x00280010");
  const instanceNumber = dataSet.string("x00200013");

  const targetInstance = {
    sopInstanceUid,
    rows,
    instanceNumber,
    url: imageObject.imageId ? imageObject.imageId : imageObject,
    image,
  };

  const targetSeries = {
    seriesInstanceUid,
    seriesDescription,
    seriesNumber,
    modality,
    imageCount: imageObject.imageCount || 1,
    imageIds: imageObject.imageIds || [],
    instances: [targetInstance],
  };

  const targetStudy = {
    patientId,
    patientName,
    studyInstanceUid,
    studyDate,
    studyTime,
    studyDescription,
    seriesList: [targetSeries],
  };

  const study = studies.find(
    (entry) =>
      entry.patientId === patientId &&
      entry.studyInstanceUid === studyInstanceUid
  );
  if (study) {
    study.seriesList = study.seriesList || [];
    const series = study.seriesList.find(
      (entry) => entry.seriesInstanceUid === seriesInstanceUid
    );
    if (series) {
      series.instances = series.instances || [];
      const instance = series.instances.find(
        (entry) => entry.sopInstanceUid === sopInstanceUid
      );
      if (!instance) {
        series.instances.push(targetInstance);
      }
    } else {
      study.seriesList.push(targetSeries);
    }
  } else {
    targetStudy.seriesList[0].instances[0].image = image;
    studies.push(targetStudy);
  }
  return { patientId, seriesInstanceUid, studyInstanceUid };
}
