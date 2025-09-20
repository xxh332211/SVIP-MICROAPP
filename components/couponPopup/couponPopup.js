// components/couponPopup/couponPopup.js
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  util
} from "../../common/util.js"
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showCouponPopup: Boolean,
    isLogin: Boolean,
    couponInfo: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    couponPopup: false,
    login: false,
    getSuccess: false,
    couponData: []
  },
  observers: {
    "showCouponPopup": function (newVal) {
      this.setData({
        couponPopup: newVal
      })
    },
    "isLogin": function (newVal) {
      this.setData({
        login: newVal
      })
    },
    "couponInfo": function (newVal) {
      let hasNotGet = false;
      for (let v of newVal) {
        if (v.is_own == 0) {
          hasNotGet = true;
        }
      }
      if (!hasNotGet) {
        this.setData({
          getSuccess: true
        })
      }
      this.setData({
        couponData: newVal,
        couponIdArr: newVal.map((v) => {
          return v.coupon_id
        })
      })
    }
  },
  ready() {
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
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
      this.setData({
        getSuccess: false
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //授权手机号
    getPhoneNumber(e) {
      util.authorizePhone(e, this.data.wxcode, () => {
        //授权登录成功回调父组件方法
        this.triggerEvent("getPhoneBack", "getCoupon")
        this.getCoupon(e)
      })
    },
    getCoupon() {
      let that = this;
      wx.showLoading({
        title: '领取中...',
        mask: true
      })
      SvipApi.getMultiSvipCoupon({
        couponId: this.data.couponIdArr
      }).then((res) => {
        let resData = res;
        wx.hideLoading({
          complete() {
            if (resData.status == 1) {
              let arr = [];
              that.data.couponData.map((v) => {
                if (resData.data.indexOf(v.coupon_id) > -1) {
                  arr.push(v);
                }
              })
              that.setData({
                getSuccess: true,
                couponData: arr
              })
            } else {
              that.setData({
                showCouponPopup: false,
                showTips: true,
                ticketName: res.message
              })
              setTimeout(function () {
                that.setData({
                  showTips: false,
                })
              }, 3000)
            }
          }
        })
      })
    },
    closeCouponPopup() {
      this.setData({
        showCouponPopup: false
      })
      // this.triggerEvent("closeCouponPopup")
    },
    toUse() {
      this.setData({
        showCouponPopup: false
      })
      wx.navigateTo({
        url: '/pages/svipPackage/paySvip/paySvip',
      })
    }
  }
})