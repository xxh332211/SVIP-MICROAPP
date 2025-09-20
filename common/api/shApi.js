//售后申请api
import {
  httpAsync
} from '../http/http-async.js'

class shApply extends httpAsync {
  // 售后申请单提交修改和添加
  formSubmit(data) {
    return this.requestNew({
      url: "/altersave/saveAfterSaleApply",
      data: data
    }, "POST")
  }
  //售后申请单提交修改和添加
  postApply(data) {
    return this.requestNew({
      url: "/altersave/saveAfterSaleApply",
      data: data
    }, "POST")
  }
  //获取申请单详情接口
  getApplyDetail(data) {
    return this.requestNew({
      url: "/altersave/getAfterSaleApplyInfo",
      data: data
    }, "POST")
  }
  //获取申请单列表接口
  getApplyList(data) {
    return this.requestNew({
      url: "/altersave/getAfterSaleApplyList",
      data: data
    }, "POST")
  }
  // 订单搜索
  orderSearch(data) {
    return this.requestNew({
      url: "/altersave/orderSearch",
      data: data
    }, "POST")
  }
}
export {
  shApply
}