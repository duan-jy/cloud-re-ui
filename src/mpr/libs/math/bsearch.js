export default function(array, value, cmp) {
  let low = 0
  let high = array.length - 1

  let cmpResult
  while (low <= high) {
    const mid = low + (((high - low) / 2) | 0) // avoid overflow when low + high > max for type
    cmpResult = cmp(array[mid], value)
    if (cmpResult < 0) {
      low = mid + 1
    } else if (cmpResult > 0) {
      high = mid - 1
    } else {
      return mid
    }
  }
}
