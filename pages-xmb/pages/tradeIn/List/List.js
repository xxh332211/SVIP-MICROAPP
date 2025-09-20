// pages-xmb/pages//tradeIn/List/List.js
import {
  xmb
} from "../../../api/xmbApi.js";
const xmbApi = new xmb()
import {
  svip
} from "../../../../common/api/svipApi.js"
let SvipApi = new svip()
const app = getApp()
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

  getListInfo() {
    //换购活动在线，显示换购列表
    xmbApi.checkTradeIn({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1 && res.data.isOnline == true) {
        //获取换购商品
        xmbApi.getTradeInAllList({
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
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          isLogin: true,
          totalXmb: res.data.panda_coin
        })
      } else {
        this.setData({
          totalXmb: "--"
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

  toMyXmbTradeIn() {
    if (this.data.isLogin) {
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
  toConfirm(e) {
    wx.navigateTo({
      url: `/pages-xmb/pages/tradeIn/Confirm/Confirm?goodsId=${e.currentTarget.dataset.id}`,
    })
  },
  toSelfHelp() {
    wx.navigateTo({
      url: '/pages/user/selfHelp/Index/Index',
    })
  },
  toXmbTradeInRule() {
    wx.navigateTo({
      url: '/pages-xmb/pages/tradeIn/Rule/Rule',
    })
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
    return {
      title: "华夏家博",
      path: "/pages/getTicket/getTicket",
      imageUrl: "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
    }
  }
})