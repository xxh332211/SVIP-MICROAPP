import {
  http
} from '../http/http.js'
class ticketApi extends http {
  constructor(obj) {
    super(obj)
  }
  //id获取门票
  getShareIdTicketInfo(data, handle) {
    this.getRequest({
      url: '/eticket/ticketId/' + data.ticketId,
      success(res) {
        handle(res)
      }
    })
  }

  // 获取用户门票列表
  getTicketList(data, handle) {
    this.getRequest({
      url: '/eticket/tickets?status=' + data.status + '&page=' + data.page + '&limit=' + data.limit,
      header: {
        'token': data.token
      },
      success(res) {
        handle(res)
      }
    })
  }

  //门票信息
  getTicketInfo(data, handle) {
    this.getRequest({
      url: "/eticket/ticket/" + data.ticketId,
      header: {
        'token': data.token
      },
      success(res) {
        handle(res.data)
      }
    })
  }

}
export {
  ticketApi
}