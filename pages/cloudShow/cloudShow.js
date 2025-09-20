// pages/cloudShow/cloudShow.js
import {
  config
} from '../../common/config/config.js'
import {
  svip
} from '../../common/api/svipApi.js'
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  util
} from "../../common/util.js"
import cryptoJs from '../../utils/crypto.js';
const app = getApp()
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
    stop: Function,
    countDown: Function,
    // reserveAdv:[{wap_image_url:"https://img.51jiabo.com/558548c1-2cee-4db4-8686-964aecfdd8c7.png"},{wap_image_url:"https://img.51jiabo.com/558548c1-2cee-4db4-8686-964aecfdd8c7.png"},{wap_image_url:"https://img.51jiabo.com/558548c1-2cee-4db4-8686-964aecfdd8c7.png"}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.scene) {
      let arr = decodeURIComponent(options.scene).split("&");
      wx.setStorageSync('cloudInviteMobile', arr[0])
      wx.setStorageSync('inviteLiveCityId', arr[1])
    }
    if (options.cloudInviteMobile) {
      wx.setStorageSync('inviteLiveCityId', options.inviteLiveCityId)
      wx.setStorageSync('cloudInviteMobile', options.cloudInviteMobile)
    }

    // 推广链接带参 cityId src uis plan unit
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
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
    //广告投放参数
    if (options.gdt_vid) {
      wx.setStorageSync('gdt_vid', options.gdt_vid)
    }
    if (options.weixinadinfo) {
      wx.setStorageSync('weixinadinfo', options.weixinadinfo)
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

    let cityId = wx.getStorageSync('cityId')
    this.setData({
      isLogin: wx.getStorageSync("isLogin"),
      offLine: false,
      pageOnload: false,
      baseUrl: config.url,
      days: "0",
      hours: "0",
      minute: "0",
      second: "0",
      cityId
    })

    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
      let text = "list[1].text"
      if(cityId == 60){
        this.getTabBar().setData({
          [text]:'装修狂欢节'
        })
      }else{
        this.getTabBar().setData({
          [text]:'家博会'
        })
      }
    }

    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=cloudShow',
      })
    } else if (cityId) {
      //云逛展基础信息
      this.getInfo()
    } else {
      //定位
      util.getPositionCity("cloudShow", () => {
        this.setData({
          curUserCityText: wx.getStorageSync('curUserCityText')
        })
        //定位成功请求数据
        this.getInfo()
      })
    }

  },

  //云逛展基础信息
  getInfo(detail) {
    let that = this;
    let cityId = wx.getStorageSync('cityId');
    if (cityId == 1 || cityId == 2 || cityId == 3 || cityId == 6 || cityId == 7 || cityId == 8 || cityId == 14 || cityId == 15 || cityId == 17 || cityId == 19 || cityId == 23 || cityId == 54) {
      wx.reLaunch({
        url: '/pages/mgg/mgg',
      })
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //获取当前城市name并填充
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      this.setData({
        curUserCityText: res.city_name
      })
    })
    this.setData({
      showCouponBtn: false,
      showCouponPopup: false
    })
    //已登录&&当天首次登录&&有抵扣券 || 未登录&&有抵扣券 ，显示抵扣券弹层
    SvipApi.firstLoginCheck().then((res) => {
      if (res.status == 1) {
        if (res.data.firstStatus == 1 && !detail) {
          //获取svip抵扣券列表
          this.svipCouponData()
        }
        //判断用户是否有未使用svip抵扣券并且非svip，有则弹优惠券按钮
        SvipApi.userSvipCouponData().then((res) => {
          if (res.status == 1 && res.data.is_show == 1) {
            this.setData({
              showCouponBtn: true
            })
          }
        })
      } else {
        //获取svip抵扣券列表
        this.svipCouponData()
      }
    })
    //判断用户是否svip
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then(res => {
      if (res.status == 1) {
        let isSvip = res.data.svip === 1
        wx.setStorageSync('isSvip', isSvip)
        this.setData({
          isSvip
        })
      } else {
        this.setData({
          isLogin: false
        })
      }
    })
    //获取云逛展信息
    marketingApi.cloudShowInfo({
      cityId: wx.getStorageSync('cityId'),
      mobile: wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").mobile : ""
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          pageOnload: true
        })
        console.log(res, "云逛展数据")
        //海报背景
        wx.setStorageSync('postBg', res.data.poster_image_url)
        //活动规则
        wx.setStorageSync('cloudRule', res.data.rule);
        //提现规则
        wx.setStorageSync('withdrawRule', res.data.withdraw_rule);
        wx.setStorageSync('liveCityId', res.data.city_id);
        wx.setStorageSync('liveActId', res.data.id);

        //云逛展邀请首次点击
        cryptoJs.getAccessToken()
          .then(() => {
            wx.request({
              url: this.data.baseUrl + "/expo/clickCloud",
              method: 'POST',
              data: {
                invite: wx.getStorageSync('cloudInviteMobile'),
                src_id: "click_cloud",
                invite_city: wx.getStorageSync('inviteLiveCityId'),
                activity_id: wx.getStorageSync('liveActId'),
                mobile: wx.getStorageSync("userInfo").mobile ? wx.getStorageSync("userInfo").mobile : "",
                ds: cryptoJs.tokenAES(),
                tk: wx.getStorageSync('accessToken')
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Token': wx.getStorageSync('token'),
                'City': wx.getStorageSync('liveCityId')
              },
              complete: function (res) {

              }
            })
          })

        //用户状态
        wx.request({
          url: this.data.baseUrl + "/v2.0/user/userStatus",
          method: 'POST',
          data: {
            mobile: wx.getStorageSync("userInfo").mobile ? wx.getStorageSync("userInfo").mobile : ""
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Token': wx.getStorageSync('token')
          },
          success(res) {
            if (res.data.status == -1) {
              wx.removeStorageSync('userInfo')
              wx.removeStorageSync("token")
              wx.removeStorageSync("mall_token")
              wx.removeStorageSync('pageGuideList')
              wx.removeStorageSync("isLogin")
              wx.removeStorageSync("isSvip")
              wx.removeStorageSync("codePopup")
              wx.showToast({
                title: res.data.message,
                icon: "none"
              })
            }
          }
        })

        //banner运营位
        wx.request({
          method: 'GET',
          header: {
            'City': res.data.city_id
          },
          url: this.data.baseUrl + "/expo/xcx/adv?area_id=33",
          success(data) {
            if (data.data.code == 200) {
              that.setData({
                banner: data.data.result,
                current: 0
              })
            }
          }
        })

        //直播按钮运营位
        wx.request({
          method: 'GET',
          header: {
            'City': res.data.city_id
          },
          url: this.data.baseUrl + "/expo/xcx/adv?area_id=37",
          success(data) {
            if (data.data.code == 200) {
              that.setData({
                liveAdv: data.data.result
              })
            }
          }
        })

        //底部运营位
        wx.request({
          method: 'GET',
          header: {
            'City': res.data.city_id
          },
          url: this.data.baseUrl + "/expo/xcx/adv?area_id=34",
          success(data) {
            if (data.data.code == 200) {
              that.setData({
                reserveAdv: data.data.result
              })
            }
            wx.hideLoading()
          }
        })

        //浮动运营位
        wx.request({
          method: 'GET',
          header: {
            'City': res.data.city_id
          },
          url: this.data.baseUrl + "/expo/xcx/adv?area_id=38",
          success(data) {
            if (data.data.code == 200) {
              that.setData({
                fixedAdv: data.data.result
              })
            }
          }
        })

        clearInterval(this.data.stop);
        let actBegDate = res.data.begin_date;
        let actEndDate = res.data.end_date;
        res.data.begin_date = res.data.begin_date.split(' ')[0].split(/[-.]/).join('.');
        res.data.end_date = res.data.end_date.split(' ')[0].split(/[-.]/).slice(1).join('.');
        this.setData({
          ticketInfo: res.data
        })
        //直播开始倒计时
        let nowTime = new Date().getTime();
        let startDate = new Date(actBegDate.replace(/-/g, "/")).getTime() - nowTime;
        if (startDate > 0) {
          // this.setData({
          //   countOver: false
          // })
          //倒计时
          this.data.stop = setInterval(() => {
            let days = Math.floor(startDate / 1000 / 60 / 60 / 24);
            let hours = Math.floor(startDate / 1000 / 60 / 60 % 24);
            let minute = Math.floor((startDate / 1000 / 60) % 60);
            let second = Math.floor((startDate / 1000) % 60);
            this.setData({
              days: days < 10 ? "0" + days : days,
              hours: hours < 10 ? "0" + hours : hours,
              minute: minute < 10 ? "0" + minute : minute,
              second: second < 10 ? "0" + second : second
            })
            if (startDate <= 0) {
              this.setData({
                days: "00",
                hours: "00",
                minute: "00",
                second: "00"
              })
              clearInterval(this.data.stop);
              return false;
            } else {
              startDate -= 1000;
            }
          }, 1000);
        } else {
          // this.setData({
          //   countOver: true
          // })
        }

        //直播结束倒计时
        let endDate = new Date(actEndDate.replace(/-/g, "/")).getTime() - nowTime;
        if (endDate > 0) {
          this.setData({
            liveOver: false
          })
          //倒计时
          this.data.countDown = setInterval(() => {
            if (endDate <= 0) {
              this.setData({
                liveOver: true
              })
              clearInterval(this.data.countDown);
              return false;
            } else {
              endDate -= 1000;
            }
          }, 1000);
        } else {
          this.setData({
            liveOver: true
          })
        }

      } else {
        wx.hideLoading()
        this.setData({
          pageOnload: true,
          offLine: true
        })
      }
    })
  },
  //svip抵扣券列表
  svipCouponData() {
    let that = this;
    SvipApi.svipCouponData().then((res) => {
      if (res.status == 1 && res.data.coupon_list && res.data.coupon_list.length > 0) {
        that.setData({
          couponInfo: res.data.coupon_list,
          showCouponPopup: true
        })
      }
    })
  },
  closeCouponPopup() {
    this.setData({
      showCouponPopup: false
    })
  },

  //选择城市
  chooseCity() {
    wx.navigateTo({
      url: '/pages/address/index?src=cloudShow',
    })
  },

  //免费预约
  freeReserve() {
    cryptoJs.getAccessToken()
      .then(() => {
        this.getFreeReserve()
      })
  },

  //
  getFreeReserve() {
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '预约中...',
        mask: true
      })
      //预约接口
      let data = {
        isSendSms: 0,
        source_id: "",
        src_id: "cloud_show",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: wx.getStorageSync("cloudInviteMobile"),
        formId: "",
        invite_city: wx.getStorageSync('inviteLiveCityId'),
        activity_id: wx.getStorageSync('liveActId'),
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit'),
        ds: cryptoJs.tokenAES(),
        tk: wx.getStorageSync('accessToken')
      }
      wx.request({
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Token': wx.getStorageSync('token'),
          'City': wx.getStorageSync('liveCityId')
        },
        url: this.data.baseUrl + "/expo/shareReserve",
        data: data,
        success(data) {
          wx.hideLoading()
          if (data.data.code == 200) {
            //跳转成功页
            wx.navigateTo({
              url: '/pages/cloudPackage/cloudShowSuccess/index'
            })
          } else {
            wx.showToast({
              title: data.data.message ? data.data.message : "请求出错了",
              icon: "none"
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login?source=cloudShow',
      })
    }
  },

  //分享
  cloudShare() {
    if (wx.getStorageSync("isLogin")) {
      this.setData({
        showShare: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  //关闭弹层
  closeShare() {
    this.setData({
      showShare: false
    })
  },

  //关闭弹层
  closePopup() {
    this.setData({
      postPopup: false
    })
  },

  stop() {
    return false
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
      ADID: '33',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });

    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url
    console.log(url)
    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    } else if (type == 2) {
      wx.navigateToMiniProgram({
        appId: e.currentTarget.dataset.item.appid,
        path: e.currentTarget.dataset.item.url,
        complete(res) {

        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
      })
    }
  },

  //跳转规则页
  toRule() {
    if (!wx.getStorageSync('cloudRule')) {
      wx.showToast({
        title: '当前未开启推广奖励活动',
        icon: "none"
      })
    } else {
      wx.navigateTo({
        url: '/pages/cloudPackage/cloudRule/index',
      })
    }
  },

  //跳转其他小程序
  toLiveHome() {
    wx.navigateToMiniProgram({
      appId: "wx65a5078ca69b0e5f",
      path: "pages/address/index",
      complete(res) {
        console.log(res)
      }
    })
  },

  //跳转奖励页
  myAward() {
    if (wx.getStorageSync("isLogin")) {
      wx.navigateTo({
        url: '/pages/cloudPackage/cloudAward/index',
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail;
    this.setData({
      isAuth: true,
      isLogin: true
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getInfo(detail)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.stop);
    clearInterval(this.data.countDown);
    this.setData({
      pageOnload: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.stop);
    clearInterval(this.data.countDown);
    this.setData({
      pageOnload: false
    })
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
      title: '云逛展',
      imageUrl: "",
      path: '/pages/cloudShow/cloudShow?cloudInviteMobile=' + wx.getStorageSync("userInfo").mobile + "&inviteLiveCityId=" + wx.getStorageSync('liveCityId')
    }
  }
})