// pages/getTicket/getTicket.js
let QRCode = require('../../utils/qrcode.js')
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  tradeIn
} from "../../common/api/tradeInApi.js"
let tradeInApi = new tradeIn()
import {
  absApi
} from "../../common/api/absAPI.js"
let AbsApi = new absApi()
import {
  xmb
} from '../../pages-xmb/api/xmbApi.js';
const xmbApi = new xmb();
import {
  fission
} from '../../pages-liebian/api/fissionApi.js';
const fissionApi = new fission();
import {
  util
} from "../../common/util.js"
const app = getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  // 'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
let flag = true;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cityList: [],
    isElectron: true,
    isPaper: false,
    bigImgPopup: false,
    tipsPopup: false,
    ticketPopup: false,
    zhanzhong: null,
    ticketShareAdv: null, //门票分享的图片
    ticketPopupTicket: false, //10元购买门票
    showIntention: false,
    showProtocol: false,
    spreadPlatformCouponDesc: false,
    ischecked: false,
    kindData: [{
      src: "https://img.51jiabo.com/4d955581-1caf-451c-b485-7b8055b120a5.png",
      name: "家用电器",
      id: 35
    }, {
      src: "https://img.51jiabo.com/73fb4b52-c3ed-4313-87b7-f9dafd07befc.png",
      name: "厨房卫浴",
      id: 32
    }, {
      src: "https://img.51jiabo.com/991b773a-eec2-4ee0-baef-dd8444a30e26.png",
      name: "家具软装",
      id: 34
    }, {
      src: "https://img.51jiabo.com/0356da9f-a05d-4274-9774-87a2b804391b.png",
      name: "地板门窗",
      id: 33
    }, {
      src: "https://img.51jiabo.com/fecc422b-9843-4b30-a15a-958d61a3b362.png",
      name: "综合建材",
      id: 36
    }, {
      src: "https://img.51jiabo.com/09f50b40-1860-42ae-976b-6b533b57c26b.png",
      name: "装修公司",
      id: 37
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.civite) {
      this.getRequestInfo()
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
    if (options.xmbFriendPhone) {
      this.setData({
        xmbFriendPhone: options.xmbFriendPhone
      })
    }
    //广告投放参数
    if (options.gdt_vid) {
      wx.setStorageSync('gdt_vid', options.gdt_vid)
    }
    if (options.weixinadinfo) {
      wx.setStorageSync('weixinadinfo', options.weixinadinfo)
    }
    if (options.mark_id) {
      wx.setStorageSync('mark_id', options.mark_id)
    }
    if (options) {
      wx.setStorageSync('options_path_url', options)
    }
    //公众号模板消息进入
    if (options.source == "HXJBSHXCX" && wx.getStorageSync('isLogin')) {
      //获取核销商品，弹窗通知用户已核销
      SvipApi.getUserCheckInfo({
        cityId: wx.getStorageSync('cityId'),
        userId: wx.getStorageSync('userInfo').uid
      }).then(res => {
        // res.resultList = [
        //   // 普通优惠券
        //   {
        //     brandName: "优惠券品牌优惠券品牌优惠券品牌",
        //     consumeAmount: 3000,
        //     couponName: "普通优惠券普通优惠券普通优惠券",
        //     couponValue: "300",
        //     logoUrl: "http://img.51jiabo.com/uploadimg//2016-08-23/1471915758230_1.jpg",
        //     type: 13
        //   }, 
        // {
        //   //会员商户券
        //   brandName: "优惠券品牌优惠券品牌优惠券品牌",
        //   consumeAmount: 3000,
        //   couponName: "会员商户券会员商户券会员商户券",
        //   couponValue: "300",
        //   logoUrl: "http://img.51jiabo.com/uploadimg//2016-08-23/1471915758230_1.jpg",
        //   type: 5
        // }, 
        // {
        //   //会员定金商品
        //   goodsImage: "https://img.51jiabo.com/ddda4671-e5bf-4af7-b88e-0de8a831eb30.jpg",
        //   goodsName: "会员定金商品会员定金商品会员定金商品",
        //   gooodsPrice: 100,
        //   modelNumber: 111,
        //   originPrice: 10,
        //   payWay: 1,
        //   prepayAmout: 1,
        //   prerogativeCount: 3,
        //   reservPrice: 100,
        //   salePrice: 12,
        //   specialPrice: 13,
        //   type: 4
        // }
        // , {
        //   //会员全款商品
        //   goodsImage: "https://img.51jiabo.com/ddda4671-e5bf-4af7-b88e-0de8a831eb30.jpg",
        //   goodsName: "会员全款会员全款会员全款会员全款",
        //   gooodsPrice: 100,
        //   modelNumber: 111,
        //   originPrice: 10,
        //   payWay: 1,
        //   prepayAmout: 1,
        //   prerogativeCount: 3,
        //   reservPrice: 100,
        //   salePrice: 12,
        //   specialPrice: 13,
        //   type: 12
        // }
        // , {
        //   //会员预约商品
        //   goodsImage: "https://img.51jiabo.com/ddda4671-e5bf-4af7-b88e-0de8a831eb30.jpg",
        //   goodsName: "会员预约会员预约会员预约会员预约会员预约",
        //   gooodsPrice: 100,
        //   modelNumber: 111,
        //   originPrice: 10,
        //   payWay: 1,
        //   prepayAmout: 1,
        //   prerogativeCount: 3,
        //   reservPrice: 100,
        //   salePrice: 12,
        //   specialPrice: 13,
        //   type: 6
        // }, 
        // {
        //   //普通爆品
        //   goodsImage: "https://img.51jiabo.com/ddda4671-e5bf-4af7-b88e-0de8a831eb30.jpg",
        //   goodsName: "普通爆品普通爆品普通爆品普通爆品普通爆品",
        //   gooodsPrice: 100,
        //   modelNumber: 111,
        //   originPrice: 10,
        //   payWay: 1,
        //   prepayAmout: 1,
        //   prerogativeCount: 3,
        //   reservPrice: 100,
        //   salePrice: 12,
        //   specialPrice: 13,
        //   type: 14
        // },
        // {
        //   //线上店铺订单
        //   goodsImage: "https://img.51jiabo.com/ddda4671-e5bf-4af7-b88e-0de8a831eb30.jpg",
        //   goodsName: "线上店铺订单线上店铺订单线上店铺订单线上店铺订单",
        //   gooodsPrice: 100,
        //   modelNumber: 111,
        //   originPrice: 10,
        //   payWay: 1,
        //   prepayAmout: 1,
        //   prerogativeCount: 3,
        //   reservPrice: 100,
        //   salePrice: 12,
        //   specialPrice: 13,
        //   exclusivePrice: 10,
        //   type: 10
        // }
        // ]
        if (res.infoMap.statusCode == 200 && res.resultList.length > 0) {
          let hasGoods = false,
            hasCoupon = false,
            onlyCommonHot = false,
            onlyCommonCoupon = false,
            onlySvipTotal = false,
            onlySvipEarnest = false,
            onlySvipReserve = false,
            onlySvipCoupon = false,
            onlyOnlineOrder = false;
          if (res.resultList.length === 1) {
            let data = res.resultList[0];
            //一条数据判断类型
            if (data.type == 14) {
              //普通爆品
              onlyCommonHot = true;
            }
            if (data.type == 13) {
              //普通优惠券
              onlyCommonCoupon = true;
            }
            if (data.type == 12) {
              //svip全款
              onlySvipTotal = true;
            }
            if (data.type == 4) {
              //svip定金
              onlySvipEarnest = true;
            }
            if (data.type == 6) {
              //svip预约
              onlySvipReserve = true;
            }
            if (data.type == 5) {
              //svip商户券
              onlySvipCoupon = true;
            }
            if (data.type == 10) {
              //线上店铺订单
              onlyOnlineOrder = true;
            }
          } else {
            //判断数据中类型
            for (let v of res.resultList) {
              if (v.type != 4 && v.type != 6 && v.type != 10 && v.type != 12 && v.type != 14) {
                hasCoupon = true;
              }
              if (v.type != 5 && v.type != 13) {
                hasGoods = true;
              }
            }
          }
          this.setData({
            onlyCommonHot: onlyCommonHot,
            onlyCommonCoupon: onlyCommonCoupon,
            onlySvipTotal: onlySvipTotal,
            onlySvipEarnest: onlySvipEarnest,
            onlySvipReserve: onlySvipReserve,
            onlySvipCoupon: onlySvipCoupon,
            onlyOnlineOrder: onlyOnlineOrder,
            onlyGoods: (!hasCoupon && hasGoods) ? true : false,
            onlyCoupon: (hasCoupon && !hasGoods) ? true : false,
            isOnlyOne: res.resultList.length === 1 ? true : false,
            checkInfo: res.resultList,
            showBaYPop: true
          })
        }
      })
    }
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#E6002D'
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
    if (this.isFromShare) {
      this.isFromShare = false;
      return
    }
    this.setData({
      checkPopup: false,
      isElectron: true,
      isPaper: false,
      showCouponPopup: false,
      showCouponBtn: false,
      hasTicket: false,
      showIntention: false,
      hasLotteryData: false,
      lotteryLoopList: {},
      isLogin: wx.getStorageSync("isLogin"),
      cityId: wx.getStorageSync('cityId'),
      intentionArr: [],
      navId: "",
      kindData: this.data.kindData.map((v) => {
        v.isSel = false;
        return v
      })
    })
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
      let text = "list[1].text"
      if (this.data.cityId == 60) {
        this.getTabBar().setData({
          [text]: '装修狂欢节'
        })
      } else {
        this.getTabBar().setData({
          [text]: '家博会'
        })
      }
    }

    wx.hideShareMenu({
      complete() {}
    })
    let cityId = wx.getStorageSync('cityId')
    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=getTicket',
      })
      return
    } else if (cityId) {
      //获取页面所有接口信息
      this.getRequestInfo(cityId)
    } else {
      //定位
      util.getPositionCity("getTicket", () => {
        this.setData({
          curUserCityText: wx.getStorageSync('curUserCityText')
        })
        //定位成功请求数据
        let ciId = wx.getStorageSync('cityId');
        this.getRequestInfo(ciId)
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
    // 友盟统计
    wx.uma.trackEvent('enter_getticket', {
      cityId: cityId,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });

    // 熊猫币弹框
    this.xmbModal();
    // 裂变抽奖弹框
    this.reqFissionOncePop();
  },
  /**
   * 方法start
   */
  // 弹窗 展示&关闭
  ifCodePop() {
    SvipApi.confirmCheck({
      cityId: wx.getStorageSync('cityId'),
      userId: wx.getStorageSync('userInfo').uid
    }).then(() => {

    })
    this.setData({
      showBaYPop: false
    })
  },
  toExpoOrder() {
    wx.navigateTo({
      url: '/pages-userInfo/pages/orderList/orderList',
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
  //获取页面所有接口信息(因为定位城市和非定位城市都要调用)
  getRequestInfo(cId, detail) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.activityInfo({
      cityId: cId
    }).then((res) => {
      let actBeginDate = res.begin_date;
      let actBuyDate = res.buy_time;
      let actEndDate = res.end_date;
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      wx.setNavigationBarTitle({
        title: cId == 65 ? "现代家博" : "华夏家博",
      })

      this.setData({
        activityInfo: res,
        curUserCityText: res.city_name,
        tradeOnline: false,
        xmbTradeIn: false,
        orderNum: 0,
        isExpoSell: res.is_activity_buy_ticket == 1 ? true : false, //判断是否开放展中售卖1开启,2不开
        // ischecked:res.is_tick == 2 ? true : false,
      })
      //获取视频号信息
      let that = this;
      if (wx.getChannelsLiveInfo) {
        wx.getChannelsLiveInfo({
          finderUserName: "sphTgeTCjc7M4Ri",
          success(res) {
            that.setData({
              liveData: res
            })
          },
          fail(res) {

          }
        })
      }
      //获取城市配置信息
      SvipApi.getCityConfig().then((res) => {
        if (res.status == 1) {
          //is_show 是否显示旧文案1是，-1否
          this.setData({
            cityConfig: res.data
          })
        }
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
        let isSvip = res.data?.svip === 1
        wx.setStorageSync('isSvip', isSvip)
        this.setData({
          isSvip,
          userInfo: res.data
        })
        if (!isSvip) {
          this.getHomeData()
        }
        if (actBeginDate <= actBuyDate && actEndDate >= actBuyDate) {
          //展中
          this.setData({
            zhanzhong: true
          })
        } else {
          this.setData({
            zhanzhong: false
          })
          this.advPopupClick()
        }
        // 索票信息
        this.getTicketsInfo()
      })
      //熊猫币抽奖
      this.xmbLotteryLoop()
      // 换购活动在线，显示换购列表
      tradeInApi.checkTradeIn({
        cityId: wx.getStorageSync('cityId'),
        activityId: res.activity_id
      }).then((res) => {
        // console.log(res.data.orderNum)
        if (res.status == 1 && res.data.isOnline == true) {
          if (res.data.exchange_method == 1) {
            //熊猫币换购
            this.setData({
              xmbTradeIn: true
            })
          } else {
            //订单换购
            if (actBeginDate <= actBuyDate && actEndDate >= actBuyDate) {
              //展中，换购上线，显示换购浮层
              this.setData({
                tradeOnline: true
              })
              //获取用户满足换购条件订单数量
              tradeInApi.getUserOrderNum({
                cityId: wx.getStorageSync('cityId'),
                activityId: wx.getStorageSync('activityId'),
                userId: wx.getStorageSync('userInfo').uid
              }).then(res => {
                if (res.status == 1) {
                  let number = res.data.orderNum;
                  let newNumber = 0;
                  let redeemConf = res.data.redeemConf;
                  for (let i in redeemConf) {
                    if (number >= Number(redeemConf[i])) {
                      newNumber = Number(redeemConf[i])
                    }
                  }
                  this.setData({
                    orderNum: newNumber,
                    trandInNum: redeemConf
                  })
                }
              })
            }
            //获取换购热门商品列表
            tradeInApi.getTradeInHotList({
              redeemId: res.data.id,
              activityId: wx.getStorageSync('activityId')
            }).then((res) => {
              if (res.status == 1) {
                this.setData({
                  tradeInList: res.data
                })
              } else {
                this.setData({
                  tradeInList: []
                })
              }
            })
          }
        } else {
          this.setData({
            tradeInList: []
          })
        }
      })

      /* 以下接口都需要获取sessionId和activityId所以放在获取成功中请求 */
      //平台优惠券
      marketingApi.getPlatformCoupon().then((res) => {
        if (res.status == 1) {
          this.pcData = res.data.length == 0 ? "" : res.data[0];
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
      //商户优惠券
      marketingApi.getVendorCoupon({
        id: "",
        is_recommend: 1
      }).then((res) => {
        if (res.code == 200) {
          this.setData({
            vendorCoupon: app.disposeData(res.result)
          })
        } else {
          this.setData({
            vendorCoupon: []
          })
        }
      })
      //获取爆品列表
      marketingApi.getHotGoodsList({
        id: "",
        page: 0,
        pageSize: 10,
        is_recommend: 1
      }).then((res) => {
        if (res.code == 200) {
          if (res.result) {
            //格式化价格
            for (let i of res.result) {
              i.market_price = Number(i.market_price)
              i.special_price = Number(i.special_price)
            }
            this.setData({
              hotGoods: res.result
            })
          }
        } else {
          this.setData({
            hotGoods: []
          })
        }
      })

      //商户活动列表
      marketingApi.getVendorAction({
        id: "",
        page: 0,
        pageSize: 10,
        is_recommend: 1
      }).then((res) => {
        if (res.code == 200) {
          if (res.result) {
            //格式化价格
            for (let i of res.result) {
              i.special_price = Number(i.special_price)
            }
            this.setData({
              vendorAct: res.result
            })
          }
        } else {
          this.setData({
            vendorAct: []
          })
        }
      })

      //获取索票页banner
      SvipApi.getAdvList({
        area_id: "8,9,10,11,12,13,25,27,28,29,31,77,86"
      }).then((res) => {
        if (res.status == 1) {
          //8:索票页banner 27:门票分享图片 28：优惠券分享图片 29：爆品分享图片 31：小程序分享图片 9：展会亮点 25：弹层运营位 10：展会亮点下方运营位 13：商户活动下方 12：爆品预约下方 11：商户优惠券下方
          this.setData({
            area_id: 8,
            banner: res.data.adv8 || [],
            ticketShareAdv: res.data.adv27 || "",
            couponShareAdv: res.data.adv28 || "",
            hotShareAdv: res.data.adv29 || "",
            minShareAdv: res.data.adv31 || "",
            lightList: res.data.adv9 || [],
            popupAdv: res.data.adv25 || "",
            lightAdv: res.data.adv10 || [],
            couponAdv: res.data.adv11 || [],
            hotGoodsAdv: res.data.adv12 || [],
            vendorActAdv: res.data.adv13 || [],
            liveAdv: res.data.adv77 || [],
            successPopupAdv: res.data.adv86?.[res.data.adv86?.length - 1] || {}
          })
        } else {
          this.setData({
            banner: [],
            ticketShareAdv: "",
            couponShareAdv: "",
            hotShareAdv: "",
            minShareAdv: "",
            lightList: [],
            popupAdv: "",
            lightAdv: [],
            couponAdv: [],
            hotGoodsAdv: [],
            vendorActAdv: [],
            liveAdv: [],
            successPopupAdv: {}
          })
        }
        wx.showShareMenu()
        if (this.pcData) {
          this.pcData.shareData = {
            isCoupon: true,
            title: "您的好友分享你一个优惠券，快快领取吧！",
            path: "/pages/expoPackage/getCoupon/getCoupon?couponId=" + this.pcData.coupon_id + "&couponType=1&couponInviteMobile=" + (wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").mobile : "") + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId")
          }
        }
        this.setData({
          platformCoupon: this.pcData
        })
      })
      //获取索票人数
      marketingApi.getTicketNum().then((res) => {
        if (res.code == 200) {
          this.setData({
            ticketNum: res.result
          })
        } else {
          this.setData({
            ticketNum: "0"
          })
        }
      })
      //获取滚动人数
      marketingApi.getTicketPerson().then((res) => {
        if (res.code == 200) {
          this.setData({
            ticketPerson: res.result
          })
        } else {
          this.setData({
            ticketPerson: []
          })
        }
      })
      // 获取抽奖轮播
      marketingApi.prizeRule({
        city_id: wx.getStorageSync('cityId')
      }).then((res) => {
        if (res.status == 1) {
          if (!res.data.lottery_info || res.data.lottery_info.length == 0 || res.data.award_list.length == 0) {
            this.setData({
              showReport: false
            })
          } else {
            this.setData({
              showReport: true,
              lotteryReport: res.data.award_list
            })
          }
        }
      })
      //获取爆品组
      marketingApi.getGoodsGroup().then((res) => {
        if (res.status == 1) {
          this.setData({
            goodsGroup: res.data
          })
        }
      })
      //品牌列表
      marketingApi.getBrandList({
        id: "",
        pageSize: 9
      }).then((res) => {
        if (res.code == 200) {
          this.setData({
            brandList: res.result
          })
        } else {
          this.setData({
            brandList: []
          })
        }
      })
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
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '优惠券点击区域',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (this.data.isSvip) {
      wx.navigateTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
    } else {
      wx.setStorageSync('src', "YYXCX");
      wx.setStorageSync('uis', "svip商户优惠券礼包");
      wx.switchTab({
        url: '/pages/home/home',
      })
    }
  },
  xmbLotteryLoop() {
    //获取熊猫币抽奖奖品
    xmbApi.xmbLotteryLoop().then(res => {
      if (res.code === 200) {
        if (res.data?.lotteryList?.length > 0 || res.data.prize?.length > 0) {
          this.setData({
            hasLotteryData: true,
            lotteryLoopList: res.data
          })
        } else {
          this.setData({
            hasLotteryData: false,
            lotteryLoopList: {}
          })
        }
      }
    })
  },
  shareTap() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '优惠券分享btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
  },
  // 索票信息
  getTicketsInfo() {
    marketingApi.getTicketsInfo().then((res) => {
      wx.hideLoading()
      console.log(res, '索票信息')
      if (res.status == 1) {
        this.setData({
          hasTicket: res.data.hasGetTicket //是否索取过门票
        })
        if (res.data.hasGetTicket) {
          let getTime = new Date(res.data.ticketInfo.get_time.replace(/-/g, "/")).toDateString();
          let nowTime = new Date().toDateString();
          if (res.data.isAddBuyPurpose === false && (getTime == nowTime) && wx.getStorageSync('cityId') != 28) {
            //未添加采购意向去添加
            this.setData({
              showIntention: true
            })
          }
          // 展中三天弹出门票
          if (this.data.zhanzhong) {
            let bDate = res.data.ticketInfo.begin_date,
              eDate = res.data.ticketInfo.end_date;
            //根据展届时间拆分自然日，判断当前是否是新的自然日再弹二维码
            let startDate = new Date(bDate.replace(/-/g, "/")).getTime();
            let endDate = new Date(eDate.replace(/-/g, "/")).getTime();
            let oneEndDate = new Date(bDate.replace(/-/g, "/").split(" ")[0] + " 23:59:59").getTime();
            let twoStartDate = "";
            let twoEndDate = "";
            let threeStartDate = "";
            let days = Math.ceil((endDate - startDate) / 86400000);
            let now = new Date().getTime();
            let preDate = wx.getStorageSync("ticketPopupStorage") || 0;
            if (preDate < startDate && preDate != 0) {
              wx.removeStorageSync('ticketPopupStorage')
            }
            if (days == 2) {
              twoStartDate = new Date(eDate.replace(/-/g, "/").split(" ")[0] + " 00:00:00").getTime();
              if (now > startDate && now < oneEndDate) {
                //第一天展中
                this.getPopupTicket()
                wx.setStorageSync('ticketPopupStorage', now)
              } else if (now > twoStartDate && now < endDate) {
                //第二天展中
                if (preDate < twoStartDate) {
                  wx.removeStorageSync('ticketPopupStorage')
                }
                this.getPopupTicket()
                wx.setStorageSync('ticketPopupStorage', now)
              }
            } else if (days == 3) {
              twoStartDate = new Date(bDate.replace(/-/g, "/").split(" ")[0] + " 00:00:00").getTime() + 86400000;
              twoEndDate = new Date(bDate.replace(/-/g, "/").split(" ")[0] + " 23:59:59").getTime() + 86400000;
              threeStartDate = new Date(eDate.replace(/-/g, "/").split(" ")[0] + " 00:00:00").getTime();
              if (now > startDate && now < oneEndDate) {
                //第一天展中
                this.getPopupTicket()
                wx.setStorageSync('ticketPopupStorage', now)
              } else if (now > twoStartDate && now < twoEndDate) {
                //第二天展中
                if (preDate < twoStartDate) {
                  wx.removeStorageSync('ticketPopupStorage')
                }
                this.getPopupTicket()
                wx.setStorageSync('ticketPopupStorage', now)
              } else {
                //第三天展中
                if (preDate < threeStartDate) {
                  wx.removeStorageSync('ticketPopupStorage')
                }
                this.getPopupTicket()
                wx.setStorageSync('ticketPopupStorage', now)
              }
            }
          }
          if (res.data.ticketInfo) {
            new QRCode("qrcode", {
              text: res.data.ticketInfo.ticket_num,
              width: 215,
              height: 215,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H,
            });
            this.setData({
              ticketInfo: res.data.ticketInfo,
              navId: res.data.ticketInfo.id
            })
            if (wx.getStorageSync('cityId') == 28) {
              //绍兴 获取开展时间区间来填充对应样式
              this.expoSchedule(res.data.ticketInfo)
            }
            wx.setStorageSync("nextActivity", res.data.ticketInfo)
            wx.setStorageSync('shareTicketId', res.data.ticketInfo.id)
          }
        }
      }

      // 新用户展前未索票，配置了展中卖票，展中弹出10元购票窗
      if (!this.data.hasTicket && this.data.isExpoSell && this.data.zhanzhong && this.data.userInfo.needBuyTicket == 1) {
        this.setData({
          ticketPopupTicket: true
        })
      } else {
        this.setData({
          ticketPopupTicket: false
        })
      }
    })
  },
  //选择城市
  chooseCity() {
    wx.navigateTo({
      url: '/pages/address/index?src=getTicket',
    })
  },
  //切换门票类型
  cutKind(e) {
    if (e.currentTarget.dataset.id == "Electron") {
      this.setData({
        isElectron: true,
        isPaper: false
      })
    } else {
      this.setData({
        isPaper: true,
        isElectron: false
      })
    }
  },
  fanzhuan() {
    this.setData({
      showIntention: !this.data.showIntention
    })
  },
  //免费索票
  freeGet(e) {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '免费索票btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '索票中...',
        mask: true
      })
      let invite = '';
      if (this.data.xmbFriendPhone) {
        invite = this.data.xmbFriendPhone;
      }
      //索票接口
      let data = {
        source_id: "",
        src_id: "ticket",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite,
        formId: "",
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit'),
        'mark_id': wx.getStorageSync('mark_id'),
        'path_url': JSON.stringify(wx.getStorageSync('options_path_url'))
      }
      marketingApi.reserveTicket(data).then((res) => {
        wx.hideLoading()
        // console.log(res)
        if (res.code == 200) {
          wx.setStorageSync("shareTicketId", res.ticket_id)
          wx.setStorageSync("nextActivity", res.activityInfo)
          //提交投放参数
          this.submitReport();
          if (wx.getStorageSync('cityId') == 28) {
            //绍兴 获取开展时间区间来填充对应样式
            this.expoSchedule(res.activityInfo)
          }
          // 裂变抽奖
          this.getFissionStatus();
          //索票成功弹成功弹层,并且显示采购意向
          this.setData({
            successInfo: app.disposeData(res.activityInfo),
            navId: res.ticket_id,
            showIntention: true
          })
        } else {
          wx.showToast({
            title: res.message ? res.message : "请求出错了",
            icon: "none"
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login?source=getTicket&type=' + (this.data.isElectron ? 1 : 0),
      })
    }
  },
  //提交投放参数
  submitReport() {
    wx.request({
      url: "https://api.51jiabo.com/youzan/wxAD/wxReported",
      method: 'POST',
      data: {
        clickId: wx.getStorageSync("gdt_vid"),
        weixinadinfo: wx.getStorageSync("weixinadinfo"),
        type: 1,
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
  },
  // 参观日程
  expoSchedule(info) {
    let nextInfo = info;
    let begin_date = nextInfo.begin_date.split(" ")[0].replace(/-/g, "/");
    let end_date = nextInfo.end_date.split(" ")[0].replace(/-/g, "/");
    let bDateTime = new Date(begin_date).getTime()
    let eDateTime = new Date(end_date).getTime()
    let firstDate = bDateTime - 172800000
    let dateList = [];
    for (var i = 0; i < 7; i++) {
      let item = firstDate + (i * 86400000);
      let listItem = {};
      //标记开展时间区间
      if ((item == bDateTime) || (item == eDateTime) || (item > bDateTime && item < eDateTime)) {
        listItem.isActive = true;
      } else {
        listItem.isActive = false;
      }
      listItem.date = new Date(item).getDate();
      let day = new Date(item).getDay();
      switch (day) {
        case 0:
          listItem.day = "星期日";
          break;
        case 1:
          listItem.day = "星期一";
          break;
        case 2:
          listItem.day = "星期二";
          break;
        case 3:
          listItem.day = "星期三";
          break;
        case 4:
          listItem.day = "星期四";
          break;
        case 5:
          listItem.day = "星期五";
          break;
        case 6:
          listItem.day = "星期六";
      }
      dateList.push(listItem)
    }
    this.setData({
      dateList: dateList,
      expoYear: begin_date.split("/")[0],
      expoMonth: begin_date.split("/")[1]
    })
  },
  startmessage() {
    wx.uma.trackEvent('click_contact', {
      cityId: wx.getStorageSync('cityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      Um_Key_UserID: wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').uid : ""
    });
  },
  umTj() {
    wx.uma.trackEvent('click_shareTicket', {
      cityId: wx.getStorageSync('cityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
  },
  //关闭成功弹层
  closeGetTicket() {
    this.setData({
      getTicSuccess: false
    })
  },
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail;
    this.setData({
      isAuth: true,
      isLogin: true
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getRequestInfo(wx.getStorageSync('cityId'), detail)
  },
  //索票须知
  togglePopup() {
    this.setData({
      tipsPopup: !this.data.tipsPopup
    })
  },
  //显示展会亮点大图
  showBigImg(e) {
    if (!e.currentTarget.dataset.item.win_image_url) {
      let type = e.currentTarget.dataset.item.type,
        url = e.currentTarget.dataset.item.url
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
          path: url,
          complete(res) {

          }
        })
      } else {
        if (url) {
          wx.navigateTo({
            url: '/pages/web/web?url=' + encodeURIComponent(url)
          })
        }
      }
    } else {
      this.setData({
        bigImgData: e.currentTarget.dataset.item,
        bigImgPopup: true
      })
    }
  },
  hideBigImg() {
    this.setData({
      bigImgPopup: false
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
    // 友盟统计
    wx.uma.trackEvent('click_AD', {
      cityId: wx.getStorageSync('cityId'),
      ADID: e.currentTarget.dataset.area_id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    let item = e.currentTarget.dataset.item;
    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url
    if (item.is_jump_live_broadcast == 1) {
      //跳转直播间
      if (flag) {
        flag = false;
        if (wx.openChannelsLive) {
          wx.openChannelsLive({
            finderUserName: "sphTgeTCjc7M4Ri",
            feedId: this.data.liveData?.feedId,
            nonceId: this.data.liveData?.nonceId,
            complete(res) {
              setTimeout(() => {
                flag = true;
              }, 100);
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }
      }
    } else {
      if (item.url) {
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
      }
    }
  },
  toAddKin(e) {
    const {
      plan = null
    } = e.target.dataset
    const pasPlan = plan ? {
      pasPlan: plan
    } : {}
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
  // 弹层运营位
  closeAdv() {
    this.setData({
      advPopup: false
    })
    let now = new Date().getTime();
    wx.setStorageSync("advTime", now + 86400000)
  },
  //门票二维码弹层
  checkTicket(e) {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '查看门票btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    let that = this;
    //记录屏幕亮度
    wx.getScreenBrightness({
      success: function (e) {
        that.setData({
          screenLight: e.value
        })
      }
    })
    //查看门票分为 已索票 || （展中&&展中无需买票） || （展中&&配置购票&&老用户）
    if (!that.data.hasTicket) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      //索票接口
      SvipApi.zhanzhongGetTicket({
        'src': wx.getStorageSync('src') || "YYXCXLP",
        'uis': wx.getStorageSync('uis') || (this.data.userInfo.is_new_user == 1 ? "新用户塞门票" : "老用户塞门票"),
      }).then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          //提交投放参数
          this.submitReport();
          //屏幕调整为最亮
          wx.setScreenBrightness({
            value: 1
          })
          new QRCode("qrcode", {
            text: res.data.ticket_num,
            width: 215,
            height: 215,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
          wx.setStorageSync('shareTicketId', res.data.id)
          this.setData({
            ticketInfo: res.data,
            navId: res.data.id,
            hasTicket: true,
            ticketPopup: true
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    } else {
      //屏幕调整为最亮
      wx.setScreenBrightness({
        value: 1
      })
      this.setData({
        ticketPopup: true
      })
    }
    //展中轮询检票接口
    if (this.data.zhanzhong) {
      //获取是否检票
      this.getChecked()
    }
  },
  //获取是否检票
  getChecked() {
    let that = this;
    marketingApi.checkTicketStatus().then(res => {
      if (res.status == 1 && res.data.is_pop == 1 && !this.data.checkPopup) {
        clearTimeout(that.cTimer)
        that.setData({
          userData: res.data,
          ticketPopup: false,
          checkPopup: true
        })
        //屏幕亮度还原
        if (this.data.screenLight) {
          wx.setScreenBrightness({
            value: this.data.screenLight
          })
        }
      }
    })
    this.cTimer = setTimeout(() => {
      that.getChecked()
    }, 3000);
  },
  //点击叉关闭门票二维码
  chaBtn() {
    clearTimeout(this.cTimer)
    this.setData({
      ticketPopup: false
    })
    //屏幕亮度还原
    if (this.data.screenLight) {
      wx.setScreenBrightness({
        value: this.data.screenLight
      })
    }
    // console.log(this.data.zhanzhong, '是否为展中', wx.getStorageSync("advTime"), this.data.popupAdv)
    if (this.data.zhanzhong) {
      this.advPopupClick()
    }
  },
  //点击叉关闭10元购买门票
  chaTicketBtn() {
    this.setData({
      ticketPopupTicket: false
    })
  },
  // 弹出10元购买门票
  checkTicketMoney() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '购票btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (wx.getStorageSync('token')) {
      this.setData({
        ticketPopupTicket: true
      })
    } else {
      wx.navigateTo({
        url: '../login/login',
      })
    }

  },
  // 展中弹完门票在弹运行位
  advPopupClick() {
    //运营位每天只弹一次
    if (!wx.getStorageSync("advTime")) {
      this.setData({
        advPopup: true
      })
    } else {
      let now = new Date().getTime();
      wx.setStorageSync("advTime", now + 86400000)
      let advTime = wx.getStorageSync("advTime");
      if (advTime <= now) {
        this.setData({
          advPopup: true
        })
      } else {
        this.setData({
          advPopup: false
        })
      }
    }
  },
  // 门票每天只弹一次
  getPopupTicket() {
    if (!wx.getStorageSync("ticketPopupStorage")) {
      this.setData({
        ticketPopup: true
      })
      //获取是否检票
      this.getChecked()
      //记录屏幕亮度
      var that = this
      wx.getScreenBrightness({
        success: function (e) {
          that.setData({
            screenLight: e.value
          })
        }
      })
      //屏幕调整为最亮
      wx.setScreenBrightness({
        value: 1
      })
    } else {
      this.setData({
        ticketPopup: false
      })
    }
  },
  stop() {
    return false
  },

  toTradeInList(e) {
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/tradeInPackage/List/Index',
      success() {
        if (type == "all") {
          wx.setStorageSync('src', "YYXCX")
          wx.setStorageSync('uis', "换购模块")
        } else {
          wx.setStorageSync('src', "YYXCX")
          wx.setStorageSync('uis', "订单进度条")
        }
      }
    })
  },
  toTradeDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/tradeInPackage/Detail/Index?detail_id=' + id,
      success() {
        wx.setStorageSync('src', "YYXCX")
        wx.setStorageSync('uis', "换购模块")
      }
    })
  },
  toXmbTradeInList() {
    wx.setStorageSync('src', "YYXCX")
    wx.setStorageSync('uis', "熊猫币换购模块")
    wx.navigateTo({
      url: '/pages-xmb/pages/tradeIn/List/List',
    })
  },
  closeCheck() {
    this.setData({
      checkPopup: false
    })
  },
  toSvipCenter() {
    wx.navigateTo({
      url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
    })
  },
  toCouponList() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '优惠券更多btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    wx.navigateTo({
      url: '/pages/couponList/couponList',
    })
  },
  toGoodsList() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '爆品更多btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    wx.navigateTo({
      url: '/pages/hotGoodsOrder/index/index',
    })
  },
  toVendorAct() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '商户活动更多btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    wx.navigateTo({
      url: '/pages/vendorAction/vendorAction',
    })
  },
  toBrandList() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '品牌更多btn',
      SourcePage: 'pages/getTicket/getTicket',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    wx.navigateTo({
      url: '/pages/brandList/brandList',
    })
  },
  /**
   * 支付方法
   */
  payEticket: function (e) {
    wx.showLoading({
      title: '支付中...',
      mask: true
    })
    let data = {
      cityId: wx.getStorageSync('cityId'),
      payType: 2,
      uis: wx.getStorageSync('uis') ? wx.getStorageSync('uis')  : "现场购票",
      src: wx.getStorageSync('src') ? wx.getStorageSync('src') :  "YYXCXLP"
    }
    const submitReport = this.submitReport()
    SvipApi.saleTicket(data, "POST").then((res) => {
      let that = this;
      // console.log(res, 'res')
      var res = res.data
      wx.requestPayment({
        'timeStamp': res.time_stamp,
        'nonceStr': res.nonce_str,
        'package': res.package,
        'signType': "MD5",
        'paySign': res.pay_sign,
        'success': function (res) {
          // console.log(res)
          wx.hideLoading()
          wx.hideToast();
          that.setData({
            ticketPopupTicket: false
          })
          // 支付成功不能立马拿到ticketId，需要1s左右才能拿到
          setTimeout(() => {
            that.getRequestInfo(wx.getStorageSync('cityId'))
          }, 500)
          if (wx.getStorageSync("gdt_vid")) {
            submitReport()
          }
        },
        'fail': function (res) {
          wx.hideLoading()
          // wx.showToast({
          //   title: '取消支付',
          // })
        }
      })
    })
  },
  selIntention(e) {
    let item = e.currentTarget.dataset.item;
    let data = this.data.kindData.map((v) => {
      if (v.id == item.id) {
        if (v.isSel) {
          v.isSel = false;
          let arr = this.data.intentionArr;
          this.data.intentionArr.splice(arr.findIndex((v) => item.id == v), 1)
        } else {
          v.isSel = true;
          this.data.intentionArr.push(item.id)
        }
      }
      return v
    })
    this.setData({
      kindData: data
    })
  },
  submitYx() {
    this.setData({
      tjCityId: this.data.cityId
    })
    if (this.data.intentionArr.length == 0) {
      wx.showToast({
        title: '请选择采购意向后提交',
        icon: "none",
        duration: 3000
      })
    } else {
      wx.showLoading({
        title: '提交中...',
        mask: true
      })
      AbsApi.addBuyPurpose({
        category_ids: this.data.intentionArr.join()
      }).then((res) => {
        wx.hideLoading()
        this.setData({
          showIntention: false
        })
        if (res.status == 1) {
          wx.navigateTo({
            url: '/pages/expoPackage/getTicketSuccess/getTicketSuccess?type=' + (this.data.isElectron ? 1 : 0)
          })
        }
      })
    }
  },
  toMap() {
    let [latitude, longitude, name, address] = [this.data.activityInfo?.location?.lat, this.data.activityInfo?.location?.lng, this.data.activityInfo?.venue_name, this.data.activityInfo?.venue_address];
    if (latitude && longitude) {
      wx.openLocation({
        latitude,
        longitude,
        name,
        address,
        scale: 16,
        complete(res) {
          // console.log(res)
        }
      })
    }
  },

  // 熊猫币数量弹框
  xmbModal() {
    let data = {
      id: 4
    }
    SvipApi.xmbModal(data).then(res => {
      if (res.code == 200) {
        this.setData({
          showXmbTips: true,
          xmbPopupData: res.result
        })
        setTimeout(() => {
          this.setData({
            showXmbTips: false
          })
        }, 5000);
      }
    })
  },
  // 裂变抽奖弹框
  reqFissionOncePop() {
    fissionApi.ticketOncePop().then(res => {
      if (res.status == 1 && res.data.isPop == 1) {
        this.setData({
          fissionEndId: res.data.popInfo.actId,
          fissionOncePop: res.data.popInfo.entrance_image
        })
      } else {
        this.setData({
          fissionOncePop: null
        })
      }
    })
  },
  fisOncePopClose() {
    this.setData({
      fissionOncePop: null
    })
  },
  // 平台券信息展开
  platformSpread(e) {
    let type = e.currentTarget.dataset.type;
    if (type === 'show') {
      this.setData({
        spreadPlatformCouponDesc: true
      })
    } else {
      this.setData({
        spreadPlatformCouponDesc: false
      })
    }
  },
  // 跳转优惠券详情
  toCouponDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/expoPackage/couponDetail/couponDetail?couponId=' + id,
    })
  },
  // 跳转裂变抽奖
  toZeroBuy(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      fissionOncePop: null,
      getTicSuccess: false,
      showFisTicketPop: false,
    })
    wx.navigateTo({
      url: `/pages-liebian/pages/index/index?actId=${id}`,
    })
  },
  // 领取优惠券
  getCoupon(e) {
    let item = e.currentTarget.dataset.item;
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '优惠券点击区域',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '领取中...',
        mask: true
      })
      let data = {
        source_id: item.coupon_id,
        src_id: "coupon",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: "",
        // formId: e.detail.formId,
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      marketingApi.postReserve(data).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          this.setData({
            getCouponSuccess: true,
            couponItem: item,
            shareData: {
              title: "您的好友分享你一个优惠券，快快领取吧！",
              path: "/pages/expoPackage/couponDetail/couponDetail?couponId=" + item.coupon_id + "&couponInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId")
            }
          })
          marketingApi.getVendorCoupon({
            id: "",
            is_recommend: 1
          }).then((res) => {
            if (res.code == 200) {
              this.setData({
                vendorCoupon: app.disposeData(res.result)
              })
            } else {
              this.setData({
                vendorCoupon: []
              })
            }
          })
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

  //关闭领取成功弹层
  closeGetCoupon() {
    this.setData({
      getCouponSuccess: false
    })
  },

  // 裂变抽奖活动id
  getFissionStatus() {
    fissionApi.fissionEntrance().then(res => {
      if (res.status === 1 && res.data.type == 2) {
        this.getFissionActInfo(res.data.actId);
      } else {
        this.setData({
          getTicSuccess: true
        })
        return;
      }
    })
  },

  // 裂变抽奖活动信息
  getFissionActInfo(id) {
    let params = {
      fission_act_id: id
    }
    fissionApi.getActInfo(params).then(res => {
      if (res.status === 1 && res.data?.type == 2) {
        this.setData({
          fissionId: id,
          fissionTicketPopImg: res.data.entrance_image
        })
        this.fissionTimerInterval(res.data.end_time);
      } else {
        this.setData({
          showFisTicketPop: false
        })
      }
    })
  },

  // 倒计时
  fissionTimerInterval(eTime) {
    let nowTime = new Date().getTime();
    let endDate = new Date(eTime.replace(/-/g, "/")).getTime() - nowTime;
    if (endDate > 0) {
      this.setData({
        getTicSuccess: true,
        showFisTicketPop: true
      })
      //倒计时
      this.data.stop = setInterval(() => {
        let days = Math.floor(endDate / 1000 / 60 / 60 / 24);
        let hours = Math.floor(endDate / 1000 / 60 / 60 % 24);
        let minute = Math.floor((endDate / 1000 / 60) % 60);
        let second = Math.floor((endDate / 1000) % 60);
        this.setData({
          fis_days: days < 10 ? "0" + days : days,
          fis_hours: hours < 10 ? "0" + hours : hours,
          fis_minute: minute < 10 ? "0" + minute : minute,
          fis_second: second < 10 ? "0" + second : second
        })
        if (endDate <= 0) {
          this.setData({
            countOver: true
          })
          clearInterval(this.data.stop);
          return false;
        } else {
          endDate -= 1000;
        }
      }, 1000);
    }
  },
  /**
   * 方法end
   */
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    this.isFromShare = true;
    // console.log('/pages/expoPackage/ticketDetail/ticketDetail?ticketId=' + this.data.navId + "&ticketInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + wx.getStorageSync("cityId"))
    if (res.from === 'button' && res.target.dataset.ticket == 'ticket') {
      return {
        title: '您的亲友分享给您一张华夏家博会现场门票',
        imageUrl: this.data.ticketShareAdv ? this.data.ticketShareAdv[0].wap_image_url : "https://img.51jiabo.com/21d7670e-2324-495a-ab6c-4a07d603092a.png",
        path: `/pages/expoPackage/ticketDetail/ticketDetail?from=${res.target.dataset.from ?? ""}&ticketId=${this.data.navId ?? ""}&ticketInviteMobile=${wx.getStorageSync("userInfo").mobile}&cityId=${wx.getStorageSync("cityId")}`
      }
    } else if (res.from === 'button' && !res.target.dataset.ticket && res.target.dataset.sharedata.isCoupon) {
      // 来自页面内转发按钮，优惠券分享
      return {
        title: res.target.dataset.sharedata.title,
        path: res.target.dataset.sharedata.path,
        imageUrl: this.data.couponShareAdv ? this.data.couponShareAdv[0].wap_image_url : "https://img.51jiabo.com/834318d8-ef5e-4548-990a-954628ddf5c8.png"
      }
    } else if (res.from === 'button' && !res.target.dataset.ticket && !res.target.dataset.sharedata.isCoupon) {
      // 来自页面内转发按钮，爆品分享
      return {
        title: res.target.dataset.sharedata.title,
        path: res.target.dataset.sharedata.path,
        imageUrl: this.data.hotShareAdv ? this.data.hotShareAdv[0].wap_image_url : "https://img.51jiabo.com/39dc30d1-9ca7-411d-bfa9-fdfac1608258.png"
      }
    } else {
      // 来自右上角转发菜单
      return {
        title: "华夏家博",
        imageUrl: this.data.minShareAdv ? this.data.minShareAdv[0].wap_image_url : "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
      }
    }
  },
  onShareTimeline() {
    return {
      title: "华夏家博",
      imageUrl: "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.cTimer) {
      clearTimeout(this.cTimer)
    }
    if (this.data.screenLight) {
      //屏幕亮度还原
      wx.setScreenBrightness({
        value: this.data.screenLight
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
    if (this.data.screenLight) {
      //屏幕亮度还原
      wx.setScreenBrightness({
        value: this.data.screenLight
      })
    }
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
  // 跳转客服
  toKefu: function () {
    wx.navigateTo({
      url: '/pages/expoPackage/tencentServe/tencentServe',
    })
  },
  showProtocol: function () {
    wx.navigateTo({
      url: '/pages/agreement/agreement',
    })
  },

})