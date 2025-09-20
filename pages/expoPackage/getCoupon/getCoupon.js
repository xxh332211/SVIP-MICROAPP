// pages/expoPackage/getCoupon/getCoupon.js
import {
  util
} from "../../../common/util.js"
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.couponId) {
      wx.setStorageSync('shareCouponId', options.couponId)
      wx.setStorageSync('shareCouponType', options.couponType)
      wx.setStorageSync("cityId", options.cityId)
      wx.setStorageSync("activityId", options.activityId)
      wx.setStorageSync("sessionId", options.sessionId)
    }
    if (options.couponInviteMobile) {
      wx.setStorageSync('couponInviteMobile', options.couponInviteMobile)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.setData({
      couponType: wx.getStorageSync('shareCouponType'),
      isLogin: wx.getStorageSync('isLogin'),
      isAuth: wx.getStorageSync("isAuth")
    })
    //获取授权登录code
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          that.setData({
            wxcode: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    //获取优惠券信息
    this.getCouponInfo()
    // 获取展届信息
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId') || 1
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
    })
  },
  /**
   * 方法start
   */
  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isAuth: true
      })
      this.getCouponInfo()
    })
  },
  //获取优惠券信息
  getCouponInfo() {
    //判断是商户券还是平台券
    if (wx.getStorageSync('shareCouponType') == 1) {
      //平台券
      marketingApi.getPlatformCoupon().then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          res.data.map((v) => {
            if (wx.getStorageSync('shareCouponId') == v.coupon_id) {
              this.setData({
                couponDetail: v
              })
            }
          })
        }
      })
    } else {
      marketingApi.vendorCouponDetail({
        detailId: wx.getStorageSync("shareCouponId")
      }).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          if (res.result && res.result.length > 0) {
            let detail = app.disposeData(res.result);
            this.setData({
              couponDetail: detail[0]
            })
          } else {
            wx.showToast({
              title: "优惠券信息为空",
              icon: "none"
            })
            wx.switchTab({
              url: '/pages/getTicket/getTicket',
            })
          }
        }
      })
    }
  },
  //领取优惠券
  freeGet() {
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '领取中...',
        mask: true
      })
      //领取接口
      let data = {
        source_id: wx.getStorageSync("shareCouponId"),
        src_id: "coupon",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: wx.getStorageSync("couponInviteMobile"),
        formId: "",
        'src': "YYXCXliebian",
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      marketingApi.postReserve(data).then((res) => {
        let resData = res,that = this;
        wx.hideLoading({
          success() {
            if (resData.code == 200) {
              that.data.couponDetail.is_get = 1;
              that.setData({
                couponDetail: that.data.couponDetail
              })
              setTimeout(() => {
                wx.showToast({
                  title: '领取成功',
                  icon: "none",
                  duration: 3000
                })
              }, 100);
            } else {
              wx.showToast({
                title: resData.message ? resData.message : "请求出错了",
                icon: "none"
              })
            }
          }
        })
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  //平台优惠券跳转
  linkTo() {
    if (this.data.couponDetail.user_is_vip == 1) {
      wx.navigateTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
    } else {
      wx.reLaunch({
        url: '/pages/home/home',
      })
    }
  },
  // 一键回首页
  goHome: function (e) {
    wx.switchTab({
      url: '/pages/getTicket/getTicket'
    })
  },
  /**
   * 方法end
   */
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})