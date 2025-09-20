// pages-abs/pages//exchangeList/exchangeList.js
import {
  absApi
} from "../../../common/api/absAPI.js"
const AbsApi = new absApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOffline: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    this.setData({
      cardId: options.cardId,
      cardOrderId: options.cardOrderId
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
    AbsApi.getExchangeGoods({
      card_id: this.data.cardId,
      card_order_id: this.data.cardOrderId
    }).then((res) => {
      let data = res;
      wx.hideLoading({
        success: () => {
          if (data.status == 1) {
            let bTime = data.data.card_info.use_begin_time.replace(/-/g, "/"),
              eTime = data.data.card_info.use_end_time.replace(/-/g, "/"),
              now = +new Date();
            if (now < +new Date(bTime) || now > +new Date(eTime)) {
              this.setData({
                isOffline: true
              })
              setTimeout(() => {
                //不在兑换时间提示
                wx.showToast({
                  title: '不在兑换卡使用时间内',
                  icon: "none",
                  duration: 3000
                })
              }, 1000);
            }
            data.data.card_info.use_begin_time = bTime.split(" ")[0].replace(/\//g, ".");
            data.data.card_info.use_end_time = eTime.split(" ")[0].replace(/\//g, ".");
            this.setData({
              cardInfo: data.data.card_info,
              goodsList: data.data.goods_list
            })
          }
        },
      })
    })
  },

  toConfirm(e) {
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '/pages-abs/pages/ConfirmOrder/ConfirmOrder?Entrance=3&id=' + item.prerogative_id + "&cardOrderId=" + this.data.cardOrderId + "&cardId=" + this.data.cardInfo.card_id
    })
  },

  toDetail(e) {
    let item = e.currentTarget.dataset.item;
    let type = 3;
    if (this.data.isOffline) {
      //不在兑换卡时间，则Entrance不传3，根据商品类型传相应值
      type = item.activity_price ? 2 : 1
    }
    wx.navigateTo({
      url: '/pages-abs/pages/productDetails/productDetails?Entrance=' + type + '&id=' + item.prerogative_id + "&cardOrderId=" + this.data.cardOrderId + "&cardId=" + this.data.cardInfo.card_id
    })
  },

  toggleRule() {
    this.setData({
      rulePopup: !this.data.rulePopup
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