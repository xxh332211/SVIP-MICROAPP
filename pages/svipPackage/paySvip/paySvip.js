import {
  svip
} from "../../../common/api/svipApi.js"
import cryptoJs from '../../../utils/crypto.js';
let SvipApi = new svip()

// 点击购买先判断是否是登录
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    color: '#000',
    background: '#f8f8f8',
    show: true,
    animated: false,
    timeTic: 0,
    activityId: 0,
    cityId: 0,
    showCity: false,
    showchangePhoneModal: false,
    cityList: [],
    svipPurchaseRecord: null,
    cityName: '',
    userNumber: '',
    price: "",
    session: '',
    phoneValue: null,
    codeValue: null,
    sending: false,
    dialogShow: false,
    dialogList: [],
    rightsList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      origin: options.origin ? options.origin : "",
      navigateHeight: app.systemData.statusBarHeight,
      mcoCurData: options.mcoCurData ? JSON.parse(options.mcoCurData) : null,
      mcoCurPrice: options.mcoCurPrice || null
    })
    if (wx.getStorageSync('isSvip')) {
      wx.redirectTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
      return
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!wx.getStorageSync("token")) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    if (!wx.getStorageSync('activityId') || !wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index',
      })
      return
    }
    let userInfo = wx.getStorageSync('userInfo')
    let activityInfo = wx.getStorageSync('activityInfo')
    let totalRightsList = wx.getStorageSync('totalRightsList')
    this.setData({
      activityId: wx.getStorageSync('activityId'),
      userNumber: userInfo.mobile,
      session: activityInfo.session,
      rightsList: this.splitArr(totalRightsList),
    })
    //进来默认获取城市信息
    this.toggleCity(wx.getStorageSync('cityId'))
    // 拉城市列表
    SvipApi.citylist().then((res) => {
      this.setData({
        cityList: res
      })
    })
    // 滚动播报
    SvipApi.getSvipPurchaseRecord().then((res) => {
      this.setData({
        svipPurchaseRecord: res
      })
    })
    //用户行为记录
    this.data.pv_b_time = new Date().getTime();
    this.postPV(9, 1)
  },
  //返回
  goBack() {
    if (this.data.isDiscount) {
      this.setData({
        showTipsPopup: true
      })
    } else {
      let pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({
          url: "/pages/home/home"
        })
      }
    }
  },
  returnPrePage() {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: "/pages/home/home"
      })
    }
  },
  confirm() {
    this.setData({
      showTipsPopup: false
    })
  },
  /**
   * 切换城市
   */
  toggleCity(e) {
    wx.showLoading({
      title: '获取展会信息中...',
      mask: true
    })
    let cityId = "",
      cityName = "";
    if (e.currentTarget) {
      cityId = e.currentTarget.dataset.text.id;
      cityName = e.currentTarget.dataset.text.city_name
    } else {
      cityId = e;
      cityName = wx.getStorageSync('curUserCityText')
    }
    let params = {
      cityId: cityId,
      activityId: null
    }
    SvipApi.activityInfo(params).then((res) => {
      let actData = app.disposeData(res);
      wx.setStorageSync('cityId', params.cityId)
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync('activityId', res.activity_id)
      wx.setStorageSync('curUserCityText', cityName)
      wx.setStorageSync('activityInfo', actData)
      this.setData({
        cityName: res.city_name,
        date: actData.buy_time + '~' + actData.end_date,
        session: res.session,
        activityId: res.activity_id,
        cityId: params.cityId
      })
      this.getRights() // 获取权益的配置
      let isBegin = Number(res.is_active)
      if (isBegin === 0) {
        wx.setStorageSync('isThisGoing', true)
        wx.reLaunch({
          url: '/pages/reserve/reserveTicket',
        })
        return false
      }
    })
    this.setData({
      showCity: false
    })
  },
  // 获取权益的方法
  getRights() {
    let params = {
      activityId: this.data.activityId,
      cityId: this.data.cityId
    }
    SvipApi.homeData(params).then((res) => {
      wx.hideLoading()
      // res.activity_id
      wx.setStorageSync('pageGuideList', res.page_guide_list)
      wx.setStorageSync('totalRightsList', res.images_quanyi)
      this.setData({
        price: Number(res.price),
        rightsList: res.images_quanyi ? this.splitArr(res.images_quanyi) : null,
        isZhanzhong: res.is_show_zhanzhong_button
      })
      //当前时间大于恢复原价时间则显示原价
      if (res.recovery_price_date) {
        let now = new Date().getTime();
        let showTime = new Date(res.recovery_price_date.replace(/\-/g, "/")).getTime();
        if (now > showTime) {
          this.setData({
            price: Number(res.origin_price)
          })
        }
      }
      //获取可使用svip抵扣券
      this.getCanUseCoupon()
    })
  },
  getCanUseCoupon() {
    this.setData({
      hasCoupon: false,
      isDiscount: false,
      svipCouponId: 0
    })
    SvipApi.userSvipCouponData().then((res) => {
      if (res.status == 1) {
        for (let v of res.data.coupon_info) {
          if (v.consume_amount <= this.data.price) {
            //当前优惠券可用
            this.setData({
              isDiscount: true,
              couponAmount: v.coupon_value,
              discountPrice: (Number(this.data.price) * 1000 - Number(v.coupon_value) * 1000) / 1000,
              svipCouponId: v.coupon_id
            })
            break
          }
        }
        if (res.data.coupon_info.length > 0 && !this.data.isDiscount) {
          //有优惠券但没有满足条件的
          this.setData({
            hasCoupon: true
          })
        }
      }
    })
  },
  splitArr(arr) {
    if (!arr) return
    if (arr.length <= 4) {
      return [arr]
    }
    if (arr.length == 6) {
      return [arr.slice(0, 3), arr.slice(3)]
    }
    return [arr.slice(0, 2), arr.slice(2)]
  },
  /**
   * 展开城市
   */
  changeCity() {
    if (this.data.cityList.length > 0) {
      if (this.data.showCity) {
        this.setData({
          showCity: false
        })
      } else {
        this.setData({
          showCity: true
        })
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: '没有其他城市!',
      })
    }
  },
  // 切换登录
  setPhone(e) {
    this.setData({
      phoneValue: e.detail.value
    })
  },
  setCode(e) {
    this.setData({
      codeValue: e.detail.value
    })
  },
  // 获取验证码
  getIdCode: function () {
    cryptoJs.getAccessToken()
      .then(() => {
        this.getIdCodeStep2()
      })
  },
  getIdCodeStep2() {
    let mbNum = this.data.phoneValue
    if (!mbNum || mbNum == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写手机号',
      })
      return false;
    }
    if (mbNum.length != 11) {
      wx.showToast({
        icon: "none",
        title: '手机号码长度不符！',
      })
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mbNum)) {
      wx.showToast({
        icon: "none",
        title: '请输入有效的手机号码！',
      })
      return false;
    }
    if (this.data.sending) return false;
    this.setData({
      sending: true
    })
    let data = {
      mobile: this.data.phoneValue,
      ds: cryptoJs.tokenAES(),
      tk: wx.getStorageSync('accessToken')
    }
    SvipApi.verificationCode(data, 'POST').then((res) => {
      console.log(res)
      wx.hideLoading()
      if (res.status == 1) {
        wx.showToast({
          title: "发送成功!",
        })
        this.getCodeTime(59);
      } else if (res.status == -2) {
        // this.getIdCode()
        SvipApi.verificationCode(data, 'POST').then((res) => {
          console.log(res)
          if (res.status == 1) {
            wx.showToast({
              title: "发送成功!",
            })
            this.getCodeTime(59);
          } else {
            this.setData({
              sending: false
            })
            wx.showToast({
              title: res.message ? res.message : "发送失败",
              icon: "none"
            })
          }
        })
      } else {
        this.setData({
          sending: false
        })
        wx.showToast({
          title: res.message ? res.message : "发送失败",
          icon: "none"
        })
      }
    })
  },
  // 计算验证码倒计时
  getCodeTime: function (sec) {
    this.setData({
      timeTic: sec
    })
    var that = this
    var timeTic = this.data.timeTic;
    var interval = setInterval(function () {
      timeTic--;
      that.setData({
        timeTic: timeTic
      })
      if (timeTic <= 0) {
        clearInterval(interval)
        that.setData({
          sending: false,
          timeTic: 0
        })
      }
    }, 1000)
    return true;
  },
  loginByProfile() {
    let c = this.data.codeValue
    let p = this.data.phoneValue
    if (!c || !p) {
      wx.showModal({
        icon: 'none',
        title: '请完整填写手机号和验证码!',
      })
      return
    }
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      complete: (res) => {
        let e = {
          detail: res
        };
        this.confirmHandle(e)
      }
    })
  },
  //确定（登录）
  confirmHandle: function (e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    let c = this.data.codeValue
    let p = this.data.phoneValue
    if (!c || !p) {
      wx.showModal({
        icon: 'none',
        title: '请完整填写手机号和验证码!',
      })
      return
    }
    if (e.detail.errMsg != "getUserInfo:ok" && e.detail.errMsg != "getUserProfile:ok") {
      wx.showModal({
        title: '登录提示!',
        content: '请允许授权,否则无法登录!',
        showCancel: false
      })
      return false
    }
    let avatar = e.detail.userInfo.avatarUrl
    let nickname = e.detail.userInfo.nickName
    let that = this
    wx.login({
      success(res) {
        if (res.code) {
          let data = {
            mobile: that.data.phoneValue,
            code: that.data.codeValue,
            uis: wx.getStorageSync('uis'),
            src: wx.getStorageSync('src'),
            wxcode: res.code,
            avatar: avatar,
            nickname: nickname
          }
          wx.showLoading({
            title: '切换中...',
          })
          SvipApi.login(data, 'POST').then((res) => {
            wx.setStorageSync('token', res.token)
            wx.setStorageSync('userInfo', res.user_info)
            wx.setStorageSync('isLogin', true)
            wx.setStorageSync("token", res.token)
            //获取可使用svip抵扣券
            that.getCanUseCoupon()
            that.setData({
              userNumber: res.user_info.mobile,
              showchangePhoneModal: false,
              phoneValue: "",
              codeValue: ""
            })
            wx.hideLoading()
          })
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '切换失败',
            icon: 'none',
            duration: 1000
          })
          console.log('切换登录失败！原因：' + res.errMsg)
        }
      }
    })
  },
  cancelHandle() {
    this.setData({
      showchangePhoneModal: false
    })
  },
  dialogShow(e) {
    // 显示
    let aList = wx.getStorageSync('totalRightsList')
    let newArr = []
    aList.forEach((item, index) => {
      if (item.id == e.detail.id) {
        let a = aList.slice(index)
        newArr = a.concat(aList.slice(0, index))
        this.setData({
          dialogList: newArr,
          dialogShow: true
        })
      }
    })
  },
  dialogHide() {
    this.setData({
      dialogShow: false
    })
  },
  /**
   * 支付方法
   */
  paySvip: function (e) {
    wx.showLoading({
      title: '支付中...',
      mask: true
    })
    //用户行为记录
    this.postPV(11, 1)
    let data = {
      scId: this.data.svipCouponId ? this.data.svipCouponId : 0,
      cityId: this.data.cityId,
      activityId: this.data.activityId,
      payType: 3,
      pay_from: 2,
      invite: wx.getStorageSync("svipInviteMobile"),
      formId: e.detail.formId,
      'src': wx.getStorageSync("svipInviteMobile") ? "YYXCXliebian" : wx.getStorageSync('src'),
      'uis': wx.getStorageSync('uis'),
      'plan': wx.getStorageSync('plan'),
      'unit': wx.getStorageSync('unit')
    }
    SvipApi.paySvip(data, "POST").then((res) => {
      let that = this;
      wx.hideLoading()
      if (res.status == 1) {
        wx.requestPayment({
          'timeStamp': res.data.time_stamp,
          'nonceStr': res.data.nonce_str,
          'package': res.data.package,
          'signType': "MD5",
          'paySign': res.data.pay_sign,
          'success': function (res) {
            that.paySuccess()
          },
          'fail': function (res) {
            //用户行为记录
            that.postPV(13, 1)
            wx.showToast({
              title: '支付失败!',
            })
          }
        })
      } else if (res.status == 2) {
        //使用抵扣券，0元购买成功
        that.paySuccess()
      } else {
        wx.showToast({
          title: res.message,
          icon: "none",
          duration: 3000
        })
      }
    })
  },
  paySuccess() {
    let that = this;
    wx.hideToast();
    wx.setStorageSync('isSvip', true)
    //提交投放参数
    if (wx.getStorageSync("gdt_vid")) {
      wx.request({
        url: "https://api.51jiabo.com/youzan/wxAD/wxReported",
        method: 'POST',
        data: {
          clickId: wx.getStorageSync("gdt_vid"),
          weixinadinfo: wx.getStorageSync("weixinadinfo"),
          type: 2,
          cityId: wx.getStorageSync('cityId'),
          session: wx.getStorageSync('sessionId'),
          mobile: wx.getStorageSync("userInfo").mobile
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        complete: function (res) {
          wx.removeStorageSync('gdt_vid');
          wx.removeStorageSync('weixinadinfo')
          console.log(res, "投放接口")
        }
      })
    }
    //用户行为记录
    that.postPV(12, 1)
    setTimeout(() => {
      if (that.data.origin) {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        // n选1
        if (that.data.origin == 'mco') {
          prevPage.setData({
            mcoCurData: this.data.mcoCurData,
            mcoCurPrice: this.data.mcoCurPrice,
          })
        }
        // n选1详情页
        if (that.data.origin == 'mcoDetail') {
          prevPage.setData({
            showMCO_svipTips: true
          })
        }
        wx.navigateBack({
          delda: 1
        })
      } else {
        wx.redirectTo({
          url: '/pages/svipPackage/svipUserCenter/svipUserCenter?orderId=1&preFrom=svipPay',
        })
      }
    }, 10)

  },
  // 切换登录
  changelogin() {
    this.setData({
      showchangePhoneModal: true
    })
  },
  //用户行为记录
  postPV(id, type) {
    SvipApi.postPV({
      envent_id: id,
      source: "svip_xcx",
      begin_time: this.data.pv_b_time,
      end_time: new Date().getTime(),
      pv_type: type,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    }).then((res) => {

    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //用户行为记录
    this.postPV(9, 2)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //用户行为记录
    this.postPV(9, 2)
  },
})