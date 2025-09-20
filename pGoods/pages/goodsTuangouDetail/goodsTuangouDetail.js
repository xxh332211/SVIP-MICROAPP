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
    hasStock: '',
    started: false,
    ended: false,
    buyerOrders: [],
    isTuangou: true,
    // -1 是开团，其它是参团
    grouponOrderId: -1,
    grouponOrderIdInParams: -1,
    grouponOrderInfo: null,
    // 是否已参团
    alreadyIn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.grouponOrderIdInParams = +options.orderId || -1
    if (this.data.grouponOrderIdInParams > 0) {
      this.data.grouponOrderId = this.data.grouponOrderIdInParams
    }
    this.data.id = options.id
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
    apiService('product/groupon/detail', 'GET', {
      grouponProductId: this.data.id,
      grouponOrderId: this.data.grouponOrderIdInParams > 0 ? this.data.grouponOrderIdInParams : undefined
    })
      .then(rst => {
        if (!rst) {
          wx.showToast({
            title: '无效团购商品',
            icon: 'none',
            duration: 2000
          })
          wx.hideLoading()
          wx.switchTab({
            url: '/pages/goodsIndex/goodsIndex'
          })
        }
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
        if (video.length) {
          swiperData.push(video[0])
        }
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
          .map(e => ({ imageUrl: e.imageUrl, imageType: e.imageUrl && e.imageUrl.indexOf('?video') > -1 ? 'video' : 'image' }))
        let specs = (rst.product.tags || '').split(',').filter(e => e)
        rst.product.price = util.getGoodsPrice(rst.product)
        rst.product.grouponStartTime = utils.toDate(rst.product.grouponStartTime)
        rst.product.grouponEndTime = utils.toDate(rst.product.grouponEndTime)
        rst.product.grouponEndTimeStr = utils.dateFormat(rst.product.grouponEndTime, 'YYYY/MM/DD HH:mm:ss')
        let started = utils.toDate(rst.product.grouponStartTime) < new Date()
        let ended = utils.toDate(rst.product.grouponEndTime) < new Date()
        for (let item of rst.buyerOrders || []) {
          item.end = utils.toDate(item.createTime)
          item.end.setHours(item.end.getHours() + 24)
          item.ended = new Date() > item.end
          item.end = utils.dateFormat(item.end, 'YYYY/MM/DD HH:mm:ss')
        }
        rst.buyerOrders.sort((a, b) => utils.toDate(a.createTime) - utils.toDate(b.createTime))
        this.setData({
          started,
          ended,
          info: rst.product,
          swiperData,
          detailImgs,
          specs,
          originInfo: rst,
          hasStock: rst.product.stock > 0 || rst.product.unlimitStock,
          buyerOrders: rst.buyerOrders || [],
          grouponOrderIdInParams: this.data.grouponOrderIdInParams
        })
        wx.hideLoading()
      })
      .catch(() => {
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading()
      })
    let coupons = []
    let token = wx.getStorageSync('mall_token')
    if (token) {
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
    if (this.data.grouponOrderIdInParams > 0) {
      apiService('order/groupon/order/status', 'GET', {grouponOrderId: this.data.grouponOrderIdInParams}).then(rst => {
        if (rst) {
          let alreadyIn = false
          if (token) {
            for (let item of rst.users){
              if(item == token.id) {
                alreadyIn = true
                break
              }
            }
          }
          this.setData({
            grouponOrderInfo: rst,
            alreadyIn
          })
          if (rst.activityState !== 1) {
            wx.showToast({
              title: '您来晚了，活动已结束',
              icon: 'none',
              duration: 3000
            })
            return
          }
          if (rst.state === 2){
            wx.showToast({
              title: '您来晚了，该团已失效。开团购买吧',
              icon: 'none',
              duration: 3000
            })
            return
          }
          if (rst.state === 1){
            wx.showToast({
              title: '您来晚了，该团人数已满。开团购买吧',
              icon: 'none',
              duration: 3000
            })
            return
          }
          if (alreadyIn) {
            wx.showToast({
              title: '您已参与此拼单',
              icon: 'none',
              duration: 3000
            })
          }
        }
      }).catch(() => {})
    }
  },

  toIntro () {
    wx.navigateTo({
      url: '/pGoods/pages/goodsTuangouIntro/goodsTuangouIntro'
    })
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
  orderTimeEnd (evt) {
    let item = this.data.buyerOrders[evt.currentTarget.dataset.idx]
    item.ended = true
    this.setData({
      buyerOrders: this.data.buyerOrders
    })
  },
  buy1 (evt) {
    if (!this.checkLogin()) return
    // if (this.data.alreadyIn) {
    //   wx.showToast({
    //     title: '您已参与了拼单',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return
    // }
    if (!this.data.hasStock) {
      wx.showToast({
        title: '已售罄',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      isTuangou: false,
      buyModalVisible: true
    })
  },
  buy2: function (evt) {
    if (!this.checkLogin()) return
    if (!this.data.started) {
      wx.showToast({
        title: '活动还未开始',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.ended) {
      wx.showToast({
        title: '活动已结束',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.alreadyIn) {
      wx.showToast({
        title: '您已参与了拼单',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!this.data.hasStock) {
      wx.showToast({
        title: '已售罄',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      isTuangou: true,
      buyModalVisible: true,
      grouponOrderId: +evt.currentTarget.dataset.orderid
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

  checkLogin() {
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
    if (this.data.isTuangou) {
      wx.navigateTo({
        url: '/pGoods/pages/goodsTuangouOrderConfirm/goodsTuangouOrderConfirm?count=' + count + '&grouponProductId=' + this.data.info.grouponProductId + '&orderId=' + this.data.grouponOrderId
      })
    } else {
      wx.navigateTo({
        url: '/pGoods/pages/goodsOrderConfirm/goodsOrderConfirm?count=' + count + '&goodsId=' + this.data.info.productId
      })
    }
  }
})
