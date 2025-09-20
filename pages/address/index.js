import {
  svip
} from "../../common/api/svipApi.js"

let SvipApi = new svip()
const app = getApp()
Page({
  data: {
    cityList: [],
    curUserCityText: "",
    cityId: null,
    activityId: null,
    urlSrc: null
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onLoad(e) {
    this.data.urlSrc = e.src;
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.loadCityList()
    this.setData({
      curUserCityText: wx.getStorageSync('curUserCityText') ? wx.getStorageSync('curUserCityText') : "未选择"
    })
  },
  loadCityList: function () {
    SvipApi.citylist().then((res) => {
      wx.hideLoading()
      this.setData({
        cityList: res
      })
    })
  },
  // 手动选择
  chooseCity: function (e) {
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    wx.setStorageSync("cityId", id)
    wx.setStorageSync("curUserCityText", name)

    this.setData({
      cityId: id,
      curUserCityText: name
    })
    this.loadActivityInfo() // 去详情
  },

  // 城市展届详情 /  新迭代跳转到预约页面
  loadActivityInfo: function () {
    let params = {
      cityId: this.data.cityId,
      activityId: null
    }
    SvipApi.activityInfo(params).then((res) => {
      console.log(res.activity_id,this.data.urlSrc, '最新的展届')
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      //如果链接参数有urlSrc则返回到门票页
      let isBegin = Number(res.is_active)
      if (isBegin === 0) {
        wx.setStorageSync('isThisGoing', true)
      } else {
        wx.setStorageSync('isThisGoing', false)
      }
      if (!this.data.urlSrc) {
        if (isBegin === 0) {
          wx.reLaunch({
            url: '/pages/reserve/reserveTicket',
          })
          return false
        } else {
          wx.switchTab({
            url: '/pages/home/home',
          })
        }
      } else {
        if (this.data.urlSrc == "goodsIndex") {
          this.svipInfo()
          wx.switchTab({
            url: `/pages/${this.data.urlSrc}/${this.data.urlSrc}`,
          })
        } else if (this.data.urlSrc == "getTicket" || this.data.urlSrc == "cloudShow") {
          wx.switchTab({
            url: `/pages/${this.data.urlSrc}/${this.data.urlSrc}`,
          })
        } else {
          wx.navigateBack(-1)
        }
      }
    })
  },
  // 超级会员详情
  svipInfo() {
    let data = {
      cityId: this.data.cityId,
      activityId: wx.getStorageSync('activityId'),
    }
    SvipApi.svipInfo(data).then((res) => {
      wx.setStorageSync('price', res.price)
    })
  },
  // 结束
})