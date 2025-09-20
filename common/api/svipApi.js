import {
  httpAsync
} from '../http/http-async.js'

class svip extends httpAsync {

  getPathQrCode(page, scene) {
    return this.requestNew({
      url: "/QRCode",
      data: {
        page,
        scene: scene || '1000'
      }
    })
  }

  // svip是否需要0元升级
  zeroUpgrade(data) {
    return this.requestNew({
      url: "/v2.0/user/svipIsZeroUpgrade",
      data: data
    }, "POST")
  }
  // svip 0元升级
  svipUpgrade(data) {
    return this.requestNew({
      url: "/v2.0/svip/svipZeroUpgrade",
      data: data
    }, "POST")
  }
  // 提交formId
  pushFormId(data) {
    return this.requestNew({
      url: "/expo/addForm",
      data: data
    }, "POST")
  }

  //获取客服微信
  getServiceInfo(data) {
    return this.requestNew({
      url: "/v2.0/city/getKeFuInfo?cityId=" + data.cityId + '&activityId=' + data.activityId
    })
  }

  //获取城市配置信息
  getCityConfig() {
    return this.requestNew({
      url: "/v2.0/svip/cityConfigInfo"
    })
  }

  // 城市列表
  citylist(data) {
    return this.request({
      url: "/v2.0/city/list"
    })
  }
  //通用广告运营位
  // getAdvList(data) {
  //   return this.requestNew({
  //     url: "/expo/xcx/adv?area_id=" + data.area_id
  //   })
  // }
  //新运营位接口（不用单个调用，传字符串id用,分割）
  getAdvList(data) {
    return this.requestNew({
      url: "/v2.0/adv/xcxAdv?area_id=" + data.area_id
    })
  }
  // 展会信息
  activityInfo(data) {
    let url = '/v2.0/city/getActivityInfo?'
    if (data.activityId && data.activityId.length > 0) {
      url = url + 'cityId=' + data.cityId + '&activityId=' + data.activityId
    } else {
      url = url + 'cityId=' + data.cityId
    }
    return this.request({
      url: url
    })
  }

  // 主页数据
  homeData(data) {
    return this.request({
      url: '/v2.0/svip/home?cityId=' + data.cityId + '&activityId=' + data.activityId,
    })
  }

  //签到礼详情
  signDetail(data) {
    return this.requestNew({
      url: '/v2.0/svip/giftDetail',
      data: data
    })
  }

  //商户优惠券获取
  getVendorCoupon() {
    return this.requestNew({
      url: "/v2.0/svip/getSupplierCouponInfo"
    }, "POST")
  }

  // 拉取商品
  refureshGoods(data, type) {
    return this.request({
      url: '/v2.0/goods/allGoodsRefresh?cityId=' + data.cityId + "&activityId=" + data.activityId + "&pageSize=" + data.pageSize + "&type=" + data.type
    })
  }
  //验证码
  verificationCode(data, type) {
    return this.requestNew({
      url: '/v2.0/user/verificationCode',
      data: data
    }, type)
  }
  // 登录
  login(data, type) {
    return this.request({
      url: '/v2.0/user/wxlogin',
      data: data
    }, type)
  }

  // 不同小程序同步登录
  syncLogin(data) {
    return this.requestNew({
      url: '/v3.0/user/synchroLogin',
      data: data
    }, "POST")
  }

  //添加用户unionID
  addUnionId(data) {
    return this.requestNew({
      url: '/v2.0/user/addUserInfo',
      data: data
    }, "POST")
  }

  //获取用户会员信息
  getUserSvipInfo(data) {
    return this.request({
      url: "/v2.0/user/lastInfo?cityId=" + data.cityId,
    })
  }
  svipInfo(data) {
    return this.request({
      url: "/v2.0/svip/info?cityId=" + data.cityId + "&activityId=" + data.activityId,
    })
  }
  // 是否是会员
  isSvip(data) {
    return this.requestNew({
      url: "/v2.0/user/info?cityId=" + data.cityId + "&activityId=" + data.activityId,
    })
  }

