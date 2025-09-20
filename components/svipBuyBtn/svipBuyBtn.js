// components/svipBuyBtn/svipBuyBtn.js
import {
  svip
} from "../../common/api/svipApi.js"
const SvipApi = new svip()
import {
  util
} from "../../common/util.js"
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    restoreOrigin: {
      type: Boolean,
      value: false
    },
    openExpoSale: {
      type: Boolean,
      value: false
    },
    isUpgrade: {
      type: Number,
      value: 1
    },
    isSvip: {
      type: Boolean,
      value: false
    },
    isLogin: {
      type: Boolean,
      value: false
    },
    origin: {
      type: String,
      value: 'page'
    },
    scrollShowBtn: {
      type: Boolean,
      value: false
    },
    isDiscount: {
      type: Boolean,
      value: false
    },
    discountPrice: {
      type: Number,
      value: 0
    },
    wxcode: String,
    canUseCoupon: Object,
    isSend: Number,
    price: Number,
    originPrice: Number,
    salePrice: Number,
  },
  observers: {
    "wxcode": function (newVal) {
      this.setData({
        code: newVal
      })
    },
    "isSvip": function (newVal) {
      this.setData({
        svip: newVal
      })
    },
    "isLogin": function (newVal) {
      this.setData({
        login: newVal
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    login: false,
    svip: false,
    code: "",
    curPage: 'pages/home/home'
  },

  ready() {},

  /**
   * 组件的方法列表
   */
  methods: {
    //授权手机号
    getPhoneNumber(e) {
      util.authorizePhone(e, this.data.code, () => {
        //授权登录成功回调父组件方法
        this.triggerEvent("getPhoneBack")
      })
    },
    buySvip() {
      if (this.data.login) {
        let btnName;
        if (this.data.svip) {
          btnName = '会员中心'
          wx.navigateTo({
            url: '/pages/svipPackage/svipUserCenter/svipUserCenter'
          })
        } else {
          btnName = '1元抢购'
          //判断是否可以直接升级svip,2为直接升级
          if (this.data.isUpgrade == 2) {
            // svip 0元升级
            this.svipUpgrade()
          } else {
            if (this.data.canUseCoupon && this.data.canUseCoupon.is_own == 0) {
              //有可用抵扣券但未领取手动领取
              SvipApi.getSvipCoupon({
                couponId: this.data.canUseCoupon.coupon_id
              }).then((res) => {
                wx.navigateTo({
                  url: '/pages/svipPackage/paySvip/paySvip',
                })
              })
            } else {
              wx.navigateTo({
                url: '/pages/svipPackage/paySvip/paySvip',
              })
            }
          }
        }
        // 友盟统计
        wx.uma.trackEvent('click_SVIPhome', {
          cityId: wx.getStorageSync('cityId'),
          ButtonName: btnName,
          SourcePage: this.data.curPage
        });
        
      } else {
        wx.navigateTo({
          url: '/pages/login/login?next=home',
        })
      }
    },
    //0元升级接口
    svipUpgrade() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      // svip 0元升级
      SvipApi.svipUpgrade({
        cityId: wx.getStorageSync('cityId'),
        activityId: wx.getStorageSync('activityId'),
        src: "0yuan",
        uis: wx.getStorageSync('uis')
      }).then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          wx.navigateTo({
            url: '/pages/svipPackage/svipUserCenter/svipUserCenter?preFrom=zeroUpgrade&type=' + res.data.order_type
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    },
    toUsercenterHandle() {
      // 友盟统计
      wx.uma.trackEvent('click_SVIPhome', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '会员中心',
        SourcePage: this.data.curPage
      });
      wx.navigateTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
    },
  }
})