import apiService from '../../../common/http/httpService_mall'
import {
  util
} from "../../../common/util.js"
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
    started: false,
    ended: false,

    coupons: [],
    couponModalVisible: false,

    title: '',
    subDesc: '',

    banners: [],

    shareData:{
    },
    shareModalVisbile: false,
    posterModalVisible: false,
    shareInfo: {
      title: '拼团活动',
      images: []
    },
    shareUrl: undefined,
    shareScene: undefined,
    sharedVenueCityId: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', options)
    this.data.sharedVenueCityId = options.cityId
    this.loadData(1)
    this.loadAdv()
    this.setData({
      shareTitle: this.data.title + ' - ' + this.data.subDesc,
      shareUrl: "pGoods/pages/goodsTuangouGoods/goodsTuangouGoods",
      shareScene: "cityId=" + (wx.getStorageSync('cityId') || 1) + "&sessionId=" + wx.getStorageSync("sessionId")
    })
  },

  timeEnd () {
    this.setData({
      ended: true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.title + ' - ' + this.data.subDesc,
      path: "pGoods/pages/goodsTuangouGoods/goodsTuangouGoods?" + "cityId=" + (wx.getStorageSync('cityId') || 1) + "&sessionId=" + wx.getStorageSync("sessionId")
    }
  },

  loadMore () {
    console.log('.....')
    if (this.data.loading) {
      return
    }
    this.loadData(this.data.pagination.pageIndex + 1)
  },

  loadAdv () {
    apiService('common/advertisement', 'GET', {name: '拼团活动商品列表页', column: '拼团活动页', position: '商品上方', cityId: wx.getStorageSync('cityId') || 1}).then(rst => {
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
    apiService('product/groupon/list', 'GET', {
      pageSize: this.data.pagination.pageSize,
      pageIndex: index,
      orderBy:
        this.data.orderType === 0
          ? ''
          : this.data.orders[this.data.orderType] +
            (this.data.orderDesc ? ' desc' : ''),
      venueCityId: this.data.sharedVenueCityId || wx.getStorageSync('cityId') || 1
    })
      .then(rst => {
        apiService('product/groupon/info', 'GET', {
          id: rst.items[0].grouponId || 1
        }).then(d => {
          this.setData({
            title: d.title,
            subDesc: d.description,
            shareData: {
              title: d.title + ' - ' + d.description,
              path: "/pGoods/pages/goodsTuangouGoods/goodsTuangouGoods?" + "cityId=" + (wx.getStorageSync('cityId') || 1) + "&sessionId=" + wx.getStorageSync("sessionId")
            }
          })
        })
        let imagesToShare = []
        for (let i = 0; i < (rst.items || []).length; i++) {
          if (rst.items[i].imageUrl && rst.items[i].imageUrl.indexOf('?video') > -1 ) {
            rst.items[i].imageType = 'video'
          } else {
            rst.items[i].imageType = 'image'
            if(rst.items[i].imageUrl) {
              imagesToShare.push(rst.items[i].imageUrl)
            }
          }
          this.refreshItemState(i, rst.items)
        }
        if (index === 1) {
          this.data.list = rst.items || []
        } else {
          this.data.list = [...this.data.list, ...rst.items]
        }
        this.data.pagination = rst.pagination
        this.setData({
          list: this.data.list,
          loading: false,
          shareInfo: {
            images: imagesToShare
          }
        })
        wx.hideLoading()
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
            item.discountValue = item.couponType === 1 ? item.couponVAlue : Math.round(item.couponValue) / 10
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

  refreshItemState (index, list) {
    if (!list) {
      list = this.data.list
    }
    let item = list[index]
    item.started = utils.toDate(item.grouponStartTime) < new Date()
    item.ended = utils.toDate(item.grouponEndTime) < new Date()
  },

  onEnd (evt) {
    this.refreshItemState(evt.currentTarget.dataset.idx)
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

  toIntro () {
    wx.navigateTo({
      url: '/pGoods/pages/goodsTuangouIntro/goodsTuangouIntro'
    })
  },

  goodsDetail (evt) {
    wx.navigateTo({
      url: '/pGoods/pages/goodsTuangouDetail/goodsTuangouDetail?id=' + evt.currentTarget.dataset.id
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

  onTimeEnd(evt){
    this.data.list[evt.currentTarget.dataset.idx].ended = true
    this.setData({
      list: this.data.list
    })
  },

  checkLogin () {
    let token = wx.getStorageSync('mall_token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return false
    }
    return true
  },

  showShareModal () {
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
