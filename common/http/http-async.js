import {
  config
} from '../config/config.js'
const tips = {
  '0': '请求失败!',
  '001': 'token 失效',
  '002': 'appkey无效',
  '003': 'id不存在'
}
let app = getApp();
class httpAsync {
  constructor() {
    this.baseUrl = config.url
    this.token = null
  }
  _setToken() {
    if (this.token) return this.token
    return wx.getStorageSync('token')
  }
  /**
   * 混合参数流程可以根据业务来简化
   */
  _mixin(val, type) {
    if (!type) {
      let params = Object.assign({}, {
        data: null,
        method: 'GET',
        header: {
          'device_type': app.systemData.model?app.systemData.model:"",
          'userid': wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").uid : 0,
          'app_version': app.systemData.version,
          'sys_version': app.systemData.system,
          'Token': this._setToken(),
          'City': wx.getStorageSync('cityId'),
          'Activity': wx.getStorageSync('activityId'),
          // 'Token': "4fe906ac1175d4141a3b846a79c9b0a759dd6255",
          // 'City': "2",
          // 'Activity': "2083",
          'Session': wx.getStorageSync('sessionId')
        },
        dataType: 'json',
        responseType: "text"
      }, val)
      return params
    }
    if (type == 'POST') {
      let params = Object.assign({}, {
        data: null,
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Token': this._setToken(),
          'City': wx.getStorageSync('cityId'),
          'Activity': wx.getStorageSync('activityId'),
          // 'Token': "4fe906ac1175d4141a3b846a79c9b0a759dd6255",
          // 'City': "2",
          // 'Activity': "2083",
          'Session': wx.getStorageSync('sessionId')
        },
        responseType: ""
      }, val)
      return params
    }
  }

  // 参数包含 val callback val可以是 number string(文字)
  _showTips(val, callback) {
    if (!val) val = '0'
    let tipText = tips[val]
    wx.showToast({
      title: tipText ? tipText : val,
      icon: 'none',
      duration: 1000,
      success() {
        if (!callback) return
        let time = null
        time = setTimeout(() => {
          callback()
        }, 1000)
      }
    })
  }
  request(data, type) {
    let params = this._mixin(data, type)
    params.url = this.baseUrl + params.url
    return new Promise((resolve, reject) => {
      wx.request({
        success: (res) => {
          if (res.statusCode == 200 && res.data && res.data.status == 1) {
            return resolve(res.data.data)
          }
          wx.hideLoading()
          if (res.data && res.data.status == '-2') {
            wx.removeStorageSync("token")
            wx.removeStorageSync("userInfo")
            wx.removeStorageSync("isLogin")
            wx.removeStorageSync("isSvip")
            // wx.clearStorage()
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
          this._showTips(res.data.message)
          reject(res)
        },
        fail: (err) => {
          wx.hideLoading()
          reject(err)
          // 异常
          // this._showTips(err.data ? err.data.status : "", () => {
          //   wx.navigateTo({
          //     url: "/pages/netOut/netOut?message=" + "接口请求失败！",
          //   })
          // })
        },
        ...params
      })
    })
  }
  requestNew(data, type) {
    let params = this._mixin(data, type)
    params.url = this.baseUrl + params.url
    return new Promise((resolve, reject) => {
      wx.request({
        success: (res) => {
          if (res.data && res.data.status == '-2') {
            wx.removeStorageSync("token")
            wx.removeStorageSync("userInfo")
            wx.removeStorageSync("isLogin")
            wx.removeStorageSync("isSvip")
          }
          return resolve(res.data)
          wx.hideLoading()
        },
        fail: (err) => {
          wx.hideLoading()
          reject(err)
          // 异常
          // this._showTips(err.errMsg, () => {
          //   wx.navigateTo({
          //     url: "/pages/netOut/netOut?message=" + "接口请求失败！",
          //   })
          // })
        },
        ...params
      })
    })
  }
}
export {
  httpAsync
}