  //svip商品订单详情
  getOrderDetail(data) {
    return this.request({
      url: "/v2.0/order/goodsOrderDetail?orderSn=" + data.orderSn,
    })
  }
  ////获取预约权益图片
  getOrderEquity(data) {
    return this.request({
      url: "/v2.0/svip/reserveImgList?cityId=" + data.cityId
    })
  }
  // 预约信息
  reserveInfo(data) {
    let url = '/v2.0/svip/reserve'
    if (data.activityId && data.activityId.length > 0) {
      url = url + '?cityId=' + data.cityId + '&activityId=' + data.activityId
    } else {
      url = url + '?cityId=' + data.cityId
    }
    return this.requestNew({
      url: url
    })
  }

  //获取svip商品描述(定金、全款)
  svipImage(data) {
    return this.request({
      url: '/v2.0/svip/allImage?cityId=' + data.cityId + "&activityId=" + data.activityId + "&type=" + data.type,
    })
  }

  // 未登录预约门票
  outReserveTicket(data, type) {
    return this.request({
      url: '/v2.0/svip/reserveNoLogin',
      data: data
    }, type)
  }
  // 已登录预约
  reserveTicket(data, type) {
    return this.request({
      url: '/v2.0/svip/reservePost',
      data: data
    }, type)
  }


  //轮询播报
  getSvipPurchaseRecord() {
    return this.request({
      url: "/v2.0/svip/purchaseRecord"
    })
  }

  // 购买会员
  paySvip(data) {
    return this.requestNew({
      url: '/v2.0/order/svip',
      data: data
    }, "POST")
  }
  // 个人中心
  lastSvipUserCenterInfo(data) {
    return this.requestNew({
      url: "/v2.0/user/centerInfo?cityId=" + data.cityId + "&activityId=" + data.activityId
    })
  }

  // 个人中心核销码弹判断
  juegeQRCodePop(data) {
    return this.requestNew({
      url: "/user/juegeQRCodePop",
      data: data
    })
  }

  //svip会员中心权益
  // getSvipEqu(data){
  //   return this.requestNew({
  //     url: "/v2.0/svip/popupImage?cityId=" + data.cityId + "&activityId=" + data.activityId
  //   })
  // }

  // 全款下单接口
  svipGoodsOrderSubmit(data) {
    return this.requestNew({
      url: '/v2.0/order/goodsBuy',
      data: data
    }, "POST")
  }
  // 定金下单接口
  svipBookingGoodsOrderSubmit(data) {
    return this.requestNew({
      url: '/v2.0/order/goodsBook',
      data: data
    }, "POST")
  }
  // 商品列表
  goodsOrderList(data, type) {
    return this.request({
      url: '/v2.0/order/goodsOrderList',
      data: data
    }, type)
  }
  // 定金商品订单退款
  svipGoodsRefund(data) {
    return this.requestNew({
      url: "/v2.0/order/svipGoodsRefund",
      data: data
    }, "POST")
  }
  // svip商品订单取消支付接口
  svipGoodsCancel(data) {
    return this.requestNew({
      url: '/cancelPayment/goodsOrderCancelPayment',
      data: data
    })
  }
  // svip会员9.9元退款
  svipRefund(data) {
    return this.requestNew({
      url: '/v2.0/order/svipRefund',
      data: data
    }, "POST")
  }
  //商品详情
  goodsDetail(data) {
    return this.request({
      url: "/v2.0/goods/goodsDetail?goodsId=" + data.goodsId + "&activity_type=" + data.activity_type
    })
  }
  // 预约商品预约接口
  goodsReserve(data) {
    return this.requestNew({
      url: "/expo/svip_reserve_goods",
      data: data
    }, "POST")
  }
  //自主录单订单列表 + "&page=" + data.page + "&pageSize=" + data.pageSize
  getSelfOrderList(data) {
    return this.requestNew({
      url: "/svip/liberty/getUserOrderList?mobile=" + data.mobile + "&userId=" + data.userId + "&page=1&pageSize=100"
    })
  }
  //自主录单填写页提交订单
  submitSelfOrder(data) {
    return this.requestNew({
      url: "/svip/liberty/saveUserOrder",
      header: {
        'Token': wx.getStorageSync('token'),
        "content-type": "application/json"
      },
      data: data
    }, "POST")
  }
  //自主录单根据统一订单号查询品牌
  getSelfOrderBrand(data) {
    return this.requestNew({
      url: "/svip/liberty/getOrderBrand?orderNum=" + data.orderNum + "&City=" + data.City
    })
  }
  //自主录单订单详情
  getSelfOrderDetail(data) {
    return this.requestNew({
      url: "/svip/liberty/getOrderDetail?orderId=" + data.orderId
    })
  }
  //订单详情页确认弹框
  selfConfirmPopup(data) {
    return this.requestNew({
      url: "/svip/liberty/saveOrderRemind",
      data: data
    }, "POST")
  }
  //商户名称匹配
  getBrandName(data) {
    return this.requestNew({
      url: "/svip/liberty/getBrandName",
      data: data
    })
  }
  // 添加门票
  oldUserTicket(data) {
    return this.requestNew({
      url: "/oldUserTicket",
      data: data
    }, 'POST')
  }
  //展中不售卖门票索票接口
  zhanzhongGetTicket(data) {
    return this.requestNew({
      url: "/ticket/userGetTicket",
      data: data
    }, 'POST')
  }
  // 10元支付
  saleTicket(data, type) {
    return this.requestNew({
      url: "/v2.0/order/saleTicket",
      data: data
    }, type)
  }

