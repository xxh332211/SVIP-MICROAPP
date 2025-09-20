// components/upgradeSvip/upgradeSvip.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderType:Number
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
    closeUpdate() {
      this.triggerEvent("closeUpdate")
    },
  }
})
