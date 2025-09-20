// pages/svipPackage//signGift/signGift.js
let app = getApp()
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
import {
  util
} from "../../../common/util.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay1: false,
    isPlay2: false,
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.cityId) {
      wx.setStorageSync('cityId', options.cityId)
    }
    if (options.activityId) {
      wx.setStorageSync('activityId', options.activityId)
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
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
    this.getAllData()
    this.getSvipStatus()
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
  },

  getAllData() {
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
      SvipApi.signDetail({
        cityId: wx.getStorageSync('cityId'),
        activityId: wx.getStorageSync('activityId')
      }).then((res) => {
        if (res.status == 1) {
          let gData = res.data.image_info.masterInfo.list;
          if (gData[0]?.type == 4) {
            gData[0].cover_img_url = gData[1].image_url;
            gData.splice(1, 1)
          }
          res.data.image_info.masterInfo.list = gData;
          this.setData({
            signData: res.data
          })
        }
        wx.hideLoading()
      })
    })
  },

  //获取svip状态
  getSvipStatus() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1) {
        let status = res.data.svip == 1 ? true : false
        wx.setStorageSync('isSvip', status)
        this.setData({
          isSvip: status,
          isLogin: true
        })
        // svip是否需要0元升级
        SvipApi.zeroUpgrade({
          cityId: wx.getStorageSync('cityId') || 1
        }).then((res) => {
          if (res.status == 1) {
            this.setData({
              isUpgrade: res.data.is_upgrade
            })
          }
        })
      }
    })
  },

  closeUpdate() {
    this.setData({
      showUpdatePopup: false
    })
    this.getSvipStatus()
  },

  //轮播change
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },

  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      this.getSvipStatus()
    })
  },

  toBuySvip() {
    if (this.data.isLogin && !this.data.isSvip) {
      //判断是否可以直接升级svip,2为直接升级
      if (this.data.isUpgrade == 2) {
        // svip 0元升级
        this.svipUpgrade()
      } else {
        wx.setStorageSync('src', "YYXCX")
        wx.setStorageSync('uis', "签到礼抽奖转化")
        wx.navigateTo({
          url: '/pages/svipPackage/paySvip/paySvip',
        })
      }
      return
    }
  },

  //0元升级接口
  svipUpgrade() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // svip 0元升级
    SvipApi.svipUpgrade({
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId'),
      src: "0yuan",
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          orderType: res.data.order_type,
          showUpdatePopup: true
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },

  //播放视频
  playVideo(e) {
    let id = e.currentTarget.id;
    let playId = e.currentTarget.dataset.play;
    if (this.data[playId]) {
      this.setData({
        [playId]: false
      })
      wx.createVideoContext(id).pause()
    } else {
      if (id == "video1") {
        this.setData({
          isPlay1: true,
          isPlay2: false
        })
        wx.createVideoContext("video1").play()
        wx.createVideoContext("video2").pause()
      } else {
        this.setData({
          isPlay1: false,
          isPlay2: true
        })
        wx.createVideoContext("video1").pause()
        wx.createVideoContext("video2").play()
      }
    }
  },

  //视频播放完
  videoPause(e) {
    let playId = e.currentTarget.dataset.play;
    this.setData({
      [playId]: false
    })
  },

  toSvipCenter() {
    wx.navigateTo({
      url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
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
      title: "超值签到礼",
      path: "/pages/svipPackage/signGift/signGift?cityId=" + wx.getStorageSync('cityId') + "&activityId=" + wx.getStorageSync("activityId"),
      imageUrl: this.data.signData.image_info.giftDetailImage[0].image_url
    }
  }
})