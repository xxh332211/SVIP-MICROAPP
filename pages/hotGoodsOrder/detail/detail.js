// pages/hotGoodsOrder/detail/detail.js
import {
  util
} from "../../../common/util.js"
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  absApi
} from "../../../common/api/absAPI.js"
let AbsApi = new absApi()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reserveSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
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
    wx.hideShareMenu()
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      activityInfo: wx.getStorageSync("activityInfo")
    })
    if (!wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index?src=hotDetail'
      })
      return
    }
    let options = this.data.options;
    console.log(options)
    //加个判断，如果链接中既有手机号，又有爆品id，说明是分享进入的，预约时要传邀请人手机号，否则不传
    if (options.detail_id && options.hotInviteMobile) {
      wx.setStorageSync('shareHotId', options.detail_id)
      wx.setStorageSync('hotInviteMobile', options.hotInviteMobile)
    }
    if (options.detail_id) {
      wx.setStorageSync('hotId', options.detail_id)
    }
    if (options.userCityId) {
      wx.setStorageSync("cityId", options.userCityId)
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
        // 获取爆品详情
        this.getHotDetail()
      })
    } else {
      // 获取爆品详情
      this.getHotDetail()
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
    //获取爆品分享图片
    SvipApi.getAdvList({
      area_id: "29"
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          hotShareAdv: res.data.adv29 || ""
        })
        wx.showShareMenu()
      }
    })
    this.setData({
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
  },
  /**
   * 方法start
   */
  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isAuth: true
      })
      this.getHotDetail()
    })
  },
  //获取爆品详情
  getHotDetail() {
    let page = getCurrentPages();
    let currentRoute = page[page.length - 1].route;
    marketingApi.getHotGoodsDetail({
      detail_id: wx.getStorageSync("hotId")
    }).then((res) => {
      wx.hideLoading()
      console.log(res, "爆品详情")
      if (res.code == 200) {
        if (res.result) {
          res.result.market_price = Number(res.result.market_price)
          res.result.special_price = Number(res.result.special_price)
          let page2 = getCurrentPages();
          let currentRoute2 = page2[page2.length - 1].route;
          if (currentRoute == currentRoute2) {
            wx.setNavigationBarTitle({
              title: res.result.goods_name,
              fail() {}
            })
          }
          this.setData({
            hotGoodsDetail: res.result
          })
          // 友盟统计
          wx.uma.trackEvent('enter_hotGoodsdetail', {
            itemID: wx.getStorageSync("hotId"),
            itemName: res.result.goods_name,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
          });
          //添加浏览记录
          this.addHistory(res.result.goods_name)
        } else {
          wx.switchTab({
            url: '/pages/getTicket/getTicket',
          })
        }
      }
    })
  },
  // 立即预约
  justOrder() {
    // 友盟统计
    wx.uma.trackEvent('click_order_btn', {
      itemID: this.data.hotGoodsDetail.detail_id,
      itemName: this.data.hotGoodsDetail.goods_name,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    if (wx.getStorageSync("isLogin")) {
      let invite = "";
      let itemId = this.data.hotGoodsDetail.detail_id;
      if (wx.getStorageSync("shareHotId") == itemId) {
        invite = wx.getStorageSync("hotInviteMobile")
      }
      let data = {
        source_id: itemId,
        src_id: "explosive",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: invite,
        formId: "",
        'src': invite ? "YYXCXliebian" : wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      console.log(data, "预约传数据")
      marketingApi.postReserve(data).then((res) => {
        console.log(res, "预约接口")
        if (res.code == 200) {
          this.data.hotGoodsDetail.is_get = "1";
          this.data.hotGoodsDetail.goods_stock = Number(this.data.hotGoodsDetail.goods_stock) - 1;
          this.setData({
            reserveSuccess: true,
            hotGoodsDetail: this.data.hotGoodsDetail
          })
          // 在detail获取列表页数据，以实现不刷新页面改变商品预约状态
          let page = getCurrentPages();
          if (page.length >= 2 && page[page.length - 2].route == "pages/hotGoodsOrder/index/index") {
            let preData = page[page.length - 2];
            console.log("列表页数据", page)
            preData.data.hotGoods = [];
            let pageNum = (preData.data.pageIndex + 1) * 10;
            preData.getHotGoods(preData.data.currentCategoryId, 0, pageNum)
          }
          this.addHistory(this.data.hotGoodsDetail.goods_name)
        } else {
          wx.showToast({
            title: res.message ? res.message : "请求出错了",
            icon: "none"
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  //添加浏览记录
  addHistory(name) {
    AbsApi.addBrowseHistory({
      action_type: 2,
      goods_type: 1,
      goods_id: wx.getStorageSync("hotId"),
      action_info: name
    }).then(res => {

    })
  },
  // 一键回首页
  goHome: function (e) {
    wx.switchTab({
      url: '/pages/getTicket/getTicket'
    })
  },
  closeReserve() {
    this.setData({
      reserveSuccess: false
    })
  },
  /**
   * 方法end
   */
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: this.data.hotGoodsDetail.goods_name,
      path: "/pages/hotGoodsOrder/detail/detail?detail_id=" + this.data.hotGoodsDetail.detail_id + "&hotInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&userCityId=" + (wx.getStorageSync('cityId') || 1) + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId"),
      imageUrl: this.data.hotShareAdv ? this.data.hotShareAdv[0].wap_image_url : "https://img.51jiabo.com/39dc30d1-9ca7-411d-bfa9-fdfac1608258.png"
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
})