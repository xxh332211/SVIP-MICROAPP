// pages-xmb/pages//tradeIn/tradeDetail/tradeDetail.js
import {
  svip
} from "../../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  xmb
} from "../../../api/xmbApi.js";
const xmbApi = new xmb()
let QRCode = require('../../../../utils/qrcode.js')
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
    this.setData({
      orderSn: options.orderSn
    })
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
    this.getUserInfo()
    this.getDetail("init")
  },
  getUserInfo() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          mobile: res.data.mobile,
          totalXmb: res.data.panda_coin
        })
      } else {
        this.setData({
          mobile: "--",
          totalXmb: "--"
        })
      }
    })
  },
  getDetail(from) {
    xmbApi.getTradeDetail({
      orderSn: this.data.orderSn
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          info: res.data
        })
        var beginDate = new Date(res.data.redeem_info.begin_time.replace(/-/g, '/')).getTime()
        var stopDate = new Date(res.data.redeem_info.stop_time.replace(/-/g, '/')).getTime()
        var dataTime = new Date().getTime()

        if (beginDate < dataTime && stopDate > dataTime) {
          //活动时间内
          this.setData({
            isActivetyTime: true
          })
        }
        if (beginDate < dataTime && stopDate > dataTime) {
          // 一进入页面显示二维码，网速慢容易显示不出来
          new QRCode("qrcode", {
            text: res.data.goods_order_info.verify_code,
            width: 170,
            height: 170,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
          new QRCode("qrcode", {
            text: res.data.goods_order_info.verify_code,
            width: 170,
            height: 170,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
        } else {
          new QRCode("qrcode", {
            text: res.data.goods_order_info.verify_code,
            width: 170,
            height: 170,
            colorDark: "#7F7F7F",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
          new QRCode("qrcode", {
            text: res.data.goods_order_info.verify_code,
            width: 170,
            height: 170,
            colorDark: "#7F7F7F",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
        }
        if (res.data.goods_order_info.delivered == 0 && !res.data.goods_refund_info.status && this.data.isActivetyTime && from) {
          //未核销 && 未退款 && 在活动时间内 && 其他页面进入 弹核销码
          this.setData({
            showCode: true
          })
        }
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
  // 查看券码
  getCode() {
    this.setData({
      showCode: true
    })
  },
  // 关闭券码弹窗
  closeCode() {
    this.getDetail()
    this.setData({
      showCode: false
    })
  },
  stop() {
    return false
  },
  getRefund() {
    wx.showLoading({
      title: '退款中...',
      mask: true
    })
    let data = {
      token: wx.getStorageSync('token'),
      orderSn: this.data.orderSn,
      cityId: wx.getStorageSync('cityId')
    }
    xmbApi.getRedeemGoodsRefund(data).then(res => {
      wx.hideLoading()
      if (res.status == 1) {
        this.getUserInfo()
        this.getDetail()
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none',
          mask: true
        })
      }
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
    return {
      title: "华夏家博",
      path: "/pages/getTicket/getTicket",
      imageUrl: "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
    }
  }
})