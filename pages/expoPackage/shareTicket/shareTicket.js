// pages/ticket/shareTIcket/shareTictet.js
import cryptoJs from '../../../utils/crypto.js';
import {
  util
} from "../../../common/util.js"
import {
  ticketApi
} from "../../../common/api/ticketApi.js";
let Api = new ticketApi()
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cityId: null,
    ticketId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.ticketInviteMobile) {
      console.log(options)
      wx.setStorageSync('shareTicketId', options.ticketId)
      wx.setStorageSync('cityId', options.cityId)
      wx.setStorageSync('ticketInviteMobile', options.ticketInviteMobile)
      wx.setStorageSync('shareNickName', options.nickName ? options.nickName : "")
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: wx.getStorageSync('cityId') || 1
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
      })
    }
    this.setData({
      nickName: wx.getStorageSync("shareNickName"),
      isLogin: wx.getStorageSync('isLogin'),
      isAuth: wx.getStorageSync("isAuth")
    })
    //获取授权登录code
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          that.setData({
            wxcode: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })

    // 获取门票信息
    this.getTicketInfo()

  },
  onShow: function (options) {

  },
  /**
   * 方法start
   */
  //获取formId
  getFormId(e) {
    console.log(e)
    this.setData({
      formIdData: e
    })
  },
  //授权手机号
  getPhoneNumber(e) {
    console.log(e)
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isAuth: true
      })
      this.getTicketInfo()
      this.getTicket(this.data.formIdData)
    })
  },
  //获取门票信息
  getTicketInfo() {
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      ticketId: wx.getStorageSync("shareTicketId")
    }
    Api.getShareIdTicketInfo(params, (res) => {
      wx.hideLoading()
      if (res.data.status == 1) {
        console.log(res)
        let resData = res.data.data;
        resData.days = ((new Date(resData.end_date.replace(/\./g, "/")) - new Date(resData.begin_date.replace(/\./g, "/"))) / 1000 / 60 / 60 / 24) + 1;
        resData.years = resData.begin_date.split(".")[0];
        this.setData({
          cityInfo: app.disposeData(res.data.data)
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none"
        })
      }
    })
  },
  // 领取门票
  getTicket(e) {
    cryptoJs.getAccessToken()
      .then(() => {
        marketingApi.checkToken().then((res) => {
          if (res.data.result == 1) {
            wx.showLoading({
              title: '领取中...',
              mask: true
            })
            //索票接口
            let data1 = {
              source_id: "",
              src_id: "ticket",
              mobile: wx.getStorageSync("userInfo").mobile,
              invite: wx.getStorageSync("ticketInviteMobile"),
              formId: e.detail.formId,
              activity_id: this.data.cityInfo.activity_id,
              'src': wx.getStorageSync('src'),
              'uis': wx.getStorageSync('uis'),
              'plan': wx.getStorageSync('plan'),
              'unit': wx.getStorageSync('unit'),
              ds: cryptoJs.tokenAES(),
              tk: wx.getStorageSync('accessToken')
            }
            marketingApi.getShareTicket(data1).then((res) => {
              wx.hideLoading()
              if (res.code == 200) {
                wx.showToast({
                  title: '领取成功！',
                })
                wx.navigateTo({
                  url: '/pages/expoPackage/ticketDetail/ticketDetail?ticket_id=' + res.ticket_id,
                })
              } else {
                if (res.message == "您已索票，无需重复索票") {
                  console.log(res.ticket_id)
                  this.setData({
                    ticketId: res.ticket_id,
                    tipsPopup: true
                  })
                } else {
                  wx.showToast({
                    title: res.message ? res.message : "请求出错了",
                    icon: "none"
                  })
                }
              }
            })
          } else {
            wx.showToast({
              icon: "none",
              title: '请登录领取！',
            })
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        })
      })
  },
  /**
   * 方法end
   */
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
})