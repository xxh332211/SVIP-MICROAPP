import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()
import {
  marketing
} from "../../../common/api/marketingApi"
let MarketApi = new marketing()
import {
  absApi
} from "../../../common/api/absAPI.js"
let AbsApi = new absApi()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  util
} from "../../../common/util.js"
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showLive: true,
    findIndex: 0,
    salesUp: false,
    salesDown: false,
    pricesUp: false,
    pricesDown: false,
    showTicket: false,
    imgheights: [], //所有图片的高度  
    current: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (options.getPageBoolean) {
      this.setData({
        getPageBoolean: options.getPageBoolean
      })
    }
    this.setData({
      supplier_id: options.supplier_id
    })
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis) 
    }

    let cityId = wx.getStorageSync('cityId');

    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index',
      })
      return
    } else if (cityId) {
      //获取页面所有接口信息
      this.getRequestInfo()
    } else {
      //定位
      util.getPositionCity("", () => {
        //定位成功请求数据
        this.getRequestInfo()
      })
    }
  },
  getRequestInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      this.shopDetail()
      this.hxjbLiveList()
    })
  },
  imageLoad(e) {
    //当图片载入完毕时
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    // 计算的高度值
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;
    this.setData({
      imgheights: imgheights
    })
  },
  bindchange: function (e) { // current 改变时会触发 change 事件
    this.setData({
      current: e.detail.current
    })
  },
  // 点击按钮返回顶部
  posTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  // 领取优惠券
  couponBtn(e) {
    if (wx.getStorageSync('token')) {
      var coupon_id = e.currentTarget.dataset.coupon_id
      var user_id = e.currentTarget.dataset.user_id
      if (user_id > 0) {
        return
      } else {
        this.setData({
          coupon_id: coupon_id
        })
        this.MarketApi()
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }

  },
  quanbu(e) {
    var map = JSON.stringify(e.currentTarget.dataset.map)
    console.log(e)
    console.log(map)
    wx.navigateTo({
      url: '../address/address?map=' + map,
    })
  },
  // 点击直播小窗口
  forkBtn() {
    this.setData({
      showLive: false
    })
  },
  goodStore(e) {
    var arg = e.currentTarget.dataset.name
    if (arg == 'synthesize') {
      this.setData({
        findIndex: 0,
        priceUp: false,
        priceDown: false,
        salesUp: false,
        salesDown: false
      })
      this.shopDetail()
    } else if (arg == 'sales') {
      if (this.data.salesDown == true) {
        var salesUp = true
        var salesDown = false
        this.setData({
          sort: 'sold_stock_count,asc'
        })
      } else {
        var salesUp = false
        var salesDown = true
        this.setData({
          sort: 'sold_stock_count,desc'
        })
      }
      this.setData({
        findIndex: 1,
        salesUp,
        salesDown,
        priceUp: false,
        priceDown: false
      })
      this.privilegeList()
    } else if (arg == 'price') {
      if (this.data.priceUp == true) {
        var priceUp = false
        var priceDown = true
        this.setData({
          sort: 'needPay,desc'
        })
      } else {
        var priceUp = true
        var priceDown = false
        this.setData({
          sort: 'needPay,asc'
        })
      }
      this.setData({
        findIndex: 2,
        priceUp,
        priceDown,
        salesUp: false,
        salesDown: false
      })
      this.privilegeList()
    }
  },
  //去商品详情页
  toGoodsDetail(e) {
    var actPrice = e.currentTarget.dataset.item.activity_price;
    var id = e.currentTarget.dataset.item.id;
    wx.navigateTo({
      url: `/pages-abs/pages/productDetails/productDetails?Entrance=${actPrice > 0?'2':'1'}&id=${id}`,
    })
  },
  // 点击橱窗进入详情
  detailnav(e) {
    var actPrice = e.currentTarget.dataset.item.activity_price;
    var id = e.currentTarget.dataset.item.id;
    if (actPrice > 0) {
      //秒光光商品跳转秒光光商品详情
      wx.navigateTo({
        url: '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' + id,
      })
    } else {
      if (this.data.liveId) {
        if (this.data.getPageBoolean) {
          wx.redirectTo({
            url: '../shopDetail/shopDetail?id=' + id + "&liveId=" + this.data.liveId + "&liveImg=" + this.data.liveImg
          })
        } else {
          wx.navigateTo({
            url: '../shopDetail/shopDetail?id=' + id + "&liveId=" + this.data.liveId + "&liveImg=" + this.data.liveImg
          })
        }
      } else {
        if (this.data.getPageBoolean) {
          wx.redirectTo({
            url: '../shopDetail/shopDetail?id=' + id
          })
        } else {
          wx.navigateTo({
            url: '../shopDetail/shopDetail?id=' + id
          })
        }
      }
    }
  },
  // 点击直播间图片进入直播小程序
  navLive(e) {
    wx.navigateToMiniProgram({
      appId: 'wx8e0746fdfcbf770c',
      path: '/pages/liveRoom/liveRoom?token=' + wx.getStorageSync('token') + '&cityId=' + wx.getStorageSync('cityId') + '&liveId=' + e.currentTarget.dataset.live_id,
      envVersion: "trial"
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  onPageScroll(e) {
    if (e.scrollTop > 500) {
        this.setData({
            showToTop: true
        })
    } else {
        this.setData({
            showToTop: false
        })
    }
  },
  onShareAppMessage() {
    return {
      title: '华夏家博会，60天买贵就退',
      imageUrl: "https://img.51jiabo.com/238c79f5-fcbf-4889-8a71-c4a6a52ea9e3.jpg",
      path: `/pages-live/pages/storeDetail/storeDetail?supplier_id=${this.data.supplier_id}&getPageBoolean=true&userCityId=${(wx.getStorageSync('cityId') || 1)}&src=${wx.getStorageSync('src')}&uis=${wx.getStorageSync('uis')}`
    }
  },
  // 页面详情
  shopDetail() {
    wx.showLoading({
      title: '加载中',
      mask: true

    })
    var data = {
      City: wx.getStorageSync('cityId'),
      Activity: wx.getStorageSync('activityId'),
      supplier_id: this.data.supplier_id,
      Token: wx.getStorageSync('token')
    }
    LiveApi.shopDetail(data).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        wx.setNavigationBarTitle({
          title: res.result.shop_name
        })
        // res.result.coupon = [{
        //   coupon_value: 100,
        //   consume_amount: 3000,
        //   begin_date: "2020-10-12 12:12:12",
        //   end_date: "2020-10-12 12:12:12",
        //   coupon_name: "TOTO卫浴",
        //   user_id: 3975839,
        //   quantity:100,
        //   use_count:10
        // }, {
        //   coupon_value: 100,
        //   consume_amount: 3000,
        //   begin_date: "2020-10-12 12:12:12",
        //   end_date: "2020-10-12 12:12:12",
        //   coupon_name: "TOTO卫浴",
        //   user_id: 3975839,
        //   quantity:100,
        //   use_count:10
        // }, {
        //   coupon_value: 100,
        //   consume_amount: 3000,
        //   begin_date: "2020-10-12 12:12:12",
        //   end_date: "2020-10-12 12:12:12",
        //   coupon_name: "TOTO卫浴",
        //   quantity:100,
        //   use_count:100,
        //   user_id: 0
        // }]
        this.setData({
          shop_name: res.result.shop_name,
          booth: res.result.booth,
          logo_url: res.result.logo_url,
          shopBanner: res.result.shopBanner,
          prerogative: res.result.prerogative,
          coupon: res.result.coupon,
          map: res.result.map
        })
        AbsApi.addBrowseHistory({
          action_type: 1,
          supplier_id: this.data.supplier_id,
          action_info: res.result.shop_name
        }).then(res => {

        })
      }
    })
  },
  // 店铺商品
  privilegeList() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      City: wx.getStorageSync('cityId'),
      Activity: wx.getStorageSync('activityId'),
      Token: wx.getStorageSync('token'),
      supplier_id: this.data.supplier_id,
      sort: this.data.sort
    }
    LiveApi.privilegeList(data).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          prerogative: res.result
        })
      } else {
        wx.showToast({
          title: res.message,
        })
      }
    })
  },
  // 领取优惠券
  MarketApi() {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true

    })
    let data = {
      City: wx.getStorageSync('cityId'),
      Activity: wx.getStorageSync('activityId'),
      Token: wx.getStorageSync('token'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      'From-Client': 'wx-xcx',
      mobile: wx.getStorageSync('userInfo').mobile,
      source_id: this.data.coupon_id,
      src_id: 'coupon',
      invite: '',
      isSendSms: 0
    }
    MarketApi.postReserve(data).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        setTimeout(function () {
          that.setData({
            showTicket: false,
            showToastName: res.message
          })
        }, 2000)
        that.shopDetail()
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
      console.log(res)
    })
  },
  // 华夏家博小程序内直播列表接口
  hxjbLiveList() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cityId: wx.getStorageSync('cityId'),
      supplierId: this.data.supplier_id,
      supplierCategoryId: '',
      page: 0,
      pageSize: 10
    }
    LiveApi.hxjbLiveList(data).then((res) => {
      wx.hideLoading()
      console.log(res)
      if (res.status == 1) {
        this.setData({
          liveList: res.data.live_list
        })
        if (res.data.live_list.length > 0) {
          if (res.data.live_list[0].status == 2 || res.data.live_list[0].status == 3 || res.data.live_list[0].status == 1) {
            this.setData({
              liveId: res.data.live_list[0].live_id,
              liveImg: res.data.live_list[0].cover_image_url
            })
          }
        }

      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  }
})