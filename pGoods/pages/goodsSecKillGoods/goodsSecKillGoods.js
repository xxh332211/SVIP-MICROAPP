// pGoods/pages/goodsCategoryGoods/goodsCategoryGoods.js
import apiService from '../../../common/http/httpService_mall'
import { util } from '../../../common/util.js'
import utils from '../../../utils/utils'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderType: 0,
    orderDesc: true,
    pagination: {
      pageSize: 20,
      pageIndex: 1,
      totalCount: 0
    },
    list: [],
    loading: false,
    orders: ['', 'promotionPrice', 'soldCount'],
    seckill: {},
    started: false,

    coupons: [],
    couponModalVisible: false,

    shareData: {},
    banners: [],
    shareModalVisbile: false,
    posterModalVisible: false,
    shareUrl: undefined,
    shareScene: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      shareUrl: 'pGoods/pages/goodsSecKillGoods/goodsSecKillGoods',
      shareScene: 'cityId='+ (wx.getStorageSync('cityId') || 1) + '&sessionId=' + wx.getStorageSync('sessionId')
    })
    this.loadData(1)
    this.loadAdv()
  },

  loadAdv () {
    apiService('common/advertisement', 'GET', {name: '限时活动商品列表页', column: '限时活动页', position: '商品上方', cityId: wx.getStorageSync('cityId') || 1}).then(rst => {
      this.setData({
        banners: rst || []
      })
    })
  },

  isTab (url) {
    let tabUrls = [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/home/home',
      'pages/user/userHome'
    ]
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  toUrl (evt) {
    let url = evt.currentTarget.dataset.url
    if (!url) return
    if (url.indexOf('http') === 0) {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url)
      })
    } else {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const { title, path } = this.data.shareData
    this.closeShareModal()
    return {
      title: title,
      path: path,
      success: function (res) {
        wx.showToast({
          title: "分享成功",
          icon: 'success',
          duration: 2000
        })
      }
    }
  },

  loadMore () {
    if (this.data.loading) {
      return
    }
    this.loadData(this.data.pagination.pageIndex + 1)
  },

  loadData (pageIndex) {
    let index = +pageIndex || 1
    if (
      this.data.pagination.totalCount > 0 &&
      this.data.list.length >= this.data.pagination.totalCount
    ) {
      return
    }
    wx.showLoading()
    this.setData({
      loading: true
    })
    apiService('product/seckill/list', 'GET', {
      pageSize: this.data.pagination.pageSize,
      pageIndex: index,
      orderBy:
        this.data.orderType === 0
          ? ''
          : this.data.orders[this.data.orderType] +
            (this.data.orderDesc ? ' desc' : ''),
      venueCityId: wx.getStorageSync('cityId') || 1
    })
      .then(rst => {
        let shareImages = []
        for (let item of rst.items || []) {
          item.progress = Math.floor(
            (item.soldCount / (item.soldCount + item.stock)) * 100
          )
          if (item.imageUrl && item.imageUrl.indexOf('?video') > -1) {
            item.imageType = 'video'
          } else {
            item.imageType = 'image'
            shareImages.push(item.imageUrl)
          }
        }
        let seckill = rst.seckill
        let started = utils.toDate(seckill.startTime) < new Date()
        if (index === 1) {
          this.data.list = rst.items || []
        } else {
          this.data.list = [...this.data.list, ...rst.items]
        }
        this.data.pagination = rst.pagination
        let timeStart = utils.dateFormat(utils.toDate(seckill.startTime), 'MM.dd')
        let timeEnd = utils.dateFormat(utils.toDate(seckill.endTime), 'MM.dd')
        let timeEndDetail = utils.dateFormat(utils.toDate(seckill.endTime), 'MM.dd日 HH:mm')
        this.setData({
          list: this.data.list,
          loading: false,
          started,
          seckill,
          shareInfo: {
            title: seckill.title,
            images: shareImages,
            timeStart: timeStart,
            timeEnd: timeEnd,
            timeEndDetail: timeEndDetail
          }
        })
        wx.hideLoading()
        this.setData({
          shareData: {
            title: '您的好友分享一件限时抢购商品，快来看看吧！',
            path:
              '/pGoods/pages/goodsSecKillGoods/goodsSecKillGoods?' +
              'cityId=' +
              (wx.getStorageSync('cityId') || 1) +
              '&sessionId=' +
              wx.getStorageSync('sessionId')
          }
        })
      })
      .catch(() => {
        wx.hideLoading()
      })

    let coupons = []
    let token = wx.getStorageSync('mall_token')
    if (token) {
      apiService('member/coupon/list', 'GET', {
        venueCityId: wx.getStorageSync('cityId') || 1
      })
        .then(rst => {
          for (let item of rst || []) {
            item.discountValue =
              item.couponType === 1
                ? item.couponVAlue
                : Math.round(item.couponValue) / 10
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

  switchOrder (evt) {
    let id = evt.currentTarget.dataset.id
    if (id === 2 || id === 0) {
      this.setData({
        orderType: id,
        orderDesc: true
      })
    } else if (id === 1) {
      this.setData({
        orderType: 1,
        orderDesc: this.data.orderType === id ? !this.data.orderDesc : true
      })
    }
    this.data.list = []
    this.data.pagination.totalCount = 0
    this.loadData(1)
  },

  goodsDetail (evt) {
    wx.navigateTo({
      url:
        '/pGoods/pages/goodsSeckillDetail/goodsSeckillDetail?id=' +
        evt.currentTarget.dataset.id
    })
  },
  showCouponModal () {
    if (!this.checkLogin()) return
    this.setData({
      couponModalVisible: true
    })
  },
  closeCouponModal: function (evt) {
    this.setData({
      couponModalVisible: false
    })
  },
  checkLogin () {
    let token = wx.getStorageSync('mall_token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  },

  showShareModal (ev) {
    this.setData({
      shareModalVisbile: true
    })
  },

  closeShareModal () {
    this.setData({
      shareModalVisbile: false
    })
  },

  showPosterModal () {
    this.setData({
      shareModalVisbile: false,
      posterModalVisible: true
    })
  },

  closePosterModal () {
    this.setData({
      posterModalVisible: false
    })
  }
})
