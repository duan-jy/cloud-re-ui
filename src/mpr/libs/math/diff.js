export default function(array) {
  const resultArray = []
  for (let i = 1; i < array.length; i++) {
    resultArray.push(array[i] - array[i - 1])
  }
  return resultArray
}
