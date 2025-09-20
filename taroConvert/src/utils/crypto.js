import Taro from '@tarojs/taro'
const CryptoJS = require('crypto-js')
// 配置文件
let app = Taro.getApp()
let baseUrl = app.version()
var encryptToken = '0df950ee8c1fc1c8aaba73e4de177e19' // 松江呼叫使用
const getTokenUrl = baseUrl + '/auth/token/get_token'
const ivrApiUrl = 'https://api-local.51jiabo.com/ivr/'
const wssUrl = 'ws://127.0.0.1:2345/'
var ApiToken

// AES 对称加密
function tokenAES() {
  var nowTime = new Date()
  var encryptStr = encryptToken + '.' + parseInt(nowTime.getTime() / 1000)
  var encryptKey = CryptoJS.enc.Hex.parse('cdff229c13b94ad9456ca46b78475f45') // md5('hxjb-api-auth')
  var encryptIV = CryptoJS.enc.Hex.parse('b4fe59840e9fabce870ad9e6706b0463') // md5('hxjb')
  var decryptStr = CryptoJS.AES.encrypt(encryptStr, encryptKey, {
    iv: encryptIV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decryptStr.toString()
}
function getAccessToken() {
  return new Promise(function (resove, reject) {
    Taro.request({
      method: 'POST',
      url: getTokenUrl,
      data: {
        token: tokenAES(),
      },
      header: {
        'content-type': 'application/json', // 默认值
      },
      success: function (res) {
        // console.log(res)
        if (res.data.code == 200) {
          Taro.setStorageSync('accessToken', res.data.access_token)
        } else {
          Taro.setStorageSync('accessToken', '')
          console.log('服务器验证失败')
        }
        resove()
      },
    })
  })
}
getAccessToken()
export default {
  // 常量
  ivrApiUrl,
  wssUrl,
  // 变量
  ApiToken,
  // 方法
  tokenAES,
  getAccessToken,
}
