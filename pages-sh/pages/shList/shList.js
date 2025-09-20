// pages-sh/pages/shList/shList.js
import {
  shApply
} from "../../../common/api/shApi.js"
let shApplyApi = new shApply()
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
    shApplyApi.getApplyList({
      submitter_mobile: wx.getStorageSync('userInfo').mobile
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          applyList: res.data
        })
      }
    })
  },

  showBig(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.img],
    })
  },
  toDetail(e) {
    wx.navigateTo({
      url: `/pages-sh/pages/shDetail/shDetail?id=${e.currentTarget.dataset.item.id}`,
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
      path: "/pages/user/userHome",
      imageUrl: "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
    }
  }
})