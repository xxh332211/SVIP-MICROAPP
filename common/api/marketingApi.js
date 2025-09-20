//营销小程序api
import {
  httpAsync
} from '../http/http-async.js'

class marketing extends httpAsync {

  //云逛展基础信息
  cloudShowInfo(data) {
    return this.requestNew({
      url: "/v2.0/city/cloudShow?cityId=" + data.cityId + "&mobile=" + data.mobile
    })
  }

  //微信授权手机自动登录
  authorizeLogin(data) {
    return this.requestNew({
      url: "/v2.0/user/authorizationLogin",
      data: data
    }, "POST")
  }

  //获取索票信息
  getTicketsInfo() {
    return this.requestNew({
      url: "/eticket/hasGetTickets"
    }, "POST")
  }

  //记录索票弹窗
  recordTicketPopup(data) {
    return this.requestNew({
      url: "/user/pyqabsUserStatus",
      data: data
    })
  }

  //检票
  ticketChecked(data) {
    return this.requestNew({
      url: "/ticket/check",
      data: data
    }, "POST")
  }

  //是否检票
  checkTicketStatus() {
    return this.requestNew({
      url: "/ticket/getUserCheckTicketStatus"
    })
  }

  //生成小程序码
  getMiniCode(data) {
    return this.requestNew({
      url: "/QRCode",
      data: data
    })
  }

  //获取商户优惠券列表
  getVendorCoupon(data) {
    return this.requestNew({
      url: "/expo/coupons/list?category=" + data.id + "&is_recommend=" + data.is_recommend
    })
  }

  //获取商户优惠券详情
  vendorCouponDetail(data) {
    return this.requestNew({
      url: "/expo/coupons/list?detail=" + data.detailId
    })
  }

  //获取平台优惠券
  getPlatformCoupon() {
    return this.requestNew({
      url: "/v2.0/svip/getPlatformCoupon"
    })
  }

  //获取svip专项商户优惠券礼包
  getSvipCouponBag() {
    return this.requestNew({
      url: "/v2.0/svip/getSupplierCouponAmount"
    })
  }

  //商户分类列表
  getVendorList() {
    return this.requestNew({
      url: "/expo/category/list"
    })
  }

  //爆品列表
  getHotGoodsList(data) {
    return this.requestNew({
      url: "/expo/explosion/list?category=" + data.id + "&page=" + data.page + "&pageSize=" + data.pageSize + "&is_recommend=" + data.is_recommend
    })
  }

  //爆品详情
  getHotGoodsDetail(data) {
    return this.requestNew({
      url: "/expo/explosion/detail?detail_id=" + data.detail_id
    })
  }

  //商户活动
  getVendorAction(data) {
    return this.requestNew({
      url: "/expo/supplier_active/list?category=" + data.id + "&page=" + data.page + "&pageSize=" + data.pageSize + "&is_recommend=" + data.is_recommend
    })
  }

  //品牌列表
  getBrandList(data) {
    return this.requestNew({
      url: "/expo/brand/list?category=" + data.id + "&pageSize=" + data.pageSize
    })
  }

  //索票成功填写地址
  postAddress(data) {
    return this.requestNew({
      url: "/expo/reserve/address",
      data: data
    }, "POST")
  }

  //预约统一接口
  postReserve(data) {
    return this.requestNew({
      url: "/expo/reserve",
      data: data
    }, "POST")
  }

  //索票接口
  reserveTicket(data) {
    return this.requestNew({
      url: "/expo/shareReserve",
      data: data
    }, "POST")
  }

  //领取分享的门票接口
  getShareTicket(data) {
    return this.requestNew({
      url: "/expo/shareReserve",
      data: data
    }, "POST")
  }

  //获取索票人数
  getTicketNum() {
    return this.requestNew({
      url: "/expo/ticket/ticketNum"
    })
  }

  //获取滚动人数
  getTicketPerson() {
    return this.requestNew({
      url: "/expo/ticket/ticketPerson"
    })
  }

  //获取我的展会订单
  getMyExpoOrder() {
    return this.requestNew({
      url: "/expo/auto/order"
    })
  }

  //获取抽奖结果接口
  getLotteryResult(data) {
    return this.requestNew({
      url: "/award/getAwardResult",
      data: data
    })
  }

  //中奖轮播+活动规则
  prizeRule(data) {
    return this.requestNew({
      url: "/award/getAwardBroadcastList",
      data: data
    }, "POST")
  }

  //展会列表抽奖接口
  orderLottery(data) {
    return this.requestNew({
      url: "/award/luckyDraw",
      data: data
    }, "POST")
  }

  //获取我的优惠券
  getMyCoupon(data) {
    return this.requestNew({
      url: "/expo/auto/coupons?category=" + data.id + "&status=" + data.status
    })
  }

  //获取我的爆品预约
  getMyReserveHot() {
    return this.requestNew({
      url: "/expo/auto/explosion?pageSize=1000"
    })
  }

  //获取我的商户活动预约
  getMyReserveAct() {
    return this.requestNew({
      url: "/expo/auto/supplier_active"
    })
  }

  //获取我的奖励金
  getMyBounty() {
    return this.requestNew({
      url: "/expo/auto/award"
    })
  }

  //加密手机号
  getEncPhone(data) {
    return this.requestNew({
      url: "/expo/enc?enc=" + data.enc
    })
  }

  //获取token是否有效
  checkToken() {
    return this.requestNew({
      url: "/v2.0/user/ckeckToken"
    })
  }
  // 索票成功页默认地址
  getUserDefaultAddress() {
    return this.requestNew({
      url: "/getUserDefaultAddress"
    }, "POST")
  }

  //爆品组
  getGoodsGroup(data) {
    return this.requestNew({
      url: "/goodsGroup/baoPinList",
      data: data
    }, "POST")
  }

  //获取七鱼用户id
  getQyUserId(data) {
    return this.requestNew({
      url: "/userCallSvipInfo",
      data: data
    })
  }

  //优惠券详情接口
  getCouponDetail(data) {
    return this.requestNew({
      url: "/shopmall/couponDetail",
      data: data
    })
  }

  //跳转添加亲友获取参数key
  getKey(data) {
    return this.requestNew({
      url: "/svip/relationship/getKey",
      data: data
    })
  }

}
export {
  marketing
}