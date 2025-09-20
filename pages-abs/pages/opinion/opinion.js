// pages-abs/pages/opinion/opinion.js
import {
  absApi
} from "../../../common/api/absAPI.js"
let AbsApi = new absApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    opinion: ""
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

  },
  opinionInput(e) {
    this.data.opinion = e.detail.value
  },
  submit() {
    if (!wx.getStorageSync("isLogin")) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return false
    }
    if (!this.data.opinion) {
      wx.showToast({
        title: '请输入内容后提交',
        icon: "none",
        duration: 3000
      })
      return
    }
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    console.log(this.data.opinion)
    AbsApi.addOpinion({
      content: this.data.opinion
    }).then((res) => {
      let resData = res;
      console.log(resData)
      wx.hideLoading({
        success: () => {
          if (resData.status == 1) {
            wx.showToast({
              title: '感谢您的宝贵意见，华夏家博会欢迎您~',
              icon: "none",
              duration: 3000,
              mask: true,
              complete() {}
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
                fail() {
                  wx.navigateTo({
                    url: '/pages/mgg/mgg',
                  })
                }
              })
            }, 3000);
          } else {
            wx.showToast({
              title: resData.message,
              icon: "none"
            })
          }
        },
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