// pages/cloudShowSuccess/index.js
import {
  config
} from '../../../common/config/config.js'
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
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
    //提交投放参数
    if (wx.getStorageSync("gdt_vid")) {
      wx.request({
        url: "https://api.51jiabo.com/youzan/wxAD/wxReported",
        method: 'POST',
        data: {
          clickId: wx.getStorageSync("gdt_vid"),
          weixinadinfo: wx.getStorageSync("weixinadinfo"),
          type: 8,
          cityId: wx.getStorageSync('liveCityId'),
          session: wx.getStorageSync('sessionId') ? wx.getStorageSync('sessionId') : '',
          mobile: wx.getStorageSync("userInfo").mobile
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        complete: function (res) {
          wx.removeStorageSync('gdt_vid');
          wx.removeStorageSync('weixinadinfo')
          console.log(res, "投放接口")
        }
      })
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
    const that = this;
    that.data.baseUrl = config.url;
    //运营位
    wx.request({
      method: 'GET',
      header: {
        'City': wx.getStorageSync('liveCityId')
      },
      url: that.data.baseUrl + "/expo/xcx/adv?area_id=35",
      success(data) {
        if (data.data.code == 200) {
          that.setData({
            reserveAdv: data.data.result
          })
        }
      }
    })
  },

  //分享记录点击次数
  shareBtn() {
    wx.request({
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      url: this.data.baseUrl + "/add/shareCloudNum"
    })
  },

  //订阅消息
  //提交formId
  pushFormId() {

  },
  subMessage() {
    wx.requestSubscribeMessage({
      tmplIds: ['yxkAejMOWzkpZ-UdKgOPd6kRi4p0vwDHg1raHLFEiq0'],
      success(res) {
        if (res.errMsg == "requestSubscribeMessage:ok") {
          SvipApi.pushFormId({
            formId: "",
            activity_id: wx.getStorageSync('liveActId'),
            type: "cloud_show"
          }).then((res) => {

          })
        }
      }
    })
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
      ADID: '35',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    
    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url

    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if(this.isTab(url)){
        wx.switchTab({
          url
        })
      }else{
        wx.navigateTo({
          url
        })
      }
    } else if (type == 2) {
      wx.navigateToMiniProgram({
        appId: e.currentTarget.dataset.item.appid,
        path: e.currentTarget.dataset.item.url
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
    return {
      title: '云逛展',
      imageUrl: "",
      path: '/pages/cloudShow/cloudShow?cloudInviteMobile=' + wx.getStorageSync("userInfo").mobile + "&inviteLiveCityId=" + wx.getStorageSync("liveCityId")
    }
  }
})