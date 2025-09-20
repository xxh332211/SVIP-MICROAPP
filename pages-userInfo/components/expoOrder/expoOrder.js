// pages-userInfo/components/expoOrder/expoOrder.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object
  },

  observers: {
    item(val) {
      if (val.goods.length > 0) {
        val.goods.map((v) => {
          v.image_url = v.image_url ?? val.logo_url;
          return v
        })
        this.setData({
          newItem: val
        })
      } else {
        val.goods.push({
          image_url: val.logo_url
        })
        this.setData({
          newItem: val
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    newItem: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toCommonDetail(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("toCommonDetail", item)
    },
    deleteOrder(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("deleteOrder", item)
    },
    // 抽奖按钮
    getLottery(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("getLottery", item)
    },
    // 兑奖按钮
    redeemPrize(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("redeemPrize", item)
    },
  }
})