import {
  tradeIn
} from "../../../common/api/tradeInApi"
let tradeInApi = new tradeIn()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showFlag: false
  },

  // 换购叉
  fork() {
    this.setData({
      showFlag: false
    })
  },
  // 换购跳转到家博换购列表
  huangouBtn() {
    if (this.data.isXmb) {
      wx.navigateTo({
        url: '/pages-xmb/pages/tradeIn/List/List?src=YYXCX&uis=熊猫币订单模块',
      })
    } else {
      wx.navigateTo({
        url: '/pages/tradeInPackage/List/Index?src=YZXCX&uis=订单模块',
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getActivityInfo()

  },
  // 换购商品详情
  getGoodsList() {
    tradeInApi.getTradeInAllList({
      activityId: wx.getStorageSync('activityId'),
      redeemId: this.data.redeemId
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          swiperList: res.data
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
      console.log(res)
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取展届信息
  getActivityInfo() {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //换购活动在线换购列表
    tradeInApi.checkTradeIn({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then(res => {
      wx.hideLoading()
      if (res.status == 1 && res.data.isOnline == true) {
        this.setData({
          redeemId: res.data.id
        })
        if (res.data.exchange_method == 1) {
          //熊猫币换购  显示条件：换购活动在线，显示换购列表
          this.setData({
            isXmb: true,
            showFlag: true
          })
        } else {
          SvipApi.activityInfo({
            cityId: wx.getStorageSync('cityId')
          }).then((res) => {
            if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
              //展中
              //订单换购  显示条件：展中&&换购活动在线，显示换购列表
              this.setData({
                showFlag: true
              })
            }
          })
        }
        that.getGoodsList()
      }
    })
  },


})