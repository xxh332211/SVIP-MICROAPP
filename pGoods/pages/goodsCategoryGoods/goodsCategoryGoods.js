// pGoods/pages/goodsCategoryGoods/goodsCategoryGoods.js
import apiService from '../../../common/http/httpService_mall'
import {
  util
} from "../../../common/util.js"
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
    orders: ['', 'sellingPrice', 'soldCount'],
    isSvip: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      isSvip: wx.getStorageSync('isSvip')
    })
    this.loadData(1)
    this.loadAdv()
    this.loadCategory()
  },

  loadCategory () {
    apiService('product/list/product/category').then(rst => {
      if(rst && rst.length) {
        for(var i = 0; i < rst.length; i++){
          if (rst[i].id === +this.data.id) {
            wx.setNavigationBarTitle({
              title: rst[i].categoryName
            })
            break
          } else {
            continue
          }
        }
      }
    })
  },

  loadAdv () {
    // apiService('common/advertisement', 'GET', {name: '商品组列表页banner运营位',  cityId: wx.getStorageSync('cityId')}).then(rst => {
    //   this.setData({
    //     advList1: JSON.parse(rst.imageUrl),
    //     advList2: JSON.parse(rst.linkUrl)
    //   })
    // })
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
  onShareAppMessage: function () {},

  loadMore () {
    if (this.data.loading) {
      return
    }
    this.loadData(this.data.pagination.pageIndex + 1)
  },

  loadData (pageIndex) {
    let index = +pageIndex || 1
    let items = []
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
    apiService('product/category/list', 'GET', {
      pageSize: this.data.pagination.pageSize,
      pageIndex: index,
      categoryId: this.data.id,
      orderBy:
        this.data.orderType === 0
          ? ''
          : this.data.orders[this.data.orderType] +
            (this.data.orderDesc ? ' desc' : ''),
      venueCityId: wx.getStorageSync('cityId') || 1
    })
      .then(rst => {
        for (let item of rst.items) {
          item.sellingPrice = util.getGoodsPrice(item)
          item.imageType = item.productImageUrl && item.productImageUrl.indexOf('?video') > -1 ? 'video' : 'image'
        }
        if (index === 1) {
          this.data.list = rst.items || []
        } else {
          this.data.list = [...this.data.list, ...rst.items]
        }
        this.data.pagination = rst.pagination
        this.setData({
          list: this.data.list,
          loading: false
        })
        wx.hideLoading()
      })
      .catch(() => {
        wx.hideLoading()
      })
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
    // if (this.data.orderType !== id) {
    //   this.setData({
    //     orderType: id,
    //     orderDesc: true
    //   })
    // } else {
    //   if (this.data.orderDesc) {
    //     this.setData({
    //       orderDesc: false
    //     })
    //   } else {
    //     this.setData({
    //       orderType: 0,
    //       orderDesc: true
    //     })
    //   }
    // }
    this.data.list = []
    this.data.pagination.totalCount = 0
    this.loadData(1)
  },

  goodsDetail (evt) {
    wx.navigateTo({
      url: '/pGoods/pages/goodsDetail/goodsDetail?id=' + evt.currentTarget.dataset.id
    })
  }
})
