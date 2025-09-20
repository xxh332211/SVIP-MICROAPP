// pages/tradeInPackage/list/Index.js
import cryptoJs from '../../../utils/crypto.js';
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  tradeIn
} from "../../../common/api/tradeInApi.js"
let tradeInApi = new tradeIn()
const app = getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    if (options.cityId) {
      wx.setStorageSync('cityId', options.cityId)
    }
    if (options.token) {
      this.token = options.token;
    }
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
    if (!wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index?src=tradeList',
      })
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //获取展届信息
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      //初始化接口信息
      this.getListInfo()
    })
  },

  //初始化接口信息
  getListInfo() {
    this.setData({
      orderNum: 0
    })
    //获取用户满足换购条件订单数量
    tradeInApi.getUserOrderNum({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
      userId: wx.getStorageSync('userInfo').uid ? wx.getStorageSync('userInfo').uid : ""
    }).then(res => {
      if (res.status == 1) {
        let number = res.data.orderNum;
        let newNumber = 0;
        let redeemConf = res.data.redeemConf;
        for (let i in redeemConf) {
          if (number >= Number(redeemConf[i])) {
            newNumber = Number(redeemConf[i])
          }
        }
        this.setData({
          orderNum: newNumber,
          trandInNum: redeemConf
        })
      }
    })
    //换购活动在线，显示换购列表
    tradeInApi.checkTradeIn({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1 && res.data.isOnline == true) {
        //获取换购商品
        tradeInApi.getTradeInAllList({
          activityId: wx.getStorageSync('activityId'),
          redeemId: res.data.id
        }).then(res => {
          wx.hideLoading()
          if (res.status == 1) {
            this.setData({
              goodsList: res.data
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.message ? res.message : "换购活动未开始",
          icon: "none"
        })
      }
    })
    //获取弹层运营位
    SvipApi.getAdvList({
      area_id: "42"
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          tradeAdv: res.data.adv42 || []
        })
      } else {
        this.setData({
          tradeAdv: []
        })
      }
    })
  },

  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/tradeInPackage/Detail/Index?detail_id=' + id,
    })
  },

  toTradeInRule() {
    wx.navigateTo({
      url: '/pages/tradeInPackage/Rule/Index',
    })
  },

  toMyTradeIn() {
    if (wx.getStorageSync('isLogin')) {
      let page = getCurrentPages();
      let preRouter = page[page.length - 2] && page[page.length - 2].route;
      if (preRouter && preRouter == "pages/tradeInPackage/My/Index") {
        wx.navigateBack()
      } else {
        wx.navigateTo({
          url: '/pages/tradeInPackage/My/Index',
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 判断url是否为tabbar
  isTab(url) {
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  //运营位链接跳转
  swiperUrl(e) {
    // 友盟统计
    wx.uma.trackEvent('click_AD', {
      cityId: wx.getStorageSync('cityId'),
      ADID: e.currentTarget.dataset.area_id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    
    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url
    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    } else if (type == 2) {
      wx.navigateToMiniProgram({
        appId: e.currentTarget.dataset.item.appid,
        path: e.currentTarget.dataset.item.url,
        complete(res) {

        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
      })
    }
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

  }
})