/**
 * Get required metadata of view
 * @param image
 */
export default function createViewdata(image) {
  const dataSet = image.data
  const patientName = dataSet.string('x00100010')
  const patientId = dataSet.string('x00100020')
  const patientAge = dataSet.string('x00101010')
  const patientSex = dataSet.string('x00100040')
  if (!patientId) {
    return {}
  }
  const studyInstanceUid = dataSet.string('x0020000d')
  if (!studyInstanceUid) {
    return {}
  }
  const studyDate = dataSet.string('x00080020')
  const studyTime = dataSet.string('x00080030')
  const studyDescription = dataSet.string('x00081030')

  const seriesDate = dataSet.string('x00080021')
  const seriesTime = dataSet.string('x00080031')
  const seriesInstanceUid = dataSet.string('x0020000e')
  const seriesDescription = dataSet.string('x0008103e')
  const seriesNumber = dataSet.string('x00200011')
  const modality = dataSet.string('x00080060')

  const sopInstanceUid = dataSet.string('x00080018')
  const rows = dataSet.uint16('x00280010')
  const instanceNumber = dataSet.string('x00200013')

  const institutionName = dataSet.string('x00080080')
  return {
    patientId,
    patientName,
    studyInstanceUid,
    studyDate,
    studyTime,
    studyDescription,
    seriesInstanceUid,
    seriesDescription,
    seriesNumber,
    modality,
    sopInstanceUid,
    rows,
    instanceNumber,
    seriesDate,
    seriesTime,
    patientAge,
    patientSex,
    institutionName
  }
}
