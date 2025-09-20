// pages-userInfo/components/reserveOrder/reserveOrder.js
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
    toDetail(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("toDetail", item)
    },
    deleteOrder(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("deleteOrder", item)
    },
    checkCode(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("checkCode", item)
    },
  }
})
