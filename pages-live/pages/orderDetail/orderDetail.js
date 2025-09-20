let QRCode = require('../../../utils/qrcode')
import cryptoJs from '../../../utils/crypto';
import {
  liveApi
} from "../../../common/api/liveApi"
import {
  absApi
} from "../../../common/api/absAPI";
import {
  svip,
} from "../../../common/api/svipApi";
const SvipApi = new svip()
const AbsApi = new absApi()
const LiveApi = new liveApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fudaipop: false,
    showCargo: false, //待提货
    flag: true,
    showCodePopup: false,
    showRefundPopup: false,
    showConfirmPopup: false,
    showAddress: false,
    showPay: false, //确认支付按钮
    showDate: false,
    showPickCode: false,
    maxtime: 0,

    // -------- pop ---------
    pop1: false,
    pop2: false,
    pop3: false,
    pop4: false,
    pop5: false,
    pop6: false,
    // ----------------------
    order: {},
    qrCodeD: {},
    use_code: "",
    create_time: "2020-12-10 16:49:48",
    tabUrls: [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/cloudShow/cloudShow',
      'pages/home/home',
      'pages/user/userHome'
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.getCanvasWidth()
    // 获取福袋弹窗
    SvipApi.getAdvList({
      area_id: "63"
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          brandAdv: res.data.adv63?.[0] || {}
        })
      } else {
        this.setData({
          brandAdv: {}
        })
      }
    })
    // this.setData({
    //   detail_id: options.id
    // })
    // this.PreOrderDetail()
    // this.BindData(res)
    this.InitData(options.order_id)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    if (this.data.maxtime == 0) {
      clearInterval(timer)
    }
    var timer = setInterval(() => {
      var maxtime = that.data.maxtime
      this.countDown(maxtime)
    }, 1000);
  },
  // 初始化数据
  InitData(order_id) {
    const that = this
    const data = {
      order_id,
    }
    AbsApi.preOrderDetail(data).then(res => {
      wx.hideLoading()
      const s = res.data.create_time;
      let create_time = new Date(s.replace(/-/g, '/')).getTime() + 15 * 60 * 1000,
        newDares = new Date().getTime(),
        endTime = new Date(res.data.expo_end_time.replace(/-/g, '/')).getTime();
      res.data.expo_begin_time = res.data.expo_begin_time.split(" ")[0].substr(5).replace(/-/g, '.');
      res.data.expo_end_time = res.data.expo_end_time.split(" ")[0].substr(5).replace(/-/g, '.');
      that.setData({
        expoEnd: newDares > endTime ? true : false,
        order: res.data,
        maxtime: ((create_time - newDares) / 1000).toFixed(0)
      })
    })
  },
  // 倒计时
  countDown(maxtime) {
    if (maxtime >= 0) {
      var minutes = Math.floor(maxtime / 60);
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      var seconds = Math.floor(maxtime % 60);
      if (seconds < 10) {
        seconds = '0' + seconds
      }
      var msg = minutes + ":" + seconds;
      --maxtime;
      this.setData({
        maxtime: maxtime,
        msg: msg
      })
    }
  },
  // 自适应二维码
  getCanvasWidth() {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        const v = 750 / res.windowWidth; //设计稿尺寸除以  当前手机屏幕宽度
        that.setData({
          v: v
        })

      }
    })
  },
  //查看全部地址
  addressLook(e) {
    var map = JSON.stringify(e.currentTarget.dataset.map)
    wx.navigateTo({
      url: '../address/address?map=' + map,
    })
  },
  // 显示二维码
  codeBtn(e) {
    this.setData({
      flag: false,
      showCodePopup: false,
      use_code: e.currentTarget.dataset.use_code
    })

    // new QRCode("qrcode", {
    //   text: e.currentTarget.dataset.use_code,
    //   width: 460 / this.data.v,
    //   height: 460 / this.data.v,
    //   colorDark: "#000000",
    //   colorLight: "#ffffff",
    //   correctLevel: QRCode.CorrectLevel.H,
    // });
  },
  // 二维码弹窗点击完成
  confirmCodeBtn() {
    this.setData({
      flag: true,
      showCodePopup: true
    })
    this.PreOrderDetail()
  },
  // 点击退款
  refundBtn(e) {
    this.setData({
      flag: false,
      showCodePopup: true,
      showRefundPopup: true,
      use_code: e.currentTarget.dataset.use_code
    })
  },
  refundCancel() {
    this.setData({
      flag: true,
      showCodePopup: true,
      showRefundPopup: false
    })
  },
  // 确认退款
  refundConfirm() {
    this.refundPri()
  },
  knowBtn() {
    this.setData({
      flag: true,
      showCodePopup: true,
      showConfirmPopup: false
    })
  },
  // 确认支付
  confirmPay() {
    this.ToPay()
  },

  PreOrderDetail() {
    // wx.showLoading({
    //   title: '加载中',
    //   mask:true
    // })
    let data = {
      City: wx.getStorageSync('cityId'),
      Activity: wx.getStorageSync('activityId'),
      Token: wx.getStorageSync('token'),
      detail_id: this.data.detail_id
    }
    LiveApi.PreOrderDetail(data).then((res) => {
      // wx.hideLoading()

      // if(res.code == 200){
      this.BindData(res)
      // }else{
      //   wx.showToast({
      //     title: res.message,
      //     icon:'none'
      //   })
      // }
    })
  },
  // 绑定数据
  BindData: function (res) {
    if (res.result.order_status_text == '待提货') {
      this.setData({
        showPickCode: true,
        showCargo: true,
        showAddress: true
      })
    } else if (res.result.order_status_text == '已完成') {
      this.setData({
        showPickCode: true,
        showCargo: false,
        showAddress: true
      })
    } else {
      var create_time = new Date(res.result.create_time.replace(/-/g, '/')).getTime() + 10 * 60 * 1000
      var newDares = new Date().getTime()
      this.setData({
        showPay: true,
        showDate: true,
        showAddress: false,
        maxtime: ((create_time - newDares) / 1000).toFixed(0)
      })
    }
    this.setData({
      order_status: res.result.order_status,
      order_num: res.result.order_num,
      prerogative_name: res.result.prerogative_name,
      exclusive_price: res.result.exclusive_price,
      earnest: res.result.earnest,
      buy_count: res.result.buy_count,
      buy_amount: res.result.buy_amount,
      map: res.result.map,
      goodsCode: res.result.goodsCode,
      user_mobile: res.result.user_mobile,
      create_time: res.result.create_time,
      pay_type_id: res.result.pay_type_id,
      remarks: res.result.remarks,
      paid_money: res.result.paid_money,
      order_status_text: res.result.order_status_text,
      image_url: res.result.image_url,
      use_end_time: res.result.use_end_time,
      pay_way: res.result.pay_way
    })
  },
  // 申请退款api
  refundPri() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    cryptoJs.getAccessToken().then(() => {
      let data = {
        tk: wx.getStorageSync('accessToken'),
        ds: cryptoJs.tokenAES(),
        City: wx.getStorageSync('cityId'),
        Activity: wx.getStorageSync('activityId'),
        Token: wx.getStorageSync('token'),
        use_code: this.data.use_code
      }
      LiveApi.refundPri(data).then((res) => {
        wx.hideLoading()
        console.log(res)
        if (res.code == 200) {
          this.setData({
            flag: false,
            showCodePopup: true,
            showConfirmPopup: true,
            showRefundPopup: false,
            refundPriTxt: res.message
          })
          this.PreOrderDetail()
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
        }
      })
    })
  },
  // 确认支付
  ToPay() {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      City: wx.getStorageSync('cityId'),
      Activity: wx.getStorageSync('activityId'),
      Token: wx.getStorageSync('token'),
      orderNum: this.data.order_num
    }
    LiveApi.ToPay(data).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        wx.requestPayment({
          'timeStamp': res.result.time_stamp,
          'nonceStr': res.result.nonce_str,
          'package': res.result.package,
          'signType': "MD5",
          'paySign': res.result.pay_sign,
          'success': function (res) {
            wx.hideLoading()
            that.getPreOrderDetail()
          },
          'fail': function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '取消支付',
              icon: 'none'
            })
          }
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  /*
    支付成功后调用订单详情来判断是否支付成功
    支付成功后后端拿到支付需要一定时间
    前端给1s的延时器也不行的  
  */
  getPreOrderDetail() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    let data = {
      City: wx.getStorageSync('cityId'),
      Activity: wx.getStorageSync('activityId'),
      Token: wx.getStorageSync('token'),
      detail_id: this.data.detail_id
    }
    LiveApi.PreOrderDetail(data).then((res) => {
      console.log(res, 'res')
      if (res.result.order_status == '2') {
        wx.hideLoading()
        that.PreOrderDetail()
      } else {
        setTimeout(() => {
          that.getPreOrderDetail()
        }, 100);
      }


    })
  },
  // 显示&关闭 pop
  popUnShow: function (e) {
    const event = e.currentTarget.dataset
    // 核销码赋值
    if (event.use_code) {
      this.setData({
        use_code: event.use_code
      })
    }
    // 二维码数据 赋值
    if (event.d) {
      this.setData({
        qrCodeD: event.d
      })
      new QRCode("myqrcode", {
        text: event.d.use_code,
        width: 506 / this.data.v,
        height: 506 / this.data.v,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
    // ------展示 或 隐藏 弹窗-------
    const name = event.name
    this.setData({
      [name]: !this.data[name]
    })
    if (event.name == "pop2") {
      //退款成功刷新页面
      this.InitData(this.data.order.order_id)
    }
    // console.log(this.data.qrCodeD);
    // console.log(event);
  },
  // 取消订单 
  cancelPreOrder(e) {
    const that = this;
    const data = {
      order_id: this.data.order.order_id
    }
    AbsApi.cancelPreOrder(data).then(res => {
      wx.showToast({
        title: res.message,
        icon: 'none',
        success() {
          that.setData({
            pop6: false
          })
          wx.navigateBack({
            delta: 1,
          })
        }
      })
    })
  },
  // 删除订单
  deleteOrder: function () {
    const order_id = this.data.order.order_id
    AbsApi.deletePreOrder({
      order_id
    }).then(res => {
      if (res.status != 1) {
        wx.showLoading({
          title: res.message,
          icon: 'none',
        })
        return
      }
      wx.showLoading({
        title: '删除成功',
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000)
    })
  },
  // 退款
  Refund: function () {
    wx.showLoading({
      title: '退款中...',
      mask: true
    })
    const that = this
    const use_code = this.data.use_code
    AbsApi.refundPreOrder({
      use_code: use_code
    }).then(res => {
      wx.hideLoading()
      if (res.status == 1) {
        that.setData({
          pop1: false,
          pop2: !this.data.pop2
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },
  // 提交订单
  payBtn() {
    const that = this
    wx.showLoading({
      title: '支付中...',
      mask: true
    })
    const data = {
      orderNum: this.data.order.order_num
    }
    AbsApi.prePay(data).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        wx.requestPayment({
          'timeStamp': res.data.time_stamp,
          'nonceStr': res.data.nonce_str,
          'package': res.data.package,
          'signType': "MD5",
          'paySign': res.data.pay_sign,
          'success': function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '支付成功',
            })
            setTimeout(() => {
              that.InitData(that.data.order.order_id);
              //弹福袋
              AbsApi.getBouncedLog({
                type: 2
              }).then(res => {
                if (res.status == -1) {
                  //没弹过福袋
                  const d = {
                    type: "2",
                    activity_id: wx.getStorageSync('activityId')
                  }
                  AbsApi.addBouncedLog(d).then(r => {
                    console.log(r);
                  })
                  that.onfudai()
                }
              })
            }, 1000)
          },
          'fail': function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '取消支付',
              icon: 'none'
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.log(err);
    })
  },
  stop() {
    return false
  },
  // 福袋弹窗
  onfudai: function () {
    this.setData({
      fudaipop: !this.data.fudaipop
    })
  },
  isTab(url) {
    for (let item of this.data.tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  // 运营位链接跳转
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
        path: e.currentTarget.dataset.item.url
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
      })
    }
  },
})