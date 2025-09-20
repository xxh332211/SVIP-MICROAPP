import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import {
  Block,
  View,
  Button,
  Image,
  Text,
  Swiper,
  SwiperItem,
  Navigator,
  Canvas,
} from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
let QRCode = require('../../utils/qrcode.js')
import { svip } from '../../common/api/svipApi.js'
let SvipApi = new svip()
import { marketing } from '../../common/api/marketingApi.js'
let marketingApi = new marketing()
import { xmb } from '../../pages-xmb/api/xmbApi.js'
const xmbApi = new xmb()
import { fission } from '../../pages-liebian/api/fissionApi.js'
const fissionApi = new fission()
import { config } from '../../common/config/config.js'
import { util } from '../../common/util.js'
import OnlineServe from '../../components/onlineServe/onlineServe'
import CouponPopup from '../../components/couponPopup/couponPopup'
import CouponBtn from '../../components/couponBtn/couponBtn'
import PrivacyPopup from '../../components/privacyPopup/privacyPopup'
import './userHome.scss'
let app = Taro.getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome',
]
cacheOptions.setOptionsToCache({
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
    xmbNum: '',
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function (options) {
    // 推广链接带参 cityId src uis
    if (options.userCityId) {
      Taro.setStorageSync('cityId', options.userCityId)
    }
    if (options.src) {
      Taro.setStorageSync('src', options.src)
    }
    if (options.uis) {
      Taro.setStorageSync('uis', options.uis)
    }
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3,
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
      cityId: Taro.getStorageSync('cityId'),
    })

    //用户状态
    let that = this
    Taro.request({
      url: this.data.baseUrl + '/v2.0/user/userStatus',
      method: 'POST',
      data: {
        mobile: Taro.getStorageSync('userInfo').mobile
          ? Taro.getStorageSync('userInfo').mobile
          : '',
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        Token: Taro.getStorageSync('token'),
      },
      success: function (res) {
        // console.log(res)
        if (res.data.status == -1) {
          that.setData({
            isLogin: false,
            isSvip: false,
            userInfo: {},
          })
          Taro.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#E6002D',
          })
          Taro.removeStorageSync('userInfo')
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('mall_token')
          Taro.removeStorageSync('pageGuideList')
          Taro.removeStorageSync('isLogin')
          Taro.removeStorageSync('isSvip')
          Taro.removeStorageSync('codePopup')
          Taro.showToast({
            title: res.data.message,
            icon: 'none',
          })
        }
      },
    })
    //获取授权登录code
    Taro.login({
      success(res) {
        if (res.code) {
          that.setData({
            code: res.code,
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
    })
    let cityId = Taro.getStorageSync('cityId')
    if (cityId) {
      //请求数据接口
      this.getRequest()
    } else if (!cityId && Taro.getStorageSync('isLocation')) {
      //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
      Taro.navigateTo({
        url: '/pages/address/index?src=userHome',
      })
      return
    } else {
      //定位
      util.getPositionCity('userHome', () => {
        //定位成功请求数据
        this.getRequest()
      })
    }
  },
  //请求数据接口
  getRequest(detail) {
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
    let cId = Taro.getStorageSync('cityId')
    //获取城市展届id
    let params1 = {
      cityId: cId,
      activityId: null,
    }
    SvipApi.activityInfo(params1).then((res) => {
      Taro.setStorageSync('activityInfo', app.disposeData(res))
      Taro.setStorageSync('sessionId', res.session)
      Taro.setStorageSync('activityId', res.activity_id)
      Taro.setStorageSync('curUserCityText', res.city_name)
      let activityInfo = Taro.getStorageSync('activityInfo')
      let svipEndTime = activityInfo.end_date ? activityInfo.end_date : ''
      this.setData({
        svipEndTime: svipEndTime,
      })
      //获取运营位
      SvipApi.getMyAdv({
        cityId: cId,
      }).then((info) => {
        if (info?.infoMap?.statusCode == 200) {
          let bottomAdv = []
          info.resultList.map((v) => {
            if (v.bannerId == 68) {
              bottomAdv.push(v)
            }
          })
          this.setData({
            bottomAdv: bottomAdv,
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
                showCouponBtn: true,
              })
            }
          })
        } else {
          //获取svip抵扣券列表
          this.svipCouponData()
        }
      })
      //获取熊猫币活动信息
      this.getXmbInfo()
      // 裂变抽奖活动
      fissionApi.fissionEntrance().then((res) => {
        console.log('裂变活动：', res)
        if (res.status === 1) {
          this.setData({
            fissionData: res.data,
          })
        }
      })
      //获取svip状态
      let params = {
        cityId: cId,
        activityId: Taro.getStorageSync('activityId'),
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
            cityId: Taro.getStorageSync('cityId') || 1,
          }).then((res) => {
            if (res.status == 1) {
              this.setData({
                isUpgrade: res.data.is_upgrade,
              })
            }
          })
          //填充数据
          let status = res.data.svip == 1 ? true : false
          Taro.setStorageSync('isSvip', status)
          this.setData({
            isLogin: true,
            userInfo: res.data,
            xmbNum: res.data.panda_coin,
          })
          if (status === false) {
            // 当届不是会员判断上一届是否为会员
            SvipApi.activityInfo({
              cityId: Taro.getStorageSync('cityId') || 1,
            }).then((res) => {
              if (res.is_active == 0) {
                //如果是展中，判断上一届是否为svip
                SvipApi.getUserSvipInfo({
                  cityId: Taro.getStorageSync('cityId') || 1,
                }).then((res) => {
                  if (res.svip == 1) {
                    this.setData({
                      isSvip: true,
                      isPastSvip: true,
                    })
                    Taro.setNavigationBarColor({
                      frontColor: '#ffffff',
                      backgroundColor: '#19151D',
                    })
                  } else {
                    this.setData({
                      isSvip: false,
                    })
                    Taro.setNavigationBarColor({
                      frontColor: '#ffffff',
                      backgroundColor: '#E6002D',
                    })
                  }
                })
              } else {
                this.setData({
                  isSvip: false,
                })
                Taro.setNavigationBarColor({
                  frontColor: '#ffffff',
                  backgroundColor: '#E6002D',
                })
              }
            })
          } else {
            this.setData({
              isSvip: true,
            })
            Taro.setNavigationBarColor({
              frontColor: '#ffffff',
              backgroundColor: '#19151D',
            })
          }
          //所有订单
          this.getAllOrder()
          //一码核销
          SvipApi.getCheckCode({
            cityId: Taro.getStorageSync('cityId'),
            mobile: Taro.getStorageSync('userInfo').mobile,
            userId: Taro.getStorageSync('userInfo').uid,
          }).then((info) => {
            if (info?.infoMap?.statusCode == 200) {
              this.setData({
                checkInfo: info.infoMap,
              })
              //加密手机号生成核销码小图
              new QRCode('bcode', {
                text: info.infoMap.ciphertext,
                width: 250,
                height: 250,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H,
              })
            }
          })
        } else {
          Taro.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#E6002D',
          })
          this.setData({
            isSvip: false,
            isLogin: Taro.getStorageSync('isLogin'),
            userInfo: Taro.getStorageSync('userInfo'),
          })
        }
        setTimeout(() => {
          Taro.hideLoading()
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
          hasXmbTask: true,
        })
      }
    })
    xmbApi.getSiteActivity().then((res) => {
      if (res.code == 200 && res.data?.length > 0) {
        this.setData({
          hasXmbAct: true,
        })
      }
    })

    //获取熊猫币抽奖活动是否在线
    xmbApi.getLotteryInfo().then((res) => {
      if (res.code == 200 && res.data.id) {
        this.setData({
          showLottery: true,
        })
      }
    })
  },
  //所有订单
  getAllOrder(update = 0) {
    if (this.stop1) {
      for (let i = 1; i <= this.stop1; i++) {
        clearInterval(i)
      }
    }
    SvipApi.getOrderList({
      order_list_type: 0,
      is_update: update,
    }).then((res) => {
      if (res.status == 1) {
        // all：全部，unpaid：待付款，ongoing：进行中，paid：已完成
        this.setData({
          unpaidLen: res.data.unpaid?.length ?? 0,
        })
        let fiveOrder = res.data.unpaid?.slice(0, 5)
        fiveOrder?.find((v) => {
          let nowTime = v.now_time
          let endDate = 0
          // order_list_type 2:SIVP订单 3:线上订单
          if (v.order_list_type == 2) {
            endDate = v.expire_time * 1000 - nowTime
          } else if (v.order_list_type == 3) {
            let b =
              new Date(v.create_time.replace(/-/g, '/')).getTime() +
              15 * 60 * 1000
            endDate = b - nowTime
          }
          //倒计时
          this.stop1 = setInterval(() => {
            let minute = Math.floor((endDate / 1000 / 60) % 60)
            // let second = Math.floor((endDate / 1000) % 60);
            if (endDate <= 0) {
              clearInterval(this.stop1)
              // for (let i = 1; i <= this.stop1; i++) {
              //   clearInterval(i);
              // }
              if (v.order_list_type != 1 && endDate > -10000) {
                //展会订单不需要更新，因为没有倒计时
                this.getAllOrder(1)
                return false
              }
            } else {
              endDate -= 1000
            }
            v.minute = minute
            // v.second = second;
            this.setData({
              unpaidList: fiveOrder ?? [],
            })
          }, 1000)
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
    Taro.uma.trackEvent('click_AD', {
      cityId: Taro.getStorageSync('cityId'),
      ADID: getTarget(e.currentTarget, Taro).dataset.area_id,
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    console.log(e)
    let type = getTarget(e.currentTarget, Taro).dataset.item.type
    var url = getTarget(e.currentTarget, Taro).dataset.item.url

    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if (this.isTab(url)) {
        Taro.switchTab({
          url,
        })
      } else {
        Taro.navigateTo({
          url,
        })
      }
    } else if (type == 2) {
      Taro.navigateToMiniProgram({
        appId: getTarget(e.currentTarget, Taro).dataset.item.appid,
        path: getTarget(e.currentTarget, Taro).dataset.item.url,
        complete(res) {},
      })
    } else {
      Taro.navigateTo({
        url:
          '/pages/web/web?url=' +
          encodeURIComponent(getTarget(e.currentTarget, Taro).dataset.item.url),
      })
    }
  },
  //svip抵扣券列表
  svipCouponData() {
    let that = this
    SvipApi.svipCouponData().then((res) => {
      if (
        res.status == 1 &&
        res.data.coupon_list &&
        res.data.coupon_list.length > 0
      ) {
        that.setData({
          couponInfo: res.data.coupon_list,
          showCouponPopup: true,
        })
      }
    })
  },
  closeCouponPopup() {
    this.setData({
      showCouponPopup: false,
    })
  },
  checkCode() {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '点我核销',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    this.setData({
      verifyPopup: !this.data.verifyPopup,
    })
  },
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getRequest(detail)
  },
  //授权手机号
  getPhoneNumber(e) {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '登录btn',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    let that = this
    util.authorizePhone(e, that.data.code, () => {
      that.setData({
        isLogin: true,
      })
      //获取页面所有接口信息
      that.getRequest()
    })
  },
  //0元升级接口
  svipUpgrade() {
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
    // svip 0元升级
    SvipApi.svipUpgrade({
      cityId: Taro.getStorageSync('cityId') || 1,
      activityId: Taro.getStorageSync('activityId'),
      src: '0yuan',
      uis: Taro.getStorageSync('uis'),
    }).then((res) => {
      Taro.hideLoading()
      if (res.status == 1) {
        Taro.navigateTo({
          url:
            '/pages/svipPackage/svipUserCenter/svipUserCenter?preFrom=zeroUpgrade&type=' +
            res.data.order_type,
        })
      } else {
        Taro.showToast({
          title: res.message,
          icon: 'none',
        })
      }
    })
  },
  // 会员中心
  toUserCenter() {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '超级会员btn',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (this.data.isLogin) {
      if (this.data.isSvip) {
        Taro.navigateTo({
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
            cityId: Taro.getStorageSync('cityId') || 1,
          }).then((res) => {
            if (res.is_active == 0) {
              SvipApi.reserveInfo({
                cityId: Taro.getStorageSync('cityId') || 1,
              }).then((res) => {
                console.log(res, '预约结果 0是未预约')
                if (res.status == 1) {
                  if (res.data.reserve_id == 0) {
                    //没预约
                    this.setData({
                      noReservePopup: true,
                    })
                  } else {
                    this.setData({
                      isReservePopup: true,
                    })
                  }
                }
              })
            } else {
              this.setData({
                buySvipPopup: true,
              })
            }
          })
        }
      }
    } else {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
    }
  },
  //跳转云逛展奖励页
  toCloudAward() {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '云逛展奖励',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (Taro.getStorageSync('isLogin')) {
      Taro.navigateTo({
        url: '/pages/cloudPackage/cloudAward/index',
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  // 门票列表
  toUserTicker() {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '我的门票',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    let token = Taro.getStorageSync('token')
    if (token && this.data.userInfo && this.data.isLogin) {
      Taro.navigateTo({
        url: '/pages/expoPackage/ticketList/ticketList',
      })
    } else {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
    }
  },
  //线上订单
  toOrderList(e) {
    let status = getTarget(e.currentTarget, Taro).dataset.status
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '我的订单',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (!this.data.userInfo || !this.data.isLogin) {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    } else {
      Taro.navigateTo({
        url: `/pages-userInfo/pages/orderList/orderList?type=0&status=${status}`,
      })
    }
  },
  toOrderDetail(e) {
    let item = getTarget(e.currentTarget, Taro).dataset.item
    if (item.order_list_type == 2) {
      //判断商品是否已下线
      if (item.is_offline == 1) {
        Taro.showToast({
          title: '商品已下线',
          icon: 'none',
        })
      } else {
        //SVIP商品带订单号跳转
        Taro.navigateTo({
          url: `/pages/svipPackage/payProductDetail/payProductDetail?id=${item.goods_id}&orderSn=${item.order_sn}`,
        })
      }
    } else {
      Taro.navigateTo({
        url: `/pages-abs/pages/orderDetail/orderDetail?order_id=${
          item.order_id ?? item.order_num
        }&orderType=${item.order_list_type}`,
      })
    }
  },
  // 我的优惠券
  myCoupon: function () {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '我的优惠券',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (!this.data.userInfo || !this.data.isLogin) {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    } else {
      Taro.navigateTo({
        url: '/pages/user/myCoupon/myCoupon',
      })
    }
  },
  // 我的预约
  myReserve: function () {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '我的预约',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (!this.data.userInfo || !this.data.isLogin) {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    } else {
      Taro.navigateTo({
        url: '/pages/user/myReserve/myReserve',
      })
    }
  },
  // 自助录单
  selfHelp: function () {
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '自助录单',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (!this.data.userInfo || !this.data.isLogin) {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    } else {
      Taro.navigateTo({
        url: '/pages/user/selfHelp/Index/Index',
      })
    }
  },
  toShApply() {
    if (!this.data.userInfo || !this.data.isLogin) {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    } else {
      Taro.navigateTo({
        url: '/pages-sh/pages/shIndex/shIndex',
      })
    }
  },
  checkLogin() {
    if (!this.data.userInfo || !this.data.isLogin) {
      Taro.showToast({
        icon: 'none',
        title: '请您先登录哦',
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login',
        })
      }, 600)
      return false
    }
    return true
  },
  // 个人信息页
  toProfile(e) {
    let type = getTarget(e.currentTarget, Taro).dataset.type
    // 友盟统计
    Taro.uma.trackEvent('click_userHome', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: type == 'avatar' ? '头像点击' : '昵称点击',
      SourcePage: 'pages/user/userHome',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (!this.checkLogin()) return
    Taro.navigateTo({
      url: '/pages-userInfo/pages/userCenter/userCenter',
    })
  },
  //
  toBuy() {
    this.setData({
      buySvipPopup: false,
    })
    Taro.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip',
    })
  },
  // 关闭弹层
  cancelBuy() {
    this.setData({
      buySvipPopup: false,
    })
  },
  // 关闭弹层
  cancelNoReserve() {
    this.setData({
      noReservePopup: false,
    })
  },
  cancelIsReserve() {
    this.setData({
      isReservePopup: false,
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      avaterUrl: e.detail.userInfo.avater,
    })
  },
  toBounty() {
    Taro.navigateTo({
      url: '/pages/expoPackage/bounty/bounty',
    })
  },
  toAward() {
    Taro.navigateTo({
      url: '/pages-xmb/pages/luckyDraw/luckyDraw',
    })
  },
  toXmbDetail() {
    Taro.navigateTo({
      url: '/pages-xmb/pages/xmbCenter/index/index',
    })
  },
  toCollect() {
    Taro.navigateTo({
      url: '/pages/user/myCollection/myCollection',
    })
  },
  toZeroBuy() {
    Taro.navigateTo({
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
      clearInterval(i)
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    for (let i = 1; i <= this.stop1; i++) {
      clearInterval(i)
    }
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      isSvip,
      isLogin,
      cityId,
      userInfo,
      hasXmbTask,
      hasXmbAct,
      isPastSvip,
      svipEndTime,
      xmbNum,
      unpaidLen,
      unpaidList,
      showLottery,
      fissionData,
      bottomAdv,
      buySvipPopup,
      noReservePopup,
      isReservePopup,
      verifyPopup,
      checkInfo,
      showCouponBtn,
      couponInfo,
      showCouponPopup,
    } = this.data
    return (
      <Block>
        <OnlineServe></OnlineServe>
        <PrivacyPopup></PrivacyPopup>
        <View className="wrapper">
          <View className={'banner ' + (isSvip ? 'is-svip' : '')}>
            <View className="banner-main">
              {!isLogin && (
                <Button
                  className="auth-login"
                  openType="getPhoneNumber"
                  onGetphonenumber={this.getPhoneNumber}
                ></Button>
              )}
              <View className="person">
                <View
                  className="user-icon"
                  data-type="avatar"
                  onClick={this.toProfile}
                >
                  {!isLogin && (
                    <Block>
                      {cityId == 60 ? (
                        <Image
                          className="head-img"
                          src="https://img.51jiabo.com/94467bd5-404c-4f6c-aeee-b6d948d93079.png"
                        ></Image>
                      ) : (
                        <Image
                          className="head-img"
                          src="https://img.51jiabo.com/1a927c4f-1d8a-49a9-8720-c90ce2719f31.jpg"
                        ></Image>
                      )}
                    </Block>
                  )}
                  {isLogin && (
                    <Block>
                      {cityId == 60 ? (
                        <Image
                          className="head-img"
                          src={
                            userInfo.avatar
                              ? userInfo.avatar
                              : 'https://img.51jiabo.com/94467bd5-404c-4f6c-aeee-b6d948d93079.png'
                          }
                        ></Image>
                      ) : (
                        <Image
                          className="head-img"
                          src={
                            userInfo.avatar
                              ? userInfo.avatar
                              : 'https://img.51jiabo.com/1a927c4f-1d8a-49a9-8720-c90ce2719f31.jpg'
                          }
                        ></Image>
                      )}
                    </Block>
                  )}
                  {/*  会员皇冠  */}
                  <Image
                    className="crown"
                    src="https://img.51jiabo.com/7cb8151f-de93-4fdd-b437-5d9bf8c6c768.png"
                  ></Image>
                </View>
                {/*  未登录  */}
                {!isLogin && (
                  <View className="not-login">
                    <View className="login-box">
                      <View className="title">未登录</View>
                      <View className="content">点击注册/登录</View>
                      {(hasXmbTask || hasXmbAct) && (
                        <View className="xmb-entry">
                          <Image
                            className="xmb-icon"
                            src="https://img.51jiabo.com/983e9af2-b384-4f5d-930c-d56f788699d9.png"
                          ></Image>
                          <Text className="xmb-text">熊猫币</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                {/*  已登录  */}
                {isLogin && (
                  <View className="login-box">
                    <View
                      className="title"
                      data-type="nick"
                      onClick={this.toProfile}
                    >
                      {userInfo.nick_name
                        ? userInfo.nick_name
                        : userInfo.mobile}
                    </View>
                    {!isSvip && userInfo.nick_name && (
                      <View className="content">{userInfo.mobile}</View>
                    )}
                    {isSvip && !isPastSvip && (
                      <View className="content">
                        {'到期时间：' + svipEndTime + '日'}
                      </View>
                    )}
                    {isSvip && isPastSvip && (
                      <View className="content">已过期</View>
                    )}
                    {(hasXmbTask || hasXmbAct) && (
                      <View className="xmb-entry" onClick={this.toXmbDetail}>
                        <Image
                          className="xmb-icon"
                          src="https://img.51jiabo.com/983e9af2-b384-4f5d-930c-d56f788699d9.png"
                        ></Image>
                        <Text className="xmb-text">{xmbNum + '熊猫币'}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {/*  核销码  */}
              <View className="verify-code" onClick={this.checkCode}>
                <View className="verify-text">
                  {isLogin ? '点我核销' : '登录核销'}
                </View>
                <View className="code"></View>
                {/*  <image class="small-code" src="{{codeImg}}" hidden="{{!isLogin}}"></image>
                
                				<canvas class="canvas-code" canvas-id='scode'></canvas>  */}
              </View>
            </View>
          </View>
          <View className="key-box">
            <View className="key-point">
              <View className="item" onClick={this.toUserCenter}>
                <View className="ico"></View>
                <View className="text">超级会员</View>
              </View>
              <View className="item" onClick={this.myCoupon}>
                <View className="ico"></View>
                <View className="text">我的优惠券</View>
              </View>
              <View className="item" onClick={this.myReserve}>
                <View className="ico"></View>
                <View className="text">我的预约</View>
              </View>
              {!isLogin && (
                <Button
                  className="auth-login"
                  openType="getPhoneNumber"
                  onGetphonenumber={this.getPhoneNumber}
                ></Button>
              )}
            </View>
          </View>
          {/*  我的订单  */}
          <View className="my-order">
            {!isLogin && (
              <Button
                className="auth-login"
                openType="getPhoneNumber"
                onGetphonenumber={this.getPhoneNumber}
              ></Button>
            )}
            <View className="order-text">
              我的订单
              <View
                className="more-order"
                data-status="all"
                onClick={this.toOrderList}
              >
                查看全部订单
              </View>
            </View>
            <View className="status-list">
              <View
                className="status-item"
                data-status="unpaid"
                onClick={this.toOrderList}
              >
                {isLogin && unpaidLen != 0 && (
                  <View className="num">{unpaidLen}</View>
                )}
                <View className="status-img"></View>
                <View className="status-text">待付款</View>
              </View>
              <View
                className="status-item"
                data-status="ongoing"
                onClick={this.toOrderList}
              >
                <View className="status-img"></View>
                <View className="status-text">进行中</View>
              </View>
              <View
                className="status-item"
                data-status="paid"
                onClick={this.toOrderList}
              >
                <View className="status-img"></View>
                <View className="status-text">已完成</View>
              </View>
            </View>
            {isLogin && unpaidList?.length > 0 && (
              <View className="obligation-box">
                <Swiper
                  className="obligation-swiper-box"
                  indicatorDots={unpaidList?.length > 1 ? true : false}
                  indicatorColor="#D3D3D3"
                  indicatorActiveColor="#D3D3D3"
                  autoplay="true"
                >
                  {unpaidList?.map((item, index) => {
                    return (
                      <SwiperItem className="obligation-swiper" key={index}>
                        <View className="obligation">
                          {item.goods_image ? (
                            <Image
                              className="img"
                              mode="aspectFill"
                              src={item.goods_image}
                            ></Image>
                          ) : item.image_url ? (
                            <Image
                              className="img"
                              mode="aspectFill"
                              src={item.image_url}
                            ></Image>
                          ) : (
                            <Image
                              className="img"
                              mode="aspectFill"
                              src={
                                item.goods[0].image_url
                                  ? item.goods[0].image_url
                                  : item.logo_url
                              }
                            ></Image>
                          )}
                          {/*  线上订单  */}
                          {/*  展会订单  */}
                          <View className="text">
                            <View className="tit">待付款</View>
                            {item.order_list_type != 1 && (
                              <View className="time">
                                <Text>{item.minute + '分钟'}</Text>
                                未支付，订单将自动关闭
                              </View>
                            )}
                          </View>
                        </View>
                        <View
                          className="to-pay"
                          data-item={item}
                          onClick={this.toOrderDetail}
                        >
                          去支付
                        </View>
                      </SwiperItem>
                    )
                  })}
                </Swiper>
              </View>
            )}
          </View>
          <View className="equity-list">
            <View className="equity-item" onClick={this.toUserTicker}>
              <View className="mp-icon"></View>
              <View className="equity-text">我的门票</View>
            </View>
            <View className="equity-item" onClick={this.selfHelp}>
              <View className="ld-icon"></View>
              <View className="equity-text">自助录单</View>
            </View>
            <View className="equity-item" onClick={this.toShApply}>
              <View className="sh-icon"></View>
              <View className="equity-text">售后申请</View>
            </View>
            <View className="equity-item" onClick={this.toCollect}>
              <View className="sc-icon"></View>
              <View className="equity-text">我的收藏</View>
            </View>
            {showLottery && (
              <View className="equity-item" onClick={this.toAward}>
                <View className="lj-icon"></View>
                <View className="equity-text">天天领奖</View>
              </View>
            )}
            {/*  <view wx:if="{{cityId !=4 4}}" class="equity-item" bindtap='toBounty'>
            
            			<view class="jlj-icon"></view>
            
            			<view class="equity-text">奖励金活动</view>
            
            		</view>  */}
            {fissionData && fissionData?.type != 1 && (
              <View
                className="equity-item"
                onClick={this.toZeroBuy}
                style={{
                  position: 'relative',
                  zIndex: '2',
                }}
              >
                <View className="zb-icon"></View>
                <View className="equity-text">周周0元抽</View>
              </View>
            )}
            {/*  <view class="equity-item" bindtap='toCloudAward'>
            
            			<view class="ygz-icon"></view>
            
            			<view class="equity-text">云逛展奖励</view>
            
            		</view>  */}
            {!isLogin && (
              <Button
                className="auth-login"
                openType="getPhoneNumber"
                onGetphonenumber={this.getPhoneNumber}
              ></Button>
            )}
          </View>
          {/*  轮播运营位  */}
          {bottomAdv && bottomAdv?.length > 0 && (
            <View className="adv">
              {bottomAdv && bottomAdv?.length > 1 ? (
                <Swiper
                  className="operate-site-bottom"
                  autoplay="true"
                  interval="3000"
                >
                  {bottomAdv?.map((item, index) => {
                    return (
                      <Block key={index}>
                        <SwiperItem
                          data-item={item}
                          data-area_id="68"
                          onClick={item.url ? 'swiperUrl' : ''}
                        >
                          <Image
                            mode="scaleToFill"
                            src={item.wapImageUrl}
                          ></Image>
                        </SwiperItem>
                      </Block>
                    )
                  })}
                </Swiper>
              ) : (
                <View
                  className="single-swiper"
                  data-item={bottomAdv?.[0]}
                  data-area_id="68"
                  onClick={bottomAdv?.[0]?.url ? 'swiperUrl' : ''}
                >
                  <Image
                    mode="widthFix"
                    src={bottomAdv?.[0]?.wapImageUrl}
                  ></Image>
                </View>
              )}
              {/*  一张运营位  */}
            </View>
          )}
          {/*  <view class='log-out' wx:if="{{isLogin}}" bindtap='logout'>退出登录</view>  */}
        </View>
        {/*  去购买svip弹层  */}
        {buySvipPopup && (
          <View className="svip-tips-popup">
            <View className="svip-tips-box">
              <View className="title">您还不是会员，请先行购买</View>
              <View className="btn-box">
                <View onClick={this.cancelBuy}>取消</View>
                <View onClick={this.toBuy} className="right">
                  去购买
                </View>
              </View>
            </View>
          </View>
        )}
        {/*  去预约下一届弹层  */}
        {noReservePopup && (
          <View className="svip-tips-popup">
            <View className="svip-tips-box">
              <View className="title">
                您还不是会员，本届展会svip售卖已结束，请预约下一届
              </View>
              <View className="btn-box">
                <View onClick={this.cancelNoReserve}>取消</View>
                <Navigator
                  openType="reLaunch"
                  url="/pages/reserve/reserveTicket"
                  className="right"
                >
                  去预约
                </Navigator>
              </View>
            </View>
          </View>
        )}
        {/*  已预约下一届弹层  */}
        {isReservePopup && (
          <View className="svip-tips-popup">
            <View className="svip-tips-box">
              <View className="title">
                您未购买本届会员，已成功预约下一届，下一届权益上线后会电话通知您。
              </View>
              <View className="btn-box">
                <View onClick={this.cancelIsReserve}>取消</View>
                <Navigator
                  openType="reLaunch"
                  url="/pages/reserve/reserveTicket"
                  className="right"
                >
                  查看
                </Navigator>
              </View>
            </View>
          </View>
        )}
        {/*  核销码弹层  */}
        {!!verifyPopup && (
          <View className="verify-code-popup" onTouchMove={this.stop}>
            <View className="layer" onClick={this.checkCode}></View>
            <View className="verify-box">
              <View className="title">
                让商家扫一扫
                <View className="close" onClick={this.checkCode}></View>
              </View>
              <View className="content">
                <Canvas
                  className="canvas"
                  disableScroll="true"
                  canvasId="bcode"
                ></Canvas>
                <View className="detail">
                  {'您有' + checkInfo?.couponCount + '张优惠券未使用'}
                </View>
                <View className="detail">
                  {'已预约' + checkInfo?.goodsCount + '件低价爆品'}
                </View>
              </View>
            </View>
          </View>
        )}
        {/*  svip抵扣券按钮  */}
        {showCouponBtn && <CouponBtn></CouponBtn>}
        {/*  领取svip抵扣券弹层  */}
        <CouponPopup
          couponInfo={couponInfo}
          isLogin={isLogin}
          showCouponPopup={showCouponPopup}
          onGetPhoneBack={this.getPhoneBack}
          onCloseCouponPopup={this.closeCouponPopup}
        ></CouponPopup>
      </Block>
    )
  }
}
export default _C
