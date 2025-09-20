// pages/vendorAction/vendorAction.js
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curNum: 0,
    reachTips: "下拉继续加载",
    pageIndex: 0,
    hasData: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 推广链接带参 cityId src uis plan unit
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: options.userCityId
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        this.setData({
          activityInfo: wx.getStorageSync("activityInfo")
        })
      })
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    if (options.plan) {
      wx.setStorageSync('plan', options.plan)
    }
    if (options.unit) {
      wx.setStorageSync('unit', options.unit)
    }
    if (!wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index'
      })
      return
    }

    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      activityInfo: wx.getStorageSync("activityInfo")
    })
    //商户分类列表
    marketingApi.getVendorList().then((res) => {
      if (res.code == 200) {
        res.result.unshift({ category_name: "全部", id: "" })
        this.setData({
          vendorList: res.result,
          currentCategoryId: res.result[0].id,
          vendorAct: []
        })
        //获取商户活动列表
        this.getVendorAct(this.data.currentCategoryId, 0, 10)
      }
    })
    //获取banner
    SvipApi.getAdvList({ area_id: "17" }).then((res) => {
      if (res.status == 1) {
        this.setData({
          banner: res.data.adv17 || []
        })
      }
    })
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
    
  },
  /**
   * 方法start
   */
  //商户活动列表
  getVendorAct(id, page = 0, pageSize = 10) {
    marketingApi.getVendorAction({
      id: id,
      page: page,
      pageSize: pageSize,
      is_recommend:0
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        if (res.result && res.result.length > 0) {
          //格式化价格
          for (let i of res.result) {
            i.special_price = Number(i.special_price)
          }
          this.data.vendorAct = this.data.vendorAct.concat(res.result);
          this.setData({
            vendorAct: this.data.vendorAct
          })
          if (res.result.length < 10) {
            this.setData({
              hasData: false,
              reachTips: "没有更多了"
            })
          }
        } else {
          this.setData({
            hasData: false,
            reachTips: "没有更多了"
          })
        }
      }else{
        wx.showToast({
          title: res.message ? res.message : "请求出错了",
          icon: "none"
        })
      }
    })
  },
  cutKind(e) {
    let nums = Number(e.currentTarget.dataset.num) + 1;
    let menuIndex = 0;
    //current
    if (this.data.vendorList.length == nums) {
      menuIndex = 0.5 + nums - 5
    } else if (this.data.vendorList.length > 5 && nums >= 5) {
      menuIndex = nums - 4
    }
    this.setData({
      vendorAct: [],
      hasData: true,
      reachTips: "下拉继续加载",
      pageIndex: 0,
      menuIndex: menuIndex,
      curNum: Number(e.currentTarget.dataset.num),
      currentCategoryId: e.currentTarget.dataset.id
    })
    //商户活动列表
    this.getVendorAct(e.currentTarget.dataset.id)
  },
  /**
   * 方法end
   */

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //加载商户活动列表
    if (this.data.hasData) {
      this.data.pageIndex++
      this.getVendorAct(this.data.currentCategoryId, this.data.pageIndex)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})