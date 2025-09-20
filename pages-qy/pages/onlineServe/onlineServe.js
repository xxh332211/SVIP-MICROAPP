// pages-qy/pages/onlineServe/onlineServe.js
// components/onlineServe/onlineServe.js
var myPluginInterface = requirePlugin('myPlugin');
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
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
    var appId = 'KXnnSrJKSbW';
    myPluginInterface.__configAppId(appId); // 不是微信的appId，是七鱼后台生成的appId
    myPluginInterface._$configAppKey('d03f408a881fa08e7103a32484a3e4d6'); // 申请企业的appKey
    var userInfo = wx.getStorageSync('qyUserInfo');
    myPluginInterface._$setUserInfo(userInfo);
    wx.redirectTo({
      url: 'plugin://myPlugin/chat',
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