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
      if (!evt.detail.value.name) {
        wx.showToast({
          title: '请输入姓名',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.triggerEvent('submit', {value: evt.detail.value.name})
    }
  }
})
