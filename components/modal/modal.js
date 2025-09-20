// components/modal/modal.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true,
  },
  properties: {
    isSingle: {
      type: Object,
      value: {
        alone: true,
        btnText: '好的'
      }
    },
    hasTitle: {
      type: Object,
      value: {
        titleText: '弹窗',
        showTitle: false
      }
    },
    hasDefBtns: {
      type: Boolean,
      value: true
    }
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
    stop() {
      return false
    },
    modalConfirm() {
      this.triggerEvent('confirm')
    },
    modalCancel() {
      this.triggerEvent('cancel')
    }
  }
})