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
  xmb
} from "../../pages-xmb/api/xmbApi.js";
const xmbApi = new xmb()
import {
  fission
} from "../../pages-liebian/api/fissionApi.js";
const fissionApi = new fission()
import {
  config
} from '../../common/config/config.js'
import {
  util
} from "../../common/util.js"
let app = getApp();
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
    userInfo: null,
    isLogin: false,
    isSvip: false,
    svipEndTime: null,
    hasSigned: false,
    cityId: null,
    xmbNum: ''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function (options) {
    // 推广链接带参 cityId src uis
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
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    this.setData({
      hasXmbTask: false,
      hasXmbAct: false,
      showLottery: false,
      showCouponBtn: false,
      showCouponPopup: false,
      baseUrl: config.url,
      isPastSvip: false,
      unpaidList: [],
      unpaidLen: 0,
      cityId: wx.getStorageSync('cityId')
    })

    //用户状态
    let that = this;
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
      success: function (res) {
        // console.log(res)
        if (res.data.status == -1) {
          that.setData({
            isLogin: false,
            isSvip: false,
            userInfo: {}
          })
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#E6002D',
          })
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
    //获取授权登录code
    wx.login({
      success(res) {
        if (res.code) {
          that.setData({
            code: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    let cityId = wx.getStorageSync('cityId')
    if (cityId) {
      //请求数据接口
      this.getRequest()
    } else if (!cityId && wx.getStorageSync("isLocation")) {
      //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
      wx.navigateTo({
        url: '/pages/address/index?src=userHome',
      })
      return
    } else {
      //定位
      util.getPositionCity("userHome", () => {
        //定位成功请求数据
        this.getRequest()
      })
    }
  },
  //请求数据接口
  getRequest(detail) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let cId = wx.getStorageSync('cityId')
    //获取城市展届id
    let params1 = {
      cityId: cId,
      activityId: null
    }
    SvipApi.activityInfo(params1).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      let activityInfo = wx.getStorageSync("activityInfo");
      let svipEndTime = activityInfo.end_date ? activityInfo.end_date : '';
      this.setData({
        svipEndTime: svipEndTime
      })
      //获取运营位
      SvipApi.getMyAdv({
        cityId: cId
      }).then((info) => {
        if (info?.infoMap?.statusCode == 200) {
          let bottomAdv = [];
          info.resultList.map((v) => {
            if (v.bannerId == 68) {
              bottomAdv.push(v)
            }
          })
          this.setData({
            bottomAdv: bottomAdv
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
      //获取熊猫币活动信息
      this.getXmbInfo();
      // 裂变抽奖活动
      fissionApi.fissionEntrance().then(res=>{
        console.log("裂变活动：",res)
        if(res.status === 1){
          this.setData({
            fissionData:res.data
          })
        }
      })
      //获取svip状态
      let params = {
        cityId: cId,
        activityId: wx.getStorageSync('activityId'),
      }
      SvipApi.isSvip(params).then((res) => {
        if (res.status == 1) {
          //获取我的奖励金
          // marketingApi.getMyBounty().then((res) => {
          //   if (res.code == 200) {
          //     let amount = res.result.amount;
          //     wx.setStorageSync("bountyNum", amount ? amount : 0)
          //     this.setData({
          //       bountyNum: amount ? amount : 0
          //     })
          //   }
          // })
          // svip是否需要0元升级
          SvipApi.zeroUpgrade({
            cityId: wx.getStorageSync('cityId') || 1
          }).then((res) => {
            if (res.status == 1) {
              this.setData({
                isUpgrade: res.data.is_upgrade
              })
            }
          })
          //填充数据
          let status = res.data.svip == 1 ? true : false
          wx.setStorageSync('isSvip', status)
          this.setData({
            isLogin: true,
            userInfo: res.data,
            xmbNum: res.data.panda_coin
          })

          if (status === false) {
            // 当届不是会员判断上一届是否为会员
            SvipApi.activityInfo({
              cityId: wx.getStorageSync('cityId') || 1
            }).then((res) => {
              if (res.is_active == 0) {
                //如果是展中，判断上一届是否为svip
                SvipApi.getUserSvipInfo({
                  cityId: wx.getStorageSync('cityId') || 1
                }).then((res) => {
                  if (res.svip == 1) {
                    this.setData({
                      isSvip: true,
                      isPastSvip: true
                    })
                    wx.setNavigationBarColor({
                      frontColor: '#ffffff',
                      backgroundColor: '#19151D'
                    })
                  } else {
                    this.setData({
                      isSvip: false
                    })
                    wx.setNavigationBarColor({
                      frontColor: '#ffffff',
                      backgroundColor: '#E6002D'
                    })
                  }
                })
              } else {
                this.setData({
                  isSvip: false
                })
                wx.setNavigationBarColor({
                  frontColor: '#ffffff',
                  backgroundColor: '#E6002D'
                })
              }
            })
          } else {
            this.setData({
              isSvip: true
            })
            wx.setNavigationBarColor({
              frontColor: '#ffffff',
              backgroundColor: '#19151D'
            })
          }
          //所有订单
          this.getAllOrder()
          //一码核销
          SvipApi.getCheckCode({
            cityId: wx.getStorageSync('cityId'),
            mobile: wx.getStorageSync('userInfo').mobile,
            userId: wx.getStorageSync('userInfo').uid
          }).then((info) => {
            if (info?.infoMap?.statusCode == 200) {
              this.setData({
                checkInfo: info.infoMap
              })
              //加密手机号生成核销码小图
              new QRCode("bcode", {
                text: info.infoMap.ciphertext,
                width: 250,
                height: 250,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H,
              });
            }
          })
        } else {
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#E6002D'
          })
          this.setData({
            isSvip: false,
            isLogin: wx.getStorageSync('isLogin'),
            userInfo: wx.getStorageSync('userInfo')
          })
        }
        setTimeout(() => {
          wx.hideLoading()
        }, 100)
      })
    })
  },
//获取熊猫币活动信息
  getXmbInfo() {
    //获取熊猫币任务||熊猫币活动任一是否在线
    xmbApi.getXmbTask().then((res) => {
      if (res.code == 200 && res.result?.length > 0) {
        this.setData({
          hasXmbTask: true
        })
      }
    })
    xmbApi.getSiteActivity().then((res) => {
      if (res.code == 200 && res.data?.length > 0) {
        this.setData({
          hasXmbAct: true
        })
      }
    })
    
    //获取熊猫币抽奖活动是否在线
    xmbApi.getLotteryInfo().then((res) => {
      if (res.code == 200 && res.data.id) {
        this.setData({
          showLottery: true
        })
      }
    })
  },  //所有订单
  getAllOrder(update = 0) {
    if (this.stop1) {
      for (let i = 1; i <= this.stop1; i++) {
        clearInterval(i);
      }
    }
    SvipApi.getOrderList({
      order_list_type: 0,
      is_update: update
    }).then((res) => {
      if (res.status == 1) {
        // all：全部，unpaid：待付款，ongoing：进行中，paid：已完成
        this.setData({
          unpaidLen: res.data.unpaid?.length ?? 0
        })
        let fiveOrder = res.data.unpaid?.slice(0, 5);
        fiveOrder?.find((v) => {
          let nowTime = v.now_time;
          let endDate = 0;
          // order_list_type 2:SIVP订单 3:线上订单
          if (v.order_list_type == 2) {
            endDate = v.expire_time * 1000 - nowTime;
          } else if (v.order_list_type == 3) {
            let b = new Date(v.create_time.replace(/-/g, "/")).getTime() + 15 * 60 * 1000;
            endDate = b - nowTime;
          }
          //倒计时
          this.stop1 = setInterval(() => {
            let minute = Math.floor((endDate / 1000 / 60) % 60);
            // let second = Math.floor((endDate / 1000) % 60);
            if (endDate <= 0) {
              clearInterval(this.stop1);
              // for (let i = 1; i <= this.stop1; i++) {
              //   clearInterval(i);
              // }
              if (v.order_list_type != 1 && endDate > -10000) {
                //展会订单不需要更新，因为没有倒计时
                this.getAllOrder(1)
                return false;
              }
            } else {
              endDate -= 1000;
            }
            v.minute = minute;
            // v.second = second;
            this.setData({
              unpaidList: fiveOrder ?? []
            })
          }, 1000);
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
    // 友盟统计
    wx.uma.trackEvent('click_AD', {
      cityId: wx.getStorageSync('cityId'),
      ADID: e.currentTarget.dataset.area_id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });

    console.log(e)
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
  checkCode() {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "点我核销",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    this.setData({
      verifyPopup: !this.data.verifyPopup
    })
  },
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail;
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getRequest(detail)
  },
  //授权手机号
  getPhoneNumber(e) {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "登录btn",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    let that = this;
    util.authorizePhone(e, that.data.code, () => {
      that.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      that.getRequest()
    })
  },
  //0元升级接口
  svipUpgrade() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // svip 0元升级
    SvipApi.svipUpgrade({
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId'),
      src: "0yuan",
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        wx.navigateTo({
          url: '/pages/svipPackage/svipUserCenter/svipUserCenter?preFrom=zeroUpgrade&type=' + res.data.order_type
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },
  // 会员中心
  toUserCenter() {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "超级会员btn",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (this.data.isLogin) {
      if (this.data.isSvip) {
        wx.navigateTo({
          url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
        })
        return
      } else {
        //判断是否可以直接升级svip,2为直接升级
        if (this.data.isUpgrade == 2) {
          // svip 0元升级
          this.svipUpgrade()
        } else {
          SvipApi.activityInfo({
            cityId: wx.getStorageSync('cityId') || 1
          }).then((res) => {
            if (res.is_active == 0) {
              SvipApi.reserveInfo({
                cityId: wx.getStorageSync('cityId') || 1
              }).then((res) => {
                console.log(res, '预约结果 0是未预约')
                if (res.status == 1) {
                  if (res.data.reserve_id == 0) {
                    //没预约
                    this.setData({
                      noReservePopup: true
                    })
                  } else {
                    this.setData({
                      isReservePopup: true
                    })
                  }
                }
              })
            } else {
              this.setData({
                buySvipPopup: true
              })
            }
          })
        }
      }
    } else {
      wx.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
    }
  },
  //跳转云逛展奖励页
  toCloudAward() {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "云逛展奖励",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
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
  // 门票列表
  toUserTicker() {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "我的门票",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    let token = wx.getStorageSync('token')
    if (token && this.data.userInfo && this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/expoPackage/ticketList/ticketList',
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
    }
  },
  //线上订单
  toOrderList(e) {
    let status = e.currentTarget.dataset.status;
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "我的订单",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (!this.data.userInfo || !this.data.isLogin) {
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
    } else {
      wx.navigateTo({
        url: `/pages-userInfo/pages/orderList/orderList?type=0&status=${status}`,
      })
    }
  },
  toOrderDetail(e) {
    let item = e.currentTarget.dataset.item;
    if (item.order_list_type == 2) {
      //判断商品是否已下线
      if (item.is_offline == 1) {
        wx.showToast({
          title: '商品已下线',
          icon: "none"
        })
      } else {
        //SVIP商品带订单号跳转
        wx.navigateTo({
          url: `/pages/svipPackage/payProductDetail/payProductDetail?id=${item.goods_id}&orderSn=${item.order_sn}`
        })
      }
    } else {
      wx.navigateTo({
        url: `/pages-abs/pages/orderDetail/orderDetail?order_id=${item.order_id ?? item.order_num}&orderType=${item.order_list_type}`
      })
    }
  },
  // 我的优惠券
  myCoupon: function () {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "我的优惠券",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (!this.data.userInfo || !this.data.isLogin) {
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
    } else {
      wx.navigateTo({
        url: '/pages/user/myCoupon/myCoupon',
      })
    }
  },
  // 我的预约
  myReserve: function () {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "我的预约",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (!this.data.userInfo || !this.data.isLogin) {
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
    } else {
      wx.navigateTo({
        url: '/pages/user/myReserve/myReserve',
      })
    }
  },
  // 自助录单
  selfHelp: function () {
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "自助录单",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (!this.data.userInfo || !this.data.isLogin) {
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
    } else {
      wx.navigateTo({
        url: '/pages/user/selfHelp/Index/Index',
      })
    }
  },
  toShApply() {
    if (!this.data.userInfo || !this.data.isLogin) {
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
    } else {
      wx.navigateTo({
        url: '/pages-sh/pages/shIndex/shIndex',
      })
    }
  },
  checkLogin() {
    if (!this.data.userInfo || !this.data.isLogin) {
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
    return true
  },
  // 个人信息页
  toProfile(e) {
    let type = e.currentTarget.dataset.type;
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: type == "avatar" ? "头像点击" : "昵称点击",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages-userInfo/pages/userCenter/userCenter',
    })
  },
  //
  toBuy() {
    this.setData({
      buySvipPopup: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip'
    })
  },
  // 关闭弹层
  cancelBuy() {
    this.setData({
      buySvipPopup: false
    })
  },
  // 关闭弹层
  cancelNoReserve() {
    this.setData({
      noReservePopup: false
    })
  },
  cancelIsReserve() {
    this.setData({
      isReservePopup: false
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      avaterUrl: e.detail.userInfo.avater
    })
  },
  toBounty() {
    wx.navigateTo({
      url: '/pages/expoPackage/bounty/bounty',
    })
  },
  toAward() {
    wx.navigateTo({
      url: '/pages-xmb/pages/luckyDraw/luckyDraw',
    })
  },
  toXmbDetail() {
    wx.navigateTo({
      url: '/pages-xmb/pages/xmbCenter/index/index',
    })
  },
  toCollect() {
    wx.navigateTo({
      url: '/pages/user/myCollection/myCollection',
    })
  },
  toZeroBuy() {
    wx.navigateTo({
      url: '/pages-liebian/pages/index/index',
    })
    
  },
  stop() {
    return false
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    for (let i = 1; i <= this.stop1; i++) {
      clearInterval(i);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    for (let i = 1; i <= this.stop1; i++) {
      clearInterval(i);
    }
  },
})