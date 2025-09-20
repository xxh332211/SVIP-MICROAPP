// pages/svipPackage/getUnionId/getUnionId.js
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
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
  },

  getUserInfo(e) {
    wx.showLoading({
      title: '授权中...',
      mask: true
    })
    if (e.detail.errMsg != "getUserInfo:ok") {
      wx.hideLoading()
      wx.navigateBack({
        delta: 1,
      })
      return false
    }
    let userInfo = e.detail;
    SvipApi.addUnionId({
      mobile: wx.getStorageSync("userInfo").mobile,
      wxcode: this.data.wxcode,
      encryptedData: userInfo.encryptedData,
      offset: userInfo.iv,
      avatar: userInfo.userInfo.avatarUrl,
      nickname: userInfo.userInfo.nickName
    }).then((res) => {
      wx.hideLoading()
      wx.navigateBack({
        delta: 1,
      })
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