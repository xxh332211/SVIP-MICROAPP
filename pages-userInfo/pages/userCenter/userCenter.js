// pages/userCenter/userCenter.js
import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
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
    leaving: false,
    region: [],
    sex: 0,
    selectAddrVisible: false,
    selectSexVisible: false,
    selectDateVisible: false,
    updateNameVisible: false,
    info: {},
    receiverAddress: {},
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchData()
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse){
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
  },

  fetchData() {
    wx.showLoading()
    Promise.all([apiService('member/profile'), apiService('member/address/default')])
      .then(data => {
        this.setData({
          receiverAddress: data[1]
        })
        if (data[0].birthday) {
          data[0].birthday = utils.dateFormat(data[0].birthday, 'YYYY/MM/DD')
        }
        if (data[0].homeAddress) {
          this.setData({
            info: data[0],
            shortName: data[0].truename.substr(0, 6) + '...',
            region: data[0].homeAddress.split(',')
          })
        } else {
          this.setData({
            info: data[0]
          })
        }
        wx.hideLoading()
      }).catch(() => {
        wx.hideLoading()
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.leaving) {
      this.fetchData()
    }
    this.getHeadImg();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      leaving: true
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.save();
    this.uploadHeadImg();
  },

  // 获取头像
  getHeadImg() {
    let params = {
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
    }
    SvipApi.isSvip(params).then((res) => {
      if (res.status == 1) {
        this.setData({
          'userInfo.avatarUrl': res.data.avatar,
          hasUserInfo: true
        })
      }
    })
  },

  // 上传头像
  uploadHeadImg() {
    let params = {
      avatar: this.data.userInfo.avatarUrl,
    }
    SvipApi.updateUserAvatar(params);
  },

  routerToRecevierAddresss: function () {
    wx.navigateTo({
      url: '/pages-userInfo/pages/userCenter/receiverAddress/receiverAddress'
    })
  },

  openAddrSelector: function (e) {
    this.setData({
      selectAddrVisible: true
    })
  },
  closeAddrSelector() {
    this.setData({
      selectAddrVisible: false
    })
  },
  selectAddr(evt) {
    this.setData({
      region: evt.detail.value
    })
    this.closeAddrSelector()
  },

  openSexSelector: function (e) {
    this.setData({
      selectSexVisible: true
    })
  },
  closeSexSelector() {
    this.setData({
      selectSexVisible: false
    })
  },
  selectSex(evt) {
    console.log(evt)
    this.setData({
      'info.sex': evt.detail.value
    })
    this.closeSexSelector()
  },

  openDateSelector: function (e) {
    this.setData({
      selectDateVisible: true
    })
  },
  closeDateSelector() {
    this.setData({
      selectDateVisible: false
    })
  },
  selectDate(evt) {
    this.setData({
      'info.birthday': evt.detail.value
    })
    this.closeDateSelector()
  },

  save(evt) {
    let info = {
      ...this.data.info
    }
    info.homeAddress = this.data.region.join(',') || ''
    // info.intention = evt.detail.value.intention || ''
    wx.showLoading()
    apiService('member/profile/update', 'PUT', info).then(data => {
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  updateIcon(evt) {
    let data = JSON.parse(evt.detail.rawData)
    this.setData({
      'info.iconUrl': data.avatarUrl
    })
    let info = {
      ...this.data.info
    }
    info.iconUrl = data.avatarUrl
    wx.showLoading()
    apiService('member/profile/update', 'PUT', info).then(() => {
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  openNameModal() {
    this.setData({
      updateNameVisible: true
    })
  },
  closeNameModal() {
    this.setData({
      updateNameVisible: false
    })
  },
  onUpdateName(evt) {
    let shortName, name = evt.detail.value;
    if (name.length > 6) {
      shortName = name.substr(0, 6) + '...'
    }
    this.setData({
      'info.truename': name,
      shortName
    })
    this.closeNameModal()
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  getUserInfo() {
    let _this = this;
    wx.getUserProfile({
      desc: '获取信息',
      lang: 'zh_CN',
      success(res) {
        _this.setData({
          'userInfo.avatarUrl': res.userInfo.avatarUrl,
          hasUserInfo: true
        })
      }
    })
  },

  //退登
  logout: function () {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "退出登录btn",
      SourcePage: 'pages-userInfo/pages/userCenter/userCenter',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    wx.navigateBack({
      success() {
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync("token")
        wx.removeStorageSync("mall_token")
        wx.removeStorageSync('pageGuideList')
        wx.removeStorageSync("isLogin")
        wx.removeStorageSync("isSvip")
        wx.removeStorageSync("codePopup")
      }
    })
  },
})