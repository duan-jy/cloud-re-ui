export default function(a, b) {
  const ax = a.x || a[0]
  const ay = a.y || a[1]
  const az = a.z || a[2]

  const bx = b.x || b[0]
  const by = b.y || b[1]
  const bz = b.z || b[2]

  const x = ay * bz - az * by
  const y = az * bx - ax * bz
  const z = ax * by - ay * bx

  return { x, y, z }
}
