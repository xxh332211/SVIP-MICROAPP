Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shareData: Object
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
    close () {
      this.triggerEvent(
        'close',
        {},
        {}
      )
    },
    saveImage () {
      this.triggerEvent(
        'show',
        {},
        {}
      )
    }
  }
})
