// 抽奖裂变活动API
import { httpAsync } from '../../common/http/http-async.js'
class fission extends httpAsync {
  // 裂变抽奖活动状态
  fissionEntrance() {
    return this.requestNew({
      url: '/fission/activityEntrance',
    })
  }
  //裂变活动信息接口
  getActInfo(data) {
    return this.requestNew({
      url: '/fission/activityInfo',
      data,
    })
  }
  //参与记录
  historyList(data) {
    return this.requestNew(
      {
        url: '/fission/joinRecordList',
        data,
      },
      'POST'
    )
  }
  //索票页弹框
  ticketOncePop() {
    return this.requestNew({
      url: '/fission/unActivityPop',
    })
  }
  //点赞/发起
  friendEnter(data) {
    return this.requestNew(
      {
        url: '/fission/userEnterIntoActivity',
        data,
      },
      'POST'
    )
  }
  //更新用户昵称和头像信息
  updateUserInfo(data) {
    return this.requestNew(
      {
        url: '/fission/updateUserNickAvatar',
        data,
      },
      'POST'
    )
  }
  //获取用户参与活动信息
  getUserActInfo(data) {
    return this.requestNew(
      {
        url: '/fission/getUserActivityInfo',
        data: data,
      },
      'POST'
    )
  }
  // 中奖名单
  getWinnerList(data) {
    return this.requestNew(
      {
        url: '/fission/winLotteryList',
        data: data,
      },
      'POST'
    )
  }
  //获取索票信息
  getTicketsInfo() {
    return this.requestNew(
      {
        url: '/eticket/hasGetTickets',
      },
      'POST'
    )
  }

  //获取城市配置信息
  getCityConfig() {
    return this.requestNew({
      url: '/v2.0/svip/cityConfigInfo',
    })
  }
  //获取token是否有效
  checkToken() {
    return this.requestNew({
      url: '/v2.0/user/ckeckToken',
    })
  }
  //索票接口
  postReserve(data) {
    return this.requestNew(
      {
        url: '/expo/reserve',
        data: data,
      },
      'POST'
    )
  }
}
export { fission }
