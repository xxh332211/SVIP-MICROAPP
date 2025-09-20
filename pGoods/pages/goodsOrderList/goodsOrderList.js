// pGoods/pages/goodsOrderList/goodsOrderList.js
import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
Page({

  /**
   * 页面的初始数据
   * payStatus 0 未支付 1 已支付 2 退款中 3 已退款
   * orderStatus 0 待付款 1 用户取消 2 系统取消 3 待提货 4 已完成  5 已删除
   */
  data: {
    tab: 0,
    pagination: {
      totalSize: 0,
      pageIndex: 1,
      pageSize: 20
    },
    loading: false,
    list: [],
    statistic: {}
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
    this.loadData(1)
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

  switchTab (evt) {
    this.setData({
      list: [],
      tab: evt.currentTarget.dataset.idx
    })
    this.loadData(1)
  },
  loadData (pageIndex) {
    wx.showLoading()
    this.data.loading = true
    this.setData({
      loading: true
    })
    apiService('order/list', 'GET', {
      pageIndex: pageIndex || 1,
      pageSize: this.data.pagination.pageSize,
      viewType: this.data.tab
    }).then(rst => {
      let list = []
      for (let item of rst.items){
        item.endTime = utils.toDate(item.createTime)
        item.endTime.setMinutes(item.endTime.getMinutes() + 30)
        item.endTime = utils.dateFormat(item.endTime, 'YYYY/MM/DD HH:mm:ss')
      }
      if (pageIndex === 1) {
        list = rst.items
      } else {
        list = [...list, ...rst.items]
      }
      this.setData({
        list,
        pagination: rst.pagination,
        statistic: rst.statistic,
        loading: false
      })
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
      this.setData({
        loading: false
      })
    })
  },
  checkDataLoading () {
    if (!this.data.loading && this.data.list.length < this.data.pagination.totalSize) {
      this.loadData(this.data.pagination.pageIndex + 1)
    }
  },
  gotoDetail (evt) {
    wx.navigateTo({
      url: '/pGoods/pages/goodsOrderDetail/goodsOrderDetail?id=' + this.data.list[evt.currentTarget.dataset.index].id
    })
  },
  pay (evt) {
    let item = this.data.list[evt.currentTarget.dataset.index]
    let ctx = this
    wx.showLoading()
    apiService('order/payment/orderInfo', 'GET', {
      orderId: item.id
    }).then(rst => {
      if (rst.nonceStr) {
        wx.requestPayment({
          timeStamp: rst.timeStamp + '',
          nonceStr: rst.nonceStr,
          package: rst.package,
          signType: rst.signType,
          paySign: rst.paySign,
          success: function(res){
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              complete () {
                item.orderStatus = 3
                ctx.setData({
                  list: ctx.data.list
                })
              }
            })
          },
          fail: function(res){
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
          }
        })
      }
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },
  
  payTimeEnd (evt) {
    this.data.list[evt.currentTarget.dataset.index].orderStatus = 2
    this.setData({
      list: this.data.list
    })
  },

  remove (evt) {
    let item = this.data.list[evt.currentTarget.dataset.index]
    let ctx = this
    wx.showModal({
      title: '删除确认',
      content: '确定删除此订单吗?',
      showCancel: true,
      confirmColor: '#E6001B',
      success (res) {
        if (res.confirm) {
          wx.showLoading()
          apiService('order/delete?id=' + item.id, 'DELETE').then(() => {
            ctx.data.list.splice(evt.currentTarget.dataset.index, 1)
            ctx.setData({
              list: ctx.data.list
            })
            wx.hideLoading()
          }).catch(() => {
            wx.wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
            wx.hideLoading()
          })
        }
      }
    })
  },

  cancel (evt) {
    let item = this.data.list[evt.currentTarget.dataset.index]
    let ctx = this
    if (item.orderStatus === 0) {
      wx.showModal({
        title: '取消确认',
        content: '确定取消此订单吗?',
        showCancel: true,
        confirmColor: '#E6001B',
        success (res) {
          if (res.confirm) {
            wx.showLoading()
            apiService('order/cancel', 'PUT', {
              id: item.id
            }).then(() => {
              item.orderStatus = 1
              ctx.setData({
                list: ctx.data.list
              })
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
    } else {
      wx.navigateTo({
        url: '/pGoods/pages/goodsReturns/goodsReturns?id=' + item.id
      })
    }
  },
  
  confirm (evt) {
    let item = this.data.list[evt.currentTarget.dataset.index]
    let ctx = this
    wx.showModal({
      title: '提货确认',
      content: '确定提货操作吗?',
      showCancel: true,
      confirmColor: '#E6001B',
      success (res) {
        if (res.confirm) {
          wx.showLoading()
          apiService('order/close', 'PUT', {
            id: item.id
          }).then(() => {
            item.orderStatus = 4
            ctx.setData({
              list: ctx.data.list
            })
            wx.hideLoading()
          }).catch(() => {
            wx.wx.showToast({
              title: '操作失败',
              icon: 'none'
            })
            wx.hideLoading()
          })
        }
      }
    })
  }
})