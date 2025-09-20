// components/couponItem/couponItem.js
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    vendorCoupon: Array,
    activityInfo: Object
  },
  observers: {
    vendorCoupon: function (newVal) {
      this.setData({
        newCouponList: newVal.map((v) => {
          v.shareData = {
            isCoupon: true,
            title: "您的好友分享你一个优惠券，快快领取吧！",
            path: "/pages/expoPackage/getCoupon/getCoupon?couponId=" + v.coupon_id + "&couponType=2&couponInviteMobile=" + (wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").mobile : "") + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId")
          }
          return v
        })
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    newCouponList: [],
    getCouponSuccess: false,
    curId: 0,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //领取优惠券
    getCoupon(e) {
      let page = getCurrentPages();
      let currentRoute = page[page.length - 1].route;
      // 友盟统计
      wx.uma.trackEvent('click_getTicke', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '优惠券点击区域',
        SourcePage: currentRoute,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
      });
      if (wx.getStorageSync("isLogin")) {
        wx.showLoading({
          title: '领取中...',
          mask: true
        })
        let data = {
          source_id: e.currentTarget.dataset.item.coupon_id,
          src_id: "coupon",
          mobile: wx.getStorageSync("userInfo").mobile,
          invite: "",
          formId: e.detail.formId,
          'src': wx.getStorageSync('src'),
          'uis': wx.getStorageSync('uis'),
          'plan': wx.getStorageSync('plan'),
          'unit': wx.getStorageSync('unit')
        }
        marketingApi.postReserve(data).then((res) => {
          wx.hideLoading()
          if (res.code == 200) {
            for (let i of this.data.newCouponList) {
              if (e.currentTarget.dataset.item.coupon_id == i.coupon_id) {
                i.can_get = 0;
                i.button = "已领取";
              }
            }
            this.setData({
              getCouponSuccess: true,
              newCouponList: this.data.newCouponList,
              couponItem: e.currentTarget.dataset.item,
              shareData: {
                isCoupon: true,
                title: "您的好友分享你一个优惠券，快快领取吧！",
                path: "/pages/expoPackage/getCoupon/getCoupon?couponId=" + e.currentTarget.dataset.item.coupon_id + "&couponInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId")
              }
            })
            // 熊猫币弹框
            this.xmbModal();
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
    //关闭领取成功弹层
    closeGetCoupon() {
      this.setData({
        getCouponSuccess: false
      })
    },
    //分享
    shareTap() {
      let page = getCurrentPages();
      let currentRoute = page[page.length - 1].route;
      // 友盟统计
      wx.uma.trackEvent('click_getTicke', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '优惠券分享btn',
        SourcePage: currentRoute,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
      });
    },

    // 熊猫币数量弹框
    xmbModal() {
      let data = {
        id: 2
      }
      SvipApi.xmbModal(data).then(res => {
        if (res.code == 200) {
          this.setData({
            showXmbTips: true,
            xmbPopupData: res.result
          })
          setTimeout(() => {
            this.setData({
              showXmbTips: false
            })
          }, 5000);
        }
      })
    },

    // 平台券信息展开
    platformSpread(e) {
      let id = e.currentTarget.dataset.id;
      let index = e.currentTarget.dataset.index;
      this.setData({
        curId: id,
        curIndex: index
      })
    },

    // 跳转优惠券详情
    toCouponDetail(e) {
      let id = e.currentTarget.dataset.item.coupon_id;
      wx.navigateTo({
        url: '/pages/expoPackage/couponDetail/couponDetail?couponId=' + id,
      })
    },
  }
})