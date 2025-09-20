// pGoods/pages/goodsReturns/goodsReturns.js
import apiService from '../../../common/http/httpService_mall'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    detail: '',
    reasons: ['不想要了', '计划有变，去不了现场了', '有了更好的选择'],
    curReason: 0,
    successModalShown: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = options.id
    this.loadData()
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

  loadData () {
    wx.showLoading()
    apiService('order/get', 'GET', {
      id: this.data.id
    }).then(rst => {
      this.setData({
        info: rst
      })
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  selectReason (evt) {
    this.setData({
      curReason: evt.currentTarget.dataset.idx
    })
  },

  back () {
    wx.navigateBack({
      delta: 1
    });
  },

  submit (evt) {
    let reason = this.data.reasons[this.data.curReason]
    let detail = evt.detail.value.detail || ''
    let ctx = this
    wx.showModal({
      title: '取消确认',
      content: '确定取消此订单吗?',
      showCancel: true,
      confirmColor: '#E6001B',
      success (res) {
        if (res.confirm) {
          wx.showLoading()
          apiService('order/cancel', 'PUT', {
            id: ctx.data.id,
            cancelReason: reason,
            cancelDescription: detail
          }).then(() => {
            if (ctx.data.info.realAmount) {
              ctx.setData({
                successModalShown: true
              })
            } else {
              ctx.back()
            }
            wx.hideLoading()
          }).catch(() => {
            wx.wx.showToast({
              title: '取消失败',
              icon: 'none'
            })
            wx.hideLoading()
          })
        }
      }
    })
  }
})