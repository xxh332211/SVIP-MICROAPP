// pages/svipPackage//moreChooseOneDetail/moreChooseOneDetail.js
import {
  svip
} from "../../../common/api/svipApi.js";
const SvipApi = new svip();
const app = getApp();
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    isSvip: false,
    showMoreChooseOneTips: false,
    buySuccessTips: false,
    hasBuyFinish: false,
    moreChooseOneGoodsData: null,
    payTimer: null,
    curChooseData: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let cityId = wx.getStorageSync('cityId');
    this.setData({
      isLogin: wx.getStorageSync('isLogin'),
      isSvip: wx.getStorageSync('isSvip')
    })
    if (cityId) {
      SvipApi.activityInfo({
        cityId
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        // n选1活动商品列表
        this.moreChooseOneGoodsListReq();
      })
    } else {
      wx.navigateTo({
        url: '/pages/address/index?src=morechoose',
      })
    }
    if (this.data.mcoCurData && this.data.mcoCurPrice) {
      this.setData({
        curChooseData: this.data.mcoCurData
      })
    }
  },

  // n选1活动商品列表
  moreChooseOneGoodsListReq() {
    SvipApi.moreChooseOneGoodsList().then(res => {
      if (res.status == 1 && res.data.goods_list) {
        let hasBuyFinish = res.data.goods_list.some(item => {
          return item.order_id > 0
        })
        this.setData({
          moreChooseOneGoodsData: res.data,
          hasBuyFinish
        })
        let navText = res.data.choose_info.activity_name;
        if (res.data.choose_info.activity_name.length > 8) {
          navText = res.data.choose_info.activity_name.substr(0, 8) + '...'
        }
        wx.setNavigationBarTitle({
          title: navText,
        })
      }
    })
  },

  buyHandle(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
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
      SvipApi.svipGoodsOrderSubmit(params, 'POST').then((res) => {
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
                  _this.moreChooseOneGoodsListReq();
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
                                _this.moreChooseOneGoodsListReq();
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
    // let isBuy = e.currentTarget.dataset.isbuy ? 1 : 0;
    wx.navigateTo({
      url: `/pages/svipPackage/payProductDetail/payProductDetail?id=${id}&activity_type=1`,
    })
  },

  // 判断url是否为tabbar
  isTab(url) {
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },

  toUrl(e) {
    let url = e.currentTarget.dataset.item.url;
    if (!url) return
    let type = e.currentTarget.dataset.item.type;
    let app_id = e.currentTarget.dataset.item.app_id;
    if (type == 1) {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    } else if (type == 2) {
      wx.navigateToMiniProgram({
        appId: app_id,
        path: url
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url)
      })
    }
  },
})