// pages/user/selfHelp/Index/Index.js
import {
  svip
} from "../../../../common/api/svipApi.js"

let SvipApi = new svip()
let app = getApp()
import {
  util
} from "../../../../common/util.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: true,
    showFillInPopup: false,
    orderList: [],
    showXmbTips: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this,
      cityId = wx.getStorageSync('cityId');
    if (cityId) {
      //请求数据接口
      this.getRequestInfo()
    } else if (!cityId && wx.getStorageSync("isLocation")) {
      //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
      wx.navigateTo({
        url: '/pages/address/index?src=selfHelp',
      })
      return
    } else {
      //定位
      util.getPositionCity("selfHelp", () => {
        //定位成功请求数据
        this.getRequestInfo()
      })
    }
    //获取授权登录code
    wx.login({
      success(res) {
        if (res.code) {
          console.log(res.code)
          that.setData({
            code: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  //展中跳转到录单页面   
  fillInBtn() {
    if (this.data.activityType) {
      wx.navigateTo({
        url: '../FillIn/FillIn',
      })
    } else {
      this.setData({
        flag: false,
        showFillInPopup: true
      })
    }
  },
  // 关闭弹窗
  knowBtn() {
    this.setData({
      flag: true,
      showFillInPopup: false
    })
  },
  //
  toDetail(e) {
    let orderId = e.currentTarget.dataset.item.orderId;
    let status = e.currentTarget.dataset.item.orderStatus;
    console.log(e.currentTarget.dataset.item.orderStatus)
    if (status == 6) {
      //有抽奖资格跳展会订单列表
      wx.navigateTo({
        url: '/pages-userInfo/pages/orderList/orderList?type=1',
      })
    } else if (status == 3 || status == 1) {
      wx.navigateTo({
        url: '/pages/user/selfHelp/FillIn/FillIn?orderId=' + orderId,
      })
    } else {
      wx.navigateTo({
        url: '/pages/user/selfHelp/Detail/Detail?orderId=' + orderId + "&status=" + status
      })
    }
  },
  // 获取展届信息
  getRequestInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
        console.log('展中')
        this.setData({
          activityType: true
        })
      } else {
        console.log('非展中')
        this.setData({
          activityType: false,
          item: res
        })
      }
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      SvipApi.getSelfOrderList({
        mobile: wx.getStorageSync("userInfo").mobile,
        userId: wx.getStorageSync("userInfo").uid
      }).then((data) => {
        this.setData({
          isLogin: data.infoMap.success ? true : false
        })
        let newData = [];
        if (data.resultList && data.resultList.length > 0) {
          data.resultList.map((v, i) => {
            //2020.8.4修改，已领取礼品不显示
            // if (v.orderStatus != 5) {
            //   newData.push(v)
            // }
            newData.push(v)

          })
        }
        this.setData({
          orderList: newData
        })
        wx.hideLoading();
        // 熊猫币弹框
        this.xmbModal();
      })
    })
  },
  //授权手机号
  getPhoneNumber(e) {
    let that = this;
    util.authorizePhone(e, that.data.code, () => {
      that.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      that.getRequestInfo()
    })
  },

  // 熊猫币数量弹框
  xmbModal() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let data = {
      id: 7
    }
    SvipApi.xmbModal(data).then(res => {
      wx.hideLoading();
      if (res.code == 200 && res.result.activity_status > 0) {
        this.setData({
          showXmbTips: true,
          xmbPopupData:res.result
        })
        setTimeout(() => {
          this.setData({
            showXmbTips: false
          })
        }, 5000);
      }
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
    this.getRequestInfo();
    wx.stopPullDownRefresh();
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