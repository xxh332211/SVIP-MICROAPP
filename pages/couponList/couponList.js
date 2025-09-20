// pages/couponList/couponList.js
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
    spreadPlatformCouponDesc: false,
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
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
        this.getAllData()
      })
    } else {
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: wx.getStorageSync('cityId') || 1
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        this.setData({
          activityInfo: wx.getStorageSync("activityInfo")
        })
        this.getAllData()
      })
    }
    if (options.from == "share" && !wx.getStorageSync("src")) {
      wx.setStorageSync('src', "YYXCX")
    }
    if (options.from == "share" && !wx.getStorageSync("uis")) {
      wx.setStorageSync('uis', "优惠券列表")
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
    if (options.categoryId) {
      this.setData({
        categoryId: options.categoryId
      })
    }
    if (!wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index'
      })
      return
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 友盟统计
    wx.uma.trackEvent('enter_couponList', {
      cityId: wx.getStorageSync('cityId'),
      categoryId: this.data.categoryId ? this.data.categoryId : "0",
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
  },
  //获取接口数据
  getAllData() {
    this.setData({
      cityId: wx.getStorageSync('cityId'),
      isSvip: wx.getStorageSync('isSvip')
    })
    wx.showLoading({
      title: '加载中...',
    })
    if (!this.data.isSvip) {
      //非会员获取svip价格
      this.getHomeData()
    }
    //获取爆品组
    marketingApi.getGoodsGroup().then((res) => {
      if (res.status == 1) {
        this.setData({
          goodsGroup: res.data
        })
      }
    })
    //运营位
    SvipApi.getAdvList({
      area_id: "18,28"
    }).then((res) => {
      // 18:banner 28:优惠券分享图片
      if (res.status == 1) {
        this.setData({
          banner: res.data.adv18 || "",
          couponShareAdv: res.data.adv28 || ""
        })
      } else {
        this.setData({
          couponShareAdv: ""
        })
      }
    })
    //平台优惠券
    marketingApi.getPlatformCoupon().then((res) => {
      if (res.status == 1) {
        if (res.data && res.data.length > 0) {
          res.data.map((v) => {
            v.shareData = {
              title: "您的好友分享你一个优惠券，快快领取吧！",
              path: "/pages/expoPackage/getCoupon/getCoupon?couponId=" + v.coupon_id + "&couponType=1&couponInviteMobile=" + (wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").mobile : "") + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId")
            }
            return v
          })
        }
        this.setData({
          platformCoupon: res.data
        })
      }
    })
    //svip专项商户优惠券礼包
    marketingApi.getSvipCouponBag().then((res) => {
      if (res.status == 1) {
        this.setData({
          svipCouponBag: res.data.length == 0 ? "" : res.data
        })
      }
    })
    //商户分类列表
    marketingApi.getVendorList().then((res) => {
      if (res.code == 200) {
        res.result.unshift({
          category_name: "全部",
          id: 0
        })
        this.setData({
          currentCategoryId: res.result[0].id,
          vendorList: res.result
        })
        //获取商户优惠券列表
        let id = res.result[0].id,
          index = 0;
        if (this.data.categoryId) {
          id = this.data.categoryId;
          for (let i in res.result) {
            if (res.result[i].id == this.data.categoryId) {
              this.setData({
                shareCategory: res.result[i]
              })
              index = i;
            }
          }
          if (index == 0) {
            id = res.result[0].id;
          }
        }
        this.initCutKind(index, id)
      }
    })
  },
  /**
   * 方法start
   */
  //商户优惠券
  getVendorCoupon(id) {
    marketingApi.getVendorCoupon({
      id: id,
      is_recommend: ""
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          vendorCoupon: app.disposeData(res.result)
        })
      }
    })
  },
  //切换分类
  cutKind(e) {
    let nums = Number(e.currentTarget.dataset.num) + 1,
      menuIndex = 0,
      item = e.currentTarget.dataset.item;
    //current
    if (this.data.vendorList.length == nums) {
      menuIndex = 0.5 + nums - 5
    } else if (this.data.vendorList.length > 5 && nums >= 5) {
      menuIndex = nums - 4
    }
    this.setData({
      menuIndex: menuIndex,
      curNum: Number(e.currentTarget.dataset.num),
      shareCategory: item,
      currentCategoryId: item.id
    })
    //获取商户优惠券列表
    this.getVendorCoupon(item.id)
  },
  // 初始化选中类别
  initCutKind(index, id) {
    let nums = Number(index) + 1;
    let menuIndex = 0;
    //current
    if (this.data.vendorList.length == nums) {
      menuIndex = 0.5 + nums - 5
    } else if (this.data.vendorList.length > 5 && nums >= 5) {
      menuIndex = nums - 4
    }
    this.setData({
      menuIndex: menuIndex,
      curNum: Number(index),
      currentCategoryId: id
    })
    //获取商户优惠券列表
    this.getVendorCoupon(id)
  },
  //获取svip价格判断
  getHomeData() {
    let params = {
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
    }
    SvipApi.homeData(params).then((res) => {
      let svipPrice = 0;
      if (res.is_show_yuanjia_button == 1 && res.is_show_zhanzhong_button == 1) {
        //展中原价
        svipPrice = res.origin_price ? Number(res.origin_price) : "";
      } else if (res.is_show_yuanjia_button == 0 && res.is_show_zhanzhong_button == 1) {
        //展中抢购价
        svipPrice = Number(res.price);
      } else if (res.is_show_yuanjia_button == 1 && res.is_show_zhanzhong_button == 0) {
        //展前原价
        svipPrice = res.origin_price ? Number(res.origin_price) : "";
      } else {
        //展前抢购价
        svipPrice = Number(res.price);
      }
      this.setData({
        svipPrice: svipPrice
      })
    })
  },
  //平台优惠券跳转
  linkTo() {
    if (this.data.isSvip) {
      wx.navigateTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
    } else {
      wx.setStorageSync('src', "YYXCX");
      wx.setStorageSync('uis', "svip商户优惠券礼包");
      wx.reLaunch({
        url: '/pages/home/home',
      })
    }
  },
  // 平台券信息展开
  platformSpread(e){
    let type = e.currentTarget.dataset.type;
    if(type === 'show'){
      this.setData({
        spreadPlatformCouponDesc: true
      })
    }else{
      this.setData({
        spreadPlatformCouponDesc: false
      })
    }
  },
  /**
   * 方法end
   */
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: res.target.dataset.sharedata.title,
        path: res.target.dataset.sharedata.path,
        imageUrl: this.data.couponShareAdv ? this.data.couponShareAdv[0].wap_image_url : "https://img.51jiabo.com/834318d8-ef5e-4548-990a-954628ddf5c8.png"
      }
    } else {
      // 来自右上角转发菜单
      if (!this.data.shareCategory || this.data.shareCategory.id == 0) {
        return {
          title: "精选推荐 万元优惠券打包给你",
          path: `/pages/couponList/couponList?from=share&userCityId=${wx.getStorageSync("cityId")}&categoryId=${this.data.currentCategoryId}`,
          // imageUrl: this.data.couponShareAdv ? this.data.couponShareAdv[0].wap_image_url : "https://img.51jiabo.com/834318d8-ef5e-4548-990a-954628ddf5c8.png"
          imageUrl: "https://img.51jiabo.com/d04dd5ff-09d7-4303-9342-3550f7a32d5c.png"
        }
      } else {
        return {
          title: `${this.data.shareCategory.category_name} 万元优惠券打包给你`,
          path: `/pages/couponList/couponList?from=share&userCityId=${wx.getStorageSync("cityId")}&categoryId=${this.data.currentCategoryId}`,
          imageUrl: this.data.shareCategory.coupon_share_img
        }
      }
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