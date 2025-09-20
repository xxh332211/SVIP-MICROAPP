import { config } from '../config/config.js'

let showError = msg => {
  setTimeout(() => {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  }, 100)
}

export default function apiService (url, method, data) {
  return new Promise((resolve, reject) => {
    let token = wx.getStorageSync('mall_token')
    let header = {}
    if (token) {
      header.Authorization = 'bearer ' + token.access_token
    } else {
      // header.Authorization =
      //   'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjEiLCJOYW1lIjoiIiwianRpIjoiNWI4YzQyODUtN2I4NS00NGYwLWJjY2UtYzE0OGExODNiZmE0IiwiaWF0IjoxNTc2OTg2ODU5ODE1LCJBbGlhcyI6IjEiLCJQcm9wZXJ0aWVzIjoie1wiY2l0eUlkXCI6OCxcImljb25VcmxcIjpudWxsLFwibW9iaWxlXCI6XCIxOTAwMDAwMDAwMlwifSIsIm5iZiI6MTU3Njk4Njg1OSwiZXhwIjoxNTc5NTc4ODU5LCJpc3MiOiJXaWN0dXJlIiwiYXVkIjoiRGJSRVNURnVsQXBpIn0._ek5kyNqkIho2uwChyi0X4LGb4Pn-dwgeP5bQGEJPx0'
    }
    for (let key in data) {
      if (data[key] === null || data[key] === undefined) {
        delete data[key]
      }
    }
    let params = {
      url: url.indexOf('http') === -1 ? (config.mallConfig.apiBaseUrl + url) : url,
      data,
      method,
      header,
      dataType: 'json',
      responseType: 'text',
      success (resp) {
        if (resp.data.statusCode == '200') {
          resolve(resp.data.data)
        } else if (resp.data.statusCode == '499') {
          wx.setStorageSync('mall_token', null)
          // wx.navigateTo({
          //   url: '/pages/login/login',
          // })
          reject(resp)
        } else {
          reject(resp)
          // showError(resp.data.errorMessage || '请求失败')
        }
      },
      fail (err) {
        reject(err)
        // showError('请求失败')
      }
    }
    wx.request(params)
  })
}
