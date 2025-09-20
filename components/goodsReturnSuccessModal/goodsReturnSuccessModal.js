// components/goodsUpdateUserName/goodsUpdateUserName.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    initValue: String
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
      this.triggerEvent('close', {}, {});
    },
    submit (evt) {
      this.triggerEvent('close', {}, {});
    }
  }
})
