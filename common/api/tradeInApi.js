//换购活动api
import {
  httpAsync
} from '../http/http-async.js'

class tradeIn extends httpAsync {
  //判断换购活动是否上线
  checkTradeIn(data) {
    return this.requestNew({
      url: "/tradeActivityIsOnline?cityId=" + data.cityId + "&activityId=" + data.activityId
    })
  }

  //用户展会订单进度条
  getUserOrderNum(data) {
    return this.requestNew({
      url: "/userOrderNum?cityId=" + data.cityId + "&activityId=" + data.activityId + "&userId=" + data.userId
    })
  }

  //换购活动热门列表
  getTradeInHotList(data) {
    return this.requestNew({
      url: "/hotList?redeemId=" + data.redeemId + "&activityId=" + data.activityId
    })
  }

  //换购活动规则
  getTradeInRule(data) {
    return this.requestNew({
      url: "/tradeRule?cityId=" + data.cityId + "&activityId=" + data.activityId
    })
  }

  //换购商品列表
  getTradeInAllList(data) {
    return this.requestNew({
      url: "/goodsList?activityId=" + data.activityId + "&redeemId=" + data.redeemId
    })
  }

  //换购商品详情
  getTradeInDetail(data) {
    return this.requestNew({
      url: "/tradeGoodsDetail?redeemGoodsId=" + data.goodsId
    })
  }

  //我的换购商品列表
  getMyTradeList(data) {
    return this.requestNew({
      url: "/myTeadeList?activityId=" + data.activityId + "&userId=" + data.userId
    })
  }

  // 确认换购页面
  getConfirmTrade(data) {
    return this.requestNew({
      url: "/confirmTrade",
      data: data
    })
  }

  // 换购支付
  getTradePayment(data) {
    return this.requestNew({
      url: "/tradePayment",
      data: data
    }, "POST")
  }

  // 换购商品详情页
  getTradeOrderDetail(data) {
    return this.requestNew({
      url: "/tradeOrderDetail",
      data: data
    }, 'POST')
  }

  // 换购订单退款
  getRedeemGoodsRefund(data) {
    return this.requestNew({
      url: "/redeemGoodsRefund",
      data: data
    }, 'POST')
  }

  // 索票接口
  getRequestTicket(data) {
    return this.requestNew({
      url: "/requestTicket",
      data: data
    }, 'POST')
  }

  // 判断用户该展届是否有门票
  hasGetTicket(data){
    return this.requestNew({
      url: "/hasGetTicket",
      data: data
    })
  }

}
export {
  tradeIn
}