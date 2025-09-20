// pages-userInfo/components/cashOrder/cashOrder.js
import {
  absApi
} from "../../../common/api/absAPI";
const AbsApi = new absApi()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    deleteOrder(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("deleteOrder", item)
    },
    // 查看商品
    toProductDetails: function (e) {
      const prerogative_order_id = e.currentTarget.dataset.orderid;
      wx.navigateTo({
        url: `/pages-abs/pages/orderDetail/orderDetail?order_id=${prerogative_order_id}`
      })
    },
    // 关闭&开启弹窗
    popUnShow(e) {
      const order_sn = e.currentTarget.dataset.ordersn
      const name = e.currentTarget.dataset.name
      if (name == "pop2") {
        this.triggerEvent("getList")
      }
      this.setData({
        [name]: !this.data[name]
      })
      if (order_sn) {
        this.setData({
          order_sn: order_sn
        })
      }
    },
    // 去兑换
    ToExchange(e) {
      let id = e.currentTarget.dataset.id,
        cid = e.currentTarget.dataset.corderid;
      wx.navigateTo({
        url: '/pages-abs/pages/exchangeList/exchangeList?cardId=' + id + "&cardOrderId=" + cid,
      })
    },
    // 退款
    Refund() {
      wx.showLoading({
        title: '退款中...',
        mask: true
      })
      const data = {
        uid: wx.getStorageSync('userInfo').uid,
        card_order_sn: this.data.order_sn
      }
      AbsApi.cardOrderRefund(data).then(res => {
        wx.hideLoading()
        this.setData({
          pop1: false
        })
        if (res.status == 1) {
          this.setData({
            pop2: true
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    },
  }
})