  //判断用户当天是否首次登录
  firstLoginCheck() {
    return this.requestNew({
      url: "/userFirstLoginStatus"
    }, 'POST')
  }

  //获取本用户未使用的Svip抵扣券接口
  userSvipCouponData() {
    return this.requestNew({
      url: "/svipCoupon/getOwnCouponList"
    })
  }

  //获取SVIP抵扣券列表
  svipCouponData() {
    return this.requestNew({
      url: "/svipCoupon/getCouponList"
    })
  }

  //领取SVIP抵扣券接口
  getSvipCoupon(data) {
    return this.requestNew({
      url: "/svipCoupon/addCoupon",
      data: data
    }, "POST")
  }

  //一键领取多张SVIP抵扣券接口
  getMultiSvipCoupon(data) {
    return this.requestNew({
      url: "/svipCoupon/addCouponNew",
      data: data
    }, "POST")
  }

  //PV用户行为统计
  postPV(data) {
    return this.requestNew({
      url: "/hxjb/pv",
      data: data
    }, "POST")
  }

  //获取用户未确认商品/优惠券
  getUserCheckInfo(data) {
    return this.requestNew({
      url: "/svip/liberty/getUserCheckGoodsAndCoupon",
      data: data
    })
  }
  //获取用户核销码
  getCheckCode(data) {
    return this.requestNew({
      url: "/svip/userCode/getCouponGoods",
      data: data
    })
  }
  //用户点击确认核销弹框
  confirmCheck(data) {
    return this.requestNew({
      url: "/svip/liberty/updateUserCheckConfirmLog",
      data: data
    }, "POST")
  }
  //个人中心运营位
  getMyAdv(data) {
    return this.requestNew({
      url: "/svip/userCode/getAdvBanner",
      data: data
    })
  }

  //svip首页、会员中心页签到礼信息
  getSignGiftInfo() {
    return this.requestNew({
      url: "/user/giftInfo"
    })
  }

  //签到礼抽奖接口
  giftLottery() {
    return this.requestNew({
      url: "/user/giftDraw"
    })
  }

  //n选1活动商品列表
  moreChooseOneGoodsList() {
    return this.requestNew({
      url: `/goods/chooseGoodsList`
    })
  }

  //n选1活动商品列表
  chooseChangeOrder(data) {
    return this.requestNew({
      url: `/goods/chooseChangeOrder?order_sn=${data.order_sn}&goods_id=${data.goods_id}`
    })
  }

  //个人信息页面上传头像
  updateUserAvatar(data) {
    return this.requestNew({
      url: `/user/updateUserAvatar`,
      data,
    }, 'POST')
  }

  // 熊猫币顶部弹框
  xmbModal(data) {
    return this.requestNew({
      url: "/panda/alertStatus?config_id=" + data.id,
    })
  }

  //获取活动展馆入口
  getActivityGate(data) {
    return this.requestNew({
      url: "/getActivityGate?city_id=" + data.cityId
    })
  }

  //小程序订单列表接口(新，整合版)
  getOrderList(data) {
    return this.requestNew({
      url: "/shopmall/order/lists",
      data
    }, 'POST')
  }

  //小程序订单列表搜索接口
  orderListSearch(data) {
    return this.requestNew({
      url: "/shopmall/order/listSearch",
      data
    }, 'POST')
  }

  //删除订单
  deleteOrder(data) {
    return this.requestNew({
      url: "/shopmall/order/deleteXcxOrder",
      data
    }, 'POST')
  }

  // end


}
export {
  svip
}