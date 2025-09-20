// pages/home/home.js
import {
  svip
} from "../../common/api/svipApi.js"
let app = getApp()
const SvipApi = new svip()
import {
  util
} from "../../common/util.js"

let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]

Page({
  data: {
    isPlay: false,
    isSvip: false,
    activityId: null,
    userInfo: wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : null,
    activityInfo: null,
    homeData: [],
    couponsData: [],
    rightsList: [],
    totalRightsList: [],
    pageGuideList: [], // 条款
    hotGoods: {}, // 火爆商品
    showExplain: false,
    dialogShow: false,
    dialogList: null,
    price: "",
    allGoodsDes: '',
    prepaygoodsDes: '',
    scrollShowBtn: null,
    expoBeginDate: "",
    giftCurrent: 0,
    stop: Function,
    curPage: 'pages/home/home',
  },
  onLoad: function (options) {
    if (options.svipInviteMobile) {
      wx.setStorageSync('svipInviteMobile', options.svipInviteMobile)
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
  onShow: function () {
    // 友盟统计
    wx.uma.trackEvent('enter_SVIPhome', {
      cityId: wx.getStorageSync('cityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    wx.hideShareMenu({
      complete() {}
    })
    clearInterval(this.data.stop);
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
      let text = "list[1].text"
      if (wx.getStorageSync('cityId') == 60) {
        this.getTabBar().setData({
          [text]: '装修狂欢节'
        })
      } else {
        this.getTabBar().setData({
          [text]: '家博会'
        })
      }
    }

    this.setData({
      restoreOrigin: false,
      openExpoSale: false,
      isOpenSale: false,
      isLogin: wx.getStorageSync('isLogin'),
    })
    if (wx.getStorageSync("zeroUpgradeS")) {
      this.setData({
        orderType: wx.getStorageSync("zeroUpgradeType"),
        showUpdatePopup: true
      })
      wx.removeStorageSync("zeroUpgradeS")
    }
    //用户行为记录
    this.data.pv_b_time = new Date().getTime();
    this.postPV(8, 1)
    //获取所有数据
    this.setIninitState()
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
  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      this.setIninitState()
    })
  },
  // 初始化状态
  setIninitState() {
    let cityId = wx.getStorageSync('cityId')
    if (cityId) {
      this.setData({
        cityId: cityId
      })
      //获取页面所有接口信息
      this.getData()

    } else if (!cityId && wx.getStorageSync("isLocation")) {
      //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
      wx.navigateTo({
        url: '/pages/address/index',
      })
      return
    } else {
      //定位
      util.getPositionCity("", () => {
        //定位成功请求数据
        let curUserCityText = wx.getStorageSync('curUserCityText')
        let price = wx.getStorageSync('price')
        this.setData({
          cityId: cityId,
          price: price,
          curUserCityText: curUserCityText
        })
        this.getData()
      })
    }

  },
  svipImage(params) {
    SvipApi.svipImage(params).then((res) => {
      //type : 2=定金商品描述 3=全款商品描述 7=预约商品描述
      if (res.image_2) {
        this.setData({
          prepaygoodsDes: res.image_2[0] ? res.image_2[0].description : ''
        })
      }
      if (res.image_3) {
        this.setData({
          allGoodsDes: res.image_3[0] ? res.image_3[0].description : ''
        })
      }
      if (res.image_7) {
        this.setData({
          reserveGoodsDes: res.image_7[0] ? res.image_7[0].description : ''
        })
      }
    })
  },

  getData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let params1 = {
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: null
    }
    SvipApi.activityInfo(params1).then((res) => {
      console.log(res)
      let actEndDate = res.begin_date;
      this.setData({
        expoBeginDate: res.begin_date
      })
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      this.setData({
        activityInfo: wx.getStorageSync('activityInfo'),
        curUserCityText: res.city_name
      })
      let isBegin = Number(res.is_active)
      if (isBegin === 0) {
        wx.hideLoading()
        wx.setStorageSync('isThisGoing', true)
        wx.reLaunch({
          url: '/pages/reserve/reserveTicket',
          fail: function () {
            wx.showToast({
              title: "跳转失败，请重试",
              icon: "none"
            })
            wx.navigateBack(1)
          }
        })
        return false
      }
      //svip购买倒计时
      let nowTime = new Date().getTime();
      let endDate = new Date(actEndDate.replace(/-/g, "/")).getTime() - nowTime;
      if (endDate > 0) {
        this.setData({
          countOver: false
        })
        //倒计时
        this.data.stop = setInterval(() => {
          let days = Math.floor(endDate / 1000 / 60 / 60 / 24);
          let hours = Math.floor(endDate / 1000 / 60 / 60 % 24);
          let minute = Math.floor((endDate / 1000 / 60) % 60);
          let second = Math.floor((endDate / 1000) % 60);
          this.setData({
            days: days < 10 ? "0" + days : days,
            hours: hours < 10 ? "0" + hours : hours,
            minute: minute < 10 ? "0" + minute : minute,
            second: second < 10 ? "0" + second : second
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
      } else {
        this.setData({
          countOver: true
        })
      }
      this.getHomeData()
      this.moreChooseOneGoodsListReq();
      wx.setStorageSync('isThisGoing', false)
    })
  },
  //首页数据
  getHomeData(detail) {
    let params = {
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId'),
    }
    SvipApi.homeData(params).then((res) => {
      console.log(res, '首页数据')
      this.setData({
        cityConfig: "",
        isDiscount: false,
        showCouponPopup: false,
        showCouponBtn: false,
        isOpenSale: res.is_zhanzhong_sell == 1 ? true : false
      })
      if (res.is_show_yuanjia_button == 1 && res.is_show_zhanzhong_button == 1) {
        //展中原价
        this.setData({
          salePrice: res.origin_price ? Number(res.origin_price) : "",
          openExpoSale: true
        })
      } else if (res.is_show_yuanjia_button == 0 && res.is_show_zhanzhong_button == 1) {
        //展中抢购价
        this.setData({
          salePrice: Number(res.price),
          openExpoSale: true
        })
      } else if (res.is_show_yuanjia_button == 1 && res.is_show_zhanzhong_button == 0) {
        //展前原价
        this.setData({
          restoreOrigin: true
        })
      }
      wx.setStorageSync('pageGuideList', res.page_guide_list);
      wx.setStorageSync('totalRightsList', res.images_quanyi);
      wx.setStorageSync('price', Number(res.price));
      let d = app.disposeData(res.coupons_data);
      let universalCoupon = [];
      if (res.universal_coupons && res.universal_coupons.length > 0) {
        universalCoupon = res.universal_coupons.map((v) => {
          v.isUniversal = true;
          return v
        })
      }
      this.setData({
        homeData: res,
        originPrice: res.origin_price ? Number(res.origin_price) : "",
        price: Number(res.price),
        couponsData: res.coupons_data ? d.concat(app.disposeData(universalCoupon)) : null,
        showCoupon: res.is_exh_buy_coupons, //展中是否显示平台券1显示
        showGift: res.is_exh_buy_gift, //展中是否显示签到礼1显示
        isSend: res.is_send, //展中购买是否赠送下一届svip: 1=是
        totalRightsList: res.images_quanyi ? res.images_quanyi : null,
        rightsList: res.images_quanyi ? this.splitArr(res.images_quanyi) : null
      })
      this.getSignInfo()
      //获取城市配置信息
      SvipApi.getCityConfig().then((res) => {
        if (res.status == 1) {
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
        } else {
          //获取svip抵扣券列表
          this.svipCouponData()
        }
      })
      //商户优惠券获取
      SvipApi.getVendorCoupon().then((res) => {
        if (res.status == 1) {
          this.setData({
            vendorCouponData: res.data.couponInfo_home ? app.disposeData(res.data.couponInfo_home) : []
          })
        }
      })
      //获取svip状态
      this.getSvipStatus()
      //获取商品数据
      this.getGoodsData('1,2,3,4', 100)
      this.svipImage({
        type: '2,3,7',
        cityId: wx.getStorageSync('cityId') || 1,
        activityId: wx.getStorageSync('activityId')
      })
      //获取运营位
      this.getAdvImg()
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
  getSignInfo() {
    this.setData({
      giftConfigImg: "",
      entityGift: "",
      couponGift: ""
    })
    //获取签到礼信息
    SvipApi.getSignGiftInfo().then((res) => {
      if (res.status == 1 && res.data) {
        //1=未登录；2=已登录，用户非会员；3=已登录，未抽签到礼；4=已登录，抽实物签到礼；5=已登录，抽优惠券签到礼；6=现代家博会广州无需抽直接显示实物
        if (res.data.mode == 1 || res.data.mode == 2 || res.data.mode == 3) {
          this.setData({
            giftConfigImg: res.data.giftInfo.giftConfigImg.length > 0 ? res.data.giftInfo.giftConfigImg : ""
          })
        } else if (res.data.mode == 4 || res.data.mode == 6) {
          let gData = res.data.giftInfo.master_img;
          if (gData[0]?.type == 4) {
            gData[0].cover_img_url = gData[1].image_url;
            gData.splice(1, 1)
          }
          res.data.giftInfo.master_img = gData;
          this.setData({
            entityGift: res.data.giftInfo
          })
        } else {
          this.setData({
            couponGift: app.disposeData(res.data.giftInfo?.couponsInfo)
          })
        }
      }
    })
  },
  closeCouponPopup() {
    this.setData({
      showCouponPopup: false
    })
  },
  // 点击查看更多按钮优惠券列表全部显示
  chakanBtn() {
    if (this.data.moreData) {
      this.setData({
        moreData: false
      })
    } else {
      this.setData({
        moreData: true
      })
    }
  },
  toSignDetail() {
    wx.navigateTo({
      url: '/pages/svipPackage/signDetail/Index',
    })
  },
  //获取svip状态
  getSvipStatus() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        let status = res.data.svip == 1 ? true : false
        wx.setStorageSync('isSvip', status)
        this.setData({
          isSvip: status,
          isLogin: true,
          userInfo: res.data
        })
        //非svip，获取可用抵扣券
        if (res.data.svip != 1) {
          //判断用户是否有未使用svip抵扣券并且非svip，有则弹优惠券按钮
          SvipApi.userSvipCouponData().then((res) => {
            let userSvipCoupon = [];
            if (res.status == 1 && res.data.is_show == 1) {
              this.setData({
                showCouponBtn: true
              })
              userSvipCoupon = res.data.coupon_info.map((v) => {
                v.is_own = 1
                return v
              })
            }
            SvipApi.svipCouponData().then((res) => {
              if (res.status == 1 && res.data.coupon_list) {
                //根据可用优惠券满减金额和svip价格判断是否有可用优惠券
                let svipPrice = 0;
                let couponList = userSvipCoupon.concat(res.data.coupon_list)
                if (couponList.length > 0) {
                  for (let v of couponList) {
                    if (!this.data.restoreOrigin && !this.data.openExpoSale) {
                      //展前抢购价
                      svipPrice = this.data.price;
                    } else if (this.data.restoreOrigin) {
                      //展前原价
                      svipPrice = this.data.originPrice;
                    } else if (this.data.openExpoSale) {
                      //展中
                      svipPrice = this.data.salePrice;
                    }
                    if (v.consume_amount <= svipPrice) {
                      this.setData({
                        canUseCoupon: v,
                        isDiscount: true,
                        discountPrice: (Number(svipPrice) * 1000 - Number(v.coupon_value) * 1000) / 1000
                      })
                      break
                    }
                  }
                }
              }
            })
          })
        }
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
      } else {
        this.setData({
          isSvip: false,
          isLogin: false,
          userInfo: null
        })
      }
    })
  },
  //获取全部运营位图片
  getAdvImg() {
    SvipApi.getAdvList({
      area_id: "19,20,22,23,24,30"
    }).then((res) => {
      // 19:优惠券下方运营位 20:签到礼下方运营位 22:定金商品下方运营位 23:全款商品下方运营位 24:免费逛展下方运营位 30:svip分享
      if (res.status == 1) {
        this.setData({
          couponAdv: res.data.adv19 || [],
          signAdv: res.data.adv20 || [],
          prePayAdv: res.data.adv22 || [],
          totalAdv: res.data.adv23 || [],
          freeExpoAdv: res.data.adv24 || [],
          svipShareAdv: res.data.adv30 || ""
        })
        wx.showShareMenu()
      }
    })
  },
  userlogin() {
    if (this.data.isLogin && this.data.isSvip) {
      // 友盟统计
      wx.uma.trackEvent('click_SVIPhome', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '会员中心',
        SourcePage: this.data.curPage
      });
      wx.navigateTo({
        url: '/pages/svipPackage/svipUserCenter/svipUserCenter',
      })
      return
    }
    if (this.data.isLogin && !this.data.isSvip) {
      // 友盟统计
      wx.uma.trackEvent('click_SVIPhome', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '成为会员',
        SourcePage: this.data.curPage
      });
      //判断是否可以直接升级svip,2为直接升级
      if (this.data.isUpgrade == 2) {
        // svip 0元升级
        this.svipUpgrade()
      } else {
        wx.navigateTo({
          url: '/pages/svipPackage/paySvip/paySvip',
        })
      }
      return
    }
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  buySvip() {
    if (this.data.isLogin) {
      let btnName;
      if (this.data.isSvip) {
        btnName = '会员中心';
        wx.navigateTo({
          url: '/pages/svipPackage/svipUserCenter/svipUserCenter'
        })
      } else {
        btnName = '成为会员';
        //判断是否可以直接升级svip,2为直接升级
        if (this.data.isUpgrade == 2) {
          // svip 0元升级
          this.svipUpgrade()
        } else {
          wx.navigateTo({
            url: '/pages/svipPackage/paySvip/paySvip',
          })
        }
      }

      // 友盟统计
      wx.uma.trackEvent('click_SVIPhome', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: btnName,
        SourcePage: this.data.curPage
      });
      wx.uma.trackEvent('click_SVIPhome', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '立即领取',
        SourcePage: this.data.curPage
      });
    } else {
      wx.navigateTo({
        url: '/pages/login/login?next=svipPay',
      })
    }
  },
  //抽取签到礼
  lottery() {
    // 友盟统计
    wx.uma.trackEvent('click_SVIPhome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '签到礼按钮',
      SourcePage: this.data.curPage
    });
    if (this.data.isLogin) {
      if (this.data.isSvip) {
        wx.showLoading({
          title: "加载中...",
          mask: true
        })
        SvipApi.giftLottery().then((res) => {
          if (res.status == 1) {
            this.setData({
              signGiftGif: res.data.image_url,
              signPopup: true
            })
            this.getSignInfo()
          }
          wx.hideLoading()
        })
      } else {
        //判断是否可以直接升级svip,2为直接升级
        if (this.data.isUpgrade == 2) {
          // svip 0元升级
          this.svipUpgrade()
        } else {
          wx.setStorageSync('src', "YYXCX")
          wx.setStorageSync('uis', "签到礼抽奖转化")
          wx.navigateTo({
            url: '/pages/svipPackage/paySvip/paySvip',
          })
        }
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  closeSignPopup() {
    this.setData({
      signPopup: !this.data.signPopup
    })
  },
  //预约商品非会员购买svip
  reserveBuySvip() {
    this.setData({
      svipTips: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip?origin=homeReserve',
    })
  },
  // 预约商品
  reserveGoods(e) {
    let id = e.currentTarget.dataset.id
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    if (this.data.isLogin && !this.data.isSvip) {
      //判断是否可以直接升级svip,2为直接升级
      if (this.data.isUpgrade == 2) {
        // svip 0元升级
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        SvipApi.svipUpgrade({
          cityId: wx.getStorageSync('cityId') || 1,
          activityId: wx.getStorageSync('activityId'),
          src: "0yuan",
          uis: wx.getStorageSync('uis')
        }).then((res) => {
          wx.hideLoading()
          if (res.status == 1) {
            this.setData({
              orderType: res.data.order_type,
              showUpdatePopup: true
            })
          } else {
            wx.showToast({
              title: res.message,
              icon: "none"
            })
          }
        })
      } else {
        //非会员提示弹层
        this.setData({
          svipTips: true
        })
      }
      return
    }
    //调用预约接口
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.goodsReserve({
      goods_id: id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          reserveTips: true
        })
        //调接口改变对应状态
        this.getGoodsData(4, 100)
      } else if (res.code == -2) {
        //非会员提示弹层
        this.setData({
          svipTips: true
        })
      } else {
        wx.showToast({
          title: res.message ? res.message : "请求出错了",
          icon: "none"
        })
      }
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

  // n选1活动商品列表
  moreChooseOneGoodsListReq() {
    SvipApi.moreChooseOneGoodsList().then(res => {
      if (res.status == 1 && res.data.goods_list && res.data.goods_list.length > 0) {
        let hasBuyFinish = res.data.goods_list.some(item => {
          return item.order_id > 0
        })
        this.setData({
          moreChooseOneGoodsData: res.data,
          hasBuyFinish
        })
      } else {
        this.setData({
          moreChooseOneGoodsData: null,
        })
      }
      this.setData({
        moreChooseOneGoodsListData: res
      })
    })
  },
  // 获取商品数据
  getGoodsData(type, size) {
    let params = {
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId'),
      pageSize: size,
      type: type
    }
    SvipApi.refureshGoods(params).then((res) => {
      // res = [{
      //   activity_id: "222",
      //   begin_date: "2019-10-10 16:58:37",
      //   buy_limit: "1",
      //   city_id: "1",
      //   create_date: "2019-10-10 16:58:49",
      //   deduction_amount: "0.00",
      //   deleted: "0",
      //   description: "全款商品111",
      //   end_date: "2019-10-28 23:59:59",
      //   goods_category: "1",
      //   goods_id: "235",
      //   goods_image: "https://img.51jiabo.com/20191010165828858.png",
      //   goods_name: "全款商品111",
      //   goods_sn: "JFqlkrqKTDOZcNlEQSir",
      //   origin_price: 123,
      //   prepay_amount: "0.00",
      //   sale_price: 123,
      //   sort: "999",
      //   status: "1",
      //   stock: "2",
      //   supplier_id: "0",
      //   type: "1",
      //   unit: "个",
      //   user_id: 0
      // }];
      res = app.disposeData(res)
      // 预约商品
      if (res.goods_4) {
        let reserveList = [];
        if (res.goods_4.length > 1) {
          reserveList = res.goods_4
            .map(function (v, i) {
              return i % 2 ? null : [res.goods_4[i], res.goods_4[i + 1]];
            })
            .filter(Boolean);
        } else {
          reserveList = res.goods_4;
        }
        this.setData({
          allReserveList: res.goods_4,
          reserveList: reserveList,
          current: 0
        })
      } else {
        this.setData({
          allReserveList: null,
          reserveList: null,
        })
      }
      // 全款商品
      if (res.goods_1) {
        let totalList = [];
        if (res.goods_1.length > 1) {
          totalList = res.goods_1
            .map(function (v, i) {
              return i % 2 ? null : [res.goods_1[i], res.goods_1[i + 1]];
            })
            .filter(Boolean);
        } else {
          totalList = res.goods_1;
        }
        this.setData({
          allTotalList: res.goods_1,
          totalList: totalList,
          current: 0
        })
      } else {
        this.setData({
          allTotalList: null,
          totalList: null,
        })
      }
      // 定金商品
      if (res.goods_2) {
        let prepayList = [];
        if (res.goods_2.length > 1) {
          prepayList = res.goods_2
            .map(function (v, i) {
              return i % 2 ? null : [res.goods_2[i], res.goods_2[i + 1]];
            })
            .filter(Boolean);
        } else {
          prepayList = res.goods_2;
        }
        this.setData({
          allPrepayList: res.goods_2,
          prepayList: prepayList,
          current: 0
        })
      } else {
        this.setData({
          allPrepayList: null,
          prepayList: null,
        })
      }
      // 爆品
      if (res.goods_3) {
        this.setData({
          hotGoods: res.goods_3
        })
      } else {
        this.setData({
          hotGoods: null
        })
      }
    })
  },
  //选择城市
  chooseCity() {
    wx.navigateTo({
      url: '/pages/address/index',
    })
  },
  closePopup(e) {
    let val = e.target.dataset.val;
    this.setData({
      [val]: false
    })
  },
  // 商品列表
  goodsList(e) {
    // 友盟统计
    wx.uma.trackEvent('click_SVIPhome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: `${e.target.dataset.title}商品查看更多`,
      SourcePage: this.data.curPage
    });
    wx.navigateTo({
      url: '/pages/goodsList/goodsList?type=' + e.target.dataset.type,
    })
  },
  //去商品详情
  goodsDetail(e) {
    // 友盟统计
    wx.uma.trackEvent('click_SVIPhome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: `${e.currentTarget.dataset.title}商品区域`,
      SourcePage: this.data.curPage
    });
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id,
    })
  },
  //运营位跳转
  // advUrl(e) {
  //   wx.navigateTo({
  //     url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.url)
  //   })
  // },
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
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail;
    this.setData({
      isAuth: true
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getHomeData(detail)
  },
  closeUpdate() {
    this.setData({
      showUpdatePopup: false
    })
    this.onShow()
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

    // 友盟统计
    wx.uma.trackEvent('click_SVIPhome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '权益图标',
      SourcePage: this.data.curPage
    });
  },
  dialogHide() {
    this.setData({
      dialogShow: false
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
  onPageScroll(h) {
    if (h.scrollTop > 450) {
      this.setData({
        scrollShowBtn: true
      })
    } else {
      this.setData({
        scrollShowBtn: false
      })
    }
  },

  //轮播change
  swiperChange(e) {
    this.setData({
      giftCurrent: e.detail.current
    })
  },

  //播放视频
  playVideo() {
    if (this.data.isPlay) {
      this.setData({
        isPlay: false
      })
      wx.createVideoContext('video').pause()
    } else {
      this.setData({
        isPlay: true
      })
      wx.createVideoContext('video').play()
    }
  },
  //视频播放完
  videoPause() {
    this.setData({
      isPlay: false
    })
  },

  toSignGift() {
    // 友盟统计
    wx.uma.trackEvent('click_SVIPhome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '签到礼图',
      SourcePage: this.data.curPage
    });
    wx.navigateTo({
      url: '/pages/svipPackage/signGift/signGift',
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

  // 平台券信息展开
  platformSpread(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    this.setData({
      curId: id,
      curIndex: index
    })
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.stop);
    //用户行为记录
    this.postPV(8, 2)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.stop);
    //用户行为记录
    this.postPV(8, 2)
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
      title: '您的好友邀请您购买超值svip,点击查看',
      imageUrl: this.data.svipShareAdv ? this.data.svipShareAdv[0].wap_image_url : "",
      path: '/pages/home/home'
    }
  }
})