// components/goodsSexPicker/goodsSexPicker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    initValue: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [
      {id: 1, name: '男'},
      {id: 0, name: '女'}
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('close', {}, {});
    },
    select (evt) {
      this.triggerEvent('select', {value: evt.target.dataset.id})
    }
  }
})
