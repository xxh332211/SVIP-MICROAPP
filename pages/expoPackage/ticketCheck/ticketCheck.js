// pages/expoPackage//ticketCheck/ticketCheck.js
var QRCode = require('../../../utils/qrcode.js')
import {
  util
} from "../../../common/util.js"
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  ticketApi
} from "../../../common/api/ticketApi.js";
let Api = new ticketApi()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showXmbTips: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
    }
    //判断链接中是否有邀请手机号，有则是分享进入
    if (options.ticketInvitePhone) {
      wx.setStorageSync('cityId', options.cityId)
      wx.setStorageSync('ticketInvitePhone', options.ticketInvitePhone)
      wx.setStorageSync('shareTicketId', options.ticketId)
    }
    //分享图片二维码进入
    if (options.scene) {
      let arr = decodeURIComponent(options.scene).split("&");
      wx.setStorageSync('cityId', arr[2])
      wx.setStorageSync('ticketInvitePhone', arr[1])
      wx.setStorageSync('shareTicketId', arr[0])
    }
    wx.hideShareMenu({
      complete() {}
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
    let cityId = wx.getStorageSync('cityId')
    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=ticketCheck',
      })
      return
    } else if (cityId) {
      //获取页面所有接口信息
      this.getRequestInfo(cityId)
      this.getAdvData()
    } else {
      //定位
      util.getPositionCity("ticketCheck", () => {
        //定位成功请求数据
        let ciId = wx.getStorageSync('cityId');
        this.getRequestInfo(ciId)
        this.getAdvData()
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
  getSignInfo() {
    this.setData({
      giftConfigImg: ""
    })
    //获取签到礼信息
    SvipApi.getSignGiftInfo().then((res) => {
      if (res.status == 1 && res.data) {
        //1=未登录；2=已登录，用户非会员；3=已登录，未抽签到礼；4=已登录，抽实物签到礼；5=已登录，抽优惠券签到礼
        if (res.data.mode == 3) {
          this.setData({
            giftConfigImg: res.data.giftInfo.giftConfigImg
          })
        }
      }
    })
  },
  //获取运营位
  getAdvData() {
    SvipApi.getAdvList({
      area_id: "27,54,55"
    }).then((res) => {
      // 27:门票分享图片 54:icon运营位 55:通栏运营位
      if (res.status == 1) {
        this.setData({
          ticketShareAdv: res.data.adv27 || "",
          iconAdv: res.data.adv54 ? res.data.adv54.slice(0, 3) : [],
          acrcoAdv: res.data.adv55 || ""
        })
      } else {
        this.setData({
          iconAdv: [],
          acrcoAdv: []
        })
      }
    })
  },
  //抽取签到礼
  lottery() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.giftLottery().then((res) => {
      if (res.status == 1) {
        this.setData({
          signGiftGif: res.data.image_url,
          signPopup: true
        })
        //判断用户是否svip
        SvipApi.isSvip({
          cityId: wx.getStorageSync('cityId'),
          activityId: wx.getStorageSync('activityId')
        }).then(res => {
          if (res.status == 1) {
            this.setData({
              userInfo: res.data
            })
          }
        })
      }
      wx.hideLoading()
    })
  },
  closeSignPopup() {
    this.setData({
      showSvipPopup: this.data.userInfo.draw_type == 2 ? true : false,
      signPopup: false
    })
  },
  //获取登录状态数据
  getRequestInfo(cId) {
    this.setData({
      isLogin: wx.getStorageSync('isLogin')
    })
    if (this.data.isLogin) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      SvipApi.activityInfo({
        cityId: cId
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        this.setData({
          ticketPrice: res.zhanzhong_ticket_pic,
          isExpoSell: res.is_activity_buy_ticket, //判断是否开放展中售卖1开启,2不开
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
              showSvipPopup: res.data.draw_type == 2 ? true : false,
              userInfo: res.data
            })
            //获取签到礼
            this.getSignInfo()
            //判断是否索票
            marketingApi.getTicketsInfo().then((res) => {
              if (res.status == 1) {
                if (res.data.hasGetTicket) {
                  this.setData({
                    ticketInfo: res.data.ticketInfo
                  })
                  //有门票直接检票
                  this.checkTicket()
                } else if (wx.getStorageSync('ticketInvitePhone')) {
                  //有邀请手机号说明是分享进来的，则调用领取门票接口
                  this.getTicketInfoAndGet()
                } else if (this.data.userInfo.is_new_user == 0) {
                  //老用户无需购票
                  wx.hideLoading()
                  this.getTicket("old");
                }
                else {
                  wx.hideLoading()
                  this.setData({
                    ticChecked: false
                  })
                }
              } else {
                wx.hideLoading()
              }
            })
          } else {
            wx.hideLoading()
            this.setData({
              isLogin: false
            })
          }
        })
      })
    }
  },
  //检票
  checkTicket(tic) {
    let that = this;
    //有门票调检票接口 is_share：是否分享来的用户，0否1是
    marketingApi.ticketChecked({
      'src': "YYXCXLP",
      'uis': this.data.isExpoSell == 1 ? "老用户塞门票" : "现场领票",
      'plan': wx.getStorageSync('plan'),
      'unit': wx.getStorageSync('unit'),
      is_share: wx.getStorageSync('ticketInvitePhone') ? 1 : 0
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          ticChecked: true
        })
        if (tic) {
          //有tic说明之前没有门票，则弹窗提示领票成功
          that.setData({
            tipsText: "领票成功！",
            tipsPopup: true
          })
          setTimeout(() => {
            that.setData({
              tipsPopup: false
            })
          }, 3000);
        }
        // 熊猫币提示
        that.xmbModal()
        //获取门票号
        marketingApi.getTicketsInfo().then((res) => {
          wx.hideLoading()
          if (res.status == 1) {
            wx.setStorageSync("shareTicketId", res.data.ticketInfo.id)
            wx.showShareMenu()
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.message ? res.message : "请求出错了",
          icon: "none"
        })
      }
    })
  },
  //获取分享的门票信息&&领取门票
  getTicketInfoAndGet() {
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      ticketId: wx.getStorageSync("shareTicketId")
    }
    Api.getShareIdTicketInfo(params, (res) => {
      wx.hideLoading()
      console.log(res, "分享的门票信息")
      if (res.data.status == 1) {
        marketingApi.checkToken().then((res) => {
          if (res.data.result == 1) {
            this.getTicket("share");
          }
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none"
        })
      }
    })
  },
  //授权手机号回调
  getPhoneBack(e) {
    this.setData({
      isAuth: true,
      isLogin: true
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getRequestInfo(wx.getStorageSync('cityId'))
  },
  closeShare() {
    this.setData({
      sharePopup: false
    })
  },
  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      this.getRequestInfo(wx.getStorageSync('cityId'))
    })
  },
  fastShare() {
    wx.showLoading({
      title: '分享码生成中...',
      mask: true
    })
    marketingApi.getMiniCode({
      //
      page: "pages/expoPackage/ticketCheck/ticketCheck",
      scene: wx.getStorageSync("shareTicketId") + "&" + wx.getStorageSync("userInfo").mobile + "&" + wx.getStorageSync("cityId")
    }).then((data) => {
      console.log(data)
      wx.hideLoading()
      if (data.data && data.status == 1) {
        this.setData({
          miniCode: data.data,
          sharePopup: true
        })
      } else {
        wx.showToast({
          title: '生成小程序码失败',
          icon: "none"
        })
      }
    })
  },
  getTicket(from) {
    wx.showLoading({
      title: '索票中...',
      mask: true
    })
    if (from == "share") {
      //邀请进来的才调用索票接口
      let data = {
        source_id: "",
        src_id: "ticket_check",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: wx.getStorageSync("ticketInvitePhone"),
        formId: "",
        'src': "YYXCXLP",
        'uis': "展中分享门票",
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      marketingApi.postReserve(data).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          wx.setStorageSync("nextActivity", res.activityInfo)
          this.checkTicket("notTicket")
        } else {
          wx.showToast({
            title: res.message ? res.message : "请求出错了",
            icon: "none"
          })
        }
      })
    } else {
      //不售卖门票直接检票
      this.checkTicket("notTicket")
    }
  },
  buyTicket() {
    wx.showLoading({
      title: '支付中...',
      mask: true
    })
    let data = {
      cityId: wx.getStorageSync('cityId'),
      payType: 2,
      uis: '现场购票',
      src: 'YYXCXLP'
    }
    SvipApi.saleTicket(data, "POST").then((res) => {
      let that = this;
      if (res.status == 1) {
        var res = res.data
        wx.requestPayment({
          'timeStamp': res.time_stamp,
          'nonceStr': res.nonce_str,
          'package': res.package,
          'signType': "MD5",
          'paySign': res.pay_sign,
          'success': function (res) {
            wx.hideLoading()
            that.setData({
              tipsText: "购票成功！",
              tipsPopup: true
            })
            setTimeout(() => {
              that.setData({
                tipsPopup: false
              })
            }, 3000);
            // 支付成功不能立马拿到ticketId，需要1s左右才能拿到
            setTimeout(() => {
              that.getRequestInfo(wx.getStorageSync('cityId'))
            }, 500)
          },
          'fail': function (res) {
            wx.hideLoading()
          }
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },

  //运营位链接跳转 先判断url是否为tabbar
  isTab(url) {
    let tabUrls = [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/cloudShow/cloudShow',
      'pages/home/home',
      'pages/user/userHome'
    ]
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  swiperUrl(e) {
    // 友盟统计
    wx.uma.trackEvent('click_AD', {
      cityId: wx.getStorageSync('cityId'),
      ADID: e.currentTarget.dataset.area_id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });

    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url
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

  toSvipCenter() {
    wx.navigateTo({
      url: '/pages/svipPackage/svipUserCenter/svipUserCenter?scroll=sign',
    })
  },

  svipPopup() {
    this.setData({
      showSvipPopup: !this.data.showSvipPopup
    })
  },

  // 添加亲友
  toAddKin(e) {
    const {plan=null} = e.target.dataset
    const pasPlan = plan ? {pasPlan:plan} : {}
    const activityId = wx.getStorageSync("activityId"),
      bindMobile = wx.getStorageSync("userInfo").mobile;
    marketingApi.getKey({
      activityId,
      bindMobile,
      ...pasPlan,
    }).then((res) => {
      //判断环境跳转不同H5页面
      let url = `https://svip-test.jia-expo.com/addKin?key=${res.infoMap.key}`
      let version = __wxConfig.envVersion
      if (!version) version = __wxConfig.platform
      if (version == "release") {
        url = `https://svip.51jiabo.com/addKin?key=${res.infoMap.key}`
      }
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url)
      })
    })
  },
  // 熊猫币数量弹框
  xmbModal() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let data = {
      id: 6
    }
    SvipApi.xmbModal(data).then(res => {
      wx.hideLoading();
      if (res.code == 200 && res.result.activity_status > 0) {
        this.setData({
          showXmbTips: true,
          xmbPopupData: res.result
        })
      }
    })
  },

  // 熊猫币中心跳转
  toXmbCenter() {
    wx.navigateTo({
      url: '/pages-xmb/pages/xmbCenter/index/index',
    })
  },

  // 熊猫币抽奖跳转
  toXmbLottery() {
    wx.navigateTo({
      url: '/pages-xmb/pages/luckyDraw/luckyDraw',
    })
  },

  closeXmbTips() {
    this.setData({
      showXmbTips: false
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
  onShareAppMessage: function (res) {
    return {
      title: '您的亲友分享给您一张华夏家博会现场门票',
      imageUrl: this.data.ticketShareAdv ? this.data.ticketShareAdv[0].wap_image_url : "https://img.51jiabo.com/21d7670e-2324-495a-ab6c-4a07d603092a.png",
      path: '/pages/expoPackage/ticketCheck/ticketCheck?ticketId=' + wx.getStorageSync("shareTicketId") + "&ticketInvitePhone=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + wx.getStorageSync("cityId")
    }
  }
})