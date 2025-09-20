// pages-userInfo/components/trandinOrder/trandinOrder.js
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
    toTradeInDetail(e) {
      let item = e.currentTarget.dataset.item;
      if (item.trade_in_type == 1) {
        //熊猫币换购订单
        wx.navigateTo({
          url: `/pages-xmb/pages/tradeIn/tradeDetail/tradeDetail?orderSn=${item.order_sn}`
        })
      } else {
        //订单换购
        wx.navigateTo({
          url: '/pages/tradeInPackage/tradeDetail/Index?orderSn=' + item.order_sn,
        })
      }
    }
  }
})