import {
  httpAsync
} from '../http/http-async.js'

class liveApi extends httpAsync {
    // 直播小程序同步登录
    synchroLogin(data) {
      return this.requestNew({
        url: '/v3.0/user/synchroLogin',
        data: data
      }, 'POST')
    }
    // 用户个人直播间预约列表
    liveReserveList(data){
      return this.requestNew({
        url: "/live/liveReserveList",
        data: data
      }, "POST")
    }
    // 热门和频道列表接口（不包涵预约列表）
    liveList(data){
      return this.requestNew({
        url: "/live/liveList",
        data: data
      }, "POST")
    }
    // 查看一级列表 
    categoryList(data){
      return this.requestNew({
        url: "/expo/category/list",
        data: data
      })
    }
    // 华夏家博小程序内直播列表接口
    hxjbLiveList(data){
      return this.requestNew({
        url: "/live/hxjbLiveList",
        data: data
      }, "POST")
    }
    // 主题馆列表
    shopList(data){
      return this.requestNew({
        url: "/shopList",
        data: data
      }, "POST")
    }
    // 店铺详情
    shopDetail(data){
      return this.requestNew({
        url: "/shopDetail",
        data: data
      }, "POST")
    }
    // 商品详情
    privilegeDetail(data){
      return this.requestNew({
        url: "/privilegeDetail",
        data: data
      })
    }
    // 检查剩余可购买数量
    CheckPOrderNum(data){
      return this.requestNew({
        url: "/PriOrder/CheckPOrderNum",
        data: data
      }, "POST")
    }
    // 直播商品购买
    createOrder(data){
      return this.requestNew({
        url: "/PriOrder/createOrder",
        data: data
      }, "POST")
    }
    // 个人中心-直播订单
    PreOrder(data){
      return this.requestNew({
        url: "/expo/auto/PreOrder",
        data: data
      }, "POST")
    }
    // 订单详情
    PreOrderDetail(data){
      return this.requestNew({
        url: "/expo/auto/PreOrderDetail",
        data: data
      }, "POST")
    }
    // 支付
    ToPay(data){
      return this.requestNew({
        url: "/PriOrder/ToPay",
        data: data
      }, "POST")
    }
    // 申请退款
    refundPri(data){
      return this.requestNew({
        url: "/PriOrder/refundPri",
        data: data
      }, "POST")
    }
    // 店铺商品
    privilegeList(data){
      return this.requestNew({
        url: "/privilegeList",
        data: data
      })
    }
    // 取消订单
    cancelOrder(data){
      return this.requestNew({
        url: "/PriOrder/cancelOrder",
        data: data
      }, "POST")
    }
    //用户进入回放页面
    liveUserVideoCollection(data) {
      return this.request({
        url: "/live/liveUserVideoCollection",
        data: data
      }, "POST")
    }
    
}

export {
  liveApi
}

