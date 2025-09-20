// pages-abs/pages/shoppingList/shoppingList.js
import {
  absApi
} from "../../../common/api/absAPI.js"
let AbsApi = new absApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.inviteId) {
      this.inviteId = options.inviteId;
      wx.setStorageSync('cityId', options.cityId)
      wx.setStorageSync("activityId", options.activityId)
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
    console.log(this.inviteId)
    wx.hideShareMenu({
      success: (res) => {},
    })
    this.setData({
      isLogin: wx.getStorageSync('isLogin')
    })

    //获取页面所有接口信息
    this.getRequestInfo()
  },

  getRequestInfo() {
    if (wx.getStorageSync('isLogin') && this.inviteId) {
      //加入分享
      AbsApi.joinShare({
        invite_id: this.inviteId
      }).then(res => {})
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //获取分享id
    AbsApi.getInviteId().then((res) => {
      if (res.status == 1) {
        this.byInviteId = res.data.invite_id;
      }
      //获取分享商品
      AbsApi.getShareGoods({
        invite_id: this.inviteId ? this.inviteId : this.byInviteId
      }).then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          this.setData({
            avatarList: res.data.avatar,
            goodsList: res.data.goods_list
          })
        }
      })
    })
  },

  toDetail(e) {
    let item = e.currentTarget.dataset.item;
    if (item.is_online === 1) {
      wx.navigateTo({
        url: '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' + item.id,
      })
    }
  },

  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  toMgg() {
    if (wx.getStorageSync('isLogin')) {
      wx.redirectTo({
        url: '/pages/mgg/mgg',
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
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
  onShareAppMessage: function (e) {
    return {
      title: '采购清单',
      imageUrl: "",
      path: '/pages-abs/pages/shoppingList/shoppingList?inviteId=' + (this.inviteId ? this.inviteId : this.byInviteId) + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId")
    }
  }
})