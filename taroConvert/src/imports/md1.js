var numFormat = function (num) {
  if (num) {
    return Number(num)
  } else {
    return num
  }
}
var indexof = function (arr, num) {
  if (arr.indexOf(num) > -1) {
    return true
  } else {
    return false
  }
}
module.exports = {
  numFormat: numFormat,
  indexof: indexof,
}
