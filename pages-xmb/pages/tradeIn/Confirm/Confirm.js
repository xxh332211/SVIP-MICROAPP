// pages-xmb/pages//tradeIn/Confirm/Confirm.js
import {
  xmb
} from "../../../api/xmbApi.js";
const xmbApi = new xmb()
import {
  svip
} from "../../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  util
} from "../../../../common/util"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // info: {
    //   goods_image: "https://img.51jiabo.com/8e421c06-7bc6-40d0-8ef6-b639fe073982.jpg",
    //   stock: 100,
    //   goods_name: "上海定金商品1上海定金商品上海定金商品",
    //   sale_price: 9.9,
    //   origin_price: 1000,
    //   redeem_price: 200,
    //   limit_svip: 1,
    //   limit_buy: 0
    // }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goodsId: options.goodsId
    })
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
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
    this.getRequest()
  },
  getRequest() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //判断有无开放售卖svip
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      if (res.is_active == 0) {
        this.setData({
          disableBuySvip: true
        })
      }
    })
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          isLogin: true,
          mobile: res.data.mobile,
          svipMobile: res.data.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
          isSvip: res.data.svip == 1 ? true : false,
          totalXmb: res.data.panda_coin
        })
      } else {
        this.setData({
          mobile: "--",
          totalXmb: "--"
        })
      }
    })
    xmbApi.getConfirmTrade({
      redeemGoodsId: this.data.goodsId,
      activityId: wx.getStorageSync('activityId'),
      isPandaCoin: 1
    }).then(res => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          info: res.data
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  toXmbTradeInRule() {
    wx.navigateTo({
      url: '/pages-xmb/pages/tradeIn/Rule/Rule',
    })
  },
  toSvipHome() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  buySvip() {
    this.setData({
      showBuySvip: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip?origin=tradeInDetail',
    })
  },
  cancel() {
    this.setData({
      showBuySvip: false
    })
  },
  closeTips() {
    this.setData({
      tipsPopup: false
    })
  },
  //授权手机号
  getPhoneNumber(e) {
    let that = this
    util.authorizePhone(e, that.data.wxcode, () => {
      //获取页面所有接口信息
      that.getRequest()
    })
  },
  toSelfHelp() {
    this.setData({
      tipsPopup: false
    })
    wx.navigateTo({
      url: '/pages/user/selfHelp/Index/Index',
    })
  },
  toXmbTradeInList() {
    this.setData({
      tipsPopup: false
    })
    let page = getCurrentPages();
    let preRouter = page[page.length - 2] && page[page.length - 2].route;
    if (preRouter && preRouter == "pages-xmb/pages/tradeIn/List/List") {
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: '/pages-xmb/pages/tradeIn/List/List',
      })
    }
  },
  toTradeBuy() {
    //已登录
    if (this.data.info.limit_svip == 1) {
      //限制svip换购
      if (this.data.isSvip) {
        this.buyRequest()
      } else {
        this.setData({
          showBuySvip: true
        })
      }
    } else {
      this.buyRequest()
    }
  },
  buyRequest() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    xmbApi.getTradePayment({
      payType: 3,
      tradeInType: 1,
      redeemPrice: this.data.info.panda_coin,
      redeemGoodsId: this.data.info.redeem_goods_id,
      goodsId: this.data.info.goods_id,
      usableSupOrderId: "",
      token: wx.getStorageSync('token'),
      src: wx.getStorageSync('src') ? wx.getStorageSync('src') : 'YYXCX',
      uis: wx.getStorageSync('uis') ? wx.getStorageSync('uis') : '熊猫币换购确认换购'
    }).then((res) => {
      let orderSn = res.data.order_sn
      if (res.status == 1) {
        wx.showToast({
          title: '支付成功！',
          icon: 'none',
          mask: true,
          duration: 1000
        })
        setTimeout(() => {
          wx.hideLoading()
          wx.redirectTo({
            url: `/pages-xmb/pages/tradeIn/tradeDetail/tradeDetail?orderSn=${orderSn}`,
          })
        }, 1000)
      } else {
        wx.hideLoading()
        if (res.message == "您的熊猫币不足，无法换购此商品。") {
          //熊猫币不足提示弹层
          this.setData({
            tipsPopup: true
          })
          return
        }
        wx.showModal({
          title: '购买失败!',
          content: res.message ? res.message : "请求支付出错",
          confirmColor: "#E5002D",
          success(res) {

          }
        })
      }
    })
  },
  toSaleBuy(e) {
    let id = e.currentTarget.dataset.id
    //限制svip直接购买
    if (this.data.isSvip) {
      //是svip跳转svip商品购买页
      wx.navigateTo({
        url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id,
      })
    } else {
      this.setData({
        showBuySvip: true
      })
    }
  },
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
    return {
      title: "华夏家博",
      path: "/pages/getTicket/getTicket",
      imageUrl: "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
    }
  }
})