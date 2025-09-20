// pages-userInfo/pages/wechat/info.js
import {
  config
} from '../../../common/config/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: config.url,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,'options')
    this.setData({
      codeImg: options?.qr_url,
      // id:options?.id
    })
    // let that=this
    // wx.showLoading()
    // wx.request({
    //   method: 'GET',
    //   url: this.data.baseUrl + `/wechaturl/wechatqrurl?id=${options?.id}`,
    //   success(data) {
    //     console.log(data)
    //     wx.hideLoading()
    //     that.setData({
    //       resImg: data?.data?.data
    //     })
      // },
      // fail(err) {
      //   console.log('失败了')
      // }
    // })
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

  }
})