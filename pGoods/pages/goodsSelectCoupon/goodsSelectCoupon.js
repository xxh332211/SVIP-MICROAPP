// pGoods/pages/goodsSelectCoupon/goodsSelectCoupon.js
import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    list: [],
    curId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let id = +options.id || 0
    let price = options.price || 0
    let goodsId = options.goodsId
    wx.showLoading()
    apiService('member/coupon/collection', 'GET', {
      productId: goodsId,
      venueCityId: wx.getStorageSync('cityId') || 1
    }).then(rst => {
      let list = []
      let curId
      let discount = 0
      for (let item of rst) {
        if (!item.usedTime && item.minAmount <= price) {
          // 哪个优惠力度大选哪个
          let d = item.couponType === 1 ? item.couponValue : price * (1 - item.couponValue / 100)
          if (d > discount) {
            curId = item.id
            discount = d
          }
          item.beginTime = utils.toDate(item.beginDate)
          item.endTime = utils.toDate(item.endDate)
          item.beginDate = utils.dateFormat(item.beginDate, 'YYYY/MM/DD')
          item.endDate = utils.dateFormat(item.endDate, 'YYYY/MM/DD')
          list.push(item)
        }
      }
      this.setData({
        curId: id || curId,
        list,
        loading: false
      })
      wx.hideLoading()
    }).catch(() => {
      this.setData({
        loading: false
      })
      wx.hideLoading()
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

  },

  select (evt) {
    this.setData({
      curId: evt.currentTarget.dataset.id === this.data.curId ? 0 : evt.currentTarget.dataset.id
    })
  },

  confirm () {
    const eventChannel = this.getOpenerEventChannel()
    if (this.data.curId > 0) {
      for (let t of this.data.list || []) {
        if (t.id === this.data.curId && t.endTime < new Date()) {
          wx.showToast({
            title: '此优惠券已失效',
            icon: 'none'
          })
          return
        }
      }
    }
    eventChannel.emit('useCoupon', {data: this.data.curId})
    wx.navigateBack()
  }
})