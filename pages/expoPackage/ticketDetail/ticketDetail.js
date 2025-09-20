var QRCode = require('../../../utils/qrcode.js')
import cryptoJs from '../../../utils/crypto.js';
import {
  ticketApi
} from "../../../common/api/ticketApi.js";
let Api = new ticketApi()
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ticketId: 0,
    // showTicket: false,
    ticketInfo: [],
    activityId:''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu({
      complete() {}
    })
    //屏幕调整为最亮
    wx.setScreenBrightness({
      value: 1
    })
    marketingApi.checkToken().then((res) => {
      if (res?.data?.result != 1 && wx.getStorageSync("isAuth")) {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      } else {
        if (res.data.result == 1) {
          this.setData({
            cityId: wx.getStorageSync('cityId'),
            userInfo: wx.getStorageSync("userInfo")
          })
          let pages = getCurrentPages();
          if (pages.length == 1) {
            // 获取分享的门票信息&&领取门票
            this.getTicketInfoAndGet()
          }
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'options 传参')
    if (options.from == "shareBtn") {
      wx.setStorageSync('src', "YYXCXliebian")
      wx.setStorageSync('uis', "分享门票按钮")
    }
    if (!options.ticketId) {
      wx.switchTab({
        url: '/pages/getTicket/getTicket',
      })
      return
    }
    wx.setStorageSync('shareTicketId', options.ticketId)
    //判断链接中是否有邀请手机号，有则是分享进入，无则门票列表进入
    if (options.ticketInviteMobile) {
      wx.setStorageSync('cityId', options.cityId)
      wx.setStorageSync('ticketInviteMobile', options.ticketInviteMobile)
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: wx.getStorageSync("cityId")
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
          //展中分享src,uis区别
          this.zhanzhong = true;
        }
      })
      // 获取分享的门票信息
      this.getTicketInfo();
    } else {
      this.showTicketInfo(wx.getStorageSync("shareTicketId"))
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

    //屏幕调整为最亮
    wx.setScreenBrightness({
      value: 1
    })
    //获取门票分享图片
    SvipApi.getAdvList({
      area_id: "27"
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          ticketShareAdv: res.data.adv27 || "",
        })
      }
    })
  },
  //授权手机号回调
  getPhoneBack() {
    //授权登录成功回调调用领取门票接口
    this.getTicket()
  },
  // 领取门票
  getTicket() {
    let that = this;
    cryptoJs.getAccessToken()
      .then(() => {
        if (that.data.cityInfo && that.data.cityInfo.activity_id) {
          wx.showLoading({
            title: '领取中...',
            mask: true
          })
          //索票接口
          let data1 = {
            source_id: "",
            src_id: "ticket",
            mobile: wx.getStorageSync("userInfo").mobile,
            invite: wx.getStorageSync("ticketInviteMobile"),
            activity_id: that.data.cityInfo.activity_id,
            'src': this.zhanzhong ? "YYXCXLP" : "YYXCXliebian",
            'uis': this.zhanzhong ? "展中分享门票" : wx.getStorageSync('uis'),
            'plan': wx.getStorageSync('plan'),
            'unit': wx.getStorageSync('unit'),
            ds: cryptoJs.tokenAES(),
            tk: wx.getStorageSync('accessToken')
          }
          marketingApi.getShareTicket(data1).then((res) => {
            wx.hideLoading()
            console.log(res, "领取的门票信息")
            if (res.code == 200) {
              that.setData({
                showTicket: true,
                ticketName: '领取成功'
              })
              setTimeout(function () {
                that.setData({
                  showTicket: false,
                })
              }, 3000)
              wx.setStorageSync('shareTicketId', res.ticket_id)
              this.showTicketInfo(wx.getStorageSync("shareTicketId"))
            } else {
              if (res.message == "您已索票，无需重复索票") {
                // console.log(res.ticket_id)
                wx.setStorageSync('shareTicketId', res.ticket_id)
                this.showTicketInfo(wx.getStorageSync("shareTicketId"))
                that.setData({
                  showTicket: true,
                  ticketName: '您已领取当届门票'
                })
                setTimeout(function () {
                  that.setData({
                    showTicket: false,
                  })
                }, 3000)
              } else {
                wx.showToast({
                  title: res.message ? res.message : "请求出错了",
                  icon: "none"
                })
              }
            }
          })
        } else {
          wx.switchTab({
            url: '/pages/getTicket/getTicket',
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
        this.setData({
          cityInfo: app.disposeData(res.data.data)
        })
        marketingApi.checkToken().then((res) => {
          if (res.data.result == 1) {
            this.getTicket();
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
  //获取分享的门票信息
  getTicketInfo() {
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
        this.setData({
          cityInfo: app.disposeData(res.data.data)
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none"
        })
      }
    })
  },
  //显示领取的门票信息
  showTicketInfo(ticketId) {
    let data1 = {
      ticketId: ticketId,
      token: wx.getStorageSync("token")
    }
    wx.showLoading({
      title: '二维码生成中...',
      mask: true
    })
    Api.getTicketInfo(data1, (res) => {
      console.log(res.data, "显示的门票信息")
      if (res.status == 1 && res.data.ticket_num) {
        this.setData({
          activityId:res.data.activity_id
        })
        let days = (new Date(res.data.end_date.split(" ")[0].replace(/\-/g, "/")) - new Date(res.data.begin_date.split(" ")[0].replace(/\-/g, "/"))) / 1000 / 60 / 60 / 24 + 1;
        let resData = app.disposeData(res.data);
        this.setData({
          days: days,
          ticketTime: resData.begin_date + "~" + resData.end_date,
          ticketInfo: res.data,
          ticketId: ticketId
        })
        let ticketNum = res.data.ticket_num;
        console.log(res.data.ticket_num, "门票id")
        //华为手机二维码出不来要调用两次才可以🙂
        new QRCode('qrcode', {
          text: ticketNum,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
        new QRCode('qrcode', {
          text: ticketNum,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
        SvipApi.activityInfo({
          cityId: this.data.ticketInfo.city_id
        }).then((res) => {
          if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
            //展中轮询检票接口 获取是否检票
            this.getChecked()
            console.log('res11111111111 :>> ', res);
          }
        })
        setTimeout(() => {
          wx.hideLoading()
        }, 50)
        return false
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '二维码生成失败!',
          duration: 800,
          success() {
            setTimeout(() => {
              wx.hideToast()
              wx.switchTab({
                url: '/pages/getTicket/getTicket',
              })
            }, 800)
          }
        })
        return
      }
    })
  },
  //获取是否检票
  getChecked() {
    let that = this;
    marketingApi.checkTicketStatus().then(res => {
      if (res.status == 1 && res.data.is_pop == 1 && !this.data.checkPopup) {
        clearTimeout(that.cTimer)
        that.setData({
          userData: res.data,
          checkPopup: true
        })
      }
    })
    this.cTimer = setTimeout(() => {
      that.getChecked()
    }, 3000);
  },
  closeCheck() {
    this.setData({
      checkPopup: false
    })
    //展中轮询检票接口 获取是否检票
    this.getChecked()
  },
  toSvipCenter() {
    wx.navigateTo({
      url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
    })
  },
  //提交formId
  pushFormId(e) {
    console.log(e.detail)
    SvipApi.pushFormId({
      formId: e.detail.formId
    }).then((res) => {})
  },

  toAddKin(e) {
    const {plan=null} = e.target.dataset
    const pasPlan = plan ? {pasPlan:plan} : {}
    const activityId = this.data.activityId
    const bindMobile = wx.getStorageSync("userInfo").mobile;
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.cTimer) {
      clearTimeout(this.cTimer)
    }
    if (wx.getStorageSync('screenLight')) {
      //屏幕亮度还原
      wx.setScreenBrightness({
        value: wx.getStorageSync('screenLight')
      })
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.cTimer) {
      clearTimeout(this.cTimer)
    }
    if (wx.getStorageSync('screenLight')) {
      //屏幕亮度还原
      wx.setScreenBrightness({
        value: wx.getStorageSync('screenLight')
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '您的亲友分享给您一张华夏家博会现场门票',
      imageUrl: this.data.ticketShareAdv ? this.data.ticketShareAdv[0].wap_image_url : "https://img.51jiabo.com/21d7670e-2324-495a-ab6c-4a07d603092a.png",
      path: '/pages/expoPackage/ticketDetail/ticketDetail?ticketId=' + this.data.ticketId + "&ticketInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + this.data.ticketInfo.city_id
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})