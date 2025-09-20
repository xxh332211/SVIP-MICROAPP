// pGoods/pages/goodsDetail/goodsDetail.js
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
    id: 0,
    info: {},
    current: 0,
    swiperData: [],
    curTab: 0,
    detailImgs: [],
    specs: [],
    buyModalVisible: false,
    couponModalVisible: false,
    coupons: [],
    originInfo: {},
    isSvip: false,
    svipDiscount: 0,
    hasStock: '',
    shareData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = options.id || 1
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isSvip: wx.getStorageSync('isSvip')
    })
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  loadData () {
    wx.showLoading()
    apiService('product/detail', 'GET', {
      id: this.data.id
    })
      .then(rst => {
        rst.product.activityBeginDate = rst.product.activityBeginDate
          ? utils.dateFormat(rst.product.activityBeginDate, 'MM.DD')
          : ''
        rst.product.activityEndDate = rst.product.activityEndDate
          ? utils.dateFormat(rst.product.activityEndDate, 'MM.DD')
          : ''
        let swiperData = []
        let imgs = (rst.images || [])
          .filter(e => e.imageType === 4)
          .map(e => {
            if (e.imageUrl && e.imageUrl.indexOf('?video') > -1) {
              return {
                type: 'video',
                url: e.imageUrl
              }
            }
            return {
              type: 'image',
              url: e.imageUrl
            }
          })
        let video = imgs.filter(e => e.imageType === 'video')
        swiperData = [...swiperData, ...imgs]
        for (let i = 0; i < swiperData.length; i++) {
          if (swiperData[i].type === 'image') {
            if (video.length) {
              swiperData[i].label = i + ''
            } else {
              swiperData[i].label = i + 1 + ''
            }
          }
        }
        let detailImgs = (rst.images || [])
          .filter(e => e.imageType === 1 || e.imageType === 3)
          .map(e => ({ imageUrl: e.imageUrl, imageType: e.imageUrl.indexOf('?video') > -1 ? 'video' : 'image' }))
        let specs = (rst.product.tags || '').split(',').filter(e => e)
        rst.product.price = util.getGoodsPrice(rst.product)
        this.setData({
          info: rst.product,
          swiperData,
          detailImgs,
          specs,
          originInfo: rst,
          svipDiscount: rst.product.catalog === 3 ? Math.round((rst.product.sellingPrice - rst.product.catalogValue) * 100) / 100 : 0,
          hasStock: rst.product.unlimitStock || rst.product.stock > 0
        })
        this.setData({
          shareData: {
            title: '您的好友分享了一件商品，快来看看吧！',
            path:
              '/pGoods/pages/goodsDetail/goodsDetail?id=' + this.data.id +
              '&cityId=' +
              (wx.getStorageSync('cityId') || 1)+
              '&sessionId=' +
              wx.getStorageSync('sessionId')
          }
        })
        wx.hideLoading()
      })
      .catch((ex) => {
        console.log(ex)
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading()
      })
    let coupons = []
    let token = wx.getStorageSync('mall_token')
    let t1 = wx.getStorageSync('token')
    if (token && t1) {
      apiService('member/coupon/list', 'GET', {
        venueCityId: wx.getStorageSync('cityId') || 1,
        productId: this.data.id
      })
        .then(rst => {
          for (let item of rst || []) {
            item.discountValue = item.couponType === 1 ? item.couponValue : Math.round(item.couponValue) / 10
          }
          coupons = rst || []
          this.setData({
            coupons
          })
        })
        .catch(() => {
          this.setData({
            coupons
          })
        })
    }
  },

  onSwiperChange: function (evt) {
    this.setData({
      current: evt.detail.current
    })
  },
  onTabClick: function (evt) {
    this.setData({
      curTab: evt.target.dataset.id
    })
  },
  buy: function (evt) {
    if (!this.checkLogin()) return
    if (!this.data.hasStock) {
      wx.showToast({
        title: '已售罄',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      buyModalVisible: true
    })
  },
  showCouponModal () {
    if (!this.checkLogin()) return
    this.setData({
      couponModalVisible: true
    })
  },
  closeBuyModal: function (evt) {
    this.setData({
      buyModalVisible: false
    })
  },
  closeCouponModal: function (evt) {
    this.setData({
      couponModalVisible: false
    })
  },

  checkLogin () {
    let token = wx.getStorageSync('mall_token')
    let t1 = wx.getStorageSync('token')
    if (!token || !t1) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return false
    }
    return true
  },

  // 下单
  confirmOrder (evt) {
    this.closeBuyModal()
    let count = evt.detail.value
    wx.navigateTo({
      url: '/pGoods/pages/goodsOrderConfirm/goodsOrderConfirm?count=' + count + '&goodsId=' + this.data.id
    })
  },

  buySvip () {
    wx.switchTab({
      url: '/pages/home/home'
    })
  }
})
