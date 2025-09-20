import {
  config
} from '../config/config.js'

class http {
  constructor() {
    this.baseUrl = config.url;
    this.token = null;
    this.params = null;
  }
  setTempToken(token) {
    this.token = token
  }
  getToken() {
    return wx.getStorageSync("token")
  }
  // get 方法
  getRequest(val) {
    let reqParam = Object.assign({}, {
      data: null,
      method: 'GET',
      header: {
        'token': this.getToken()
      },
      dataType: 'json',
      responseType: "",
      success: this.success,
      fail: this.fail,
      complete: this.complete,
      callback: () => {},
    }, val)
    reqParam.url = this.baseUrl + val.url
    this.params = reqParam
    wx.request(reqParam)
  }
  // post 方法
  postRequest(val) {
    let reqParam = Object.assign({}, {
      data: null,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': this.getToken()
      },
      responseType: "",
      success: this.success,
      fail: this.fail,
      complete: this.complete,
      callback: () => {},
    }, val)
    reqParam.url = this.baseUrl + val.url
    this.params = reqParam
    console.log(reqParam, '请求参数')
    wx.request(reqParam)
  }
  /**
   * 默认失败请求函数
   */
  fail(error) {
    let message = error.message
    // wx.navigateTo({
    //   url: "/pages/netOut/netOut?message=" + message,
    // })
  }
  // 必定执行函数
  complete(res) {
    if (res.data && res.data.status == '-2') {
      wx.removeStorageSync("token")
      wx.removeStorageSync("userInfo")
      wx.removeStorageSync("isLogin")
      wx.removeStorageSync("isSvip")
      wx.showModal({
        title: '账号已下线！',
        content: '您的账户已在其他端登录,请重新登录',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return
    }
  }
}
export {
  http
}