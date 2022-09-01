export function getVolumeCenter(volumeMapper) {
  const bounds = volumeMapper.getBounds()
  return [
    (bounds[0] + bounds[1]) / 2.0,
    (bounds[2] + bounds[3]) / 2.0,
    (bounds[4] + bounds[5]) / 2.0
  ]
}
export function getVOI(volume) {
  const rgbTransferFunction = volume.getProperty().getRGBTransferFunction(0)
  const range = rgbTransferFunction.getMappingRange()
  const windowWidth = range[0] + range[1]
  const windowCenter = range[0] + windowWidth / 2
  return {
    windowCenter,
    windowWidth
  }
}
