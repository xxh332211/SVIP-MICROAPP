// pages/expoPackage/couponDetail/couponDetail.js
import {
  marketing
} from '../../../common/api/marketingApi';
const Api = new marketing();
import {
  svip
} from "../../../common/api/svipApi.js"
const SvipApi = new svip()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponData: null,
    getCouponSuccess: false,
    isGet: false,
    from: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.cityId) {
      wx.setStorageSync("cityId", options.cityId)
      wx.setStorageSync("activityId", options.activityId)
      wx.setStorageSync("sessionId", options.sessionId)
    }
    if (options.couponId) {
      this.setData({
        id: options.couponId
      })
      this.getCouponDetail();
      this.getAdvImg();
    }
    if (options.btn) {
      this.setData({
        btn: options.btn
      })
    }
    if (options.from === 'couponList') {
      this.setData({
        from: 'couponList'
      })
      wx.hideShareMenu({
        menus: ['shareAppMessage'],
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      activityInfo: wx.getStorageSync('activityInfo'),
      cityId: wx.getStorageSync('cityId') || 1
    })
  },

  getCouponDetail() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let params = {
      coupon_id: this.data.id
    }
    Api.getCouponDetail(params).then(res => {
      wx.hideLoading();
      if (res.status === 1) {
        this.setData({
          couponData: res.data
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  // 领取优惠券
  getCoupon() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '优惠券点击区域',
      SourcePage: 'pages/expoPackage/couponDetail/couponDetail',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '领取中...',
        mask: true
      })
      let data = {
        source_id: this.data.couponData.coupon_id,
        src_id: "coupon",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: "",
        // formId: e.detail.formId,
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      Api.postReserve(data).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          this.setData({
            getCouponSuccess: true,
            // isGet:true
          })
          this.getCouponDetail();
        } else {
          wx.showToast({
            title: res.message ? res.message : "请求出错了",
            icon: "none"
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  closeGetCoupon() {
    this.setData({
      getCouponSuccess: false
    })
  },

  // 运营位
  getAdvImg() {
    SvipApi.getAdvList({
      area_id: "28"
    }).then((res) => {
      if (res.status == 1 && res.data.adv28 && res.data.adv28.length) {
        this.setData({
          advImg: res.data.adv28[0].wap_image_url || null,
        })
      } else {
        this.setData({
          advImg: null,
        })
      }
    })
  },

  onShareAppMessage(e) {
    if (this.data.from === 'couponList') {
      return {
        title: "您的好友分享你一个优惠券，快快领取吧！",
        path: "/pages/goodsIndex/goodsIndex?userCityId=" + wx.getStorageSync("cityId"),
        imageUrl: this.data.advImg && this.data.advImg
      }
    } else {
      return {
        title: "您的好友分享你一个优惠券，快快领取吧！",
        path: "/pages/expoPackage/couponDetail/couponDetail?couponId=" + this.data.couponData.coupon_id + "&couponInviteMobile=" + (wx.getStorageSync("userInfo").mobile || "") + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId"),
        imageUrl: this.data.advImg && this.data.advImg
      }
    }
  },
})