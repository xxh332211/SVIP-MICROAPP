// pages/tradeInPackage//My/Index.js
import {
  tradeIn
} from "../../../common/api/tradeInApi.js"
let tradeInApi = new tradeIn()
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
    //获取换购商品
    // this.setData({
    //   goodsList: [{
    //     goods_id: 111,
    //     redeem_price: 1,
    //     limit_svip: 1,
    //     goods_name: "商品名称",
    //     goods_image: "https://img.51jiabo.com/93094d45-539c-4381-98e7-db8f22bed5ca.png",
    //     origin_price: 999,
    //     stock: 0,
    //     need_orders: 1,
    //     status: 1,
    //     order_status_des:2
    //   }]
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
    //获取换购活动类型
    tradeInApi.checkTradeIn({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1 && res.data.isOnline == true) {
        if (res.data.exchange_method == 1) {
          this.setData({
            isXmb: true
          })
        }
      }
    })
    //我的换购订单
    tradeInApi.getMyTradeList({
      activityId: wx.getStorageSync('activityId'),
      userId: wx.getStorageSync('userInfo').uid
    }).then(res => {
      if (res.status == 1) {
        this.setData({
          goodsList: res.data
        })
      }
    })
  },

  toDetail(e) {
    let item = e.currentTarget.dataset.item;
    if (item.trade_in_type == 1) {
      //熊猫币换购订单
      wx.navigateTo({
        url: `/pages-xmb/pages/tradeIn/tradeDetail/tradeDetail?orderSn=${item.order_sn}`
      })
    } else {
      //订单换购
      wx.navigateTo({
        url: '/pages/tradeInPackage/tradeDetail/Index?orderSn=' + item.order_sn,
      })
    }
  },

  toTradeInList() {
    let page = getCurrentPages();
    let preRouter = page[page.length - 2] && page[page.length - 2].route;
    if (preRouter && (preRouter == "pages/tradeInPackage/List/Index" || preRouter == "pages-xmb/pages/tradeIn/List/List")) {
      wx.navigateBack()
    } else {
      if (this.data.isXmb) {
        wx.navigateTo({
          url: '/pages-xmb/pages/tradeIn/List/List',
        })
      } else {
        wx.navigateTo({
          url: '/pages/tradeInPackage/List/Index',
        })
      }
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

  }
})