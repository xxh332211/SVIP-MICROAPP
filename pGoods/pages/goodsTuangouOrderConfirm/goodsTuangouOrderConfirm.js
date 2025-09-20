// pGoods/pages/goodsOrderConfirm/goodsOrderConfirm.js
import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
import {
  util
} from "../../../common/util.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    grouponProductId: 0,
    info: {},
    coupons: [],
    curCoupon: null,
    count: 1,
    discount: 0,
    total: 0,
    payTotal: 0,
    isSvip: false,
    hasStock: true,
    originInfo: {},
    score: 0,
    scoreUsed: 0,
    useScore: false,
    percent: 0
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      grouponProductId: options.grouponProductId,
      count: +options.count || 1,
      orderId: +options.orderId === -1 ? -1 : +options.orderId
    })
    this.calcDiscount()
    this.loadData()
    this.setData({
      isSvip: wx.getStorageSync('isSvip')
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

  selectCoupon () {
    let ctx = this
    wx.navigateTo({
      url: '/pGoods/pages/goodsSelectCoupon/goodsSelectCoupon?price=' + (this.data.info.promotionPrice * this.data.count || 0) + '&goodsId=' + this.data.info.productId +
      '&id=' +
      ((ctx.data.curCoupon && ctx.data.curCoupon.id) || 0),
      events: {
        useCoupon ({data}) {
          ctx.setData({
            curCoupon: ctx.data.coupons.filter(e => e.id === data)[0] || null
          })
          ctx.calcDiscount()
        }
      }
    })
  },

  loadData () {
    // 加载商品详情,可用优惠券,可用积分
    wx.showLoading()
    let coupons = []
    let info = {}
    let originInfo = {}
    apiService('product/groupon/detail', 'GET', {
      grouponProductId: this.data.grouponProductId
    }).then(rst => {
      rst.product.activityBeginDate = rst.product.activityBeginDate
        ? utils.dateFormat(rst.product.activityBeginDate, 'MM.DD')
        : ''
      rst.product.activityEndDate = rst.product.activityEndDate
        ? utils.dateFormat(rst.product.activityEndDate, 'MM.DD')
        : ''
      info = rst.product
      let imgs = rst.images.filter(e => e.imageType === 2)
      if (imgs.length) {
        info.thunbmail = imgs[0].imageUrl || imgs[0].smallImageUrl
      }
      originInfo = rst
      apiService('member/coupon/collection', 'GET', {
        productId: info.productId,
        venueCityId: wx.getStorageSync('cityId') || 1
      }).then(rst => {
        coupons = rst
        let price = info.promotionPrice * (this.data.count || 1)
        coupons = coupons.filter(item => {
          if (!item.usedTime && item.minAmount <= price) {
            item.beginDate = utils.dateFormat(item.beginDate, 'YYYY-MM-DD')
            item.endDate = utils.dateFormat(item.endDate, 'YYYY-MM-DD')
            return true
          } else {
            return false
          }
        })
        info.price = price
        Promise.all([
          apiService('member/score/total', 'GET'),
          apiService('common/get/scoreUsage', 'GET')
        ])
          .then(rst => {
            wx.hideLoading()
            let score = Math.floor(rst[0].total)
            let percent = Math.floor(rst[1].usablePercent)
            this.setData({
              originInfo,
              info,
              coupons,
              score,
              percent
            })
            this.calcDiscount()
          })
          .catch(() => {})
      }).catch(() => {})
    }).catch(() => {})
  },

  useScoreChange (evt) {
    this.setData({
      useScore: evt.detail.value
    })
    this.calcDiscount()
  },

  calcPayTotal () {
    let total = Math.round((this.data.scoreUsed > 0 ? (this.data.total - this.data.scoreUsed / 100) : this.data.total) * 100) / 100
    total = total > 0 ? total : 0
    this.setData({
      payTotal: total
    })
  },

  calcDiscount () {
    if (!this.data.curCoupon) {
      this.data.discount = 0
    } else {
      this.data.discount = this.data.curCoupon.couponType === 1 ? this.data.curCoupon.couponValue : Math.round((this.data.info.promotionPrice * this.data.count) * (1 - this.data.curCoupon.couponValue / 100) * 100) / 100
    }
    const total = Math.round((this.data.info.promotionPrice * this.data.count - this.data.discount) * 100) / 100 || 0
    this.data.total = total > 0 ? total : 0
    let max =
      this.data.total * this.data.percent > this.data.score
        ? this.data.score
        : Math.floor(this.data.total * this.data.percent)
    this.setData({
      discount: this.data.discount,
      total: this.data.total,
      scoreUsed: this.data.useScore ? max : 0
    })
    this.calcPayTotal()
  },

  scoreInput (evt) {
    let val = +evt.detail.value || 0
    let max =
      this.data.total * 100 > this.data.score
        ? this.data.score
        : this.data.total * 100
    if (val > max) {
      wx.showToast({
        title: '此次最多使用' + max + '积分',
        icon: 'none',
        duration: 2000
      })
      val = max
    }
    this.setData({
      scoreUsed: Math.floor(val) || 0
    })
    this.calcPayTotal()
  },

  confirmOrder () {
    if (!this.data.info.grouponProductId) return
    if (this.data.scoreUsed > this.data.score || this.data.scoreUsed > this.data.total * 100) {
      wx.showToast({
        title: '积分不足',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if ((this.data.info.stock == 0) && !this.data.info.unlimitStock) {
      wx.showToast({
        title: '已售罄',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if ((this.data.info.stock < this.data.count) && !this.data.info.unlimitStock){
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.loading) return
    let ctx = this
    wx.showLoading()
    apiService('order/create', 'POST', {
      orderType: 2,
      productId: this.data.info.productId,
      count: this.data.count,
      couponCollectedId: this.data.curCoupon && this.data.curCoupon.id || 0,
      scoreUsed: this.data.scoreUsed,
      payType: 0,
      comment: '',
      grouponProductId: this.data.grouponProductId,
      grouponOrderId: this.data.orderId === -1 ? null : this.data.orderId
    }).then(rst => {
      if (rst.nonceStr) {
        wx.requestPayment({
          timeStamp: rst.timeStamp + '',
          nonceStr: rst.nonceStr,
          package: rst.package,
          signType: rst.signType,
          paySign: rst.paySign,
          success: function(){
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              complete () {
                // wx.redirectTo({
                //   url: '/pGoods/pages/goodsTuangouOrderList/goodsOrderList'
                // })
                wx.navigateTo({
                  url: '/pGoods/pages/goodsOrderDetail/goodsOrderDetail?id=' + rst.orderId
                })
              }
            })
            ctx.data.loading = false
          },
          fail: function(){
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              complete () {
                wx.navigateTo({
                  url: '/pGoods/pages/goodsOrderDetail/goodsOrderDetail?id=' + rst.orderId
                })
              }
            })
            ctx.data.loading = false
          }
        })
      } else {
        wx.navigateTo({
          url: '/pGoods/pages/goodsOrderDetail/goodsOrderDetail?id=' + rst.orderId
        })
        ctx.data.loading = false
      }
      wx.hideLoading()
      }).catch((err) => {
      wx.hideLoading()
      if (err.data.statusCode == 506) {
        ctx.setData({
          hasStock: false
        })
      }
    })
  }
})