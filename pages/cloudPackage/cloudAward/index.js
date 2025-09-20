// pages/cloudPackage/cloudAward/index.js
import {
  config
} from '../../../common/config/config.js'
import cryptoJs from '../../../utils/crypto.js';
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
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
    let that = this;
    this.setData({
      baseUrl: config.url
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    marketingApi.cloudShowInfo({
      cityId: wx.getStorageSync('cityId'),
      mobile: wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").mobile : ""
    }).then((res) => {
      let infoData = res.data;
      if (res.status == 1) {
        //提现规则
        this.setData({
          withdrawRule: res.data.withdraw_rule
        })
        wx.setStorageSync('liveCityId', res.data.city_id);
        wx.setStorageSync('liveActId', res.data.id);
        //获取金额
        wx.request({
          method: 'GET',
          header: {
            'Token': wx.getStorageSync('token'),
            'City': wx.getStorageSync('liveCityId'),
            Activity: wx.getStorageSync('liveActId')
          },
          url: this.data.baseUrl + "/getAweard",
          success(data) {
            wx.hideLoading()
            that.setData({
              awardNumber: data.data.data
            })
          }
        })
      } else {
        wx.hideLoading()
        that.setData({
          awardNumber: "0",
          withdrawRule: ""
        })
      }
      //运营位
      if (infoData) {
        wx.request({
          method: 'GET',
          header: {
            'City': infoData.city_id
          },
          url: this.data.baseUrl + "/expo/xcx/adv?area_id=36",
          success(data) {
            if (data.data.code == 200) {
              that.setData({
                reserveAdv: data.data.result
              })
            }
          }
        })
      }
    })
  },

  //提现
  withDraw() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    cryptoJs.getAccessToken()
      .then(() => {
        wx.request({
          url: this.data.baseUrl + "/withdrawal",
          method: 'POST',
          data: {
            ds: cryptoJs.tokenAES(),
            tk: wx.getStorageSync('accessToken')
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Token': wx.getStorageSync('token'),
            'City': wx.getStorageSync('liveCityId')
          },
          success: function (res) {
            if (res.data.status == 1) {
              wx.showModal({
                title: "提现成功",
                content: "24小时内到您的微信零钱，请到微信我的--支付--钱包查看",
                showCancel: false,
                confirmColor: '#00C200',
                confirmText: "好的"
              })
            } else {
              if (res.data.message.indexOf("累计到10元") > -1) {
                wx.showModal({
                  content: "累计到10元就能提现到微信零钱分享给好友，继续领现金吧",
                  confirmColor: '#00C200',
                  confirmText: "分享",
                  success(res) {
                    if (res.confirm) {
                      if (!wx.getStorageSync('cloudRule')) {
                        wx.showToast({
                          title: '当前未开启推广奖励活动',
                          icon: "none"
                        })
                      } else {
                        wx.navigateTo({
                          url: '/pages/cloudPackage/cloudRule/index'
                        })
                      }
                    }
                  }
                })
              } else {
                wx.showModal({
                  content: res.data.message,
                  showCancel: false,
                  confirmColor: '#00C200',
                  confirmText: "好的"
                })
              }
            }
            wx.hideLoading()
          }
        })
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
      ADID: '36',
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

  }
})