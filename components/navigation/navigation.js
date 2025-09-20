// components/navigation/navigation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hiddenItem:String
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
    // 跳转优惠券爆品弹层
    showLink() {
      this.setData({
        showLinkPopup: true
      })
    },
    hideLink() {
      this.setData({
        showLinkPopup: false
      })
    },
  }
})
