// pages/svipPackage/signDetail/Index.js
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
    //加个判断，如果没有城市id
    let cityId = wx.getStorageSync('cityId')
    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=signDetail',
      })
      return
    } else if (cityId) {
      //获取页面所有接口信息
      this.getAllData()
    } else {
      //定位
      util.getPositionCity("signDetail", () => {
        this.setData({
          curUserCityText: wx.getStorageSync('curUserCityText')
        })
        //定位成功请求数据
        this.getAllData()
      })
    }
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
      })
      this.getHomeData()
    })
  },

  //首页数据
  getHomeData() {
    let params = {
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
    }
    SvipApi.homeData(params).then((res) => {
      this.setData({
        isOpenSale: res.is_zhanzhong_sell == 1 ? true : false
      })
      if (res.is_show_yuanjia_button == 1 && res.is_show_zhanzhong_button == 1) {
        //展中原价
        this.setData({
          salePrice: res.origin_price ? Number(res.origin_price) : "",
          openExpoSale: true
        })
      } else if (res.is_show_yuanjia_button == 0 && res.is_show_zhanzhong_button == 1) {
        //展中抢购价
        this.setData({
          salePrice: Number(res.price),
          openExpoSale: true
        })
      } else if (res.is_show_yuanjia_button == 1 && res.is_show_zhanzhong_button == 0) {
        //展前原价
        this.setData({
          restoreOrigin: true
        })
      }
      this.setData({
        originPrice: res.origin_price ? Number(res.origin_price) : "",
        price: Number(res.price),
        isSend: res.is_send, //展中购买是否赠送下一届svip: 1=是
      })
      //获取svip状态
      this.getSvipStatus()
    })
  },
  //获取svip状态
  getSvipStatus() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        let status = res.data.svip == 1 ? true : false
        this.setData({
          userInfo: res.data,
          discountPrice: 0,
          isDiscount: false,
          isLogin: true,
          isSvip: status
        })
        //非svip，获取可用抵扣券
        if (res.data.svip != 1) {
          //判断用户是否有未使用svip抵扣券
          SvipApi.userSvipCouponData().then((res) => {
            let userSvipCoupon = []
            if (res.status == 1 && res.data.is_show == 1) {
              userSvipCoupon = res.data.coupon_info.map((v) => {
                v.is_own = 1
                return v
              })
            }
            SvipApi.svipCouponData().then((res) => {
              if (res.status == 1 && res.data.coupon_list) {
                //根据可用优惠券满减金额和svip价格判断
                let svipPrice = 0;
                let couponList = userSvipCoupon.concat(res.data.coupon_list)
                if (couponList.length > 0) {
                  for (let v of couponList) {
                    if (!this.data.restoreOrigin && !this.data.openExpoSale) {
                      //展前抢购价
                      svipPrice = this.data.price;
                    } else if (this.data.restoreOrigin) {
                      //展前原价
                      svipPrice = this.data.originPrice;
                    } else if (this.data.openExpoSale) {
                      //展中
                      svipPrice = this.data.salePrice;
                    }
                    if (v.consume_amount <= svipPrice) {
                      this.setData({
                        canUseCoupon: v,
                        isDiscount: true,
                        discountPrice: (Number(svipPrice) * 1000 - Number(v.coupon_value) * 1000) / 1000
                      })
                      break
                    }
                  }
                }
              }
            })
          })
        }
        // svip是否需要0元升级
        SvipApi.zeroUpgrade({
          cityId: wx.getStorageSync('cityId')
        }).then((res) => {
          if (res.status == 1) {
            this.setData({
              isUpgrade: res.data.is_upgrade
            })
          }
        })
      } else {
        this.setData({
          isLogin: false,
          isSvip: false
        })
      }
    })
  },

  //授权手机号回调
  getPhoneBack() {
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getSvipStatus()
  },

  //轮播change
  swiperChange(e) {
    this.setData({
      current: e.detail.current
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
    console.log(this.data.signData)
    return {
      title: this.data.signData.gift_name,
      path: "/pages/svipPackage/signGift/signGift?cityId=" + wx.getStorageSync('cityId') + "&activityId=" + wx.getStorageSync("activityId")
    }
  }
})