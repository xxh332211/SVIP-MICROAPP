// components/moreChooseOne/moreChooseOne.js
import {
  svip
} from "../../common/api/svipApi.js";
const SvipApi = new svip();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: {
      type: String
    },
    isLogin: {
      type: Boolean
    },
    isSvip: {
      type: Boolean
    },
    isUpgrade: {
      type: Number
    },
    moreChooseOneGoodsData: {
      type: Object
    },
    hasBuyFinish: {
      type: Boolean
    },
    moreChooseOneGoodsListData: {
      type: Object
    },
    mcoCurData: {
      type: Object
    },
    mcoCurPrice: {
      type: String
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showMoreChooseOneTips: false,
    buySuccessTips: false,
    hasBuyFinish: false,
    moreChooseOneGoodsData: null,
    curChooseData: null,
    payTimer: null
  },

  lifetimes: {
    attached() {
      if (this.data.from && this.data.from === 'svipUserCenter') {
        this.setData({
          isLogin: true,
          isSvip: true
        })
      }
      if (this.data.mcoCurData && this.data.mcoCurPrice) {
        this.setData({
          curChooseData: this.data.mcoCurData
        })
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toMore() {
      wx.navigateTo({
        url: `/pages/svipPackage/moreChooseOneDetail/moreChooseOneDetail`,
      })
    },
    buyHandle(e) {
      if (!this.data.isLogin) {
        wx.navigateTo({
          url: '/pages/login/login',
        })
        return
      }

      //判断是否可以直接升级svip,2为直接升级
      if (!this.data.isSvip && this.data.isUpgrade == 2) {
        // svip 0元升级
        this.svipUpgrade()
        return
      }

      if (!this.data.hasBuyFinish) {
        this.setData({
          showMoreChooseOneTips: true,
          curChooseData: e.currentTarget.dataset.item
        })
      }

    },
    closeSuccessPopup() {
      this.setData({
        buySuccessTips: false,
      })
    },
    toOrderList() {
      this.setData({
        buySuccessTips: false,
      })
      wx.navigateTo({
        url: "/pages-userInfo/pages/orderList/orderList?type=2"
      })
    },
    confirmPay() {
      clearTimeout(this.data.payTimer);
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      const _this = this;
      let params = {
        goodsId: this.data.curChooseData.goods_id,
        num: 1,
        payType: 3,
        orderSn: this.data.curChooseData.order_sn,
        send_type: 1,
        activity_type: 1,
        token: wx.getStorageSync('token'),
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }

      this.data.payTimer = setTimeout(() => {
        SvipApi.svipGoodsOrderSubmit(params).then((res) => {
          wx.hideLoading()
          if (res.status == 1) {
            wx.requestPayment({
              'timeStamp': res.data.time_stamp,
              'nonceStr': res.data.nonce_str,
              'package': res.data.package,
              'signType': "MD5",
              'paySign': res.data.pay_sign,
              'success': function (res) {
                wx.showToast({
                  title: '支付成功！',
                  duration: 1000,
                  success() {
                    _this.setData({
                      showMoreChooseOneTips: false,
                      buySuccessTips: true,
                    })
                  }
                })
              },
              'fail': function (res) {
                wx.showModal({
                  title: '购买失败!',
                  content: '购买出现问题，请尝试重新支付',
                  confirmColor: "#E5002D",
                  success(res) {
                    if (res.confirm) {
                      wx.showLoading({
                        title: '加载中...',
                        mask: true
                      })
                      SvipApi.svipGoodsOrderSubmit(params).then((res) => {
                        wx.hideLoading({
                          success: (res) => {},
                        })
                        if (res.status == 1) {
                          wx.requestPayment({
                            'timeStamp': res.data.time_stamp,
                            'nonceStr': res.data.nonce_str,
                            'package': res.data.package,
                            'signType': "MD5",
                            'paySign': res.data.pay_sign,
                            success() {
                              wx.showToast({
                                title: '支付成功！',
                                duration: 1000,
                                success() {
                                  _this.setData({
                                    showMoreChooseOneTips: false,
                                    buySuccessTips: true,
                                  })
                                }
                              })
                            },
                            fail() {
                              wx.showToast({
                                title: '支付失败！',
                                duration: 1000,
                              })
                            },
                            complete() {
                              wx.hideLoading()
                            }
                          })
                        }
                      })
                    }
                  }
                })
              },
              complete() {
                _this.setData({
                  mcoCurData: null,
                  mcoCurPrice: ''
                })
              }
            })
          } else {
            setTimeout(() => {
              wx.showToast({
                title: res.message,
                icon: "none",
                duration: 3000
              })
            }, 400);
          }
        })
      }, 500);


    },
    toBuySvip() {
      let curChooseData = JSON.stringify(this.data.curChooseData);
      let price = this.data.moreChooseOneGoodsData.choose_info.activity_price;
      this.setData({
        showMoreChooseOneTips: false
      })
      wx.navigateTo({
        url: `/pages/svipPackage/paySvip/paySvip?origin=mco&mcoCurData=${curChooseData}&mcoCurPrice=${price}`,
      })
    },
    closeTips() {
      this.setData({
        showMoreChooseOneTips: false
      })
    },
    closeSvipTips() {
      this.setData({
        mcoCurData: null,
        mcoCurPrice: ''
      })
    },
    toGoodsDetail(e) {
      let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/svipPackage/payProductDetail/payProductDetail?id=${id}&activity_type=1`,
      })
    },
    //0元升级接口
    svipUpgrade() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      // svip 0元升级
      SvipApi.svipUpgrade({
        cityId: wx.getStorageSync('cityId') || 1,
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
  }
})