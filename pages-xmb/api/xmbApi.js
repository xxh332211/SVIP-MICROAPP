//换购活动api
import {
  httpAsync
} from '../../common/http/http-async.js'

class xmb extends httpAsync {
  // 获取用户积分明细
  getXmbDetail(data) {
    return this.requestNew({
      url: "/panda/getUserPandaCoinDetail",
      data
    })
  }
  //判断换购活动是否上线
  checkTradeIn(data) {
    return this.requestNew({
      url: "/tradeActivityIsOnline?cityId=" + data.cityId + "&activityId=" + data.activityId
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

  // 确认换购页面
  getConfirmTrade(data) {
    return this.requestNew({
      url: "/confirmTrade",
      data: data
    })
  }

  //我的换购订单列表
  getMyTradeList(data) {
    return this.requestNew({
      url: "/myTeadeList?activityId=" + data.activityId + "&userId=" + data.userId
    })
  }

  //换购订单详情
  getTradeDetail(data) {
    return this.requestNew({
      url: "/tradeOrderDetail",
      data: data
    }, 'POST')
  }


  // 换购支付
  getTradePayment(data) {
    return this.requestNew({
      url: "/tradePayment",
      data: data
    }, "POST")
  }

  // 换购订单退款
  getRedeemGoodsRefund(data) {
    return this.requestNew({
      url: "/redeemGoodsRefund",
      data: data
    }, 'POST')
  }

  // 获取熊猫币任务
  getXmbTask() {
    return this.requestNew({
      url: "/pandaCoinTask"
    })
  }

  // 熊猫币签到
  xmbSignIn(data) {
    return this.requestNew({
      url: "/userGetPandaCoin",
      data
    },'POST')
  }

  // 获取现场活动列表
  getSiteActivity() {
    return this.requestNew({
      url: "/panda/getSiteActivity"
    })
  }

  // 获取现场活动列表
  xmbLotteryLoop() {
    return this.requestNew({
      url: "/panda/lotteryArray"
    })
  }

  // 获取活动状态（福袋）
  bagListData() {
    return this.requestNew({
      url: "/panda/activeState"
    })
  }

  // 现场活动兑换
  xmbExchange(data) {
    return this.requestNew({
      url: "/panda/exchange",
      data
    },'POST')
  }

  // 领取熊猫币
  getTaskXmb(data) {
    return this.requestNew({
      url: "/panda/receivePandaCoin",
      data
    },'POST')
  }

  // 熊猫币中心抽奖
  xmbCenterLottery(data) {
    return this.requestNew({
      url: "/panda/cashLotter",
      data
    },'POST')
  }
  //获取抽奖信息
  getLotteryInfo() {
    return this.requestNew({
      url: "/panda/lottery"
    })
  }

  //中奖名单
  getLotteryRecord(data) {
    return this.requestNew({
      url: "/panda/lotteryRecord",
      data: data
    })
  }

  //我的中奖记录
  getSelfRecord(data) {
    return this.requestNew({
      url: "/panda/selfRecord",
      data: data
    })
  }

  //添加抽奖收获地址
  addPrizeAddress(data) {
    return this.requestNew({
      url: "/panda/addAddress",
      data: data
    }, 'POST')
  }

  //抽奖接口
  getLotteryPrize(data) {
    return this.requestNew({
      url: "/panda/addPrize",
      data: data
    }, 'POST')
  }

  //抽完奖发送短信
  getPrizeSendMsg(data) {
    return this.requestNew({
      url: "/panda/sendPrizeMsg",
      data: data
    }, 'POST')
  }

  // 获取熊猫币任务
  getXmbTask() {
    return this.requestNew({
      url: "/pandaCoinTask"
    })
  }

  // 熊猫币签到
  xmbSignIn(data) {
    return this.requestNew({
      url: "/userGetPandaCoin",
      data
    },'POST')
  }

  // 获取现场活动列表
  getSiteActivity() {
    return this.requestNew({
      url: "/panda/getSiteActivity"
    })
  }

  // 检测是否冻结
  checkFreeze() {
    return this.requestNew({
      url: "/panda/checkFreeze"
    },'POST')
  }

  // 熊猫币中心规则
  xmbCenterRules() {
    return this.requestNew({
      url: "/panda/pandaCoinRule"
    })
  }
}
export {
  xmb
}