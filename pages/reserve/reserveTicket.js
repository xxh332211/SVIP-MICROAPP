let app = getApp()
import {
  svip
} from '../../common/api/svipApi.js'
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
import cryptoJs from '../../utils/crypto.js';
import {
  util
} from "../../common/util.js"
let marketingApi = new marketing()
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
    tabIndex: 0,
    reserveTicket: false,
    sending: false,
    timeTic: 60,
    hide: true,
    curCity: '加载中..',
    userInfo: '华夏家博',
    phoneValue: null,
    codeValue: null,
    name: '',
    sending: null,
    isSvip: false,
    isLogin: null,
    cityId: null,
    activityId: null,
    userInfo: null,
    isReserve: false, // 是否预约
    reserveActivityId: null,
    headWriter: "",
    equityData: [],
    orderRightsList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      selected: 2
    })
    wx.showLoading({
      title: '加载中...',
    })
    wx.getStorageSync('curUserCityText')
    this.setData({
      curCity: wx.getStorageSync('curUserCityText'),
      isLogin: wx.getStorageSync('isLogin'),
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
      userInfo: wx.getStorageSync('userInfo')
    })
    this.getOrderEquity({
      cityId: this.data.cityId
    })
    if (this.data.isLogin) {
      this.getReserveInfo()
      this.getLastUserInfo()
    }
    //预约成功运营位
    SvipApi.getAdvList({
      area_id: "21"
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          successAdv: res.data.adv21?.[0] || "",
        })
      } else {
        this.setData({
          successAdv: ""
        })
      }
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

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      let text = "list[1].text"
      if(this.data.cityId == 60){
        this.getTabBar().setData({
          [text]:'装修狂欢节'
        })
      }else{
        this.getTabBar().setData({
          [text]:'家博会'
        })
      }
    }
  },
  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      this.getReserveInfo()
      this.getLastUserInfo()
    })
  },
  // 登录判定是否预约过
  getReserveInfo() {
    let params = {
      cityId: this.data.cityId
    }
    SvipApi.reserveInfo(params).then((res) => {
      console.log(res, '预约结果 0是未预约')
      if (res.status == 1) {
        if (res.data.reserve_id == 0) { //没预约
          this.setData({
            isReserve: false
          })
        } else {
          this.setData({
            isReserve: true
          })
        }
      }
    })
  },
  // 登录了直接预约
  loginReserveTicketHandle(e) {
    if (this.data.isReserve) {
      wx.showModal({
        showCancel: false,
        confirmColor: '#e6002d',
        content: '您已经预约成功，请勿重复预约！',
      })
      return false;
    }
    let data = {
      cityId: this.data.cityId,
      'src': wx.getStorageSync("svipInviteMobile") ? "YYXCXliebian" : wx.getStorageSync('src'),
      'uis': wx.getStorageSync('uis'),
      invite: wx.getStorageSync("svipInviteMobile"),
      formId: e.detail.formId,
    }
    if (this.data.isLogin) {
      wx.showLoading({
        title: '预约中...',
      })
      SvipApi.reserveTicket(data, 'POST').then(res => {
        if (this.data.successAdv) {
          this.setData({
            reserveSuc: true
          })
        } else {
          let areaContent = '华夏家博';
          if(this.data.cityId == 60) areaContent = '宁波装修狂欢节';
          wx.showModal({
            title: "预约成功",
            confirmColor: '#e6002d',
            showCancel: false,
            content: `恭喜您预约成功！权益上线后我们会第一时间 与您联系，${areaContent}等您来~`
          })
        }
        this.setData({
          isReserve: true
        })
        wx.hideLoading()
      })
      return false
    }
    if (!this.data.isLogin) {
      // 没登录 开始填表单
      this.setData({
        reserveTicket: true
      })
    }
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
  advUrl(e) {
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
  // 
  closeSuc() {
    this.setData({
      reserveSuc: false
    })
  },
  // 预约
  reserveTicketHandle2(e) {
    if (!this.data.isReserve) {
      this.loginReserveTicketHandle(e)
    } else {
      wx.showModal({
        showCancel: false,
        confirmColor: '#e6002d',
        content: '您已经预约成功，请勿重复预约！',
      })
    }
  },
  //获取预约权益图片
  getOrderEquity(data) {
    SvipApi.getOrderEquity(data).then((res) => {
      wx.hideLoading()
      this.setData({
        //头部文案
        headWriter: res.head_writer.split(";"),
        //会员说明
        svipDesc: res.svip_description_list,
        // 权益图片
        equityData: res.img_list
      })
      wx.setStorageSync('orderRightsList', res.img_list)
    })
  },
  //未登录弹窗，预约
  reserveTicketHandle(e) {
    if (!this.data.phoneValue) {
      return wx.showToast({
        icon: 'none',
        title: '请填写手机号',
      })
    }
    if (!this.data.codeValue) {
      return wx.showToast({
        icon: 'none',
        title: '请填写验证码',
      })
    }
    wx.showLoading({
      title: '预约中...',
    })
    SvipApi.pushFormId({
      formId: e.detail.formId
    }).then((res) => {
      let data = {
        mobile: this.data.phoneValue,
        code: this.data.codeValue,
        cityId: this.data.cityId,
        name: this.data.name,
        'src': wx.getStorageSync("svipInviteMobile") ? "YYXCXliebian" : wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        invite: wx.getStorageSync("svipInviteMobile"),
        formId: e.detail.formId
      }
      // 判断异常
      console.log(data, '//未登录预约参数数')
      SvipApi.outReserveTicket(data, 'POST').then(res => {
        wx.hideLoading()
        if (this.data.successAdv) {
          this.setData({
            reserveSuc: true
          })
        } else {
          let areaContent = '华夏家博';
          if(this.data.cityId == 60) areaContent = '宁波装修狂欢节';
          wx.showModal({
            title: "预约成功",
            confirmColor: '#e6002d',
            showCancel: false,
            content: `恭喜您预约成功！权益上线后我们会第一时间 与您联系，${areaContent}等您来~`
          })
        }
        this.setData({
          // isReserve: true,
          reserveTicket: false
        })
      }).catch((err) => {})
    })
  },
  // 登录回来获取上一届svip
  getLastUserInfo: function () {
    let data = {
      cityId: this.data.cityId
    }
    SvipApi.getUserSvipInfo(data).then((res) => {
      let status = res.svip == 1 ? true : false
      console.log(res, status, '预约页面 svip')
      this.setData({
        isSvip: status
      })
      wx.setStorageSync('isSvip', status)
    })
  },
  goLogin() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  goSvipCenter() {
    if (this.data.isLogin && this.data.isSvip) {
      wx.navigateTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
    }
  },

  showDialog(e) {
    // 显示
    let aList = wx.getStorageSync('orderRightsList')
    //console.log(aList, e)
    let newArr = []
    aList.forEach((item, index) => {
      if (item.sort == e.currentTarget.dataset.item.sort) {
        let a = aList.slice(index)
        newArr = a.concat(aList.slice(0, index))
        this.setData({
          dialogList: newArr,
          hide: false
        })
      }
    })
  },
  closeDialog() {
    this.setData({
      hide: true
    })
  },
  //授权手机号回调
  getPhoneBack() {
    this.setData({
      isLogin: true
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getReserveInfo()
    this.getLastUserInfo()
  },
  // 设置名字
  setName(e) {
    let reg = /[^\w\u4e00-\u9fa5]/g
    let val = e.detail.value
    if (reg.test(val)) {
      return wx.showToast({
        icon: 'none',
        title: '请填写中英文或者数字！',
      })
    }
    this.setData({
      name: e.detail.value
    })
  },
  // 设置电话号码
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
    let mbNUm = this.data.phoneValue
    if (!mbNUm || mbNUm == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写手机号',
      })
      return false;
    }

    if (mbNUm.length != 11) {
      wx.showToast({
        icon: "none",
        title: '手机号码长度不符！',
      })
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mbNUm)) {
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
    wx.showLoading({
      title: '获取中...',
    })
    let data = {
      mobile: this.data.phoneValue,
      ds: cryptoJs.tokenAES(),
      tk: wx.getStorageSync('accessToken')
    }
    SvipApi.verificationCode(data, 'POST').then((res) => {
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
    }).catch((err) => {
      console.log(err, '0')
      wx.showToast({
        title: err.data.message + "!",
      })
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
  cancelHandle() {
    this.setData({
      reserveTicket: false
    })
  },
  //选择城市
  chooseCity() {
    wx.navigateTo({
      url: '/pages/address/index',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  onUnload: function () {},
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

  }
})