import bsearch from '../math/bsearch.js'
import compareReals from '../math/compareReals.js'

export default function(zAxis, imagePositionPatient) {
  const x = imagePositionPatient.x || imagePositionPatient[0]
  const y = imagePositionPatient.y || imagePositionPatient[1]
  const z = imagePositionPatient.z || imagePositionPatient[2]

  let sliceIndex = 0
  if (zAxis.xyzIndex === 0) {
    sliceIndex = bsearch(zAxis.positions, x, compareReals)
  } else if (zAxis.xyzIndex === 1) {
    sliceIndex = bsearch(zAxis.positions, y, compareReals)
  } else {
    sliceIndex = bsearch(zAxis.positions, z, compareReals)
  }

  return sliceIndex
}
