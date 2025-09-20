// pages-xmb/pages/xmbCenter/xmbCenter.js
let app = getApp();
let QRCode = require('../../../../utils/qrcode.js')
import cryptoJs from '../../../../utils/crypto.js';
import {
  util
} from "../../../../common/util.js"
import {
  xmb
} from '../../../api/xmbApi';
const Api = new xmb();
import {
  svip
} from "../../../../common/api/svipApi.js";
let SvipApi = new svip();
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
    totCoin: '???',
    showBag: false,
    aniStart: false,
    currentXY: {},
    bagTimer: null,
    showCover: false,
    showFreezeBox: false,
    showScanBox: false,
    showPrizePopup: false,
    showSignInRules: false,
    showXmbRules: false,
    showReceivePopup: false,
    showLotteryFailPopup: false,
    showExchangeSuccess: false,
    showActivityRules: false,
    cjHideLoading: true,
    taskList: null,
    siteActivityList: null,
    siteRulesCont: '',
    xmbRulesCont: '',
    bagGif: false,
    closeScanFromBag: false,
    xmbAdv: null,
    signInSuccessNum: '',
    lotteryLoopList: null,
    exchangeCont: null,
    bagListData: null,
  },

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

  onShow: function () {
    let cityId = wx.getStorageSync('cityId')
    if (cityId) {
      this.getData();
    } else if (!cityId && wx.getStorageSync("isLocation")) {
      //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
      wx.navigateTo({
        url: '/pages/address/index?src=xmb',
      })
      return
    } else {
      //定位
      util.getPositionCity("xmb", () => {
        //定位成功请求数据
        // let curUserCityText = wx.getStorageSync('curUserCityText')
        // let price = wx.getStorageSync('price')
        // this.setData({
        //   cityId: cityId,
        //   price: price,
        //   curUserCityText: curUserCityText
        // })
        this.getData()
      })
    }
  },

  getData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let params = {
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: null
    }
    SvipApi.activityInfo(params).then((res) => {
      wx.hideLoading();
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      this.getAdvList();
      // 是否展示福袋
      this.bagListDataReq('any');
      // 签到弹框
      this.xmbSignInReq();
      // 现场活动
      this.getSiteActivity();
      // 天天抽动画
      this.xmbLotteryLoop();
    })
  },


  // 获取熊猫币任务
  getXmbTask() {
    wx.showLoading({
      title: '加载中...',
    })
    Api.getXmbTask().then(res => {
      console.log('任务', res)
      wx.hideLoading();
      if (res.code === 200) {
        this.setData({
          taskList: res.result
        })
      }
    })
  },

  // 熊猫币签到
  xmbSignInReq() {
    wx.showLoading({
      title: '加载中...',
    })
    cryptoJs.getAccessToken().then(() => {
      let data = {
        ds: cryptoJs.tokenAES(),
        tk: wx.getStorageSync('accessToken'),
        config_id: 1
      }
      Api.xmbSignIn(data).then(res => {
        wx.hideLoading();
        console.log('签到', res)
        if (res.code === 200) {
          this.setData({
            showCover: true,
            signInSuccessNum: res.result.coin_num
          })
          let timer = setTimeout(() => {
            this.setData({
              showCover: false,
              signInSuccessNum: ''
            })
            clearTimeout(timer);
          }, 3000);
        }
        this.getXmbTask();
        // 总熊猫币
        this.getTotalCoin();
      })
    })
  },

  // 获取展会现场活动列表
  getSiteActivity() {
    wx.showLoading({
      title: '加载中...',
    })
    Api.getSiteActivity().then(res => {
      wx.hideLoading();
      console.log('展会现场', res)
      if (res.code === 200 && res.data.length) {
        this.setData({
          siteActivityList: res.data
        })
      } else {
        this.setData({
          siteActivityList: null
        })
      }
    })
  },

  //运营位
  getAdvList() {
    wx.showLoading({
      title: '加载中...',
    })
    SvipApi.getAdvList({
      area_id: "80"
    }).then((res) => {
      wx.hideLoading();
      console.log('运营位', res)
      if (res.status == 1) {
        this.setData({
          xmbAdv: res.data.adv80 || null
        })
      } else {
        this.setData({
          xmbAdv: null
        })
      }
    })
  },

  xmbLotteryLoop() {
    Api.xmbLotteryLoop().then(res => {
      console.log('天天抽', res)
      if (res.code === 200) {
        this.setData({
          lotteryLoopList: res.data
        })
      }
    })
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
    let type = e.currentTarget.dataset.item.type;
    let url = e.currentTarget.dataset.item.url
    if (!url) return;
    // 友盟统计
    wx.uma.trackEvent('click_AD', {
      cityId: wx.getStorageSync('cityId'),
      ADID: '80',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });


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

  // 获取活动状态（福袋）
  bagListDataReq(type) {
    wx.showLoading({
      title: '加载中...',
    })
    Api.bagListData().then(res => {
      console.log('福袋', res,type)
      wx.hideLoading();
      if (res.code === 200 && type) {
        if (type === 'any') {
          if(res.data.list.length){
            this.setData({
              showBag: true,
              alwaysHideBag: false
            })
          }else{
            this.setData({
              showBag: false,
              alwaysHideBag: true
            })
          }
          return false;
        }
        if (type === 'close') {
          this.setData({
            showPrizePopup: false
          })
        } else if (type === 'open') {
          this.setData({
            showCover: true,
            closeScanFromBag: true
          })
        }
        if (type !== 'any') {
          this.setData({
            showScanBox: true,
            showBag: true,
            alwaysHideBag: false,
            bagListData: res.data.list,
            scanPhoneNum: res.data.mobile,
          })
          this.QRCode();
        }
      } else if (res.code === 400) {
        this.setData({
          showBag: false,
          alwaysHideBag: true,
          showCover: false,
          showPrizePopup: false,
        })
      }
    })
  },

  // 现场活动兑换
  xmbExchange(id) {
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    Api.xmbExchange({
      site_activity_id: id
    }).then(res => {
      console.log('兑换', res)
      wx.hideLoading();
      if (res.code === 200) {
        this.setData({
          showCover: true,
          showBag: true,
          alwaysHideBag: false,
          showExchangeSuccess: true,
          exchangeCont: res.data
        })
      } else if (res.code === 4003) {
        this.setData({
          showCover: true,
          showFreezeBox: true
        })
      } else {
        this.setData({
          showCover: true,
          showLotteryFailPopup: true,
          LotteryFail: res.message,
          isExchange: true,
        })
      }
    })
  },

  // 获取熊猫币总数
  getTotalCoin() {
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      page_num: 0,
      type: 1
    }
    Api.getXmbDetail(params).then(res => {
      console.log('获取熊猫币总数', res)
      wx.hideLoading();
      if (res.status == 1) {
        this.setData({
          totCoin: res.data.all_panda_coin
        })
      }
    })
  },


  // 领取熊猫币
  getTaskXmbReq(id) {
    if (!wx.getStorageSync("isLogin")) {
      wx.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let data = {
      config_id: id
    }
    Api.getTaskXmb(data).then(res => {
      wx.hideLoading();
      console.log('领取熊猫币', res)
      if (res.code === 200) {
        this.setData({
          showCover: true,
          showReceivePopup: true,
          receiveNum: res.result.user_get
        })
        let timer = setTimeout(() => {
          this.setData({
            showCover: false,
            showReceivePopup: false
          })
          clearTimeout(timer);
          this.getXmbTask();
        }, 3000);
      } else if (res.code == 4003) {
        this.setData({
          showCover: true,
          showFreezeBox: true
        })
        return false;
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },

  // 抽奖
  xmbActLottery() {
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    cryptoJs.getAccessToken().then(() => {
      let data = {
        ds: cryptoJs.tokenAES(),
        tk: wx.getStorageSync('accessToken'),
      }
      Api.xmbCenterLottery(data).then(res => {
        wx.hideLoading();
        console.log('抽奖', res)
        this.setData({
          showCover: true,
        })
        if (res.code === 200) {
          this.setData({
            cjHideLoading: false
          })
          let timer = setTimeout(() => {
            this.setData({
              showBag: true,
              alwaysHideBag: false,
              showPrizePopup: true,
              actPrize: res.data,
              cjHideLoading: true
            })
            clearTimeout(timer);
          }, 2000);
        } else if (res.code === 4003) {
          this.setData({
            showFreezeBox: true
          })
        } else {
          this.setData({
            showLotteryFailPopup: true,
            LotteryFail: res.message
          })
        }
      })
    })
  },

  toXmbDetail() {
    if (!wx.getStorageSync("isLogin")) {
      wx.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    }
    wx.navigateTo({
      url: '/pages-xmb/pages/xmbIndex/xmbIndex',
    })
  },

  toRules() {
    wx.navigateTo({
      url: '/pages-xmb/pages/xmbCenter/rules/rules',
    })
  },


  // 关闭弹框--------------------------
  scanClose(e) {
    this.setData({
      showCover: false,
      showScanBox: false,
    })
    if (!this.data.closeScanFromBag) {
      let arr = {
        x: e.touches[0].clientX - 150,
        y: e.touches[0].clientY
      }
      this.setData({
        currentXY: arr,
        aniStart: true
      })
      let gifTimer = setTimeout(() => {
        this.setData({
          bagGif: true
        })
        clearTimeout(gifTimer)
        let pngTimer = setTimeout(() => {
          this.setData({
            bagGif: false
          })
          clearTimeout(pngTimer)
        }, 5000);
      }, 1000);
    } else {
      this.setData({
        closeScanFromBag: false
      })
    }
  },

  prizePopupClose() {
    this.bagListDataReq('close');
  },

  signInRulesPopupClose() {
    this.setData({
      showCover: false,
      showSignInRules: false,
      signInRulesCont: ''
    })
  },

  xmbRulesPopupClose() {
    this.setData({
      showCover: false,
      showXmbRules: false,
      xmbRulesCont: ''
    })
  },

  zhanPopupClose() {
    this.setData({
      showCover: false,
      showZhanPopup: false
    })
  },

  exchangeSuccessClose() {
    this.bagListDataReq('open');
    this.setData({
      // showCover: false,
      showExchangeSuccess: false
    })
  },

  lotteryFailPopupClose() {
    this.setData({
      showCover: false,
      showLotteryFailPopup: false
    })
  },

  activityRulesClose() {
    this.setData({
      showCover: false,
      showActivityRules: false,
      siteRulesCont: ''
    })
  },

  // 显示弹框--------------------------

  signInRulesShow(e) {
    let rule = e.currentTarget.dataset.rule;
    if (rule) {
      this.setData({
        showCover: true,
        showSignInRules: true,
        signInRulesCont: rule
      })
    }
  },

  xmbRulesShow(e) {
    let id = e.currentTarget.dataset.id;
    let rule = e.currentTarget.dataset.rule;
    if (!rule) return;

    if (id === '1') {
      this.setData({
        showCover: true,
        showSignInRules: true,
        signInRulesCont: rule
      })
    } else {
      this.setData({
        showCover: true,
        showXmbRules: true,
        xmbRulesCont: rule
      })
    }
  },

  activityRulesShow(e) {
    let rule = e.currentTarget.dataset.rule;
    if (!rule) return;

    this.setData({
      showCover: true,
      showActivityRules: true,
      siteRulesCont: rule,
    })
  },

  scanBoxShow() {
    this.bagListDataReq('open');
  },

  // --------------------------------------

  doTask(e) {
    if (!wx.getStorageSync("isLogin")) {
      wx.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    }
    wx.showLoading();
    Api.checkFreeze().then(res => {
      wx.hideLoading();
      if (res.code == 4003) {
        this.setData({
          showCover: true,
          showFreezeBox: true
        })
        return false;
      } else {
        let id = e.currentTarget.dataset.id;
        let popup = e.currentTarget.dataset.popup;
        let pageUrl;
        switch (id) {
          case '2':
            pageUrl = '/pages/couponList/couponList';
            break;
          case '3':
            pageUrl = '/pages/hotGoodsOrder/index/index';
            break;
          case '5':
            pageUrl = '/pages/home/home';
            break;
          case '6':
            this.setData({
              showCover: true,
              showZhanPopup: true,
              showZhanPopupCont: popup,
            })
            break;
          case '7':
            pageUrl = '/pages/user/selfHelp/Index/Index';
            break;
        }

        if (id == 5) {
          wx.switchTab({
            url: pageUrl
          })
        } else if (pageUrl) {
          wx.navigateTo({
            url: pageUrl
          })
        }
      }
    })
  },

  getXmbHandle(e) {
    let id = e.currentTarget.dataset.id;
    this.getTaskXmbReq(id);
  },

  activityClick(e) {
    if (!wx.getStorageSync("isLogin")) {
      wx.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    }
    let type = e.currentTarget.dataset.type;
    let id = e.currentTarget.dataset.id;

    if(this.data.timer) clearTimeout(this.data.timer);
    this.data.timer = setTimeout(() => {
      if (type == 1) { // 抽奖
        this.xmbActLottery()
      } else { // 兑换
        this.xmbExchange(id);
      }
    }, 500);
  },




  QRCode() {
    if (!this.data.scanPhoneNum) return;
    new QRCode("qrcode", {
      text: this.data.scanPhoneNum,
      width: 100,
      height: 100,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },

  onTouchMove() {
    if (!this.data.showBag || this.data.alwaysHideBag) return;
    this.setData({
      showBag: false
    })
  },

  onPageScroll: debounce(function (res) {
    if (this.data.alwaysHideBag) return;
    let Timer = setTimeout(() => {
      this.setData({
        showBag: true
      })
      clearTimeout(Timer);
    }, 100);
  }),

  onShareAppMessage(opt) {
    console.log(opt)
    if (opt.from === 'button') {
      return {
        title: '您的亲友分享给您一张华夏家博会现场门票',
        path: `/pages/getTicket/getTicket?userCityId=${wx.getStorageSync('cityId')}&xmbFriendPhone=${wx.getStorageSync("userInfo").mobile}`,
        imageUrl: this.data.xmbAdv ? this.data.xmbAdv[this.data.xmbAdv.length - 1].wap_image_url : "https://img.51jiabo.com/21d7670e-2324-495a-ab6c-4a07d603092a.png",
        success: function (res) {
          wx.showToast({
            title: '分享成功！',
          })
        },
        fail(res) {
          console.log(res)
        }
      }
    }
  },
})






function debounce(fn, interval) {
  let timer;
  let gapTime = interval || 200;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, arguments);
    }, gapTime);
  };
}