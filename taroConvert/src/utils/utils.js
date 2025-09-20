let toDate = function (date) {
  if (!date) {
    return new Date()
  }
  if (typeof date === 'string') {
    date = new Date(date.split('.')[0].replace('T', ' ').replace(/-/g, '/'))
  } else if (typeof date === 'number' && !isNaN(date)) {
    date = new Date(date)
  }
  return date
}

/*
 * 将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 如："yyyy-MM-dd hh:mm:ss.S"
 * fmt 默认为 'yyyy-MM-dd HH:mm'
 * */
const dateFormat = function (date, fmt) {
  if (!date) {
    return '--'
  }
  date = toDate(date)
  fmt = fmt || 'YYYY-MM-DD HH:mm'
  let o = {
    'M+': date.getMonth() + 1,
    // 月份
    '[dD]+': date.getDate(),
    // 日
    'H+': date.getHours(),
    // 小时
    'm+': date.getMinutes(),
    // 分
    's+': date.getSeconds(),
    // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3),
    // 季度
    S: date.getMilliseconds(), // 毫秒
  }
  if (/([yY]+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  }
  return fmt
}
let numerMach = function (num) {
  if (num.length == 5) {
  }
}
export default {
  toDate,
  dateFormat,
}
