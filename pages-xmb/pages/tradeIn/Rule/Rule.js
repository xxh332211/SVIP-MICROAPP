// pages-xmb/pages//tradeIn/Rule/Rule.js
import {
  xmb
} from "../../../api/xmbApi.js";
const xmbApi = new xmb()
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
    xmbApi.getTradeInRule({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then(res => {
      if (res.status == 1) {
        this.setData({
          tradeRuld: res.data.rules
        })
      }
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