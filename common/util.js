import {
  marketing
} from "./api/marketingApi.js"
import {
  config
} from './config/config.js'
let marketApi = new marketing()
import {
  svip
} from "./api/svipApi.js"
let SvipApi = new svip()

const util = {
  //公用授权使用手机号方法
  authorizePhone(e, code, callback) {
    wx.showLoading({
      title: '授权登录中...',
      mask: true
    })
    let infoDetail = e.detail;
    wx.setStorageSync("isAuth", true);
    //拒绝授权
    if (e.detail.errMsg != "getPhoneNumber:ok" || e.detail.errno === 1400001) {
      wx.hideLoading()
      wx.navigateTo({
        url: `/pages/login/login?source=${e.source?e.source:''}`,
      })
    } else {
      // 登录获取code登陆凭证，code传给接口，返回openid
      //发起网络请求
      let params = {
        wxcode: code,
        encryptedData: infoDetail.encryptedData,
        offset: infoDetail.iv,
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        nick_name: "",
        avatar: ""
      }
      marketApi.authorizeLogin(params).then((res) => {
        // console.log(res)
        if (res.status == 1) {
          let resData = res.data
          wx.setStorageSync('token', resData.token)
          wx.setStorageSync('userInfo', resData.user_info);
          wx.setStorageSync('isLogin', true);
          //用户行为记录
          SvipApi.postPV({
            envent_id: 10,
            source: "svip_xcx",
            begin_time: 0,
            end_time: 0,
            pv_type: 1,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
          }).then((res) => {

          })
          // Get token for hxjb-mall sub-system
          wx.request({
            url: config.mallConfig.baseUrl + 'token',
            data: {
              mobile: resData.user_info.mobile
            },
            method: 'POST',
            dataType: 'json',
            responseText: 'text',
            success(resp) {
              if (!resp.data || !resp.data.data || !resp.data.data.access_token) {
                wx.hideLoading()
                return
              }
              wx.setStorageSync('mall_token', resp.data.data)
            },
            fail(err) {
              console.log('失败了')
            }
          })
          // 友盟统计
          const userInfo = wx.getStorageSync('userInfo');
          wx.uma.trackEvent('Event_LoginSuc', {
            Um_Key_LoginType: '手机号授权',
            Um_Key_UserID: userInfo.uid
          });
          //授权登录成功
          wx.showToast({
            title: '授权登录成功',
            icon: "none",
            mask: true
          })
          wx.hideLoading()
          if (!resData.user_info.unionid) {
            //没有unionID跳转授权页获取
            wx.navigateTo({
              url: '/pages/getUnionId/getUnionId',
            })
            return
          }
          callback && callback()
        } else {
          // 友盟统计
          wx.uma.trackEvent('Event_LoginFailed', {
            Um_Key_Reasons: res.message,
            Um_Key_LoginType: '手机号授权'
          });
          wx.hideLoading()
          //授权登录失败
          wx.showLoading({
            title: '授权登录失败',
            mask: true
          })
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/login/login?source=${e.source?e.source:''}`,
              success() {
                wx.hideLoading()
              }
            })
          }, 300)
        }
      }).catch(err => {
        // 友盟统计
        wx.uma.trackEvent('Event_LoginFailed', {
          Um_Key_Reasons: err,
          Um_Key_LoginType: '手机号授权'
        });
      })
    }
  },

  //定位
  getPositionCity(src = "", callBack) {
    let that = this
    // wx.authorize({
    //   scope: 'scope.userLocation',
    //   success(e) {
    wx.getLocation({
      type: 'wgs84',
      success(e) {
        SvipApi.citylist().then((res) => {
          that.loadCity(e.longitude, e.latitude, res, callBack)
        }).catch((err) => {
          console.log(err, 'err')
        })
      },
      fail(res) {
        console.log("定位失败", res)
        wx.hideLoading();
        if (src == "ticketCheck" || src == "mgg" || src == "goodsIndex" || src == "shoppingList" || src == "userHome" || src == "selfHelp" || src == "fisson" || src == "xmb") {
          wx.navigateTo({
            url: '/pages/address/index?src=' + src
          })
        } else {
          wx.reLaunch({
            url: '/pages/address/index?src=' + src
          })
        }
      },
      complete(){
        wx.setStorageSync('isLocation', true);
      }
    })
    // },
    // })
  },
  // 定义获取城市,name转换为id
  loadCity: function (longitude, latitude, resData, callBack) {
    var that = this
    wx.request({
      url: 'https://api.51jiabo.com/msv/rest/v1/map/getcityinfobyxy.do?x=' + longitude + '&y=' + latitude,
      // url: 'https://api.51jiabo.com/msv/rest/v1/map/getcityinfobyxy.do?x=' + 126.564264 + '&y=' + 45.821048,// 哈尔滨
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        let login_id = res.data.infoMap.cityid
        let idArray = []
        resData.forEach((item) => {
          idArray.push(item.id)
          if (item.id == login_id) {
            wx.setStorageSync('curUserCityText', item.city_name)
            wx.setStorageSync('cityId', item.id) // 老项 新项 通用
            wx.hideLoading();
            wx.setStorage({
              key: 'cityId',
              data: item.id,
              success: function () {
                //获取页面所有接口信息
                callBack()
              }
            })
          }
        })
      },
      fail: function () {
        wx.showModal({
          title: 'error',
          content: '微信获取地理位置失败！',
        })
      },
    })
  },

  //手机号加密
  // async getEncPhone(num){
  //   let result = await marketApi.getEncPhone({ enc: num})
  //   return result
  // }

  // 获取商品的最终价格
  getGoodsPrice(goodsInfo) {
    if (goodsInfo.catalogValue === undefined) {
      return goodsInfo.sellingPrice
    }
    if (goodsInfo.catalog === 0) {
      return goodsInfo.catalogValue
    } else if (goodsInfo.catalog === 1) {
      return goodsInfo.sellingPrice
    } else if (goodsInfo.catalog === 2) {
      return goodsInfo.catalogValue
    } else if (goodsInfo.catalog === 3) {
      return wx.getStorageSync('isSvip') ? goodsInfo.catalogValue : goodsInfo.sellingPrice
    } else if (goodsInfo.catalog === 4) {
      return goodsInfo.catalogValue
    }
    return goodsInfo.sellingPrice
  }
}

export {
  util
}