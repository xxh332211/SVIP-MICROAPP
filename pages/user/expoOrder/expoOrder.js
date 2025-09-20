// pages/user/expoOrder/expoOrder.js
let QRCode = require('../../../utils/qrcode.js')
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
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cityId: wx.getStorageSync('cityId')
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    marketingApi.prizeRule({
      city_id: wx.getStorageSync('cityId')
    }).then((res) => {
      console.log(res)
      if (res.status == 1) {
        if (!res.data.lottery_info || res.data.lottery_info.length == 0 || res.data.award_list.length == 0) {
          //活动规则 || 奖励播报列表 为空整条不显示
          this.setData({
            showReport: false
          })
        } else {
          this.setData({
            showReport: true,
            lotteryReport: res.data.award_list,
            lotteryRule: res.data.lottery_info.rule_name
          })
        }
      }
    })
    // 获取展届信息
    SvipApi.activityInfo({
      cityId: wx.getStorageSync("cityId")
    }).then((res) => {
      if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
        //展中
        this.setData({
          zhanzhong: true
        })
      }
    })
    this.getRequest()
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

  },

  getRequest() {
    marketingApi.getMyExpoOrder().then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          expoOrder: res.result ? res.result : []
        })
      } else {
        wx.showToast({
          title: res.message ? res.message : "加载失败",
          icon: "none"
        })
      }
    })
  },
  stop() {
    return false
  },
  // 抽奖按钮
  getLottery(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      loading: true
    })
    new QRCode("qrcode", {
      text: item.order_num,
      width: 130,
      height: 130,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    marketingApi.orderLottery({
      orderNum: item.order_num
    }).then((res) => {
      this.setData({
        loading: false
      })
      if (res.status == 1) {
        this.getRequest()
        this.setData({
          prizeInfo: res.data,
          showLottery: true
        })
      } else if (res.status == 2) {
        this.setData({
          showNotPrize: true
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },
  // 兑奖按钮
  redeemPrize(e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let item = e.currentTarget.dataset.item;
    new QRCode("qrcode", {
      text: item.order_num,
      width: 130,
      height: 130,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    marketingApi.getLotteryResult({
      orderNum: item.order_num
    }).then((res) => {
      wx.hideLoading({
        success: (res) => {},
      })
      if (res.status == 1) {
        this.setData({
          prizeInfo: res.data,
          showLottery: true
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },
  closeLottery() {
    this.setData({
      showNotPrize: false,
      showLottery: false
    })
  },
  toggleRule() {
    this.setData({
      rulePopup: !this.data.rulePopup
    })
  },
  toSelfHelp() {
    wx.navigateTo({
      url: '/pages/user/selfHelp/Index/Index',
    })
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

  }
})